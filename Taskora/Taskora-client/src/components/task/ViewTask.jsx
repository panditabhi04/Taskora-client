import React from 'react';

const ViewTask = ({ isOpen = false, task = null, onClose, onEdit }) => {
  if (!isOpen || !task) return null;

  const isOverdue = task.isOverdue || (task.dueDate && task.dueDate.toLowerCase().includes('overdue'));

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'in progress':
        return 'bg-[#2b6cb0] text-white';
      case 'completed':
        return 'bg-[#2f855a] text-white';
      case 'cancelled':
        return 'bg-[#a0522d] text-white';
      case 'todo':
      default:
        return 'bg-[#556270] text-white';
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-5 py-4 bg-[#212529] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base sm:text-lg tracking-tight">
              Task Details
            </span>
            <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded font-mono">
              {task.taskCode || task.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors text-lg cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Title
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {task.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold shadow-2xs ${getStatusBadgeStyle(task.status)}`}>
                {task.status}
              </span>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getPriorityBadgeStyle(task.priority)}`}>
                Priority: {task.priority}
              </span>

              {task.department && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {task.department}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Assigned Employee
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                {task.employee || 'Unassigned'}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                Due Date
              </span>
              {isOverdue ? (
                <span className="font-bold text-[#a32222] text-sm flex items-center gap-1">
                  <span>{task.dueDate}</span>
                </span>
              ) : (
                <span className="font-semibold text-slate-900 text-sm">
                  {task.dueDate || 'No due date'}
                </span>
              )}
            </div>

            {task.startDate && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                  Start Date
                </span>
                <span className="font-medium text-slate-700 text-sm">
                  {new Date(task.startDate).toLocaleDateString() !== 'Invalid Date'
                    ? new Date(task.startDate).toLocaleDateString()
                    : task.startDate}
                </span>
              </div>
            )}

            {task.createdDate && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">
                  Created Date
                </span>
                <span className="font-medium text-slate-700 text-sm">
                  {new Date(task.createdDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Description
            </span>
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[70px]">
              {task.description || 'No description provided for this task.'}
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#2563eb] hover:bg-blue-50 border border-blue-200 rounded-md transition-colors cursor-pointer"
            >
              Edit Task
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#853A3A] hover:bg-[#722f2f] rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTask;
