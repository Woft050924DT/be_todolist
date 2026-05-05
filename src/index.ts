import express, { Express, Request, Response } from "express";
import { connectDB } from "../config/dbConfig";
import taskRoutes from "./routes/taskRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import { initializeTaskSchema } from "./services/taskService";
import cors from 'cors';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use("/tasks", taskRoutes);
app.use("/categories", categoryRoutes);

app.use(cors({
  origin: 'http://localhost:5173'
}))

async function startServer(): Promise<void> {
  try {
    await connectDB();
    await initializeTaskSchema();

    app.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Tasks API: http://localhost:${PORT}/tasks`);
      console.log(`Categories API: http://localhost:${PORT}/categories`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
