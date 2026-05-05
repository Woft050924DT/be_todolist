import { Request, Response } from "express";
import taskService from "../services/taskService";
import { TaskListFilters } from "../models/taskModel";

function parseTaskId(id: string | string[]): number | null {
  if (Array.isArray(id)) {
    return null;
  }

  const taskId = Number(id);
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null;
}

export function getAllTasks(req: Request, res: Response) {
  const filters: TaskListFilters = {
    categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined,
    priority: req.query.priority !== undefined ? Number(req.query.priority) : undefined,
    dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
    dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
    search: req.query.search as string,
    includeRelated: req.query.includeRelated === 'true'
  };
  taskService.get(filters, res);
}

export function getTask(req: Request, res: Response) {
  const id = parseTaskId(req.params.id);

  if (!id) {
    return res.status(400).send({ status: 1, message: "Invalid task id" });
  }

  const includeRelated = req.query.includeRelated === 'true';
  taskService.getByID(id, includeRelated, res);
}

export function addTask(req: Request, res: Response) {
  taskService.create(req.body, res);
}

export function editTask(req: Request, res: Response) {
  const id = parseTaskId(req.params.id);

  if (!id) {
    return res.status(400).send({ status: 1, message: "Invalid task id" });
  }

  taskService.update(req.body, id, res);
}

export function removeTask(req: Request, res: Response) {
  const id = parseTaskId(req.params.id);

  if (!id) {
    return res.status(400).send({ status: 1, message: "Invalid task id" });
  }

  taskService.delete(id, res);
}
