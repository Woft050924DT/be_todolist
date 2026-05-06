import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../config/dbConfig";
import { SubTask, SubTaskFilters } from "../models/taskModel";

function normalizeSubTask(subTask: any): SubTask {
  return {
    subTaskId: subTask.subTaskId ?? subTask.SubTaskId,
    taskId: subTask.taskId ?? subTask.TaskId,
    title: subTask.title ?? subTask.Title,
    isCompleted: Boolean(subTask.isCompleted ?? subTask.IsCompleted),
    sortOrder: subTask.sortOrder ?? subTask.SortOrder,
  };
}

class SubTaskService {
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

  async create(subTask: SubTask, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("TaskId", sql.Int, subTask.taskId)
        .input("Title", sql.NVarChar(255), subTask.title)
        .input("IsCompleted", sql.Bit, subTask.isCompleted ?? false)
        .input("SortOrder", sql.Int, subTask.sortOrder ?? 0)
        .query(`
          INSERT INTO dbo.SubTasks (TaskId, Title, IsCompleted, SortOrder)
          VALUES (@TaskId, @Title, @IsCompleted, @SortOrder);
          SELECT SCOPE_IDENTITY() AS subTaskId;
        `);

      res.send({ status: 0, data: { subTaskId: result.recordset[0].subTaskId } });
    } catch (error) {
      console.error("Create subtask fail:", error);
      res.status(400).send({ status: 1, message: "Subtask creation fail" });
    }
  }

  async update(id: number, subTask: SubTask, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("SubTaskId", sql.Int, id)
        .input("Title", sql.NVarChar(255), subTask.title)
        .input("IsCompleted", sql.Bit, subTask.isCompleted)
        .input("SortOrder", sql.Int, subTask.sortOrder)
        .query(`
          UPDATE dbo.SubTasks
          SET Title = @Title,
              IsCompleted = @IsCompleted,
              SortOrder = @SortOrder
          WHERE SubTaskId = @SubTaskId
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).send({ status: 1, message: "Subtask not found" });
      }

      res.send({ status: 0, message: "Subtask update success" });
    } catch (error) {
      console.error("Update subtask fail:", error);
      res.status(400).send({ status: 1, message: "Subtask update fail" });
    }
  }

  async delete(id: number, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("SubTaskId", sql.Int, id)
        .query("DELETE FROM dbo.SubTasks WHERE SubTaskId = @SubTaskId");

      if (result.rowsAffected[0] === 0) {
        return res.status(404).send({ status: 1, message: "Subtask not found" });
      }

      res.send({ status: 0, message: "Subtask delete success" });
    } catch (error) {
      console.error("Delete subtask fail:", error);
      res.status(500).send({ status: 1, message: "Subtask delete fail" });
    }
  }
}

export default SubTaskService;
