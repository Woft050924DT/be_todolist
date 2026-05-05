import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config: sql.config = {
  user: process.env.USER || "",
  password: process.env.PASSWORD || "",
  server: process.env.SERVER || "",
  database: "ToDoList",
  options: { encrypt: true, trustServerCertificate: true },
};

let pool: sql.ConnectionPool;

export async function connectDB(): Promise<void> {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✓ Database connected successfully!");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    throw error;
  }
}

export function getPool(): sql.ConnectionPool {
  if (!pool) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return pool;
}

export async function disconnectDB(): Promise<void> {
  if (pool) {
    await pool.close();
    console.log("Database disconnected.");
  }
}
