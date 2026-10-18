import React from 'react';

const departmentOptions = [
  'Development',
  'Engineering',
  'Design',
  'QA',
  'HR',
  'Sales',
  'Marketing',
  'Product',
];

const statusOptions = ['Active', 'Inactive', 'On Leave'];

const EmployeeHeaderActions = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  isSearching = false,
  selectedDepartment = '',
  onDepartmentChange,
  selectedStatus = '',
  onStatusChange,
  onResetFilters,
  onAddEmployee,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const hasActiveFilters = Boolean(selectedDepartment || selectedStatus || searchQuery);

  return (
    <div className="w-full space-y-3 sm:space-y-4 mb-4 sm:mb-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search by name, ID, role or email..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onAddEmployee}
            className="w-full sm:w-auto justify-center bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.98] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative min-w-[140px] flex-1 sm:flex-initial">
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange && onDepartmentChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 pr-7 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/40 focus:border-[#853A3A] cursor-pointer shadow-2xs"
          >
            <option value="">All Departments</option>
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

        <div className="relative min-w-[130px] flex-1 sm:flex-initial">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 rounded-md px-3 py-1.5 pr-7 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#853A3A]/40 focus:border-[#853A3A] cursor-pointer shadow-2xs"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="col-span-2 sm:col-span-1 text-xs text-[#853A3A] hover:text-[#722f2f] font-semibold underline px-2 py-1.5 cursor-pointer transition-colors text-center sm:text-left"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeHeaderActions;
