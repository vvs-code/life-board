#!/usr/bin/env python3
"""Собирает PDF из Markdown-документов в docs/ через headless Chrome.

Конвертер Markdown минимальный и покрывает ровно то, что используется в docs/:
заголовки, абзацы, списки (с вложенностью), таблицы, блоки кода, цитаты,
разделители, `код`, **жирный**, *курсив*, ссылки.

Относительные ссылки переписываются на GitHub, чтобы работать в PDF где угодно.

Использование: python3 scripts/docs-pdf.py [ИМЯ.md ...]
"""
import html
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS = os.path.join(ROOT, 'docs')
REPO_URL = 'https://github.com/vvs-code/life-board'
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
# PDF нужен только одностраничнику; остальные документы живут в Markdown.
DEFAULT = ['ONE-PAGER.md']

CSS = """
@page { size: A4; margin: 16mm 14mm 18mm; }
body { font: 10.5pt/1.5 -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1c1c1a; }
h1 { font-size: 20pt; margin: 0 0 10pt; }
h2 { font-size: 14pt; margin: 18pt 0 6pt; padding-bottom: 3pt; border-bottom: 1px solid #ddd; page-break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14pt 0 4pt; page-break-after: avoid; }
h4 { font-size: 10.5pt; margin: 10pt 0 4pt; }
p { margin: 5pt 0; }
ul, ol { margin: 4pt 0; padding-left: 18pt; }
li { margin: 1.5pt 0; }
table { border-collapse: collapse; width: 100%; margin: 7pt 0; font-size: 9pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th, td { border: 1px solid #d6d5d0; padding: 3.5pt 5pt; text-align: left; vertical-align: top; }
th { background: #f3f3f1; }
code { font: 8.8pt "SF Mono", Menlo, monospace; background: #f3f3f1; padding: 0 2pt; border-radius: 2pt; }
pre { background: #f6f6f4; border: 1px solid #e4e3df; padding: 7pt; font-size: 8pt; line-height: 1.35;
      white-space: pre-wrap; page-break-inside: avoid; }
pre code { background: none; padding: 0; font-size: inherit; }
blockquote { margin: 7pt 0; padding: 3pt 9pt; border-left: 3px solid #c9c8c3; color: #55544f; }
hr { border: none; border-top: 1px solid #ddd; margin: 12pt 0; }
a { color: #2f55c9; text-decoration: none; }
"""


# Точечные правки вёрстки для отдельных документов. Одностраничник обязан уместиться на одну страницу A4.
DOC_CSS = {
    'ONE-PAGER.md': """
@page { margin: 13mm 14mm 13mm; }
body { font-size: 10pt; }
h1 { margin-bottom: 6pt; }
h2 { margin-top: 13pt; }
""",
}

def rewrite_link(url, src_dir):
    if re.match(r'^[a-z]+:', url) or url.startswith('#'):
        return url
    path, _, anchor = url.partition('#')
    target = os.path.normpath(os.path.join(src_dir, path))
    rel = os.path.relpath(target, ROOT).replace(os.sep, '/')
    kind = 'tree' if os.path.isdir(target) else 'blob'
    return f'{REPO_URL}/{kind}/main/{rel}' + (f'#{anchor}' if anchor else '')


def inline(text, src_dir):
    # Код прячем за плейсхолдерами: так жирный, курсив и ссылки разбираются по всей строке,
    # даже если начинаются или заканчиваются кодом (**`agent_run` — ...**).
    codes = []

    def stash(m):
        codes.append(f'<code>{html.escape(m.group(1))}</code>')
        return f'\x00{len(codes) - 1}\x00'

    s = re.sub(r'`([^`]+)`', stash, text)
    s = html.escape(s, quote=False)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',
               lambda m: f'<a href="{html.escape(rewrite_link(m.group(2), src_dir))}">{m.group(1)}</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', s)
    return re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], s)


def split_row(line):
    line = line.strip()
    if line.startswith('|'):
        line = line[1:]
    if line.endswith('|'):
        line = line[:-1]
    return [c.strip() for c in line.split('|')]


