import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from '../../redux/slices/employeeSlice.js';

export const useEmployeeController = (initialParams = {}) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '', 10) || initialParams.page || 1;
  const urlSearch = searchParams.get('search') ?? (initialParams.search || '');
  const urlDepartment = searchParams.get('department') ?? (initialParams.department || '');
  const urlStatus = searchParams.get('status') ?? (initialParams.status || '');

  const { employees: rawEmployees, pagination, loading, error, success } = useSelector(
    (state) => state.employee
  );

  const [page, setPage] = useState(urlPage);
  const [limit, setLimit] = useState(initialParams.limit || 10);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [department, setDepartment] = useState(urlDepartment);
  const [status, setStatus] = useState(urlStatus);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const prevDebouncedSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  const submitSearch = useCallback(
    (immediateValue) => {
      const val = immediateValue !== undefined ? immediateValue : search;
      setDebouncedSearch(val);
      setPage(1);
    },
    [search]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (debouncedSearch?.trim()) params.set('search', debouncedSearch.trim());
    if (department) params.set('department', department);
    if (status) params.set('status', status);

    if (searchParams.toString() !== params.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [page, debouncedSearch, department, status, searchParams, setSearchParams]);

  const loadEmployees = useCallback(() => {
    const params = {
      page,
      limit,
    };
    if (debouncedSearch?.trim()) params.search = debouncedSearch.trim();
    if (department) params.department = department;
    if (status) params.status = status;

    dispatch(fetchEmployees(params));
  }, [dispatch, page, limit, debouncedSearch, department, status]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleCreateEmployee = useCallback(
    async (payload) => {
      const result = await dispatch(createEmployee(payload)).unwrap();
      loadEmployees();
      return result;
    },
    [dispatch, loadEmployees]
  );

  const handleUpdateEmployee = useCallback(
    async (employeeId, payload) => {
      const result = await dispatch(updateEmployee({ employeeId, employeeData: payload })).unwrap();
      loadEmployees();
      return result;
    },
    [dispatch, loadEmployees]
  );

  const handleDeleteEmployee = useCallback(
    async (employeeId) => {
      const result = await dispatch(deleteEmployee(employeeId)).unwrap();
      loadEmployees();
      return result;
    },
    [dispatch, loadEmployees]
  );

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setStatus('');
    setPage(1);
  }, []);

  const normalizedEmployees = useMemo(() => {
    let list = Array.isArray(rawEmployees) ? rawEmployees : [];

    if (debouncedSearch?.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(q) ||
          emp.employeeId?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.role?.toLowerCase().includes(q) ||
          emp.department?.toLowerCase().includes(q)
      );
    }

    if (department) {
      list = list.filter((emp) => emp.department?.toLowerCase() === department.toLowerCase());
    }

    if (status) {
      list = list.filter((emp) => emp.status?.toLowerCase() === status.toLowerCase());
    }

    return list.map((emp, index) => ({
      ...emp,
      id: emp._id || emp.id || `emp-${index}`,
      _id: emp._id || emp.id,
      employeeId: emp.employeeId || `EMP-${String(index + 1).padStart(3, '0')}`,
      fullName: emp.fullName || emp.name || 'Unknown',
      email: emp.email || '-',
      phone: emp.phone || '-',
      department: emp.department || 'Unassigned',
      role: emp.role || 'Employee',
      status: emp.status || 'Active',
      skills: Array.isArray(emp.skills) ? emp.skills : [],
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().slice(0, 10) : '-',
      leaveStart: emp.leaveStart ? new Date(emp.leaveStart).toISOString().slice(0, 10) : null,
      leaveEnd: emp.leaveEnd ? new Date(emp.leaveEnd).toISOString().slice(0, 10) : null,
      activeTasks: emp.activeTasks ?? emp.activeTaskCount ?? 0,
    }));
  }, [rawEmployees, debouncedSearch, department, status]);

  return {
    employees: normalizedEmployees,
    rawEmployees,
    pagination: {
      currentPage: pagination?.page || page,
      totalPages: pagination?.totalPages || Math.ceil(normalizedEmployees.length / limit) || 1,
      totalItems: pagination?.total || normalizedEmployees.length,
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
    status,
    setStatus,
    resetFilters,
    createEmployee: handleCreateEmployee,
    updateEmployee: handleUpdateEmployee,
    deleteEmployee: handleDeleteEmployee,
    refreshEmployees: loadEmployees,
  };
};

const EmployeeController = ({ children, render, initialParams }) => {
  const controller = useEmployeeController(initialParams);

  if (typeof render === 'function') {
    return render(controller);
  }

  if (typeof children === 'function') {
    return children(controller);
  }

  return <>{children}</>;
};

export default EmployeeController;
