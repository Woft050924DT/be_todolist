import { Request, Response } from "express";
import categoryService from "../services/categoryService";

function parseCategoryId(id: string | string[]): number | null {
  if (Array.isArray(id)) {
    return null;
  }

  const categoryId = Number(id);
  return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null;
}

export function getAllCategories(req: Request, res: Response) {
  categoryService.get(res);
}

export function getCategory(req: Request, res: Response) {
  const id = parseCategoryId(req.params.id);

  if (!id) {
    return res.status(400).json({ status: 1, message: "Invalid category id" });
  }

  categoryService.getByID(id, res);
}

export function addCategory(req: Request, res: Response) {
  categoryService.create(req.body, res);
}

export function editCategory(req: Request, res: Response) {
  const id = parseCategoryId(req.params.id);

  if (!id) {
    return res.status(400).json({ status: 1, message: "Invalid category id" });
  }

  categoryService.update(req.body, id, res);
}

export function removeCategory(req: Request, res: Response) {
  const id = parseCategoryId(req.params.id);

  if (!id) {
    return res.status(400).json({ status: 1, message: "Invalid category id" });
  }

  categoryService.delete(id, res);
}
