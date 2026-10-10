
function isAuthorized(request, env) {
  const token = env.JARVIS_API_TOKEN;
  const auth = request.headers.get("Authorization") || "";

  return Boolean(token) && auth === `Bearer ${token}`;
}

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) {
    return Response.json(
      { ok: false, error: "No autoritzat" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let result;

  if (status) {
    result = await env.DB.prepare(
      "SELECT id, title, description, due_at, status, created_at FROM tasks WHERE status = ? ORDER BY created_at DESC LIMIT 100"
    ).bind(status).all();
  } else {
    result = await env.DB.prepare(
      "SELECT id, title, description, due_at, status, created_at FROM tasks ORDER BY created_at DESC LIMIT 100"
    ).all();
  }

  return Response.json({ ok: true, tasks: result.results });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) {
    return Response.json(
      { ok: false, error: "No autoritzat" },
      { status: 401 }
    );
  }

  let data;

  try {
    data = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "JSON invàlid" },
      { status: 400 }
    );
  }

  const title =
    typeof data.title === "string" ? data.title.trim() : "";

  if (!title || title.length > 200) {
    return Response.json(
      {
        ok: false,
        error: "El títol és obligatori i ha de tenir com a màxim 200 caràcters"
      },
      { status: 400 }
    );
  }

  const description =
    typeof data.description === "string"
      ? data.description.slice(0, 2000)
      : null;

  const dueAt =
    typeof data.due_at === "string"
      ? data.due_at.slice(0, 100)
      : null;

  const result = await env.DB.prepare(
    "INSERT INTO tasks (title, description, due_at) VALUES (?, ?, ?) RETURNING id, title, description, due_at, status, created_at"
  ).bind(title, description, dueAt).first();

  return Response.json({ ok: true, task: result }, { status: 201 });
}
