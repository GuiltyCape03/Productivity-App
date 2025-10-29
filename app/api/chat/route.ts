// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "nodejs"; // importante: usar Node.js para leer variables de entorno

type Msg = { role: "user" | "assistant" | "system"; content: string };

function envOrDefault(name: string, def?: string) {
  const v = process.env[name];
  return (v && v.trim().length > 0) ? v : def;
}

const MODEL = envOrDefault("OPENAI_MODEL", "gpt-5")!;
const TEMPERATURE = Number(envOrDefault("OPENAI_TEMPERATURE", "0.7"));
const MAX_OUTPUT_TOKENS = Number(envOrDefault("OPENAI_MAX_OUTPUT_TOKENS", "800"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return badRequest("Falta OPENAI_API_KEY en .env.local");
  }

  let body: { messages?: Msg[]; project?: string } = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("JSON inválido");
  }

  const project = body.project ?? "Todos los proyectos";
  const messages = Array.isArray(body.messages) ? body.messages : [];

  // Sanitiza y limita el historial (memoria corta)
  const trimmed: Msg[] = messages
    .filter(m => m && typeof m.content === "string" && typeof m.role === "string")
    .slice(-12);

  const system: Msg = {
    role: "system",
    content:
      `Eres un coach de productividad claro y directo. Responde en español. ` +
      `Evita repetición; da recomendaciones accionables en 3–6 frases. ` +
      `Usa bloques 50/10 cuando sea útil. Proyecto activo: ${project}.`,
  };

  // Usamos el cliente Chat Completions disponible en la versión actual del SDK
  try {
    const chatResponse = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: system.role, content: system.content },
        ...trimmed.map((m) => ({ role: m.role, content: m.content }))
      ],
      temperature: TEMPERATURE,
      max_tokens: MAX_OUTPUT_TOKENS,
    });

    // Extraemos texto de la primera elección
    const text = chatResponse.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ output: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const msg = err?.message ?? "Fallo al contactar OpenAI";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
