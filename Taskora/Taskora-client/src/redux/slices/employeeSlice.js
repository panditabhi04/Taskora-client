import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeesAPI, createEmployeeAPI, deleteEmployeeAPI, updateEmployeeAPI } from '../../api.js';

export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getEmployeesAPI(params);
      const employees = Array.isArray(response)
        ? response
        : response?.employees || response?.data?.employees || response?.data || [];
      const pagination = response?.pagination || response?.data?.pagination || {
        total: employees.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(employees.length / (params.limit || 10)) || 1,
      };
      return { employees, pagination };
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await createEmployeeAPI(employeeData);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Error creating employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ employeeId, employeeData }, { rejectWithValue }) => {
    try {
      const response = await updateEmployeeAPI(employeeId, employeeData);
      return { employeeId, data: response };
    } catch (err) {
      return rejectWithValue(err.message || 'Error updating employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await deleteEmployeeAPI(employeeId);
      return { employeeId, data: response };
    } catch (err) {
      return rejectWithValue(err.message || 'Error deleting employee');
    }
  }
);

const initialState = {
  employees: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  error: null,
  success: false,
};

export const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setEmployeePage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearEmployeeSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch employees';
      })

      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const newEmp = action.payload?.employee || action.payload?.data || action.payload;
        if (newEmp && newEmp._id) {
          state.employees = [newEmp, ...state.employees];
          state.pagination.total += 1;
        }
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create employee';
      })

      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated =
          action.payload?.data?.employee ||
          action.payload?.data?.data ||
          action.payload?.data;
        if (updated && (updated._id || updated.id)) {
          const id = updated._id || updated.id || action.payload.employeeId;
          state.employees = state.employees.map((emp) =>
            emp._id === id || emp.id === id || emp.employeeId === id
              ? { ...emp, ...updated }
              : emp
          );
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update employee';
      })

      // Delete Employee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp._id !== action.payload.employeeId && emp.id !== action.payload.employeeId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { setEmployeePage, clearEmployeeError, clearEmployeeSuccess } = employeeSlice.actions;

export default employeeSlice.reducer;
