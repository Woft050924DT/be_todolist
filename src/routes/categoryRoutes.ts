import { Router } from "express";
import {
  addCategory,
  editCategory,
  getAllCategories,
  getCategory,
  removeCategory,
} from "../controller/categoryController";

const router = Router();

router.get("/", getAllCategories);


router.get("/:id", getCategory);


router.post("/", addCategory);


router.put("/:id", editCategory);

router.delete("/:id", removeCategory);

export default router;
