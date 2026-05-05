import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../config/dbConfig";
import { Category } from "../models/taskModel";

export interface CategoryRequestBody {
  name?: string;
  color?: string;
  Name?: string;
  Color?: string;
}

function normalizeCategory(category: CategoryRequestBody) {
  return {
    Name: category.Name ?? category.name,
    Color: category.Color ?? category.color ?? "#000000",
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

class CategoryService {
  async get(res: Response) {
    try {
      const result = await getPool()
        .request()
        .query("SELECT * FROM dbo.Categories ORDER BY CreatedAt DESC");

      const categories = result.recordset.map((cat: any) => ({
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
    } catch (error) {
      console.error("Get categories fail:", error);
      res.status(500).json({ status: 1, message: "Failed to retrieve categories" });
    }
  }

  async getByID(id: number, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("CategoryId", sql.Int, id)
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
    } catch (error) {
      console.error("Get category by ID fail:", error);
      res.status(500).json({ status: 1, message: "Failed to retrieve category" });
    }
  }

  async create(category: CategoryRequestBody, res: Response) {
    const data = normalizeCategory(category);

    if (!data.Name) {
      return res.status(400).json({ status: 1, message: "Name is required" });
    }

    try {
      await getPool()
        .request()
        .input("Name", sql.NVarChar(255), data.Name)
        .input("Color", sql.NVarChar(7), data.Color)
        .query(`
          INSERT INTO dbo.Categories (Name, Color, CreatedAt)
          VALUES (@Name, @Color, GETDATE())
        `);

      res.json({
        status: 0,
        message: "Category created successfully"
      });
      console.log("Create category successful");
    } catch (error) {
      console.error("Create category fail:", error);
      res.status(500).json({ status: 1, message: "Failed to create category" });
    }
  }

  async update(category: CategoryRequestBody, id: number, res: Response) {
    const data = normalizeCategory(category);

    if (!data.Name) {
      return res.status(400).json({ status: 1, message: "Name is required" });
    }

    try {
      const result = await getPool()
        .request()
        .input("CategoryId", sql.Int, id)
        .input("Name", sql.NVarChar(255), data.Name)
        .input("Color", sql.NVarChar(7), data.Color)
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
    } catch (error) {
      console.error("Update category fail:", error);
      res.status(500).json({ status: 1, message: "Failed to update category" });
    }
  }

  async delete(id: number, res: Response) {
    try {
      const result = await getPool()
        .request()
        .input("CategoryId", sql.Int, id)
        .query("DELETE FROM dbo.Categories WHERE CategoryId = @CategoryId");

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ status: 1, message: "Category not found" });
      }

      res.json({
        status: 0,
        message: "Category deleted successfully"
      });
      console.log("Delete category successful");
    } catch (error) {
      console.error("Delete category fail:", error);
      res.status(500).json({ status: 1, message: "Failed to delete category" });
    }
  }
}

export default new CategoryService();
