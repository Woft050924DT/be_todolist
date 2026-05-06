import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { TaskRequestBody } from "../../models/taskModel";
import { addTaskInputs, isForeignKeyError, normalizeTask } from "./taskUtils";

class TaskWriteService {
  async create(task: TaskRequestBody, res: Response) {
    const data = normalizeTask(task);

    try {
      await addTaskInputs(getPool().request(), data).query(`
        INSERT INTO dbo.Tasks (
          CategoryId,
          Title,
          Description,
          Priority,
          Status,
          DueDate
        )
        VALUES (
          @CategoryId,
          @Title,
          @Description,
          @Priority,
          @Status,
          @DueDate
        )
      `);

      res.send({ status: 0, message: "Task create success" });
      console.log("Post successful");
    } catch (error) {
      console.error("Task creation fail:", error);
      const message = isForeignKeyError(error)
        ? "CategoryId does not exist"
        : "Task creation fail";
      res.status(400).send({ status: 1, message });
    }
  }

  async update(task: TaskRequestBody, id: number, res: Response) {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).send({ status: 1, message: "Invalid task ID" });
    }

    const data = normalizeTask(task);

    try {
      const request = getPool().request().input("TaskId", sql.Int, id);
      const updateFields: string[] = [];

      if (data.CategoryId !== undefined) {
        request.input("CategoryId", sql.Int, data.CategoryId);
        updateFields.push("CategoryId = @CategoryId");
      }

      if (data.Title !== undefined) {
        if (!data.Title.trim()) {
          return res
            .status(400)
            .send({ status: 1, message: "Title is required" });
        }
        request.input("Title", sql.NVarChar(255), data.Title);
        updateFields.push("Title = @Title");
      }

      if (data.Description !== undefined) {
        request.input("Description", sql.NVarChar(sql.MAX), data.Description);
        updateFields.push("Description = @Description");
      }

      if (data.Priority !== undefined) {
        request.input("Priority", sql.TinyInt, data.Priority);
        updateFields.push("Priority = @Priority");
      }

      if (data.Status !== undefined) {
        request.input("Status", sql.TinyInt, data.Status);
        updateFields.push("Status = @Status");
      }

      if (data.DueDate !== undefined) {
        request.input(
          "DueDate",
          sql.DateTime2,
          data.DueDate ? new Date(data.DueDate) : null,
        );
        updateFields.push("DueDate = @DueDate");
      }

      if (updateFields.length === 0) {
        return res.status(400).send({
          status: 1,
          message: "No fields to update",
        });
      }

      const query = `
        UPDATE dbo.Tasks
        SET ${updateFields.join(", ")},
            UpdatedAt = GETDATE()
        WHERE TaskId = @TaskId
      `;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).send({
          status: 1,
          message: "Task not found",
        });
      }

      return res.status(200).send({
        status: 0,
        message: "Task updated successfully",
      });
    } catch (error) {
      console.error("Task update failed:", error);

      if (isForeignKeyError(error)) {
        return res.status(400).send({
          status: 1,
          message: "CategoryId does not exist",
        });
      }

      return res.status(500).send({
        status: 1,
        message: "Internal server error",
      });
    }
  }

  async delete(id: number, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("TaskId", sql.Int, id)
        .query("DELETE FROM dbo.Tasks WHERE TaskId = @TaskId");

      if (result.rowsAffected[0] === 0) {
        return res.status(404).send({ status: 1, message: "Task not found" });
      }

      res.send({ status: 0, message: "Task delete success" });
      console.log("Delete successful");
    } catch (error) {
      console.error("Task delete fail:", error);
      res.status(500).send({ status: 1, message: "Task delete fail" });
    }
  }
}

export default new TaskWriteService();
