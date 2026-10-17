import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardDataAPI } from '../../api.js';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardDataAPI();
      return response.data || response;
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching dashboard data');
    }
  }
);

const initialState = {
  loading: false,
  success: false,
  error: null,
  data: {
    employees: {
      total: 0,
      active: 0,
      inactive: 0,
      onLeave: 0,
    },
    tasks: {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
    },
    employeeWorkload: [],
    workload: [],
  },
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboardState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.data = {
          employees: action.payload?.employees || initialState.data.employees,
          tasks: action.payload?.tasks || initialState.data.tasks,
          employeeWorkload:
            action.payload?.employeeWorkload ||
            action.payload?.workload ||
            [],
          workload:
            action.payload?.workload ||
            action.payload?.employeeWorkload ||
            [],
        };
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to load dashboard data';
      });
  },
});

export const { resetDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
