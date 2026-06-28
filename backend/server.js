import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import express from "express";
import http from "http";
import { initSocket } from "./sockets/server.socket.js";

import cors from "cors";

const app = express();

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
app.use(cors());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
