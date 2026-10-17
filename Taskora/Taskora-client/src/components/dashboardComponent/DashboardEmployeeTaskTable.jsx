import React from 'react';

const DashboardEmployeeTaskTable = ({
  workload = [],
  title = 'Employee Workload',
  loading = false,
}) => {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <span className="text-xs text-slate-500">
          Max capacity: 3 active tasks
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead>
              <tr className="bg-[#1f242d] text-white">
                <th scope="col" className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-wide">
                  Employee
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-wide hidden sm:table-cell">
                  Department
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-semibold tracking-wide text-right">
                  Active Tasks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-sm text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading workload...</span>
                    </div>
                  </td>
                </tr>
              ) : workload.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-sm text-slate-500">
                    No employee workload data available.
                  </td>
                </tr>
              ) : (
                workload.map((item, index) => {
                  const activeCount = item.activeTasks ?? item.activeTaskCount ?? 0;
                  const isAtCapacity = activeCount >= 3;
                  return (
                    <tr
                      key={item._id || item.employeeId || item.id || index}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {item.fullName || item.name || item.employeeName || 'Unnamed'}
                          </span>
                          {item.employeeId && (
                            <span className="text-xs text-slate-400">{item.employeeId}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                        {item.department || '-'}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-right pr-6 sm:pr-8">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            isAtCapacity
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : activeCount > 0
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {activeCount} {isAtCapacity && '(Max)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmployeeTaskTable;

