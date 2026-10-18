import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTaskAPI, getEmployeesAPI } from '../../api.js';
import Toast from '../../common/Toast.jsx';

const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const departmentOptions = ['Development', 'Design', 'QA', 'HR', 'Sales', 'Engineering'];

const AddTask = ({ onBack, onTaskCreated, existingTasks = [] }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    assignedEmployee: '',
    priority: '',
    department: '',
    startDate: '',
    dueDate: '',
    description: '',
  });

  const { title, assignedEmployee, priority, department, startDate, dueDate, description } = form;

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const todayString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);


  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await getEmployeesAPI();
        const list = Array.isArray(data) ? data : (data?.employees || data?.data || []);
        if (isMounted) {
          setEmployees(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to load employees:', err.message);
        if (isMounted) {
          setEmployees([]);
        }
      } finally {
        if (isMounted) {
          setLoadingEmployees(false);
        }
      }
    };
    fetchEmployees();
    return () => {
      isMounted = false;
    };
  }, []);


  const selectedEmployeeObj = useMemo(() => {
    if (!assignedEmployee) return null;
    return employees.find(
      (emp) =>
        emp._id === assignedEmployee ||
        emp.id === assignedEmployee ||
        emp.employeeId === assignedEmployee ||
        emp.fullName === assignedEmployee ||
        emp.name === assignedEmployee
    );
  }, [assignedEmployee, employees]);

  useEffect(() => {
    if (selectedEmployeeObj?.department) {
      setForm((prev) => ({ ...prev, department: selectedEmployeeObj.department }));
    } else if (!assignedEmployee) {
      setForm((prev) => ({ ...prev, department: '' }));
    }
  }, [selectedEmployeeObj, assignedEmployee]);

  const isEmployeeOverloaded = useMemo(() => {
    if (!selectedEmployeeObj) return false;
    const count = selectedEmployeeObj.activeTasks ?? selectedEmployeeObj.activeTaskCount;
    if (typeof count === 'number') {
      return count >= 3;
    }
    if (existingTasks.length > 0) {
      const activeCount = existingTasks.filter(
        (t) =>
          (t.employee === selectedEmployeeObj.fullName ||
            t.assignedEmployee === selectedEmployeeObj._id ||
            t.assignedEmployee?._id === selectedEmployeeObj._id) &&
          t.status !== 'Completed' &&
          t.status !== 'Cancelled'
      ).length;
      return activeCount >= 3;
    }
    return false;
  }, [selectedEmployeeObj, existingTasks]);

  const isEmployeeOnLeaveConflict = useMemo(() => {
    if (!selectedEmployeeObj || !startDate) return false;
    if (selectedEmployeeObj.status?.toLowerCase() !== 'on leave') return false;

    if (selectedEmployeeObj.leaveStartDate && selectedEmployeeObj.leaveEndDate) {
      const taskStart = new Date(startDate).setHours(0, 0, 0, 0);
      const leaveStart = new Date(selectedEmployeeObj.leaveStartDate).setHours(0, 0, 0, 0);
      const leaveEnd = new Date(selectedEmployeeObj.leaveEndDate).setHours(23, 59, 59, 999);
      return taskStart >= leaveStart && taskStart <= leaveEnd;
    }
    return true;
  }, [selectedEmployeeObj, startDate]);

  const isEmployeeInactive = useMemo(() => {
    return selectedEmployeeObj?.status?.toLowerCase() === 'inactive';
  }, [selectedEmployeeObj]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    if (val && val < todayString) {
      const msg = 'Start Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      setForm((prev) => ({ ...prev, startDate: '' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      startDate: val,
      dueDate: prev.dueDate && val && prev.dueDate < val ? '' : prev.dueDate,
    }));
    setFormError('');
  };

  const handleDueDateChange = (e) => {
    const val = e.target.value;
    const minAllowed = startDate || todayString;
    if (val && val < minAllowed) {
      const msg = startDate
        ? 'Due Date cannot be earlier than Start Date.'
        : 'Due Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      setForm((prev) => ({ ...prev, dueDate: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, dueDate: val }));
    setFormError('');
  };

  const handleEmployeeChange = (e) => {
    const selected = e.target.value;
    const emp = employees.find(
      (item) => item._id === selected || item.id === selected || item.fullName === selected
    );

    setForm((prev) => ({
      ...prev,
      assignedEmployee: selected,
      department: emp?.department || '',
    }));
    setFormError('');

    if (emp) {
      if (emp.status?.toLowerCase() === 'inactive') {
        const msg = 'Cannot assign task to an inactive employee.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
      } else if ((emp.activeTasks ?? emp.activeTaskCount ?? 0) >= 3) {
        const msg = 'Employee already has 3 active tasks. Please choose another employee.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
      }
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      const msg = 'Please enter a task title.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (title.trim().length < 3) {
      const msg = 'Task title must be at least 3 characters.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!assignedEmployee) {
      const msg = 'Please select an assigned employee.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (isEmployeeInactive) {
      const msg = 'Cannot assign task to an inactive employee.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (isEmployeeOnLeaveConflict) {
      const msg = 'Cannot assign task: employee is on leave during the selected task start date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (isEmployeeOverloaded) {
      const msg = 'Employee already has 3 active tasks. Please choose another employee.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!priority) {
      const msg = 'Please select priority.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!department) {
      const msg = 'Please select department.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!startDate) {
      const msg = 'Please select start date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (startDate < todayString) {
      const msg = 'Start Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!dueDate) {
      const msg = 'Please select due date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (dueDate < todayString) {
      const msg = 'Due Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (startDate && dueDate && dueDate < startDate) {
      const msg = 'Due Date cannot be earlier than Start Date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!description.trim()) {
      const msg = 'Please enter task description.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormError('');

    try {
      const employeeIdPayload =
        selectedEmployeeObj?._id || selectedEmployeeObj?.id || assignedEmployee;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        assignedEmployee: employeeIdPayload,
        department,
        priority,
        startDate,
        dueDate,
        status: 'Todo',
      };

      const result = await createTaskAPI(payload);

      setToast({
        show: true,
        message: 'Task created successfully!',
        type: 'success',
      });

      if (onTaskCreated) {
        onTaskCreated(result?.task || result?.data || result);
      } else if (onBack) {
        onBack();
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      const errorMsg =
        err.message || 'Failed to create task. Please verify your inputs and business rules.';
      setFormError(errorMsg);
      setToast({ show: true, message: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/tasks');
    }
  };

  const bannerMessage =
    isEmployeeOverloaded
      ? 'Employee already has 3 active tasks. Please choose another employee.'
      : isEmployeeInactive
        ? 'Cannot assign task to an inactive employee.'
        : isEmployeeOnLeaveConflict
          ? 'Employee is on leave during task start date.'
          : formError;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 px-2 sm:px-4">

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
      <div className="mb-3">
        <button
          type="button"
          onClick={handleBackAction}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Tasks</span>
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-6 tracking-tight">
        Add Task
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={handleChange}
                placeholder="Enter Title"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Assigned Employee
              </label>
              <div className="relative">
                <select
                  name="assignedEmployee"
                  value={assignedEmployee}
                  onChange={handleEmployeeChange}
                  disabled={loadingEmployees || employees.length === 0}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  {loadingEmployees ? (
                    <option value="">Loading employees...</option>
                  ) : employees.length === 0 ? (
                    <option value="">No employees available</option>
                  ) : (
                    <>
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => {
                        const empId = emp._id || emp.id || emp.employeeId;
                        const empName = emp.fullName || emp.name || emp.employeeName;
                        const activeCount = emp.activeTasks ?? emp.activeTaskCount ?? 0;
                        return (
                          <option key={empId} value={empId}>
                            {empName} ({emp.status || 'Active'}) {activeCount > 0 ? `[${activeCount} tasks]` : ''}
                          </option>
                        );
                      })}
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 text-xs">
                  ▼
                </div>
              </div>
              {!loadingEmployees && employees.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-700 font-medium flex items-center gap-1">
                  <span>⚠️</span> No employees found in system. Please add an employee first.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={priority}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                >
                  <option value="">Select...</option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={department}
                  onChange={handleChange}
                  disabled={!assignedEmployee || Boolean(selectedEmployeeObj?.department)}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-700 disabled:cursor-not-allowed"
                >
                  {!assignedEmployee ? (
                    <option value="">Select employee first</option>
                  ) : selectedEmployeeObj?.department ? (
                    <option value={selectedEmployeeObj.department}>
                      {selectedEmployeeObj.department}
                    </option>
                  ) : (
                    <>
                      <option value="">Select...</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                min={todayString}
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                min={startDate || todayString}
                value={dueDate}
                onChange={handleDueDateChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Enter Description"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all resize-y"
            />
          </div>
          {Boolean(bannerMessage) && (
            <div className="rounded-lg border border-[#a33a3a] bg-[#fbf2f2] px-4 py-3 text-xs sm:text-sm text-[#853A3A] font-medium animate-fadeIn">
              {bannerMessage}
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.99] text-white py-3 rounded-lg text-sm sm:text-base font-bold transition-all shadow-sm cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Task...</span>
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
