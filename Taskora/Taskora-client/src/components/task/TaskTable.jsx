import React, { useState, useEffect, useRef } from 'react';
import TaskPagination from './TaskPagination.jsx';
import TaskDeleteModal from './TaskDeleteModal.jsx';

const TaskTable = ({
  tasks = [],
  loading = false,
  onStatusChange,
  onViewTask,
  onEditTask,
  onDeleteTask,
  paginationProps = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    onPageChange: () => {},
  },
}) => {
  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const tableContainerRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target)) {
        setOpenStatusMenuId(null);
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'in progress':
        return 'bg-[#2b6cb0] hover:bg-[#235891] text-white';
      case 'completed':
        return 'bg-[#2f855a] hover:bg-[#266d49] text-white';
      case 'cancelled':
        return 'bg-[#a0522d] hover:bg-[#834324] text-white';
      case 'todo':
      default:
        return 'bg-[#556270] hover:bg-[#45505c] text-white';
    }
  };

  const getNextStatusOptions = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'todo':
        return ['In Progress', 'Cancelled'];
      case 'in progress':
        return ['Completed', 'Cancelled'];
      default:
        return [];
    }
  };

  return (
    <div ref={tableContainerRef} className="w-full">
      <div className="sm:hidden text-[11px] text-slate-500 mb-1 flex items-center justify-end gap-1">
        <span>Swipe horizontally to view full table</span>
        <span>→</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-visible">
        <div className="overflow-x-auto overflow-y-visible min-h-[340px] pb-8">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#212529] text-white text-xs sm:text-sm select-none">
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  ID
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Title
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Employee
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Priority
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Status
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider text-right pr-6">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 font-medium">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500 font-medium">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => {
                  const taskId = task._id || task.id || `task-${index}`;
                  const isStatusOpen = openStatusMenuId === taskId;
                  const isActionOpen = openActionMenuId === taskId;
                  const isOverdue =
                    task.isOverdue ||
                    (typeof task.dueDate === 'string' &&
                      task.dueDate.toLowerCase().includes('overdue'));

                  const nextStatuses = getNextStatusOptions(task.status);
                  const canChangeStatus = nextStatuses.length > 0;
                  const openUpwards = tasks.length > 2 && index >= tasks.length - 2;

                  const employeeName =
                    task.employee ||
                    (task.assignedEmployee && typeof task.assignedEmployee === 'object'
                      ? task.assignedEmployee.fullName || task.assignedEmployee.name
                      : task.assignedEmployee) ||
                    'Unassigned';

                  return (
                    <tr
                      key={taskId}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {task.taskCode || task.taskId || taskId}
                      </td>

                      <td
                        className="py-3.5 px-4 font-medium text-slate-900 max-w-[220px] sm:max-w-[260px] truncate"
                        title={task.title}
                      >
                        {task.title}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {employeeName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {task.priority}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            disabled={!canChangeStatus}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canChangeStatus) return;
                              setOpenActionMenuId(null);
                              setOpenStatusMenuId(isStatusOpen ? null : taskId);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold shadow-2xs transition-all ${
                              canChangeStatus
                                ? 'active:scale-95 cursor-pointer'
                                : 'cursor-default opacity-90'
                            } ${getStatusBadgeStyle(task.status)}`}
                            aria-expanded={isStatusOpen}
                            aria-haspopup="true"
                          >
                            <span>{task.status}</span>
                            {canChangeStatus && (
                              <span className="text-[9px] transform transition-transform">▼</span>
                            )}
                          </button>

                          {isStatusOpen && canChangeStatus && (
                            <div
                              className={`absolute left-0 w-36 bg-white rounded-md shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn ${
                                openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              }`}
                            >
                              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                Next Status
                              </div>
                              {nextStatuses.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onStatusChange) {
                                      onStatusChange(taskId, opt);
                                    }
                                    setOpenStatusMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <span>{opt}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                        {isOverdue ? (
                          <span className="text-[#a32222] font-semibold">{task.dueDate}</span>
                        ) : (
                          <span className="text-slate-700">{task.dueDate}</span>
                        )}
                      </td>

                      
                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenStatusMenuId(null);
                              setOpenActionMenuId(isActionOpen ? null : taskId);
                            }}
                            className="p-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                            aria-label="Open task actions"
                            aria-expanded={isActionOpen}
                          >
                            
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>

                            
                          {isActionOpen && (
                            <div
                              className={`absolute right-0 w-32 bg-white rounded-md shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-left ${
                                openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(null);
                                  if (onViewTask) onViewTask(task);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-[#2f855a] hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(null);
                                  if (onEditTask) onEditTask(task);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-[#2563eb] hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(null);
                                  setDeletingTask(task);
                                }}
                                className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-[#dc2626] hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      <TaskPagination {...paginationProps} />

      
      <TaskDeleteModal
        isOpen={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onSuccess={(deletedTask) => {
          setDeletingTask(null);
          if (onDeleteTask) onDeleteTask(deletedTask);
        }}
      />
    </div>
  );
};

export default TaskTable;
