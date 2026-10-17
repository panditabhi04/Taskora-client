import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../redux/slices/dashboardSlice.js';

export const useDashboardController = () => {
  const dispatch = useDispatch();
  const { data, loading, error, success } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const refreshDashboard = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const employeeStats = useMemo(() => {
    const emp = data?.employees || {};
    return [
      { label: 'Total Employees', value: emp.total ?? 0, color: 'text-slate-900' },
      { label: 'Active', value: emp.active ?? 0, color: 'text-emerald-600' },
      { label: 'Inactive', value: emp.inactive ?? 0, color: 'text-slate-600' },
      { label: 'On Leave', value: emp.onLeave ?? 0, color: 'text-amber-600' },
    ];
  }, [data?.employees]);

  const taskStats = useMemo(() => {
    const t = data?.tasks || {};
    return [
      { label: 'Total Tasks', value: t.total ?? 0, color: 'text-slate-900' },
      { label: 'Todo', value: t.todo ?? 0, color: 'text-slate-600' },
      { label: 'In Progress', value: t.inProgress ?? 0, color: 'text-blue-600' },
      { label: 'Completed', value: t.completed ?? 0, color: 'text-emerald-600' },
      { label: 'Cancelled', value: t.cancelled ?? 0, color: 'text-amber-700' },
      { label: 'Overdue', value: t.overdue ?? 0, color: 'text-red-600' },
    ];
  }, [data?.tasks]);

  const workload = useMemo(() => {
    const list = data?.employeeWorkload || data?.workload || [];
    return list.map((item, index) => ({
      id: item._id || item.employeeId || index,
      employeeId: item.employeeId || '',
      name: item.fullName || item.employeeName || item.employee || item.name || 'Unnamed',
      role: item.role || '',
      department: item.department || '',
      status: item.status || 'Active',
      activeTasks: item.activeTasks ?? item.activeTaskCount ?? 0,
      completedTasks: item.completedTasks ?? 0,
      totalTasks: item.totalTasks ?? 0,
    }));
  }, [data?.employeeWorkload, data?.workload]);

  return {
    raw: data,
    employees: data?.employees || {},
    tasks: data?.tasks || {},
    employeeStats,
    taskStats,
    workload,
    loading,
    error,
    success,
    refreshDashboard,
  };
};

const DashbordController = ({ children, render }) => {
  const controller = useDashboardController();

  if (typeof render === 'function') {
    return render(controller);
  }

  if (typeof children === 'function') {
    return children(controller);
  }

  return <>{children}</>;
};

export default DashbordController;
