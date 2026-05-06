import { Category } from "../../models/taskModel";

export interface CategoryRequestBody {
  name?: string;
  color?: string;
  Name?: string;
  Color?: string;
}

export function normalizeCategoryRequest(category: CategoryRequestBody) {
  return {
    Name: category.Name ?? category.name,
    Color: category.Color ?? category.color ?? "#000000",
  };
}

export function normalizeCategoryUpdateRequest(category: CategoryRequestBody) {
  return {
    Name: category.Name ?? category.name,
    Color: category.Color ?? category.color,
  };
}

export function normalizeCategoryRecord(category: any): Category {
  return {
    categoryId: category.categoryId ?? category.CategoryId,
    name: category.name ?? category.Name,
    color: category.color ?? category.Color,
    createdAt: category.createdAt ?? category.CreatedAt,
  };
}
