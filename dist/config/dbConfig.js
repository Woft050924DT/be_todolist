"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getPool = getPool;
exports.disconnectDB = disconnectDB;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    user: process.env.USER || "",
    password: process.env.PASSWORD || "",
    server: process.env.SERVER || "",
    database: "ToDoList",
    options: { encrypt: true, trustServerCertificate: true },
};
let pool;
async function connectDB() {
    try {
        pool = new mssql_1.default.ConnectionPool(config);
        await pool.connect();
        console.log("✓ Database connected successfully!");
    }
    catch (error) {
        console.error("✗ Database connection failed:", error);
        throw error;
    }
}
function getPool() {
    if (!pool) {
        throw new Error("Database not connected. Call connectDB() first.");
    }
    return pool;
}
async function disconnectDB() {
    if (pool) {
        await pool.close();
        console.log("Database disconnected.");
    }
}