def render_list(lines, src_dir):
    """lines: [(indent, ordered, text)] — строит вложенные списки."""
    out = []
    stack = []  # [(indent, tag)]
    for indent, ordered, text in lines:
        tag = 'ol' if ordered else 'ul'
        while stack and indent < stack[-1][0]:
            out.append(f'</li></{stack.pop()[1]}>')
        if not stack or indent > stack[-1][0]:
            out.append(f'<{tag}>')
            stack.append((indent, tag))
        else:
            out.append('</li>')
        out.append(f'<li>{inline(text, src_dir)}')
    while stack:
        out.append(f'</li></{stack.pop()[1]}>')
    return ''.join(out)


def convert(md, src_dir):
    lines = md.split('\n')
    out = []
    i = 0
    list_re = re.compile(r'^(\s*)([-*]|\d+\.)\s+(.*)$')
    while i < len(lines):
        line = lines[i]
        if line.startswith('```'):
            i += 1
            code = []
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i])
                i += 1
            out.append(f'<pre><code>{html.escape(chr(10).join(code))}</code></pre>')
            i += 1
            continue
        if not line.strip():
            i += 1
            continue
        if re.match(r'^-{3,}\s*$', line):
            out.append('<hr>')
            i += 1
            continue
        m = re.match(r'^(#{1,4})\s+(.*)$', line)
        if m:
            level = len(m.group(1))
            out.append(f'<h{level}>{inline(m.group(2), src_dir)}</h{level}>')
            i += 1
            continue
        if line.lstrip().startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|?\s*:?-{2,}', lines[i + 1]):
            head = split_row(line)
            i += 2
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith('|'):
                rows.append(split_row(lines[i]))
                i += 1
            th = ''.join(f'<th>{inline(c, src_dir)}</th>' for c in head)
            body = ''.join('<tr>' + ''.join(f'<td>{inline(c, src_dir)}</td>' for c in r) + '</tr>' for r in rows)
            out.append(f'<table><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>')
            continue
        if line.startswith('>'):
            quote = []
            while i < len(lines) and lines[i].startswith('>'):
                quote.append(lines[i].lstrip('>').strip())
                i += 1
            out.append(f'<blockquote><p>{inline(" ".join(quote), src_dir)}</p></blockquote>')
            continue
        if list_re.match(line):
            items = []
            while i < len(lines):
                lm = list_re.match(lines[i])
                if lm:
                    items.append((len(lm.group(1)), lm.group(2)[0].isdigit(), lm.group(3)))
                    i += 1
                elif lines[i].strip() and lines[i].startswith('  ') and items:
                    ind, ordered, text = items[-1]
                    items[-1] = (ind, ordered, text + ' ' + lines[i].strip())
                    i += 1
                else:
                    break
            out.append(render_list(items, src_dir))
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,4}\s|```|>|\||-{3,}\s*$)', lines[i]) \
                and not list_re.match(lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append(f'<p>{inline(" ".join(para), src_dir)}</p>')
    return '\n'.join(out)


def build(name):
    src = os.path.join(DOCS, name)
    md = open(src, encoding='utf-8').read()
    title = re.search(r'^#\s+(.*)$', md, re.M).group(1)
    page = (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>{html.escape(title)}</title>'
            f'<style>{CSS}{DOC_CSS.get(name, "")}</style></head><body>{convert(md, DOCS)}</body></html>')
    pdf = os.path.join(DOCS, name[:-3] + '.pdf')
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(page)
        tmp = f.name
    try:
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                        '--print-to-pdf-no-header', f'--print-to-pdf={pdf}', f'file://{tmp}'],
                       check=True, capture_output=True, timeout=120)
    finally:
        os.unlink(tmp)
    print(f'{os.path.relpath(pdf, ROOT)}  {os.path.getsize(pdf) // 1024} КБ')


for doc in sys.argv[1:] or DEFAULT:
    build(doc)
