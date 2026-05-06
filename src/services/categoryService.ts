import { Response } from "express";
import categoryReadService from "./category/categoryReadService";
import categoryWriteService from "./category/categoryWriteService";
import { CategoryRequestBody } from "./category/categoryUtils";
export type { CategoryRequestBody } from "./category/categoryUtils";

class CategoryService {
  async get(res: Response) {
    return categoryReadService.get(res);
  }

  async getByID(id: number, res: Response) {
    return categoryReadService.getByID(id, res);
  }

  async create(category: CategoryRequestBody, res: Response) {
    return categoryWriteService.create(category, res);
  }

  async update(category: CategoryRequestBody, id: number, res: Response) {
    return categoryWriteService.update(category, id, res);
  }

  async delete(id: number, res: Response) {
    return categoryWriteService.delete(id, res);
  }
}

export default new CategoryService();
