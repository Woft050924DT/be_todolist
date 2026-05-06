"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const dbConfig_1 = require("../../config/dbConfig");
function normalizeCategory(category) {
    return {
        Name: category.Name ?? category.name,
        Color: category.Color ?? category.color ?? "#000000",
    };
}
function isForeignKeyError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "number" in error &&
        error.number === 547);
}
class CategoryService {
    async get(res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .query("SELECT * FROM dbo.Categories ORDER BY CreatedAt DESC");
            const categories = result.recordset.map((cat) => ({
                categoryId: cat.CategoryId,
                name: cat.Name,
                color: cat.Color,
                createdAt: cat.CreatedAt
            }));
            res.json({
                status: 0,
                message: "Categories retrieved successfully",
                data: categories
            });
            console.log("Get categories successful");
        }
        catch (error) {
            console.error("Get categories fail:", error);
            res.status(500).json({ status: 1, message: "Failed to retrieve categories" });
        }
    }
    async getByID(id, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("CategoryId", mssql_1.default.Int, id)
                .query("SELECT * FROM dbo.Categories WHERE CategoryId = @CategoryId");
            if (result.recordset.length === 0) {
                return res.status(404).json({ status: 1, message: "Category not found" });
            }
            const category = {
                categoryId: result.recordset[0].CategoryId,
                name: result.recordset[0].Name,
                color: result.recordset[0].Color,
                createdAt: result.recordset[0].CreatedAt
            };
            res.json({
                status: 0,
                message: "Category retrieved successfully",
                data: category
            });
            console.log("Get category by ID successful");
        }
        catch (error) {
            console.error("Get category by ID fail:", error);
            res.status(500).json({ status: 1, message: "Failed to retrieve category" });
        }
    }
    async create(category, res) {
        const data = normalizeCategory(category);
        if (!data.Name) {
            return res.status(400).json({ status: 1, message: "Name is required" });
        }
        try {
            await (0, dbConfig_1.getPool)()
                .request()
                .input("Name", mssql_1.default.NVarChar(255), data.Name)
                .input("Color", mssql_1.default.NVarChar(7), data.Color)
                .query(`
          INSERT INTO dbo.Categories (Name, Color, CreatedAt)
          VALUES (@Name, @Color, GETDATE())
        `);
            res.json({
                status: 0,
                message: "Category created successfully"
            });
            console.log("Create category successful");
        }
        catch (error) {
            console.error("Create category fail:", error);
            res.status(500).json({ status: 1, message: "Failed to create category" });
        }
    }
    async update(category, id, res) {
        const data = normalizeCategory(category);
        if (!data.Name) {
            return res.status(400).json({ status: 1, message: "Name is required" });
        }
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("CategoryId", mssql_1.default.Int, id)
                .input("Name", mssql_1.default.NVarChar(255), data.Name)
                .input("Color", mssql_1.default.NVarChar(7), data.Color)
                .query(`
          UPDATE dbo.Categories
          SET Name = @Name, Color = @Color
          WHERE CategoryId = @CategoryId
        `);
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ status: 1, message: "Category not found" });
            }
            res.json({
                status: 0,
                message: "Category updated successfully"
            });
            console.log("Update category successful");
        }
        catch (error) {
            console.error("Update category fail:", error);
            res.status(500).json({ status: 1, message: "Failed to update category" });
        }
    }
    async delete(id, res) {
        try {
            const result = await (0, dbConfig_1.getPool)()
                .request()
                .input("CategoryId", mssql_1.default.Int, id)
                .query("DELETE FROM dbo.Categories WHERE CategoryId = @CategoryId");
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ status: 1, message: "Category not found" });
            }
            res.json({
                status: 0,
                message: "Category deleted successfully"
            });
            console.log("Delete category successful");
        }
        catch (error) {
            console.error("Delete category fail:", error);
            res.status(500).json({ status: 1, message: "Failed to delete category" });
        }
    }
}
exports.default = new CategoryService();
