import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../config/dbConfig";
import { TaskRequestBody, TaskListFilters, Task, Category, SubTask, Tag, Comment } from "../models/taskModel";
 
function normalizeTask(task: TaskRequestBody) {
  return {
    CategoryId: task.CategoryId ?? task.categoryId ?? null,
    Title: task.Title ?? task.title,
    Description: task.Description ?? task.description ?? null,
    Priority: task.Priority ?? task.priority ?? 1,
    Status: task.Status ?? task.status ?? 0,
    DueDate: task.DueDate ?? task.dueDate ?? null,
  };
}
 
function isForeignKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "number" in error &&
    (error as { number?: number }).number === 547
  );
}
 
export async function initializeTaskSchema(): Promise<void> {
  const result = await getPool().request().query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'Tasks'
      AND COLUMN_NAME IN ('TaskId', 'Title', 'Priority', 'Status')
  `);
 
  const columns = new Set(result.recordset.map((row) => row.COLUMN_NAME));
  const requiredColumns = ["TaskId", "Title", "Priority", "Status"];
  const missingColumns = requiredColumns.filter((column) => !columns.has(column));
 
  if (missingColumns.length > 0) {
    throw new Error(
      `dbo.Tasks schema is missing column(s): ${missingColumns.join(", ")}`
    );
  }
}
 
class TaskService {
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

      if (filters.includeRelated) {
        const enrichedTasks = await this.attachRelatedData(result.recordset as Task[]);
        res.send(enrichedTasks);
      } else {
        res.send(result.recordset);
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
 
      let task = result.recordset[0] as Task;
 
      if (includeRelated) {
        task = await this.attachRelatedData([task]) as Task;
      }
 
      res.send(task);
      console.log("Get by ID successful");
    } catch (error) {
      console.error("Get by ID fail:", error);
      res.status(500).send({ status: 1, message: "Task get by ID fail" });
    }
  }
 
  async create(task: TaskRequestBody, res: Response) {
    const data = normalizeTask(task);
 
    try {
      await getPool()
        .request()
        .input("CategoryId", sql.Int, data.CategoryId)
        .input("Title", sql.NVarChar(255), data.Title)
        .input("Description", sql.NVarChar(sql.MAX), data.Description)
        .input("Priority", sql.TinyInt, data.Priority)
        .input("Status", sql.TinyInt, data.Status)
        .input("DueDate", sql.DateTime2, data.DueDate ? new Date(data.DueDate) : null)
        .query(`
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
    const data = normalizeTask(task);
 
    try {
      const result = await getPool()
        .request()
        .input("TaskId", sql.Int, id)
        .input("CategoryId", sql.Int, data.CategoryId)
        .input("Title", sql.NVarChar(255), data.Title)
        .input("Description", sql.NVarChar(sql.MAX), data.Description)
        .input("Priority", sql.TinyInt, data.Priority)
        .input("Status", sql.TinyInt, data.Status)
        .input("DueDate", sql.DateTime2, data.DueDate ? new Date(data.DueDate) : null)
        .query(`
          UPDATE dbo.Tasks
          SET CategoryId = @CategoryId,
              Title = @Title,
              Description = @Description,
              Priority = @Priority,
              Status = @Status,
              DueDate = @DueDate,
              UpdatedAt = GETDATE()
          WHERE TaskId = @TaskId
        `);
 
      if (result.rowsAffected[0] === 0) {
        return res.status(404).send({ status: 1, message: "Task not found" });
      }
 
      res.send({ status: 0, message: "Task update success" });
      console.log("Put successful");
    } catch (error) {
      console.error("Task update fail:", error);
      const message = isForeignKeyError(error)
        ? "CategoryId does not exist"
        : "Task update fail";
      res.status(400).send({ status: 1, message });
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
 
  private async attachRelatedData(tasks: Task[]): Promise<Task | Task[]> {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }
 
    const taskIds = tasks.map(t => t.taskId);
    const categoryIds = tasks.filter(t => t.categoryId).map(t => t.categoryId).filter(Boolean) as number[];
 
    const [categories, subTasks, tags, comments] = await Promise.all([
      this.getCategories(categoryIds),
      this.getSubTasks(taskIds),
      this.getTags(taskIds),
      this.getComments(taskIds)
    ]);
 
    const categoryMap = new Map(categories.map(c => [c.categoryId, c]));
    const subTasksMap = new Map<number, SubTask[]>();
    const tagsMap = new Map<number, Tag[]>();
    const commentsMap = new Map<number, Comment[]>();
 
    subTasks.forEach(st => {
      if (!subTasksMap.has(st.taskId)) subTasksMap.set(st.taskId, []);
      subTasksMap.get(st.taskId)!.push(st);
    });
 
    tags.forEach(t => {
      if (!tagsMap.has(t.taskId)) tagsMap.set(t.taskId, []);
      tagsMap.get(t.taskId)!.push(t);
    });
 
    comments.forEach(c => {
      if (!commentsMap.has(c.taskId)) commentsMap.set(c.taskId, []);
      commentsMap.get(c.taskId)!.push(c);
    });
 
    const enrichedTasks = tasks.map(task => ({
      ...task,
      category: task.categoryId ? categoryMap.get(task.categoryId) : undefined,
      subTasks: subTasksMap.get(task.taskId) || [],
      tags: tagsMap.get(task.taskId) || [],
      comments: commentsMap.get(task.taskId) || []
    }));
 
    return enrichedTasks.length === 1 ? enrichedTasks[0] : enrichedTasks;
  }
 
  private async getCategories(categoryIds: number[]): Promise<Category[]> {
    if (categoryIds.length === 0) return [];
 
    const result = await getPool().request()
      .input("CategoryIds", sql.VarChar, categoryIds.join(','))
      .query(`SELECT * FROM dbo.Categories WHERE CategoryId IN (SELECT value FROM STRING_SPLIT(@CategoryIds, ','))`);
 
    return result.recordset as Category[];
  }
 
  private async getSubTasks(taskIds: number[]): Promise<SubTask[]> {
    if (taskIds.length === 0) return [];
 
    const result = await getPool().request()
      .input("TaskIds", sql.VarChar, taskIds.join(','))
      .query(`SELECT * FROM dbo.SubTasks WHERE TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ',')) ORDER BY SortOrder`);
 
    return result.recordset.map(st => ({
      ...st,
      isCompleted: st.IsCompleted === 1
    })) as SubTask[];
  }
 
  private async getTags(taskIds: number[]): Promise<(Tag & { taskId: number })[]> {
    if (taskIds.length === 0) return [];

    const result = await getPool().request()
      .input("TaskIds", sql.VarChar, taskIds.join(','))
      .query(`
        SELECT t.*, tt.TaskId 
        FROM dbo.Tags t
        INNER JOIN dbo.TaskTags tt ON t.TagId = tt.TagId
        WHERE tt.TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ','))
      `);

    return result.recordset as (Tag & { taskId: number })[];
  }
 
  private async getComments(taskIds: number[]): Promise<Comment[]> {
    if (taskIds.length === 0) return [];

    const result = await getPool().request()
      .input("TaskIds", sql.VarChar, taskIds.join(','))
      .query(`
        SELECT * FROM dbo.Comments 
        WHERE TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ','))
        ORDER BY CreatedAt DESC
      `);

    return result.recordset as Comment[];
  }
}

export default new TaskService();