import React, { useState } from 'react';
import EmployeeDeleteModal from './EmployeeDeleteModal.jsx';
import ViewEmployee from './ViewEmployee.jsx';

const EmployeeTable = ({
  employees = [],
  loading = false,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddEmployeeClick,
  paginationProps = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    onPageChange: () => {},
  },
}) => {
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const { currentPage, totalPages, totalItems, itemsPerPage, onPageChange } = paginationProps;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getStatusBadgeStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'on leave':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'inactive':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      default:
        return 'bg-slate-600 hover:bg-slate-700 text-white';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full">
      <div className="sm:hidden text-[11px] text-slate-500 mb-1 flex items-center justify-end gap-1">
        <span>Swipe horizontally to view full table</span>
        <span>→</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-visible">
        <div className="overflow-x-auto min-h-[300px] pb-4">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#212529] text-white text-xs sm:text-sm select-none">
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Name
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Contact
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Department & Role
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Status
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Joining Date
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider">
                  Skills
                </th>
                <th scope="col" className="py-3 px-4 font-bold tracking-wider text-right pr-6">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-[#853A3A] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span className="text-slate-500 font-medium">Loading employees...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">👥</span>
                      <p className="font-semibold text-slate-700">No employees found.</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your filters or click below to add a new employee.
                      </p>
                      {onAddEmployeeClick && (
                        <button
                          type="button"
                          onClick={onAddEmployeeClick}
                          className="mt-2 bg-[#853A3A] hover:bg-[#722f2f] text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          + Add Employee
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  return (
                    <tr
                      key={emp._id || emp.id || emp.employeeId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Employee ID */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                          {emp.employeeId}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#853A3A]/10 text-[#853A3A] font-bold text-xs flex items-center justify-center border border-[#853A3A]/20">
                            {emp.fullName?.charAt(0)?.toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{emp.fullName}</div>
                            {emp.activeTasks !== undefined && (
                              <div className="text-[11px] text-slate-400">
                                Active tasks: {emp.activeTasks}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{emp.email}</div>
                        <div className="text-[11px] text-slate-400">{emp.phone}</div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{emp.role}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {emp.department}
                        </div>
                      </td>

                      {/* Status + Leave dates if On Leave */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-2xs ${getStatusBadgeStyle(
                            emp.status
                          )}`}
                        >
                          {emp.status}
                        </span>
                        {emp.status === 'On Leave' && (emp.leaveStart || emp.leaveEnd) && (
                          <div className="text-[10px] text-amber-700 mt-1 font-medium">
                            {formatDate(emp.leaveStart)} - {formatDate(emp.leaveEnd)}
                          </div>
                        )}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {formatDate(emp.joiningDate)}
                      </td>

                      {/* Skills */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {Array.isArray(emp.skills) && emp.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {emp.skills.slice(0, 3).map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                            {emp.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center font-bold">
                                +{emp.skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions: View, Edit, Delete Icons */}
                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Icon */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewEmployee) {
                                onViewEmployee(emp);
                              } else {
                                setViewingEmployee(emp);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="View Employee Details"
                            aria-label="View employee"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Icon */}
                          <button
                            type="button"
                            onClick={() => onEditEmployee && onEditEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Employee"
                            aria-label="Edit employee"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Delete Icon */}
                          <button
                            type="button"
                            onClick={() => setDeletingEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Employee"
                            aria-label="Delete employee"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && employees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 pb-3 px-4 border-t border-slate-100 text-xs sm:text-sm select-none">
            <div className="text-slate-600 font-normal text-center sm:text-left">
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {startItem}-{endItem}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{totalItems}</span> employees
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`h-8 min-w-[32px] px-2 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                  currentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                }`}
              >
                ‹
              </button>

              {pages.map((p) => {
                const isActive = p === currentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`h-8 min-w-[32px] px-2.5 flex items-center justify-center rounded text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#853A3A] text-white border border-[#853A3A] font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-2xs'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`h-8 min-w-[32px] px-2 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                  currentPage === totalPages || totalPages === 0
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
                    : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs'
                }`}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Delete Confirmation Modal */}
      <EmployeeDeleteModal
        isOpen={Boolean(deletingEmployee)}
        employee={deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onSuccess={(deletedEmp) => {
          setDeletingEmployee(null);
          if (onDeleteEmployee) onDeleteEmployee(deletedEmp);
        }}
      />

      {/* Employee View Modal */}
      <ViewEmployee
        isOpen={Boolean(viewingEmployee)}
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        onEdit={(emp) => {
          setViewingEmployee(null);
          if (onEditEmployee) onEditEmployee(emp);
        }}
      />
    </div>
  );
};

export default EmployeeTable;
