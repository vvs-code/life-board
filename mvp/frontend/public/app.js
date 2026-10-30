const api = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const STATUSES = { todo: 'к выполнению', in_progress: 'в работе', done: 'сделано' };
const PRIORITIES = { high: 'высокий', mid: 'средний', low: 'низкий', zero: 'нулевой' };

async function render() {
  const [spaces, tasks] = await Promise.all([api('/spaces'), api('/tasks')]);
  const byId = Object.fromEntries(spaces.map((s) => [s.id, s]));

  document.getElementById('spaces').innerHTML = spaces.map((s) => `
    <tr><td><span class="dot" style="background:${esc(s.color)}"></span>${esc(s.name)}</td>
    <td><button data-rename-space="${s.id}">Переименовать</button> <button data-del-space="${s.id}">Удалить</button></td></tr>`).join('');

  document.getElementById('space-select').innerHTML = spaces.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('');

  document.getElementById('tasks').innerHTML = tasks.map((t) => `
    <tr><td>${esc(byId[t.space_id]?.name)}</td><td>${esc(t.title)}</td>
    <td>${t.deadline ? new Date(t.deadline).toLocaleDateString('ru-RU') : '—'}</td>
    <td>${PRIORITIES[t.priority]}</td>
    <td><select data-status="${t.id}">${Object.entries(STATUSES).map(([v, l]) => `<option value="${v}" ${v === t.status ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
    <td><button data-del-task="${t.id}">Удалить</button></td></tr>`).join('');
}

const formData = (form) => Object.fromEntries([...new FormData(form)].filter(([, v]) => v !== ''));

document.getElementById('space-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/spaces', { method: 'POST', body: JSON.stringify(formData(e.target)) });
  e.target.reset();
  render();
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = formData(e.target);
  data.space_id = Number(data.space_id);
  await api('/tasks', { method: 'POST', body: JSON.stringify(data) });
  e.target.reset();
  render();
});

document.body.addEventListener('click', async (e) => {
  const { delSpace, delTask, renameSpace } = e.target.dataset;
  if (delSpace) await api(`/spaces/${delSpace}`, { method: 'DELETE' });
  if (delTask) await api(`/tasks/${delTask}`, { method: 'DELETE' });
  if (renameSpace) {
    const name = prompt('Новое название');
    if (name) await api(`/spaces/${renameSpace}`, { method: 'PUT', body: JSON.stringify({ name }) });
  }
  if (delSpace || delTask || renameSpace) render();
});

document.body.addEventListener('change', async (e) => {
  const id = e.target.dataset.status;
  if (id) {
    await api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status: e.target.value }) });
    render();
  }
});

render();
