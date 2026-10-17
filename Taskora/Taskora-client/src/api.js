import axios from 'axios';

// Base API URL from environment variable, fallback to default local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getDashboardDataAPI = async () => {
  try {
    const response = await api.get('/task/dashboard');
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch dashboard data';
    throw new Error(errorMessage);
  }
};

export const getTasksAPI = async (params = {}) => {
  try {
    const response = await api.get('/task', { params });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch tasks';
    throw new Error(errorMessage);
  }
};

export const updateTaskStatusAPI = async (taskId, status) => {
  try {
    const response = await api.put(`/task/${taskId}/status`, { status });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update task status';
    throw new Error(errorMessage);
  }
};

export const createTaskAPI = async (taskData) => {
  try {
    const response = await api.post('/task', taskData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to create task';
    throw new Error(errorMessage);
  }
};

export const updateTaskAPI = async (taskId, taskData) => {
  try {
    const response = await api.patch(`/task/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Backend Error on PATCH /task/${taskId}:`, error.response?.data || error.message);
    const errorMessage =
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update task';
    throw new Error(errorMessage);
  }
};

export const deleteTaskAPI = async (taskId) => {
  try {
    const response = await api.delete(`/task/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Backend Error on DELETE /task/${taskId}:`, error.response?.data || error.message);
    const errorMessage =
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete task';
    throw new Error(errorMessage);
  }
};

export const getEmployeesAPI = async (params = {}) => {
  try {
    const response = await api.get('/employee', { params });
    return response.data;
  } catch (err) {
    try {
      const response2 = await api.get('/employees', { params });
      return response2.data;
    } catch {
      try {
        const dash = await api.get('/task/dashboard');
        const list = dash.data?.data?.employeeWorkload || dash.data?.data?.workload || [];
        return { success: true, employees: list };
      } catch {
        throw new Error(err.response?.data?.message || err.message || 'Failed to fetch employees');
      }
    }
  }
};

export const createEmployeeAPI = async (employeeData) => {
  try {
    const response = await api.post('/employee', employeeData);
    return response.data;
  } catch (error) {
    console.error('Backend Error on POST /employee:', error.response?.data || error.message);
    const errorMessage =
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to create employee';
    throw new Error(errorMessage);
  }
};

export const updateEmployeeAPI = async (employeeId, employeeData) => {
  try {
    const response = await api.patch(`/employee/${employeeId}`, employeeData);
    return response.data;
  } catch (error) {
    const errorMessage =
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update employee';
    throw new Error(errorMessage);
  }
};

export const deleteEmployeeAPI = async (employeeId) => {
  try {
    const response = await api.delete(`/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete employee';
    throw new Error(errorMessage);
  }
};

export const exportTasksCsvAPI = async (params = {}) => {
  try {
    const response = await api.get('/task/export/csv', {
      params,
      responseType: 'blob',
    });

    let filename = `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`;
    const disposition = response.headers?.['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '').trim();
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  } catch (error) {
    let errorMessage = 'Failed to export tasks CSV';
    if (error.response?.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.message || parsed.error || errorMessage;
      } catch {
        // use default message
      }
    } else {
      errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        errorMessage;
    }
    throw new Error(errorMessage);
  }
};

export default api;
