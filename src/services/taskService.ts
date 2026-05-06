import { Response } from "express";
import { TaskListFilters, TaskRequestBody } from "../models/taskModel";
import taskReadService from "./task/taskReadService";
import taskWriteService from "./task/taskWriteService";
export { initializeTaskSchema } from "./task/taskUtils";

class TaskService {
  async get(filters: TaskListFilters, res: Response) {
    return taskReadService.get(filters, res);
  }

  async getByID(id: number, includeRelated: boolean, res: Response) {
    return taskReadService.getByID(id, includeRelated, res);
  }

  async create(task: TaskRequestBody, res: Response) {
    return taskWriteService.create(task, res);
  }

  async update(task: TaskRequestBody, id: number, res: Response) {
    return taskWriteService.update(task, id, res);
  }

  async delete(id: number, res: Response) {
    return taskWriteService.delete(id, res);
  }
}

export default new TaskService();
