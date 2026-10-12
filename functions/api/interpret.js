const json = (body, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "no-store" }
});

const schema = {
  type: "OBJECT",
  properties: {
    action: { type: "STRING", enum: ["create", "update", "complete", "reopen", "delete", "list", "summary", "clarify", "unknown"] },
    taskId: { type: "STRING", nullable: true },
    title: { type: "STRING", nullable: true },
    description: { type: "STRING", nullable: true },
    due: { type: "STRING", nullable: true, description: "Due date in YYYY-MM-DD, or empty string if not specified." },
    priority: { type: "STRING", enum: ["high", "medium", "low"] },
    response: { type: "STRING" },
    clarification: { type: "STRING", nullable: true }
  },
  required: ["action", "taskId", "title", "description", "due", "priority", "response", "clarification"]
};

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: "Falta configurar el secret GEMINI_API_KEY a Cloudflare Pages." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON invàlid." }, 400); }
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 1500) : "";
  if (!text) return json({ error: "Escriu una instrucció." }, 400);

  const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 150).map(t => ({
    id: String(t.id || "").slice(0, 80),
    title: String(t.title || "").slice(0, 180),
    description: String(t.description || "").slice(0, 300),
    due: String(t.due || "").slice(0, 10),
    done: Boolean(t.done),
    priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium"
  })) : [];
  const context = Array.isArray(body.history) ? body.history.slice(-6).map(x => ({
    user: String(x.user || "").slice(0, 500),
    assistant: String(x.assistant || "").slice(0, 500)
  })) : [];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
  const prompt = `You are the natural-language task interpreter for JARVIS, a personal task app. Current date in Europe/Madrid: ${today}.
Return only the schema JSON. Understand Catalan, Spanish, and English, including natural variants such as "trucar a en Jordi", "trucar al Jordi", "llamar a Jordi". Resolve relative dates using the current date.
Choose exactly one action:
- create: user clearly asks to add a new task.
- update: user clearly asks to change an existing task's title, date, description or priority.
- complete/reopen/delete: operate on an existing task.
- list/summary: user asks to inspect tasks or get a daily summary.
- clarify: the target task is missing/ambiguous, or a destructive action is not safely resolved.
- unknown: not a task-management request.
Never invent a task ID. Select taskId only from the provided tasks. Prefer exact semantic match, not literal title equality. If two tasks could match, ask which one. If the user says change/move/reschedule/edit/complete/delete and no existing task can be confidently identified, use clarify, NEVER create a task. For follow-up references like "it", "that task", use lastTaskId only if it exists in the provided tasks. Use due as YYYY-MM-DD or empty string. For update, return only fields the user wants to change; leave title/description/due empty when unspecified. For create, title must be a concise task title without dates or command words. Be concise and answer in the user's language.
Tasks: ${JSON.stringify(tasks)}
Recent conversation: ${JSON.stringify(context)}
Last task id: ${String(body.lastTaskId || "")}
User instruction: ${text}`;

  try {
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1, maxOutputTokens: 500 }
      })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return json({ error: "Gemini ha rebutjat la petició. Revisa el secret, el model i la quota.", providerStatus: resp.status }, 502);
    const out = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!out) return json({ error: "Gemini no ha retornat cap interpretació vàlida." }, 502);
    let result;
    try { result = JSON.parse(out); } catch { return json({ error: "La resposta de Gemini no és JSON vàlid." }, 502); }
    const allowed = ["create","update","complete","reopen","delete","list","summary","clarify","unknown"];
    if (!allowed.includes(result.action)) return json({ error: "Acció no permesa." }, 502);
    if (result.taskId && !tasks.some(t => t.id === result.taskId)) result.taskId = null;
    if (result.due && !/^\d{4}-\d{2}-\d{2}$/.test(result.due)) result.due = "";
    result.priority = ["high","medium","low"].includes(result.priority) ? result.priority : "medium";
    return json({ ok: true, result });
  } catch {
    return json({ error: "No s'ha pogut contactar amb Gemini." }, 502);
  }
}
