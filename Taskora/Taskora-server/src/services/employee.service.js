import Employee from "../model/employee.model.js"
import Task from "../model/task.model.js"
import mongoose from "mongoose";
import { buildQueryOptions } from "../utils/queryBuilder.js";

export const createEmployeeService = async (data) => {
    const { employeeId, fullName, email, phone, department, role, joiningDate, status, skills, leaveStart, leaveEnd } = data;

    if (!employeeId || !fullName || !email || !phone || !department || !role || !joiningDate) {
        throw { statusCode: 400, message: "All required fields must be provided" };
    }

    const existingEmployeeId = await Employee.findOne({ employeeId });

    if (existingEmployeeId) {
        throw {
            statusCode: 409,
            message: "Employee ID already exists",
        };
    }

    const existingEmail = await Employee.findOne({
        email: email.trim().toLowerCase(),
    });

    if (existingEmail) {
        throw {
            statusCode: 409,
            message: "Email already exists",
        };
    }

    const employeeData = {
        employeeId, fullName, email, phone, department, role, joiningDate, status, skills, leaveStart, leaveEnd
    };

    const employee = await Employee.create(employeeData);

    return employee;
};

export const getAllEmployeeService = async (queryParams = {}) => {
    const isAll = queryParams.all === "true" || queryParams.all === true;

    const options = buildQueryOptions({
        queryParams,
        searchFields: ["fullName", "employeeId", "email", "role", "department"],
        filterFields: ["department", "status", "role"],
        sortFields: ["createdAt", "fullName", "employeeId", "joiningDate", "department"],
        defaultSort: "createdAt",
        defaultOrder: "desc",
    });

    const query = Employee.find(options.filters).sort(options.sort);

    if (!isAll) {
        query.skip(options.skip).limit(options.limit);
    }

    const [employees, total] = await Promise.all([
        query.lean(),
        Employee.countDocuments(options.filters),
    ]);

    // Attach active task count to each employee
    const employeeIds = employees.map((emp) => emp._id);
    const activeTasksCountMap = await Task.aggregate([
        {
            $match: {
                assignedEmployee: { $in: employeeIds },
                status: { $in: ["Todo", "In Progress"] },
            },
        },
        {
            $group: {
                _id: "$assignedEmployee",
                count: { $sum: 1 },
            },
        },
    ]);

    const countLookup = new Map(
        activeTasksCountMap.map((item) => [String(item._id), item.count])
    );

    const employeesWithWorkload = employees.map((emp) => ({
        ...emp,
        activeTasks: countLookup.get(String(emp._id)) || 0,
        activeTaskCount: countLookup.get(String(emp._id)) || 0,
    }));

    const limit = isAll ? total : options.limit;
    const page = isAll ? 1 : options.page;
    const totalPages = isAll ? 1 : Math.ceil(total / options.limit) || 1;

    return {
        employees: employeesWithWorkload,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};

export const updateEmployeeService = async (id, data) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid employee ID",
        };
    }

    const employee = await Employee.findById(id);

    if (!employee) {
        throw {
            statusCode: 404,
            message: "Employee not found",
        };
    }

    const allowedFields = ["employeeId", "fullName", "email", "phone", "department", "role", "joiningDate", "status", "skills", "leaveStart", "leaveEnd"];

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            employee[field] = data[field];
        }
    }

    if (data.employeeId) {
        const existingEmployeeId = await Employee.findOne({
            employeeId: data.employeeId,
            _id: { $ne: id },
        });

        if (existingEmployeeId) {
            throw {
                statusCode: 409,
                message: "Employee ID already exists",
            };
        }
    }

    if (data.email) {
        const email = data.email.trim().toLowerCase();
        employee.email = email;

        const existingEmail = await Employee.findOne({
            email,
            _id: { $ne: id },
        });

        if (existingEmail) {
            throw {
                statusCode: 409,
                message: "Email already exists",
            };
        }
    }

    const updatedEmployee = await employee.save();

    return updatedEmployee;
};

export const deleteEmployeeService = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw {
            statusCode: 400,
            message: "Invalid employee ID",
        };
    }

    const employee = await Employee.findById(id);

    if (!employee) {
        throw {
            statusCode: 404,
            message: "Employee not found",
        };
    }

    const activeTasks = await Task.countDocuments({
        assignedEmployee: id,
        status: { $in: ["Todo", "In Progress"] },
    });

    if (activeTasks > 0) {
        throw {
            statusCode: 400,
            message: "Cannot delete employee while they have Todo or In Progress tasks",
        };
    }

    await Employee.findByIdAndDelete(id);

    return employee;
};
