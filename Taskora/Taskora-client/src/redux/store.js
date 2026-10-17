import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice.js';
import taskReducer from './slices/taskSlice.js';
import employeeReducer from './slices/employeeSlice.js';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    task: taskReducer,
    employee: employeeReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
