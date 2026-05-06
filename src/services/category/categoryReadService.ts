import { Response } from "express";
import sql from "mssql";
import { getPool } from "../../../config/dbConfig";
import { normalizeCategoryRecord } from "./categoryUtils";

class CategoryReadService {
  async get(res: Response) {
    try {
      const result = await getPool()
        .request()
        .query("SELECT * FROM dbo.Categories ORDER BY CreatedAt DESC");

      res.json({
        status: 0,
        message: "Categories retrieved successfully",
        data: result.recordset.map(normalizeCategoryRecord),
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

      res.json({
        status: 0,
        message: "Category retrieved successfully",
        data: normalizeCategoryRecord(result.recordset[0]),
      });
      console.log("Get category by ID successful");
    } catch (error) {
      console.error("Get category by ID fail:", error);
      res.status(500).json({ status: 1, message: "Failed to retrieve category" });
    }
  }
}

export default new CategoryReadService();
