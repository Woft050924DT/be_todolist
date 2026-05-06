import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { SubTaskFilters } from "../../models/taskModel";
import { normalizeSubTask } from "./subtaskUtils";

class SubTaskReadService {
  async get(res: Response) {
    try {
      const result = await getPool().request().query(`
        SELECT
          SubTaskId AS subTaskId,
          TaskId AS taskId,
          Title AS title,
          IsCompleted AS isCompleted,
          SortOrder AS sortOrder
        FROM dbo.SubTasks
        ORDER BY TaskId ASC, SortOrder ASC
      `);

      res.send({ status: 0, data: result.recordset.map(normalizeSubTask) });
    } catch (error) {
      console.error("Get subtasks fail:", error);
      res.status(500).send({ status: 1, message: "Subtask get fail" });
    }
  }

  async getByTaskId(filters: SubTaskFilters, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("TaskId", sql.Int, filters.taskId)
        .query(`
          SELECT
            SubTaskId AS subTaskId,
            TaskId AS taskId,
            Title AS title,
            IsCompleted AS isCompleted,
            SortOrder AS sortOrder
          FROM dbo.SubTasks
          WHERE TaskId = @TaskId
          ORDER BY SortOrder ASC
        `);

      res.send({ status: 0, data: result.recordset.map(normalizeSubTask) });
    } catch (error) {
      console.error("Get subtasks by task id fail:", error);
      res.status(500).send({ status: 1, message: "Subtask get fail" });
    }
  }

  async getByID(id: number, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("SubTaskId", sql.Int, id)
        .query(`
          SELECT
            SubTaskId AS subTaskId,
            TaskId AS taskId,
            Title AS title,
            IsCompleted AS isCompleted,
            SortOrder AS sortOrder
          FROM dbo.SubTasks
          WHERE SubTaskId = @SubTaskId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).send({ status: 1, message: "Subtask not found" });
      }

      res.send({ status: 0, data: normalizeSubTask(result.recordset[0]) });
    } catch (error) {
      console.error("Get subtask by id fail:", error);
      res.status(500).send({ status: 1, message: "Subtask get fail" });
    }
  }
}

export default new SubTaskReadService();
