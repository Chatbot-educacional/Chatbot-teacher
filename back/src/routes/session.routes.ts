import express, { Router } from "express";
import { startSession, endSession, getAverageSessionTimeByClass } from "../controllers/session.controller";

const router: Router = express.Router();

router.post("/start", startSession);
router.post("/end", endSession);
router.get("/list/total/time/:classId", getAverageSessionTimeByClass);

export default router;
