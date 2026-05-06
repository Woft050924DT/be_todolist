import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { Task, TaskListFilters } from "../../models/taskModel";
import taskRelatedService from "./taskRelatedService";
import { normalizeTaskRecord } from "./taskUtils";

class TaskReadService {
  async get(filters: TaskListFilters, res: Response) {
    try {
      const request = getPool().request();
      let query = "SELECT * FROM dbo.Tasks WHERE 1=1";

      if (filters.categoryId) {
        request.input("CategoryId", sql.Int, filters.categoryId);
        query += " AND CategoryId = @CategoryId";
      }

      if (filters.status !== undefined) {
        request.input("Status", sql.TinyInt, filters.status);
        query += " AND Status = @Status";
      }

      if (filters.priority !== undefined) {
        request.input("Priority", sql.TinyInt, filters.priority);
        query += " AND Priority = @Priority";
      }

      if (filters.dueDateFrom) {
        request.input("DueDateFrom", sql.DateTime2, filters.dueDateFrom);
        query += " AND DueDate >= @DueDateFrom";
      }

      if (filters.dueDateTo) {
        request.input("DueDateTo", sql.DateTime2, filters.dueDateTo);
        query += " AND DueDate <= @DueDateTo";
      }

      if (filters.search) {
        request.input("Search", sql.NVarChar(255), `%${filters.search}%`);
        query += " AND (Title LIKE @Search OR Description LIKE @Search)";
      }

      query += " ORDER BY TaskId DESC";

      const result = await request.query(query);
      const tasks = result.recordset.map(normalizeTaskRecord);

      if (filters.includeRelated) {
        const enrichedTasks = await taskRelatedService.attachRelatedData(tasks);
        res.send(enrichedTasks);
      } else {
        res.send(tasks);
      }
      console.log("Get successful");
    } catch (error) {
      console.error("Get fail:", error);
      res.status(500).send({ status: 1, message: "Task get fail" });
    }
  }

  async getByID(id: number, includeRelated: boolean, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("TaskId", sql.Int, id)
        .query("SELECT * FROM dbo.Tasks WHERE TaskId = @TaskId");

      if (result.recordset.length === 0) {
        return res.status(404).send({ status: 1, message: "Task not found" });
      }

      let task = normalizeTaskRecord(result.recordset[0]) as Task;

      if (includeRelated) {
        const [enrichedTask] = await taskRelatedService.attachRelatedData([task]);
        task = enrichedTask;
      }

      res.send(task);
      console.log("Get by ID successful");
    } catch (error) {
      console.error("Get by ID fail:", error);
      res.status(500).send({ status: 1, message: "Task get by ID fail" });
    }
  }
}

export default new TaskReadService();
