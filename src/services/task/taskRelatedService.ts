import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { Category, Comment, SubTask, Tag, Task } from "../../models/taskModel";

function normalizeCategory(category: any): Category {
  return {
    categoryId: category.categoryId ?? category.CategoryId,
    name: category.name ?? category.Name,
    color: category.color ?? category.Color,
    createdAt: category.createdAt ?? category.CreatedAt,
  };
}

function normalizeSubTask(subTask: any): SubTask {
  return {
    subTaskId: subTask.subTaskId ?? subTask.SubTaskId,
    taskId: subTask.taskId ?? subTask.TaskId,
    title: subTask.title ?? subTask.Title,
    isCompleted: Boolean(subTask.isCompleted ?? subTask.IsCompleted),
    sortOrder: subTask.sortOrder ?? subTask.SortOrder,
  };
}

function normalizeTag(tag: any): Tag & { taskId: number } {
  return {
    tagId: tag.tagId ?? tag.TagId,
    taskId: tag.taskId ?? tag.TaskId,
    name: tag.name ?? tag.Name,
    color: tag.color ?? tag.Color,
  };
}

function normalizeComment(comment: any): Comment {
  return {
    commentId: comment.commentId ?? comment.CommentId,
    taskId: comment.taskId ?? comment.TaskId,
    content: comment.content ?? comment.Content,
    createdAt: comment.createdAt ?? comment.CreatedAt,
  };
}

class TaskRelatedService {
  async attachRelatedData(tasks: Task[]): Promise<Task[]> {
    if (!tasks || tasks.length === 0) {
      return tasks;
    }

    const taskIds = tasks.map((task) => task.taskId);
    const categoryIds = tasks
      .map((task) => task.categoryId)
      .filter((categoryId): categoryId is number => Boolean(categoryId));

    const [categories, subTasks, tags, comments] = await Promise.all([
      this.getCategories(categoryIds),
      this.getSubTasks(taskIds),
      this.getTags(taskIds),
      this.getComments(taskIds),
    ]);

    const categoryMap = new Map(categories.map((category) => [category.categoryId, category]));
    const subTasksMap = new Map<number, SubTask[]>();
    const tagsMap = new Map<number, Tag[]>();
    const commentsMap = new Map<number, Comment[]>();

    subTasks.forEach((subTask) => {
      if (!subTasksMap.has(subTask.taskId)) {
        subTasksMap.set(subTask.taskId, []);
      }
      subTasksMap.get(subTask.taskId)!.push(subTask);
    });

    tags.forEach((tag) => {
      if (!tagsMap.has(tag.taskId)) {
        tagsMap.set(tag.taskId, []);
      }
      tagsMap.get(tag.taskId)!.push(tag);
    });

    comments.forEach((comment) => {
      if (!commentsMap.has(comment.taskId)) {
        commentsMap.set(comment.taskId, []);
      }
      commentsMap.get(comment.taskId)!.push(comment);
    });

    return tasks.map((task) => ({
      ...task,
      category: task.categoryId ? categoryMap.get(task.categoryId) : undefined,
      subTasks: subTasksMap.get(task.taskId) || [],
      tags: tagsMap.get(task.taskId) || [],
      comments: commentsMap.get(task.taskId) || [],
    }));
  }

  private async getCategories(categoryIds: number[]): Promise<Category[]> {
    if (categoryIds.length === 0) return [];

    const result = await getPool()
      .request()
      .input("CategoryIds", sql.VarChar, categoryIds.join(","))
      .query(
        "SELECT * FROM dbo.Categories WHERE CategoryId IN (SELECT value FROM STRING_SPLIT(@CategoryIds, ','))",
      );

    return result.recordset.map(normalizeCategory);
  }

  private async getSubTasks(taskIds: number[]): Promise<SubTask[]> {
    if (taskIds.length === 0) return [];

    const result = await getPool()
      .request()
      .input("TaskIds", sql.VarChar, taskIds.join(","))
      .query(
        "SELECT * FROM dbo.SubTasks WHERE TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ',')) ORDER BY SortOrder",
      );

    return result.recordset.map(normalizeSubTask);
  }

  private async getTags(taskIds: number[]): Promise<(Tag & { taskId: number })[]> {
    if (taskIds.length === 0) return [];

    const result = await getPool()
      .request()
      .input("TaskIds", sql.VarChar, taskIds.join(",")).query(`
        SELECT t.*, tt.TaskId
        FROM dbo.Tags t
        INNER JOIN dbo.TaskTags tt ON t.TagId = tt.TagId
        WHERE tt.TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ','))
      `);

    return result.recordset.map(normalizeTag);
  }

  private async getComments(taskIds: number[]): Promise<Comment[]> {
    if (taskIds.length === 0) return [];

    const result = await getPool()
      .request()
      .input("TaskIds", sql.VarChar, taskIds.join(",")).query(`
        SELECT * FROM dbo.Comments
        WHERE TaskId IN (SELECT value FROM STRING_SPLIT(@TaskIds, ','))
        ORDER BY CreatedAt DESC
      `);

    return result.recordset.map(normalizeComment);
  }
}

export default new TaskRelatedService();
