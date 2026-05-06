"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbConfig_1 = require("../config/dbConfig");
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const subTaskRoute_1 = __importDefault(require("./routes/subTaskRoute"));
const taskService_1 = require("./services/taskService");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
    ],
    credentials: true,
}));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});
app.use("/tasks", taskRoutes_1.default);
app.use("/categories", categoryRoutes_1.default);
app.use("/subtasks", subTaskRoute_1.default);
async function startServer() {
    try {
        await (0, dbConfig_1.connectDB)();
        await (0, taskService_1.initializeTaskSchema)();
        app.listen(PORT, () => {
            console.log(`Express server running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Tasks API: http://localhost:${PORT}/tasks`);
            console.log(`Categories API: http://localhost:${PORT}/categories`);
            console.log(`Subtasks API: http://localhost:${PORT}/subtasks`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
