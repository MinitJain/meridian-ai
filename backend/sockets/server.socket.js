import { Server } from "socket.io";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { model, emailTool } from "../core/model.js";
import { searchWeb } from "../core/search.js";

async function shouldSearch(text) {
  const decision = await model.invoke([
    new HumanMessage(
      `Does this question require a web search to answer accurately? Reply only YES or NO.\n\nQuestion: ${text}`,
    ),
  ]);
  return String(decision.content).trim().startsWith("YES");
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const messages = [];

    socket.on("user_question", async ({ id, text }) => {
      try {
        let context = "";

        if (await shouldSearch(text)) {
          const results = await searchWeb(text);
          if (results?.length > 0) {
            socket.emit("sources", { id, results });
            context = results.map((r) => r.content).join("\n\n");
          }
        }

        const prompt = context
          ? `Answer based on context: ${context}\n\nQuestion: ${text}`
          : text;

        messages.push(new HumanMessage(prompt));

        let fullResponse = null;
        const stream = await model.stream(messages);

        for await (const chunk of stream) {
          fullResponse = fullResponse ? fullResponse.concat(chunk) : chunk;
          if (chunk.content) {
            socket.emit("response_chunk", { id, token: chunk.content });
          }
        }

        messages.push(fullResponse);

        if (fullResponse?.tool_calls?.length > 0) {
          for (const toolCall of fullResponse.tool_calls) {
            if (toolCall.name === "send_email") {
              const result = await emailTool.invoke(toolCall.args);
              messages.push(
                new ToolMessage({ content: result, tool_call_id: toolCall.id })
              );
              socket.emit("response_chunk", { id, token: `\n\n_${result}_` });
            }
          }

          const followUp = await model.stream(messages);
          for await (const chunk of followUp) {
            if (chunk.content) {
              socket.emit("response_chunk", { id, token: chunk.content });
            }
          }
        }

        socket.emit("response_done", { id });
      } catch (err) {
        socket.emit("error", { id, error: err.message || String(err) });
      }
    });
  });

  return io;
}
