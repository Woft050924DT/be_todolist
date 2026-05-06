"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = getAllTasks;
exports.getTask = getTask;
exports.addTask = addTask;
exports.editTask = editTask;
exports.removeTask = removeTask;
const taskService_1 = __importDefault(require("../services/taskService"));
function parseTaskId(id) {
    if (Array.isArray(id)) {
        return null;
    }
    const taskId = Number(id);
    return Number.isInteger(taskId) && taskId > 0 ? taskId : null;
}
function getAllTasks(req, res) {
    const filters = {
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        status: req.query.status !== undefined ? Number(req.query.status) : undefined,
        priority: req.query.priority !== undefined ? Number(req.query.priority) : undefined,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo) : undefined,
        search: req.query.search,
        includeRelated: req.query.includeRelated === 'true'
    };
    taskService_1.default.get(filters, res);
}
function getTask(req, res) {
    const id = parseTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid task id" });
    }
    const includeRelated = req.query.includeRelated === 'true';
    taskService_1.default.getByID(id, includeRelated, res);
}
function addTask(req, res) {
    taskService_1.default.create(req.body, res);
}
function editTask(req, res) {
    const id = parseTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid task id" });
    }
    taskService_1.default.update(req.body, id, res);
}
function removeTask(req, res) {
    const id = parseTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid task id" });
    }
    taskService_1.default.delete(id, res);
}
