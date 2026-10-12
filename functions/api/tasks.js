function isAuthorized(request, env) {
  const token = env.JARVIS_API_TOKEN;
  return Boolean(token) && (request.headers.get('Authorization') || '') === `Bearer ${token}`;
}
const json = (body, status = 200) => Response.json(body, { status });
export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) return json({ ok: false, error: 'No autoritzat' }, 401);
  const result = await env.DB.prepare(
    `SELECT COALESCE(client_id, CAST(id AS TEXT)) AS id, title, description, due_at,
            priority, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 500`
  ).all();
  return json({ ok: true, tasks: result.results });
}
export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return json({ ok: false, error: 'No autoritzat' }, 401);
  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: 'JSON invàlid' }, 400); }
  if (data.action !== 'sync' || !Array.isArray(data.tasks) || data.tasks.length > 500) {
    return json({ ok: false, error: 'Sol·licitud invàlida' }, 400);
  }
  const tasks = data.tasks;
  for (const t of tasks) {
    if (!t || typeof t.id !== 'string' || typeof t.title !== 'string' || !t.title.trim() || t.title.length > 200) {
      return json({ ok: false, error: 'Hi ha una tasca invàlida' }, 400);
    }
  }
  const statements = [env.DB.prepare('DELETE FROM tasks')];
  for (const t of tasks) {
    statements.push(env.DB.prepare(
      `INSERT INTO tasks (client_id, title, description, due_at, priority, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      t.id, t.title.trim(), typeof t.description === 'string' ? t.description.slice(0, 2000) : '',
      typeof t.due === 'string' && t.due ? t.due : null,
      ['high','medium','low'].includes(t.priority) ? t.priority : 'medium',
      t.done ? 'completed' : 'pending',
      typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString()
    ));
  }
  await env.DB.batch(statements);
  return json({ ok: true, count: tasks.length });
}
