import React from 'react';
import DashboardEmployeeTaskTable from './DashboardEmployeeTaskTable.jsx';

const defaultEmployeeStats = [
  { label: 'Total Employees', value: 12, color: 'text-slate-900' },
  { label: 'Active', value: 8, color: 'text-emerald-600' },
  { label: 'Inactive', value: 2, color: 'text-slate-600' },
  { label: 'On Leave', value: 2, color: 'text-amber-600' },
];

const defaultTaskStats = [
  { label: 'Total Tasks', value: 40, color: 'text-slate-900' },
  { label: 'Todo', value: 14, color: 'text-slate-600' },
  { label: 'In Progress', value: 9, color: 'text-blue-600' },
  { label: 'Completed', value: 14, color: 'text-emerald-600' },
  { label: 'Cancelled', value: 3, color: 'text-amber-700' },
  { label: 'Overdue', value: 5, color: 'text-red-600' },
];

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
    <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</span>
    <span className={`text-2xl sm:text-3xl font-bold mt-1.5 sm:mt-2 ${color}`}>{value}</span>
  </div>
);

const DashboardStats = ({
  employeeStats = defaultEmployeeStats,
  taskStats = defaultTaskStats,
  workload = [],
  loading = false,
  showTable = true,
}) => {
  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {employeeStats.map((item, index) => (
          <StatCard
            key={index}
            label={item.label}
            value={loading ? '-' : item.value}
            color={item.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {taskStats.map((item, index) => (
          <StatCard
            key={index}
            label={item.label}
            value={loading ? '-' : item.value}
            color={item.color}
          />
        ))}
      </div>

      {showTable && (
        <div className="pt-2 sm:pt-4">
          <DashboardEmployeeTaskTable workload={workload} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
export { DashboardEmployeeTaskTable };
