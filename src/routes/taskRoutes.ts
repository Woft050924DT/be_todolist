import { Router } from "express";
import {
  addTask,
  editTask,
  getAllTasks,
  getTask,
  removeTask,
} from "../controller/taskController";

const router = Router();

router.get("/", getAllTasks);


router.get("/:id", getTask);


router.post("/", addTask);


router.put("/:id", editTask);

router.delete("/:id", removeTask);

export default router;
