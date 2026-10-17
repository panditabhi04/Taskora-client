import {
    createTaskService, getAllTasksService, getTaskByIdService, updateTaskService, deleteTaskService,
    updateTaskStatusService, getDashboardService, exportTasksCsvService
} from "../services/task.service.js";
import { Parser } from "json2csv";


export const createTask = async (req, res) => {
    try {
        console.log("req.body : ", req.body);

        const task = await createTaskService(req.body);

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task,
        });
    } catch (error) {
        console.error("Create Task Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const result = await getAllTasksService(req.query);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Get All Tasks Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await getTaskByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Task fetched successfully",
            data: task,
        });
    } catch (error) {
        console.error("Get Task By ID Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await updateTaskService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task,
        });
    } catch (error) {
        console.error("Update Task Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }

        const task = await updateTaskStatusService(id, status);

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: task,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await deleteTaskService(id);

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: task,
        });
    } catch (error) {
        console.error("Delete Task Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getDashboard = async (req, res) => {
    try {
        const data = await getDashboardService();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
    
export const exportTasksCsv = async (req, res) => {
    try {
        const tasks = await exportTasksCsvService(req.query);

        const parser = new Parser({
            fields: [
                "taskId",
                "title",
                "description",
                "employeeId",
                "employeeName",
                "department",
                "priority",
                "status",
                "startDate",
                "dueDate",
                "completedDate",
                "overdue",
            ],
        });

        const csv = parser.parse(tasks);

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks.csv"'
        );

        return res.status(200).send("\uFEFF" + csv);
    } catch (error) {
        console.error("Export Tasks CSV Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to export tasks CSV",
        });
    }
};