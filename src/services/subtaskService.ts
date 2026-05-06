import { Response } from "express";
import { SubTask, SubTaskFilters } from "../models/taskModel";
import subTaskReadService from "./subtask/subtaskReadService";
import subTaskWriteService from "./subtask/subtaskWriteService";
import { SubTaskRequestBody } from "./subtask/subtaskUtils";

class SubTaskService {
  async get(res: Response) {
    return subTaskReadService.get(res);
  }

  async getByTaskId(filters: SubTaskFilters, res: Response) {
    return subTaskReadService.getByTaskId(filters, res);
  }

  async getByID(id: number, res: Response) {
    return subTaskReadService.getByID(id, res);
  }

  async create(subTask: SubTask, res: Response) {
    return subTaskWriteService.create(subTask, res);
  }

  async update(id: number, subTask: SubTaskRequestBody, res: Response) {
    return subTaskWriteService.update(id, subTask, res);
  }

  async delete(id: number, res: Response) {
    return subTaskWriteService.delete(id, res);
  }
}

export default SubTaskService;
