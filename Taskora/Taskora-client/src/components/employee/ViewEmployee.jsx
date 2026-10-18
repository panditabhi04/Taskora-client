import React from 'react';

const ViewEmployee = ({ isOpen = false, employee = null, onClose, onEdit }) => {
  if (!isOpen || !employee) return null;

  const getStatusBadgeStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'bg-emerald-600 text-white';
      case 'on leave':
        return 'bg-amber-600 text-white';
      case 'inactive':
        return 'bg-rose-600 text-white';
      default:
        return 'bg-slate-600 text-white';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#212529] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base sm:text-lg tracking-tight">
              Employee Details
            </span>
            <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded font-mono font-bold">
              {employee.employeeId || 'EMP'}
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#853A3A]/10 text-[#853A3A] font-extrabold text-lg flex items-center justify-center border border-[#853A3A]/20">
                {employee.fullName?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {employee.fullName}
                </h2>
                <div className="text-xs text-slate-500 font-medium">
                  {employee.role} • {employee.department}
                </div>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                employee.status
              )}`}
            >
              {employee.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                Email
              </span>
              <span className="font-medium text-slate-800 break-all">{employee.email || '-'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                Phone
              </span>
              <span className="font-medium text-slate-800">{employee.phone || '-'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                Joining Date
              </span>
              <span className="font-medium text-slate-800">{formatDate(employee.joiningDate)}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase block text-[10px] mb-0.5">
                Active Tasks
              </span>
              <span className="font-semibold text-slate-900">
                {employee.activeTasks ?? 0} task(s)
              </span>
            </div>
          </div>

          {employee.status === 'On Leave' && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] text-amber-800">
                <span>📅</span>
                <span>On Leave Schedule</span>
              </div>
              <div className="text-sm font-semibold">
                {formatDate(employee.leaveStart)} — {formatDate(employee.leaveEnd)}
              </div>
              <p className="text-[11px] text-amber-700">
                Tasks starting during this leave window cannot be assigned to this employee.
              </p>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Skills & Expertise
            </span>
            {Array.isArray(employee.skills) && employee.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">No skills specified.</p>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#853A3A] hover:bg-[#722f2f] rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>Edit Employee</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
