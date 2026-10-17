import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchTasks, updateTaskStatus, createTask, updateTask } from '../../redux/slices/taskSlice.js';
import { exportTasksCsvAPI } from '../../api.js';

const formatDueDate = (dateStr, status) => {
  if (!dateStr) return { text: '-', isOverdue: false };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return {
      text: dateStr,
      isOverdue: String(dateStr).toLowerCase().includes('overdue'),
    };
  }

  const today = new Date();
  const endOfDueDate = new Date(d);
  endOfDueDate.setHours(23, 59, 59, 999);

  const isOverdue =
    endOfDueDate < today &&
    status !== 'Completed' &&
    status !== 'Cancelled';

  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(d);

  return {
    text: isOverdue ? `${formatted} (Overdue)` : formatted,
    isOverdue,
  };
};

const getEmployeeName = (task) => {
  if (task.assignedEmployee && typeof task.assignedEmployee === 'object') {
    return (
      task.assignedEmployee.fullName ||
      task.assignedEmployee.name ||
      task.assignedEmployee.employeeId ||
      'Unassigned'
    );
  }
  return task.employee || task.assignedEmployee || 'Unassigned';
};

export const useTaskController = (initialParams = {}) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '', 10) || initialParams.page || 1;
  const urlSearch = searchParams.get('search') ?? (initialParams.search || '');
  const urlDepartment = searchParams.get('department') ?? (initialParams.department || '');
  const urlPriority = searchParams.get('priority') ?? (initialParams.priority || '');
  const urlStatus = searchParams.get('status') ?? (initialParams.status || '');
  const urlDueDate = searchParams.get('dueDate') ?? (initialParams.dueDateFilter || '');

  const { tasks: rawTasks, pagination, loading, error, success } = useSelector(
    (state) => state.task
  );

  const [page, setPage] = useState(urlPage);
  const [limit, setLimit] = useState(initialParams.limit || 10);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [department, setDepartment] = useState(urlDepartment);
  const [priority, setPriority] = useState(urlPriority);
  const [status, setStatus] = useState(urlStatus);
  const [dueDateFilter, setDueDateFilter] = useState(urlDueDate);

  // Debounce search input by 400ms to avoid unnecessary API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // When debounced search value changes, reset page to 1
  const prevDebouncedSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  // Immediate search submit handler (e.g. Enter key or Search button click)
  const submitSearch = useCallback((immediateValue) => {
    const val = immediateValue !== undefined ? immediateValue : search;
    setDebouncedSearch(val);
    setPage(1);
  }, [search]);

  // Synchronize state with URL query parameters per assignment requirements
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (debouncedSearch?.trim()) params.set('search', debouncedSearch.trim());
    if (department) params.set('department', department);
    if (priority) params.set('priority', priority);
    if (status) params.set('status', status);
    if (dueDateFilter) params.set('dueDate', dueDateFilter);

    if (searchParams.toString() !== params.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [page, debouncedSearch, department, priority, status, dueDateFilter, searchParams, setSearchParams]);

  const loadTasks = useCallback(() => {
    const params = {
      page,
      limit,
    };
    if (debouncedSearch?.trim()) params.search = debouncedSearch.trim();
    if (department) params.department = department;
    if (priority) params.priority = priority;
    if (status) params.status = status;
    if (dueDateFilter) params.dueDate = dueDateFilter;

    dispatch(fetchTasks(params));
  }, [dispatch, page, limit, debouncedSearch, department, priority, status, dueDateFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = useCallback(
    async (taskId, newStatus) => {
      try {
        await dispatch(updateTaskStatus({ taskId, status: newStatus })).unwrap();
        loadTasks();
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    },
    [dispatch, loadTasks]
  );

  const handleCreateTask = useCallback(
    async (taskPayload) => {
      const result = await dispatch(createTask(taskPayload)).unwrap();
      loadTasks();
      return result;
    },
    [dispatch, loadTasks]
  );

  const handleUpdateTask = useCallback(
    async (taskId, taskPayload) => {
      const result = await dispatch(
        updateTask({ taskId, taskData: taskPayload })
      ).unwrap();
      loadTasks();
      return result;
    },
    [dispatch, loadTasks]
  );

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setPriority('');
    setStatus('');
    setDueDateFilter('');
    setPage(1);
  }, []);

  const normalizedTasks = useMemo(() => {
    return (rawTasks || []).map((task, index) => {
      const { text: formattedDueDate, isOverdue } = formatDueDate(
        task.dueDate,
        task.status
      );
      const employeeName = getEmployeeName(task);

      return {
        ...task,
        id: task._id || task.id || `task-${index}`,
        _id: task._id,
        taskCode: task.taskId || task.taskCode || task._id,
        employee: employeeName,
        dueDate: formattedDueDate,
        rawDueDate: task.dueDate,
        isOverdue,
      };
    });
  }, [rawTasks]);

  const handleExportCsv = useCallback(async () => {
    const filterParams = {};
    if (debouncedSearch?.trim()) filterParams.search = debouncedSearch.trim();
    if (department) filterParams.department = department;
    if (priority) filterParams.priority = priority;
    if (status) filterParams.status = status;
    if (dueDateFilter) filterParams.dueDate = dueDateFilter;

    return await exportTasksCsvAPI(filterParams);
  }, [debouncedSearch, department, priority, status, dueDateFilter]);

  return {
    tasks: normalizedTasks,
    rawTasks,
    pagination: {
      currentPage: pagination?.page || page,
      totalPages: pagination?.totalPages || 1,
      totalItems: pagination?.total || normalizedTasks.length,
      itemsPerPage: pagination?.limit || limit,
      onPageChange: handlePageChange,
    },
    loading,
    isSearching: search !== debouncedSearch,
    error,
    success,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
    submitSearch,
    department,
    setDepartment,
    priority,
    setPriority,
    status,
    setStatus,
    dueDateFilter,
    setDueDateFilter,
    resetFilters,
    handleStatusChange,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    exportCsv: handleExportCsv,
    refreshTasks: loadTasks,
  };
};

const TaskController = ({ children, render, initialParams }) => {
  const controller = useTaskController(initialParams);

  if (typeof render === 'function') {
    return render(controller);
  }

  if (typeof children === 'function') {
    return children(controller);
  }

  return <>{children}</>;
};

export default TaskController;
