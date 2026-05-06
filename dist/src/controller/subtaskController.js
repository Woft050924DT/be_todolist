"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubTasks = getAllSubTasks;
exports.getSubTasksByTaskId = getSubTasksByTaskId;
exports.getSubTasks = getSubTasks;
exports.InsertSubTask = InsertSubTask;
exports.UpdateSubTask = UpdateSubTask;
exports.DeleteSubTask = DeleteSubTask;
const subtaskService_1 = __importDefault(require("../services/subtaskService"));
const subTaskService = new subtaskService_1.default();
function parseSubTaskId(id) {
    if (Array.isArray(id)) {
        return null;
    }
    const subTaskId = Number(id);
    return Number.isInteger(subTaskId) && subTaskId > 0 ? subTaskId : null;
}
function getAllSubTasks(req, res) {
    subTaskService.get(res);
}
function getSubTasksByTaskId(req, res) {
    const taskId = Number(req.params.taskId);
    if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).send({ status: 1, message: "Invalid task id" });
    }
    const filters = {
        taskId,
        includeRelated: req.query.includeRelated === 'true'
    };
    subTaskService.getByTaskId(filters, res);
}
function getSubTasks(req, res) {
    const id = parseSubTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid subtask id" });
    }
    subTaskService.getByID(id, res);
}
function InsertSubTask(req, res) {
    subTaskService.create(req.body, res);
}
function UpdateSubTask(req, res) {
    const id = parseSubTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid subtask id" });
    }
    subTaskService.update(id, req.body, res);
}
function DeleteSubTask(req, res) {
    const id = parseSubTaskId(req.params.id);
    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid subtask id" });
    }
    subTaskService.delete(id, res);
}
