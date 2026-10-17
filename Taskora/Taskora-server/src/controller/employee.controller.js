import { createEmployeeService, deleteEmployeeService, getAllEmployeeService, updateEmployeeService } from "../services/employee.service.js";

export const createEmployee = async (req, res) => {
    try {
        const employee = await createEmployeeService(req.body);

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Error in createEmployee:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getAllEmployee = async (req, res) => {
    try {
        const result = await getAllEmployeeService(req.query);

        return res.status(200).json({
            success: true,
            message: "Employee fetched successfully",
            employees: result.employees,
            data: result.employees,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error("Error in getAllEmployee:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error fetching employee",
        });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log("id : ", id);
        // console.log("req.body : ", req.body);
        const updatedEmployee = await updateEmployeeService(id, req.body);


        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee,
        });
    } catch (error) {
        console.error("Error in updateEmployee:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEmployee = await deleteEmployeeService(id);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: deletedEmployee,
    });
  } catch (error) {
    console.error("Error in deleteEmployee:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

