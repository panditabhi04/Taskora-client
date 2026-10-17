import Task from "../model/task.model.js"
export const validateEmployeeForTask = (employee, startDate) => {
  if (employee.status === "Inactive") {
    throw {
      statusCode: 400,
      message: "Cannot assign a task to an inactive employee",
    };
  }

  if (employee.status === "On Leave") {
    const taskDate = new Date(startDate).getTime();
    const leaveStart = new Date(employee.leaveStart).getTime();
    const leaveEnd = new Date(employee.leaveEnd).getTime();

    if (taskDate >= leaveStart && taskDate <= leaveEnd) {
      throw {
        statusCode: 400,
        message: "Cannot assign a task during the employee's leave period",
      };
    }
  }
};

export const validateStatusTransition = (currentStatus, newStatus) => {
    const allowedTransitions = {
        "Todo": ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
        "Completed": [],
        "Cancelled": [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
        throw {
            statusCode: 400,
            message: `Cannot change status from ${currentStatus} to ${newStatus}`,
        };
    }
};

export const validateEmployeeTaskCapacity = async (
    employeeId,
    currentTaskId = null
) => {
    const query = {
        assignedEmployee: employeeId,
        status: { $in: ["Todo", "In Progress"] },
    };

    // Exclude the task being updated
    if (currentTaskId) {
        query._id = { $ne: currentTaskId };
    }

    const activeTaskCount = await Task.countDocuments(query);

    if (activeTaskCount >= 3) {
        throw {
            statusCode: 400,
            message: "Employee cannot have more than 3 active tasks",
        };
    }
};