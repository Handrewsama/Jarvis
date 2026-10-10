function isAuthorized(request, env) {
  const token = env.JARVIS_API_TOKEN;
  const auth = request.headers.get('Authorization') || '';
  return Boolean(token) && auth === `Bearer ${token}`;
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

function fail(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

function taskRow(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    title: row.title,
    description: row.description || '',
    due: row.due_at || '',
    priority: row.priority || 'medium',
    done: row.status === 'completed',
    createdAt: row.created_at
  };
}

async function requireAuth(request, env) {
  if (!isAuthorized(request, env)) return fail('No autoritzat', 401);
  if (!env.DB) return fail('Base de dades no configurada', 500);
  return null;
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAuth(request, env);
  if (authError) return authError;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  let result;
  if (status === 'pending' || status === 'completed') {
    result = await env.DB.prepare(
      'SELECT id, title, description, due_at, priority, status, created_at FROM tasks WHERE status = ? ORDER BY created_at DESC LIMIT 500'
    ).bind(status).all();
  } else {
    result = await env.DB.prepare(
      'SELECT id, title, description, due_at, priority, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 500'
    ).all();
  }
  return json({ ok: true, tasks: (result.results || []).map(taskRow) });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAuth(request, env);
  if (authError) return authError;
  let data;
  try { data = await request.json(); } catch { return fail('JSON invàlid'); }
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title || title.length > 200) return fail('El títol és obligatori i ha de tenir com a màxim 200 caràcters');
  const description = typeof data.description === 'string' ? data.description.slice(0, 2000) : '';
  const dueAt = typeof (data.due_at ?? data.due) === 'string' ? (data.due_at ?? data.due).slice(0, 100) : null;
  const priority = ['high', 'medium', 'low'].includes(data.priority) ? data.priority : 'medium';
  const status = data.done === true || data.status === 'completed' ? 'completed' : 'pending';
  const result = await env.DB.prepare(
    'INSERT INTO tasks (title, description, due_at, priority, status) VALUES (?, ?, ?, ?, ?) RETURNING id, title, description, due_at, priority, status, created_at'
  ).bind(title, description, dueAt, priority, status).first();
  return json({ ok: true, task: taskRow(result) }, 201);
}

export async function onRequestPatch({ request, env }) {
  const authError = await requireAuth(request, env);
  if (authError) return authError;
  let data;
  try { data = await request.json(); } catch { return fail('JSON invàlid'); }
  const id = Number(data.id);
  if (!Number.isInteger(id) || id < 1) return fail('Identificador de tasca invàlid');
  const existing = await env.DB.prepare('SELECT id, title, description, due_at, priority, status, created_at FROM tasks WHERE id = ?').bind(id).first();
  if (!existing) return fail('No s’ha trobat la tasca', 404);
  const title = typeof data.title === 'string' ? data.title.trim() : existing.title;
  if (!title || title.length > 200) return fail('El títol és obligatori i ha de tenir com a màxim 200 caràcters');
  const description = typeof data.description === 'string' ? data.description.slice(0, 2000) : (existing.description || '');
  const dueAt = typeof data.due === 'string' ? data.due.slice(0, 100) : (typeof data.due_at === 'string' ? data.due_at.slice(0, 100) : (existing.due_at || null));
  const priority = ['high', 'medium', 'low'].includes(data.priority) ? data.priority : (existing.priority || 'medium');
  const status = typeof data.done === 'boolean' ? (data.done ? 'completed' : 'pending') : (data.status === 'completed' || data.status === 'pending' ? data.status : existing.status);
  const result = await env.DB.prepare(
    'UPDATE tasks SET title = ?, description = ?, due_at = ?, priority = ?, status = ? WHERE id = ? RETURNING id, title, description, due_at, priority, status, created_at'
  ).bind(title, description, dueAt, priority, status, id).first();
  return json({ ok: true, task: taskRow(result) });
}

export async function onRequestDelete({ request, env }) {
  const authError = await requireAuth(request, env);
  if (authError) return authError;
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id < 1) return fail('Identificador de tasca invàlid');
  const result = await env.DB.prepare('DELETE FROM tasks WHERE id = ? RETURNING id').bind(id).first();
  if (!result) return fail('No s’ha trobat la tasca', 404);
  return json({ ok: true, deletedId: String(result.id) });
}
