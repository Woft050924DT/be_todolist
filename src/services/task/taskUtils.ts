import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { Task, TaskRequestBody } from "../../models/taskModel";

export function normalizeTask(task: TaskRequestBody) {
  return {
    CategoryId: task.CategoryId ?? task.categoryId ?? null,
    Title: task.Title ?? task.title,
    Description: task.Description ?? task.description ?? null,
    Priority: task.Priority ?? task.priority ?? 1,
    Status: task.Status ?? task.status ?? 0,
    DueDate: task.DueDate ?? task.dueDate ?? null,
  };
}

export function isForeignKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "number" in error &&
    (error as { number?: number }).number === 547
  );
}

export function normalizeTaskRecord(task: any): Task {
  return {
    taskId: task.taskId ?? task.TaskId,
    categoryId: task.categoryId ?? task.CategoryId ?? null,
    title: task.title ?? task.Title,
    description: task.description ?? task.Description ?? null,
    priority: task.priority ?? task.Priority,
    status: task.status ?? task.Status,
    dueDate: task.dueDate ?? task.DueDate ?? null,
    createdAt: task.createdAt ?? task.CreatedAt,
    updatedAt: task.updatedAt ?? task.UpdatedAt,
  };
}

export async function initializeTaskSchema(): Promise<void> {
  const result = await getPool().request().query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'Tasks'
      AND COLUMN_NAME IN ('TaskId', 'Title', 'Priority', 'Status')
  `);

  const columns = new Set(
    result.recordset.map((row: { COLUMN_NAME: string }) => row.COLUMN_NAME),
  );
  const requiredColumns = ["TaskId", "Title", "Priority", "Status"];
  const missingColumns = requiredColumns.filter(
    (column) => !columns.has(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `dbo.Tasks schema is missing column(s): ${missingColumns.join(", ")}`,
    );
  }
}

export function addTaskInputs(request: sql.Request, task: ReturnType<typeof normalizeTask>) {
  return request
    .input("CategoryId", sql.Int, task.CategoryId)
    .input("Title", sql.NVarChar(255), task.Title)
    .input("Description", sql.NVarChar(sql.MAX), task.Description)
    .input("Priority", sql.TinyInt, task.Priority)
    .input("Status", sql.TinyInt, task.Status)
    .input("DueDate", sql.DateTime2, task.DueDate ? new Date(task.DueDate) : null);
}
