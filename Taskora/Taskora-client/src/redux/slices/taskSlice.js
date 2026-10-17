import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasksAPI, updateTaskStatusAPI, createTaskAPI, updateTaskAPI, deleteTaskAPI } from '../../api.js';

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getTasksAPI(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Error fetching tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await createTaskAPI(taskData);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Error creating task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTaskAPI(taskId, taskData);
      return { taskId, data: response };
    } catch (err) {
      return rejectWithValue(err.message || 'Error updating task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await updateTaskStatusAPI(taskId, status);
      return { taskId, status, data: response };
    } catch (err) {
      return rejectWithValue(err.message || 'Error updating task status');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await deleteTaskAPI(taskId);
      return { taskId, data: response };
    } catch (err) {
      return rejectWithValue(err.message || 'Error deleting task');
    }
  }
);

const initialState = {
  tasks: [],
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

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTaskPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setTaskLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    resetTaskState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.tasks = action.payload?.tasks || [];
        state.pagination = action.payload?.pagination || {
          total: (action.payload?.tasks || []).length,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to fetch tasks';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const createdTask = action.payload?.task || action.payload?.data || action.payload;
        if (createdTask && (createdTask._id || createdTask.id)) {
          state.tasks = [createdTask, ...state.tasks];
          state.pagination.total += 1;
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updated =
          action.payload?.data?.task ||
          action.payload?.data?.data ||
          action.payload?.data;
        if (updated && (updated._id || updated.id)) {
          const id = updated._id || updated.id || action.payload.taskId;
          state.tasks = state.tasks.map((task) =>
            task._id === id || task.id === id || task.taskId === id
              ? { ...task, ...updated }
              : task
          );
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update task';
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const { taskId, status } = action.payload;
        state.tasks = state.tasks.map((task) =>
          task._id === taskId || task.id === taskId || task.taskId === taskId
            ? { ...task, status }
            : task
        );
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedId = action.payload?.taskId;
        state.tasks = state.tasks.filter(
          (t) => t._id !== deletedId && t.id !== deletedId && t.taskId !== deletedId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { setTaskPage, setTaskLimit, resetTaskState } = taskSlice.actions;
export default taskSlice.reducer;
