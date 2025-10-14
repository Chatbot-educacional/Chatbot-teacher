import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionRoutes from "./routes/session.routes";
import { connectPocketBase } from "./services/pocketbase.service";
import classRoutes from "./routes/class.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/session", sessionRoutes);
app.use("/api/classes", classRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Metrics API (PocketBase) is up" });
});

const PORT = process.env.PORT || 3000;

connectPocketBase().finally(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
