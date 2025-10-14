import express, { Router } from "express";
import { listClassesWithStudentCount } from "../controllers/class.controller";

const router: Router = express.Router();

router.get("/summary", listClassesWithStudentCount);

export default router;
