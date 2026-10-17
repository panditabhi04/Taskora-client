import express from "express";
import { createTask, deleteTask, exportTasksCsv, getAllTasks, getDashboard, getTaskById, updateTask, updateTaskStatus } from "../controller/task.controller.js";

const router = express.Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/dashboard", getDashboard);
router.get("/export/csv", exportTasksCsv    );
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.put("/:id/status", updateTaskStatus);

export default router;