import React, { useState } from 'react';
import { deleteEmployeeAPI } from '../../api.js';

const EmployeeDeleteModal = ({ isOpen, employee, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !employee) return null;

  const employeeId = employee._id || employee.id;
  const hasActiveTasks = Boolean(employee.activeTasks && employee.activeTasks > 0);

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await deleteEmployeeAPI(employeeId);
      if (onSuccess) {
        onSuccess(employee);
      }
      onClose();
    } catch (err) {
      setError(
        err.message ||
          'Failed to delete employee. Note: Employees with active tasks (Todo/In Progress) cannot be deleted.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Employee</h3>
              <p className="text-xs text-slate-500">Remove employee from organization</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-lg leading-none cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete employee{' '}
            <strong className="text-slate-900 font-bold">{employee.fullName}</strong>?
          </p>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {employee.employeeId || 'EMP'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                  employee.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {employee.status || 'Active'}
              </span>
            </div>

            <div className="font-bold text-slate-900 text-sm">{employee.fullName}</div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="font-medium text-slate-800">{employee.role || 'Employee'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-medium text-slate-800">{employee.department || '-'}</span>
              </div>
            </div>

            {employee.email && (
              <div className="text-slate-500 text-[11px] truncate">
                ✉️ {employee.email} {employee.phone ? `• 📞 ${employee.phone}` : ''}
              </div>
            )}
          </div>
          {hasActiveTasks && (
            <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <span className="font-bold">Active Tasks Warning:</span> This employee currently has{' '}
                <span className="font-bold">{employee.activeTasks}</span> active task(s). Per business
                rules, employee deletion is rejected if they have pending tasks.
              </div>
            </div>
          )}

          
          {error && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              ⚠️ {error}
            </div>
          )}
        </div>

    
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Employee</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDeleteModal;
