import { SubTask } from "../../models/taskModel";

export interface SubTaskRequestBody {
  taskId?: number;
  title?: string;
  isCompleted?: boolean;
  sortOrder?: number;
  TaskId?: number;
  Title?: string;
  IsCompleted?: boolean;
  SortOrder?: number;
}

export function normalizeSubTaskRequest(subTask: SubTaskRequestBody) {
  return {
    TaskId: subTask.TaskId ?? subTask.taskId,
    Title: subTask.Title ?? subTask.title,
    IsCompleted: subTask.IsCompleted ?? subTask.isCompleted,
    SortOrder: subTask.SortOrder ?? subTask.sortOrder,
  };
}

export function normalizeSubTask(subTask: any): SubTask {
  return {
    subTaskId: subTask.subTaskId ?? subTask.SubTaskId,
    taskId: subTask.taskId ?? subTask.TaskId,
    title: subTask.title ?? subTask.Title,
    isCompleted: Boolean(subTask.isCompleted ?? subTask.IsCompleted),
    sortOrder: subTask.sortOrder ?? subTask.SortOrder,
  };
}
