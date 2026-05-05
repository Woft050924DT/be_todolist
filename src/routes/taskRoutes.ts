import { Router, Request, Response, NextFunction } from "express";
import {
  addTask,
  editTask,
  getAllTasks,
  getTask,
  removeTask,
} from "../controller/taskController";

const router = Router();

// Add CORS headers to all responses
router.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.get("/", getAllTasks);


router.get("/:id", getTask);


router.post("/", addTask);


router.put("/:id", editTask);

router.delete("/:id", removeTask);

export default router;
