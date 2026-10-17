import React from 'react';
import DashboardStats from '../../components/dashboardComponent/DashboardStats.jsx';
import { useDashboardController } from '../../controller/DashbordController.jsx';

const Dashboard = () => {
  const {
    employeeStats,
    taskStats,
    workload,
    loading,
    error,
    refreshDashboard,
  } = useDashboardController();

  return (
    <div className="w-full pb-8 sm:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of employee workload, task distribution, and organization metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition shadow-xs disabled:opacity-60 cursor-pointer"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin text-slate-600' : 'text-slate-500'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={refreshDashboard}
            className="text-xs font-semibold text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards & Employee Workload Table */}
      <DashboardStats
        employeeStats={employeeStats}
        taskStats={taskStats}
        workload={workload}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
