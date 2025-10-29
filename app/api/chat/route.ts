import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  project?: string | null;
}

const textEncoder = new TextEncoder();

function streamError(message: string) {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.enqueue(textEncoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      },
      status: 500
    }
  );
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return streamError("OPENAI_API_KEY no configurada en el servidor.");
  }

  let payload: ChatRequestBody;
  try {
    payload = (await request.json()) as ChatRequestBody;
  } catch {
    return streamError("Solicitud inválida: JSON no válido.");
  }

  const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
  if (messages.length === 0) {
    return streamError("Solicitud inválida: se requieren mensajes.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const today = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
  const projectLabel = payload.project ? `Proyecto activo: ${payload.project}.` : "Sin proyecto seleccionado.";

  try {
    const stream = await client.responses.stream({
      model: MODEL,
      input: [
        {
          role: "system",
          content: `Eres NeuralDesk, un copiloto de productividad bilingüe. Responde en español con tono profesional y cálido. Ofrece diagnóstico breve, bloques de trabajo de 50/10 y recordatorios accionables.
Fecha: ${today}.
${projectLabel}
Considera el contexto del usuario: tareas, metas y calendario gestionados desde la app.`
        },
        ...messages.map((message) => ({ role: message.role, content: message.content }))
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_output_tokens: 800
    });

    return new Response(stream.toReadableStream(), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al contactar a OpenAI.";
    return streamError(message);
  }
}
