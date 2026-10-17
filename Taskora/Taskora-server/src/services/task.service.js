import mongoose from "mongoose";
import Task from "../model/task.model.js";
import Employee from "../model/employee.model.js";
import { validateEmployeeForTask, validateEmployeeTaskCapacity, validateStatusTransition } from "../utils/taskValidation.js"
import { buildQueryOptions } from "../utils/queryBuilder.js";
import { isTaskOverdue } from "../utils/taskUtils.js";


export const createTaskService = async (data) => {
    const { title, description, assignedEmployee, department, priority, status, startDate, dueDate } = data;

    if (!title || !description || !assignedEmployee || !department || !startDate || !dueDate) {
        throw { statusCode: 400, message: "All required fields must be provided" };
    }

    if (!mongoose.isValidObjectId(assignedEmployee)) {
        throw {
            statusCode: 400,
            message: "Invalid assigned employee ID",
        };
    }

    const employee = await Employee.findById(assignedEmployee);

    if (!employee) {
        throw {
            statusCode: 404,
            message: "Assigned employee not found",
        };
    }

    validateEmployeeForTask(employee, startDate);
    await validateEmployeeTaskCapacity(assignedEmployee);
    const task = await Task.create(data);

    return task;
};

export const getAllTasksService = async (queryParams) => {
    const { search = "", dueDate, ...rest } = queryParams;

    // Search employee names in the Employee collection
    let searchConditions = [];

    if (search.trim()) {
        const employees = await Employee.find({
            fullName: {
                $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
            },
        }).select("_id");

        searchConditions = [
            {
                assignedEmployee: {
                    $in: employees.map((employee) => employee._id),
                },
            },
        ];
    }

    const options = buildQueryOptions({
        queryParams: { ...rest, search },
        searchFields: ["title"],
        filterFields: ["department", "priority", "status"],
        sortFields: ["createdAt", "dueDate", "title"],
        searchConditions,
        defaultSort: "createdAt",
        defaultOrder: "desc",
    });

    // Add due-date filtering
    if (dueDate) {
        const start = new Date(`${dueDate}T00:00:00.000Z`);
        const end = new Date(`${dueDate}T00:00:00.000Z`);
        end.setUTCDate(end.getUTCDate() + 1);

        if (Number.isNaN(start.getTime())) {
            throw {
                statusCode: 400,
                message: "Invalid due date",
            };
        }

        options.filters.dueDate = {
            $gte: start,
            $lt: end,
        };
    }

    const [tasks, total] = await Promise.all([
        Task.find(options.filters)
            .populate(
                "assignedEmployee",
                "employeeId fullName email department"
            )
            .sort(options.sort)
            .skip(options.skip)
            .limit(options.limit),

        Task.countDocuments(options.filters),
    ]);

    return {
        tasks,
        pagination: {
            total,
            page: options.page,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit),
        },
    };
};

export const getTaskByIdService = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid task ID",
        };
    }

    const task = await Task.findById(id).populate(
        "assignedEmployee",
        "employeeId fullName email department"
    );

    if (!task) {
        throw {
            statusCode: 404,
            message: "Task not found",
        };
    }

    return {
        ...task.toObject(),
        isOverdue: isTaskOverdue(task),
    };

    // return task;
};

export const updateTaskService = async (id, data) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid task ID",
        };
    }

    const task = await Task.findById(id);

    if (!task) {
        throw {
            statusCode: 404,
            message: "Task not found",
        };
    }

    if (["Completed", "Cancelled"].includes(task.status)) {
        throw {
            statusCode: 400,
            message: "Cannot edit this task",
        };
    }

    const allowedFields = [
        "title","description","assignedEmployee","department","priority","status","startDate","dueDate",
    ];

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            task[field] = data[field];
        }
    }

    const employeeId = task.assignedEmployee;

    if (!mongoose.isValidObjectId(employeeId)) {
        throw {
            statusCode: 400,
            message: "Invalid assigned employee ID",
        };
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
        throw {
            statusCode: 404,
            message: "Assigned employee not found",
        };
    }

    validateEmployeeForTask(employee, task.startDate);
    if (["Todo", "In Progress"].includes(task.status)) {
        await validateEmployeeTaskCapacity(employee._id, task._id);
    }

    const updatedTask = await task.save();

    return updatedTask;
};

