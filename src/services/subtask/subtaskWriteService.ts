import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { SubTask } from "../../models/taskModel";
import { normalizeSubTaskRequest, SubTaskRequestBody } from "./subtaskUtils";

class SubTaskWriteService {
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

  async update(id: number, subTask: SubTaskRequestBody, res: Response) {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).send({ status: 1, message: "Invalid subtask ID" });
    }

    const data = normalizeSubTaskRequest(subTask);

    try {
      const request = getPool().request().input("SubTaskId", sql.Int, id);
      const updateFields: string[] = [];

      if (data.TaskId !== undefined) {
        request.input("TaskId", sql.Int, data.TaskId);
        updateFields.push("TaskId = @TaskId");
      }

      if (data.Title !== undefined) {
        if (!data.Title.trim()) {
          return res.status(400).send({ status: 1, message: "Title is required" });
        }
        request.input("Title", sql.NVarChar(255), data.Title);
        updateFields.push("Title = @Title");
      }

      if (data.IsCompleted !== undefined) {
        request.input("IsCompleted", sql.Bit, data.IsCompleted);
        updateFields.push("IsCompleted = @IsCompleted");
      }

      if (data.SortOrder !== undefined) {
        request.input("SortOrder", sql.Int, data.SortOrder);
        updateFields.push("SortOrder = @SortOrder");
      }

      if (updateFields.length === 0) {
        return res.status(400).send({
          status: 1,
          message: "No fields to update",
        });
      }

      const query = `
        UPDATE dbo.SubTasks
        SET ${updateFields.join(", ")}
        WHERE SubTaskId = @SubTaskId
      `;

      const result = await request.query(query);

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

export default new SubTaskWriteService();
