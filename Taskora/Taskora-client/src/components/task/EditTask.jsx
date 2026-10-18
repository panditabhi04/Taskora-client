import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateTaskAPI, getEmployeesAPI } from '../../api.js';
import Toast from '../../common/Toast.jsx';

const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const departmentOptions = ['Development', 'Design', 'QA', 'HR', 'Sales', 'Engineering'];

const EditTask = ({ task, onBack, onTaskUpdated, existingTasks = [] }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [department, setDepartment] = useState('Development');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');

      const initialEmpId =
        (typeof task.assignedEmployee === 'object' && task.assignedEmployee?._id)
          ? task.assignedEmployee._id
          : task.assignedEmployee || task.employee || '';
      setAssignedEmployee(initialEmpId);

      setPriority(task.priority || 'Medium');
      setDepartment(task.department || 'Development');

      const safeDate = (val) => {
        if (!val) return '';
        if (typeof val === 'string' && val.includes('T')) return val.split('T')[0];
        return val;
      };

      setStartDate(safeDate(task.startDate) || new Date().toISOString().split('T')[0]);
      setDueDate(safeDate(task.rawDueDate) || safeDate(task.dueDate) || '');
      setDescription(task.description || '');
    }
  }, [task]);

  const isTaskNonEditable = useMemo(() => {
    const s = (task?.status || '').toLowerCase();
    return s === 'completed' || s === 'cancelled';
  }, [task?.status]);

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

  const isOriginalAssignee = useMemo(() => {
    if (!task || !selectedEmployeeObj) return false;
    const origId =
      typeof task.assignedEmployee === 'object'
        ? task.assignedEmployee?._id
        : task.assignedEmployee;
    const origName = task.employee || task.assignedEmployee?.fullName;

    return (
      (origId && (origId === selectedEmployeeObj._id || origId === selectedEmployeeObj.id)) ||
      (origName && origName === selectedEmployeeObj.fullName)
    );
  }, [task, selectedEmployeeObj]);

  useEffect(() => {
    if (selectedEmployeeObj?.department) {
      setDepartment(selectedEmployeeObj.department);
    } else if (!assignedEmployee) {
      setDepartment('');
    }
  }, [selectedEmployeeObj, assignedEmployee]);

  const isEmployeeOverloaded = useMemo(() => {
    if (!selectedEmployeeObj) return false;
    if (isOriginalAssignee) return false;

    const count = selectedEmployeeObj.activeTasks ?? selectedEmployeeObj.activeTaskCount;
    if (typeof count === 'number') {
      return count >= 3;
    }

    if (existingTasks.length > 0) {
      const activeCount = existingTasks.filter(
        (t) =>
          (t._id || t.id) !== (task?._id || task?.id) &&
          (t.employee === selectedEmployeeObj.fullName ||
            t.assignedEmployee === selectedEmployeeObj._id) &&
          t.status !== 'Completed' &&
          t.status !== 'Cancelled'
      ).length;
      return activeCount >= 3;
    }
    return false;
  }, [selectedEmployeeObj, isOriginalAssignee, existingTasks, task]);

  const isEmployeeInactive = useMemo(() => {
    return selectedEmployeeObj?.status?.toLowerCase() === 'inactive';
  }, [selectedEmployeeObj]);

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

  const handleEmployeeChange = (e) => {
    const selected = e.target.value;
    setAssignedEmployee(selected);
    setFormError('');

    const emp = employees.find(
      (item) => item._id === selected || item.id === selected || item.fullName === selected
    );

    if (emp) {
      if (emp.status?.toLowerCase() === 'inactive') {
        const msg = 'Cannot assign task to an inactive employee.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
      } else if (!isOriginalAssignee && (emp.activeTasks ?? emp.activeTaskCount ?? 0) >= 3) {
        const msg = 'Employee already has 3 active tasks. Please choose another employee.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
      }

      setDepartment(emp.department || '');
    } else {
      setDepartment('');
    }
  };

  const validateForm = () => {
    if (isTaskNonEditable) {
      const msg = 'Completed and Cancelled tasks cannot be edited.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
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
    if (!dueDate) {
      const msg = 'Please select due date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
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
      const taskId = task?._id || task?.id;
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
      };

      const result = await updateTaskAPI(taskId, payload);

      setToast({
        show: true,
        message: 'Task updated successfully!',
        type: 'success',
      });

      if (onTaskUpdated) {
        onTaskUpdated(result?.task || result?.data || result);
      } else if (onBack) {
        onBack();
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      const errorMsg =
        err.message || 'Failed to update task. Please verify your inputs and business rules.';
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

  const bannerMessage = isTaskNonEditable
    ? 'Completed and Cancelled tasks cannot be edited per business rules.'
    : isEmployeeOverloaded
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
        Edit Task {task?.taskCode || task?.taskId ? `(${task.taskCode || task.taskId})` : ''}
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
                disabled={isTaskNonEditable}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFormError('');
                }}
                placeholder="Enter Title"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Assigned Employee
              </label>
              <div className="relative">
                <select
                  disabled={isTaskNonEditable || loadingEmployees || employees.length === 0}
                  value={assignedEmployee}
                  onChange={handleEmployeeChange}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
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
                  <span>⚠️</span> No employees found in system.
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
                  disabled={isTaskNonEditable}
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setFormError('');
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
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
                  disabled={isTaskNonEditable || !assignedEmployee || Boolean(selectedEmployeeObj?.department)}
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setFormError('');
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed"
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
                disabled={isTaskNonEditable}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setFormError('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Due Date
              </label>
              <input
                type="date"
                min={startDate}
                disabled={isTaskNonEditable}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setFormError('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              disabled={isTaskNonEditable}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormError('');
              }}
              placeholder="Enter Description"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all resize-y disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          {Boolean(bannerMessage) && (
            <div className="rounded-lg border border-[#a33a3a] bg-[#fbf2f2] px-4 py-3 text-xs sm:text-sm text-[#853A3A] font-medium animate-fadeIn">
              {bannerMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleBackAction}
              className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isTaskNonEditable}
              className="w-full sm:flex-1 bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.99] text-white py-3 rounded-lg text-sm sm:text-base font-bold transition-all shadow-sm cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
