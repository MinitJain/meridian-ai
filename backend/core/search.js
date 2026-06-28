import dotenv from "dotenv";
dotenv.config();
import { tavily } from "@tavily/core";

export async function searchWeb(query) {
  const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const response = await client.search(query);
  return response.results;
}
