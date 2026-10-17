import React from 'react';

const TaskHeaderActions = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  isSearching = false,
  selectedDepartment = '',
  onDepartmentChange,
  departmentOptions = ['Engineering', 'Design', 'QA', 'Marketing', 'Product', 'HR'],
  selectedPriority = '',
  onPriorityChange,
  priorityOptions = ['High', 'Medium', 'Low', 'Critical'],
  selectedStatus = '',
  onStatusChange,
  statusOptions = ['Todo', 'In Progress', 'Completed', 'Cancelled'],
  selectedDueDateFilter = '',
  onDueDateFilterChange,
  onResetFilters,
  onAddTask,
  onExportCsv,
  isExporting = false,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const hasActiveFilters = Boolean(
    selectedDepartment || selectedPriority || selectedStatus || selectedDueDateFilter || searchQuery
  );

  return (
    <div className="w-full space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {/* Top Row: Search & Action Buttons (Add Task, Export CSV) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input + Search button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full lg:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search title or employee..."
              className="w-full bg-white border border-slate-300 rounded-md px-3.5 py-2 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/40 focus:border-[#853A3A] transition-all shadow-2xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {isSearching && (
                <div
                  className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"
                  title="Searching..."
                />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.98] text-white px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Action Buttons: Add Task & Export To Csv */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onAddTask}
            className="flex-1 sm:flex-none justify-center bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.98] text-white px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Add Task</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            disabled={isExporting}
            className="flex-1 sm:flex-none justify-center bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.98] text-white px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export To Csv</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Dropdowns */}
      {/* Mobile: 2-column grid; Tablet/Desktop: flexible row */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Department Filter */}
        <div className="relative w-full sm:w-auto sm:min-w-[130px]">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 sm:py-2 pr-7 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] shadow-2xs cursor-pointer transition-colors"
          >
            <option value="">Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Priority Filter */}
        <div className="relative w-full sm:w-auto sm:min-w-[110px]">
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange && onPriorityChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 sm:py-2 pr-7 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] shadow-2xs cursor-pointer transition-colors"
          >
            <option value="">Priority</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-auto sm:min-w-[110px]">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 sm:py-2 pr-7 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] shadow-2xs cursor-pointer transition-colors"
          >
            <option value="">Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Due Date Filter */}
        <div className="relative w-full sm:w-auto sm:min-w-[150px]">
          <select
            value={selectedDueDateFilter}
            onChange={(e) => onDueDateFilterChange && onDueDateFilterChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 sm:py-2 pr-7 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] shadow-2xs cursor-pointer transition-colors"
          >
            <option value="">Due: from - to</option>
            <option value="overdue">Overdue Tasks</option>
            <option value="today">Due Today</option>
            <option value="this_week">Due This Week</option>
            <option value="this_month">Due This Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              if (onResetFilters) {
                onResetFilters();
              } else {
                if (onSearchChange) onSearchChange('');
                if (onDepartmentChange) onDepartmentChange('');
                if (onPriorityChange) onPriorityChange('');
                if (onStatusChange) onStatusChange('');
                if (onDueDateFilterChange) onDueDateFilterChange('');
              }
            }}
            className="col-span-2 sm:col-span-1 text-xs text-[#853A3A] hover:text-[#722f2f] font-semibold underline px-2 py-1.5 cursor-pointer transition-colors text-center sm:text-left"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskHeaderActions;
