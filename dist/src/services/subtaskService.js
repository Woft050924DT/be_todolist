"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const dbConfig_1 = require("../../config/dbConfig");
function normalizeSubTask(subTask) {
    return {
        subTaskId: subTask.subTaskId ?? subTask.SubTaskId,
        taskId: subTask.taskId ?? subTask.TaskId,
        title: subTask.title ?? subTask.Title,
        isCompleted: Boolean(subTask.isCompleted ?? subTask.IsCompleted),
        sortOrder: subTask.sortOrder ?? subTask.SortOrder,
    };
}
class SubTaskService {
    async get(res) {
        try {
            const result = await (0, dbConfig_1.getPool)().request().query(`
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
        }
        catch (error) {
            console.error("Get subtasks fail:", error);
            res.status(500).send({ status: 1, message: "Subtask get fail" });
        }
    }
    async getByTaskId(filters, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("TaskId", mssql_1.default.Int, filters.taskId)
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
        }
        catch (error) {
            console.error("Get subtasks by task id fail:", error);
            res.status(500).send({ status: 1, message: "Subtask get fail" });
        }
    }
    async getByID(id, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("SubTaskId", mssql_1.default.Int, id)
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
        }
        catch (error) {
            console.error("Get subtask by id fail:", error);
            res.status(500).send({ status: 1, message: "Subtask get fail" });
        }
    }
    async create(subTask, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("TaskId", mssql_1.default.Int, subTask.taskId)
                .input("Title", mssql_1.default.NVarChar(255), subTask.title)
                .input("IsCompleted", mssql_1.default.Bit, subTask.isCompleted ?? false)
                .input("SortOrder", mssql_1.default.Int, subTask.sortOrder ?? 0)
                .query(`
          INSERT INTO dbo.SubTasks (TaskId, Title, IsCompleted, SortOrder)
          VALUES (@TaskId, @Title, @IsCompleted, @SortOrder);
          SELECT SCOPE_IDENTITY() AS subTaskId;
        `);
            res.send({ status: 0, data: { subTaskId: result.recordset[0].subTaskId } });
        }
        catch (error) {
            console.error("Create subtask fail:", error);
            res.status(400).send({ status: 1, message: "Subtask creation fail" });
        }
    }
    async update(id, subTask, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("SubTaskId", mssql_1.default.Int, id)
                .input("Title", mssql_1.default.NVarChar(255), subTask.title)
                .input("IsCompleted", mssql_1.default.Bit, subTask.isCompleted)
                .input("SortOrder", mssql_1.default.Int, subTask.sortOrder)
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
        }
        catch (error) {
            console.error("Update subtask fail:", error);
            res.status(400).send({ status: 1, message: "Subtask update fail" });
        }
    }
    async delete(id, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("SubTaskId", mssql_1.default.Int, id)
                .query("DELETE FROM dbo.SubTasks WHERE SubTaskId = @SubTaskId");
            if (result.rowsAffected[0] === 0) {
                return res.status(404).send({ status: 1, message: "Subtask not found" });
            }
            res.send({ status: 0, message: "Subtask delete success" });
        }
        catch (error) {
            console.error("Delete subtask fail:", error);
            res.status(500).send({ status: 1, message: "Subtask delete fail" });
        }
    }
}
exports.default = SubTaskService;