export const updateTaskStatusService = async (id, newStatus) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid task ID",
        };
    }

    const task = await Task.findById(id);

    if (!task) {
        throw {
            statusCode: 404,
            message: "Task not found",
        };
    }
    console.log("status:", JSON.stringify(task.status));
    console.log("New status:", JSON.stringify(newStatus));

    validateStatusTransition(task.status, newStatus);

    task.status = newStatus;

    return await task.save();
};

export const deleteTaskService = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid task ID",
        };
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
        throw {
            statusCode: 404,
            message: "Task not found",
        };
    }

    return deletedTask;
};

export const getDashboardService = async () => {
    const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        employeesOnLeave,
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        overdueTasks,
        employeeWorkload,
    ] = await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ status: "Active" }),
        Employee.countDocuments({ status: "Inactive" }),
        Employee.countDocuments({ status: "On Leave" }),
        Task.countDocuments(),
        Task.countDocuments({ status: "Todo" }),
        Task.countDocuments({ status: "In Progress" }),
        Task.countDocuments({ status: "Completed" }),
        Task.countDocuments({ status: "Cancelled" }),
        Task.countDocuments({
            dueDate: { $lt: new Date(new Date().setHours(0, 0, 0, 0)) },
            status: { $nin: ["Completed", "Cancelled"] },
        }),
        Employee.aggregate([
            {
                $lookup: {
                    from: "tasks",
                    let: { empId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$assignedEmployee", "$$empId"],
                                },
                            },
                        },
                    ],
                    as: "allTasks",
                },
            },
            {
                $project: {
                    _id: 1,
                    employeeId: 1,
                    fullName: 1,
                    employeeName: "$fullName",
                    employee: "$fullName",
                    name: "$fullName",
                    email: 1,
                    department: 1,
                    role: 1,
                    status: 1,
                    activeTasks: {
                        $size: {
                            $filter: {
                                input: "$allTasks",
                                as: "t",
                                cond: { $in: ["$$t.status", ["Todo", "In Progress"]] },
                            },
                        },
                    },
                    activeTaskCount: {
                        $size: {
                            $filter: {
                                input: "$allTasks",
                                as: "t",
                                cond: { $in: ["$$t.status", ["Todo", "In Progress"]] },
                            },
                        },
                    },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: "$allTasks",
                                as: "t",
                                cond: { $eq: ["$$t.status", "Completed"] },
                            },
                        },
                    },
                    totalTasks: { $size: "$allTasks" },
                },
            },
            {
                $match: {
                    $or: [
                        { status: { $ne: "Inactive" } },
                        { activeTasks: { $gt: 0 } },
                    ],
                },
            },
            {
                $sort: {
                    activeTasks: -1,
                    fullName: 1,
                },
            },
        ]),
    ]);

    return {
        employees: {
            total: totalEmployees,
            active: activeEmployees,
            inactive: inactiveEmployees,
            onLeave: employeesOnLeave,
        },
        tasks: {
            total: totalTasks,
            todo: todoTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
            cancelled: cancelledTasks,
            overdue: overdueTasks,
        },
        employeeWorkload,
        workload: employeeWorkload,
    };
};

export const exportTasksCsvService = async (queryParams = {}) => {
    const { search = "", department, priority, status } = queryParams;

    const filters = {};
    if (department) filters.department = department;
    if (priority) filters.priority = priority;
    if (status) filters.status = status;

    if (search && search.trim()) {
        const employees = await Employee.find({
            fullName: {
                $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
            },
        }).select("_id");

        filters.$or = [
            { title: { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            { assignedEmployee: { $in: employees.map((e) => e._id) } },
        ];
    }

    const tasks = await Task.find(filters)
        .populate("assignedEmployee", "employeeId fullName name")
        .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    };

    return tasks.map((task) => {
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (taskDueDate) taskDueDate.setHours(0, 0, 0, 0);

        const isOverdue =
            taskDueDate &&
            taskDueDate < today &&
            task.status !== "Completed" &&
            task.status !== "Cancelled";

        return {
            taskId: task.taskId || String(task._id),
            title: task.title,
            description: task.description,
            employeeId: task.assignedEmployee?.employeeId || "",
            employeeName: task.assignedEmployee?.fullName || task.assignedEmployee?.name || "",
            department: task.department,
            priority: task.priority,
            status: task.status,
            startDate: formatDate(task.startDate),
            dueDate: formatDate(task.dueDate),
            completedDate: formatDate(task.completedDate),
            overdue: isOverdue ? "Yes" : "No",
        };
    });
};