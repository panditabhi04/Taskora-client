import React from 'react';

const TaskPagination = ({
  currentPage = 1,
  totalPages = 3,
  totalItems = 23,
  itemsPerPage = 5,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      if (onPageChange) {
        onPageChange(page);
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 pb-2 px-1 text-xs sm:text-sm select-none">
      
      <div className="text-slate-600 font-normal text-center sm:text-left">
        Showing{' '}
        <span className="font-semibold text-slate-800">
          {startItem}-{endItem}
        </span>{' '}
        of <span className="font-semibold text-slate-800">{totalItems}</span> tasks
      </div>

      
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`h-8 sm:h-8.5 min-w-[32px] sm:min-w-[34px] px-2 flex items-center justify-center rounded border text-xs sm:text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 cursor-pointer shadow-2xs'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`h-8 sm:h-8.5 min-w-[32px] sm:min-w-[34px] px-2.5 flex items-center justify-center rounded text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#853A3A] text-white border border-[#853A3A] shadow-2xs font-semibold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 active:bg-slate-200 shadow-2xs'
              }`}
            >
              {page}
            </button>
          );
        })}

        
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          aria-label="Next page"
          className={`h-8 sm:h-8.5 min-w-[32px] sm:min-w-[34px] px-2 flex items-center justify-center rounded border text-xs sm:text-sm font-medium transition-colors ${
            currentPage === totalPages || totalPages === 0
              ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50/50'
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 cursor-pointer shadow-2xs'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskPagination;
