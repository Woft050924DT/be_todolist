import { Router } from "express";
import {
  DeleteSubTask,
  getAllSubTasks,
  getSubTasks,
  getSubTasksByTaskId,
  InsertSubTask,
  UpdateSubTask,
} from "../controller/subtaskController";

const router = Router();

router.get("/", getAllSubTasks);
router.get("/task/:taskId", getSubTasksByTaskId);
router.get("/:id", getSubTasks);
router.post("/", InsertSubTask);
router.put("/:id", UpdateSubTask);
router.delete("/:id", DeleteSubTask);

export default router;
