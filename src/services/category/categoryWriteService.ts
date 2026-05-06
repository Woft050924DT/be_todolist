import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import {
  CategoryRequestBody,
  normalizeCategoryRequest,
  normalizeCategoryUpdateRequest,
} from "./categoryUtils";

class CategoryWriteService {
  async create(category: CategoryRequestBody, res: Response) {
    const data = normalizeCategoryRequest(category);

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
        message: "Category created successfully",
      });
      console.log("Create category successful");
    } catch (error) {
      console.error("Create category fail:", error);
      res.status(500).json({ status: 1, message: "Failed to create category" });
    }
  }

  async update(category: CategoryRequestBody, id: number, res: Response) {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ status: 1, message: "Invalid category ID" });
    }

    const data = normalizeCategoryUpdateRequest(category);

    try {
      const request = getPool().request().input("CategoryId", sql.Int, id);
      const updateFields: string[] = [];

      if (data.Name !== undefined) {
        if (!data.Name.trim()) {
          return res.status(400).json({ status: 1, message: "Name is required" });
        }
        request.input("Name", sql.NVarChar(255), data.Name);
        updateFields.push("Name = @Name");
      }

      if (data.Color !== undefined) {
        request.input("Color", sql.NVarChar(7), data.Color);
        updateFields.push("Color = @Color");
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          status: 1,
          message: "No fields to update",
        });
      }

      const query = `
        UPDATE dbo.Categories
        SET ${updateFields.join(", ")}
        WHERE CategoryId = @CategoryId
      `;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ status: 1, message: "Category not found" });
      }

      res.json({
        status: 0,
        message: "Category updated successfully",
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
        message: "Category deleted successfully",
      });
      console.log("Delete category successful");
    } catch (error) {
      console.error("Delete category fail:", error);
      res.status(500).json({ status: 1, message: "Failed to delete category" });
    }
  }
}

export default new CategoryWriteService();
