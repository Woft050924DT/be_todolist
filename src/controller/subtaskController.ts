import {Request, Response} from 'express';
import SubTaskService from '../services/subtaskService';
import { SubTaskFilters } from '../models/taskModel';
const subTaskService = new SubTaskService();


function parseSubTaskId(id: string | string[]): number | null {
  if (Array.isArray(id)) {
    return null;
  }

  const subTaskId = Number(id);
  return Number.isInteger(subTaskId) && subTaskId > 0 ? subTaskId : null;
}

export function getAllSubTasks(req: Request, res: Response) {
  subTaskService.get(res);
}

export function getSubTasksByTaskId(req: Request, res: Response) {
  const taskId = Number(req.params.taskId);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).send({ status: 1, message: "Invalid task id" });
  }

  const filters : SubTaskFilters = {
    taskId,
    includeRelated: req.query.includeRelated === 'true'
  };
  subTaskService.getByTaskId(filters, res);
}

export function getSubTasks(req: Request, res: Response) {
    const id = parseSubTaskId(req.params.id);

    if (!id) {
        return res.status(400).send({ status: 1, message: "Invalid subtask id" });
    }
    subTaskService.getByID(id, res);
}


export function InsertSubTask(req: Request, res: Response) {
  subTaskService.create(req.body, res);
}

export function UpdateSubTask(req: Request, res: Response) {
    const id = parseSubTaskId(req.params.id);

    if (!id){
        return res.status(400).send({status:1, message:"Invalid subtask id"});
    }
    subTaskService.update(id, req.body, res);
}

export function DeleteSubTask(req: Request, res: Response){
    const id = parseSubTaskId(req.params.id);

    if (!id){
        return res.status(400).send({status:1, message:"Invalid subtask id"});
    }
    subTaskService.delete(id, res);
}
