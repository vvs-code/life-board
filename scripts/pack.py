#!/usr/bin/env python3
"""Собирает архив для сдачи: UTF-8 имена файлов, без node_modules, .git и .env.

Использование: python3 scripts/pack.py <архив.zip> [скринкаст.mp4]
"""
import os
import sys
import zipfile

SKIP_DIRS = {'node_modules', '.git'}
SKIP_FILES = {'.DS_Store', '.env'}

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.abspath(sys.argv[1])
video = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else None

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = os.path.join(dirpath, name)
            if name in SKIP_FILES or name.endswith('.zip') or os.path.abspath(path) == out:
                continue
            z.write(path, os.path.join('life-board', os.path.relpath(path, root)))
    if video:
        z.write(video, os.path.join('life-board', os.path.basename(video)), compress_type=zipfile.ZIP_STORED)

names = zipfile.ZipFile(out).namelist()
print(f'{out}: {len(names)} файлов' + (f', скринкаст {os.path.basename(video)}' if video else ', БЕЗ скринкаста'))
