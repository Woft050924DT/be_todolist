import { Router, Request, Response, NextFunction } from "express";
import {
  addCategory,
  editCategory,
  getAllCategories,
  getCategory,
  removeCategory,
} from "../controller/categoryController";

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

router.get("/", getAllCategories);


router.get("/:id", getCategory);


router.post("/", addCategory);


router.put("/:id", editCategory);

router.delete("/:id", removeCategory);

export default router;
