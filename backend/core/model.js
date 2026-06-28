import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendEmail } from "../mail.service.js";
import { ChatMistralAI } from "@langchain/mistralai";

const emailTool = tool(
  async ({ to, subject, body }) => {
    await sendEmail(to, subject, body, body);
    return `Email sent to ${to}`;
  },
  {
    name: "send_email",
    description: "Send an email to a recipient",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body content"),
    }),
  },
);

export { emailTool };

export const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-large-latest",
}).bindTools([emailTool]);
