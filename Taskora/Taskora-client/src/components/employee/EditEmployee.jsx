import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateEmployeeAPI } from '../../api.js';
import Toast from '../../common/Toast.jsx';

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

const EditEmployee = ({ employee, onBack, onEmployeeUpdated }) => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employeeId || '');
      setFullName(employee.fullName || employee.name || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDepartment(employee.department || '');
      setRole(employee.role || '');

      const safeDate = (val) => {
        if (!val || val === '-') return '';
        try {
          const d = new Date(val);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setJoiningDate(safeDate(employee.joiningDate));
      setStatus(employee.status || 'Active');
      setSkills(Array.isArray(employee.skills) ? [...employee.skills] : []);
      setLeaveStart(safeDate(employee.leaveStart));
      setLeaveEnd(safeDate(employee.leaveEnd));
    }
  }, [employee]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const validateForm = () => {
    if (!employeeId.trim()) {
      const msg = 'Please enter Employee ID (e.g., EMP-010).';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!fullName.trim()) {
      const msg = 'Please enter employee Full Name.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      const msg = 'Please enter a valid Email address.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!phone.trim()) {
      const msg = 'Please enter Phone number.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!department) {
      const msg = 'Please select a Department.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!role.trim()) {
      const msg = 'Please enter employee Role.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (!joiningDate) {
      const msg = 'Please select Joining Date.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      return false;
    }
    if (status === 'On Leave') {
      if (!leaveStart) {
        const msg = 'Leave Start date is required when employee is On Leave.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
        return false;
      }
      if (!leaveEnd) {
        const msg = 'Leave End date is required when employee is On Leave.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
        return false;
      }
      if (new Date(leaveEnd) < new Date(leaveStart)) {
        const msg = 'Leave End date must be on or after Leave Start date.';
        setFormError(msg);
        setToast({ show: true, message: msg, type: 'error' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormError('');

    try {
      let finalSkills = [...skills];
      if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
        finalSkills.push(skillInput.trim());
      }

      const payload = {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        role: role.trim(),
        joiningDate,
        status,
        skills: finalSkills,
        leaveStart: status === 'On Leave' && leaveStart ? leaveStart : null,
        leaveEnd: status === 'On Leave' && leaveEnd ? leaveEnd : null,
      };

      const targetId = employee?._id || employee?.id;
      const result = await updateEmployeeAPI(targetId, payload);

      setToast({
        show: true,
        message: `Employee "${fullName}" updated successfully!`,
        type: 'success',
      });

      if (onEmployeeUpdated) {
        onEmployeeUpdated(result?.employee || result?.data || result);
      } else if (onBack) {
        onBack();
      } else {
        navigate('/employees');
      }
    } catch (err) {
      const errorMsg =
        err.message || 'Failed to update employee. Please verify your inputs and try again.';
      setFormError(errorMsg);
      setToast({ show: true, message: errorMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/employees');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 px-2 sm:px-4">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}

      <div className="mb-3">
        <button
          type="button"
          onClick={handleBackAction}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Employees</span>
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-6 tracking-tight">
        Edit Employee
      </h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setFormError('');
                }}
                placeholder="e.g. EMP-010"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFormError('');
                }}
                placeholder="e.g. Vikram Joshi"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError('');
                }}
                placeholder="e.g. vikram.joshi@example.com"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFormError('');
                }}
                placeholder="e.g. 9876543219"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setFormError('');
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                >
                  <option value="">Select Department...</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Role / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setFormError('');
                }}
                placeholder="e.g. Sales Manager"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => {
                  setJoiningDate(e.target.value);
                  setFormError('');
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setFormError('');
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 pr-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {status === 'On Leave' && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3 transition-all animate-fadeIn">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📅</span>
                <span>Leave Period Details (Required for On Leave)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Leave Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => {
                      setLeaveStart(e.target.value);
                      setFormError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Leave End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={leaveStart}
                    value={leaveEnd}
                    onChange={(e) => {
                      setLeaveEnd(e.target.value);
                      setFormError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Skills
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Type skill & press Enter or Add (e.g. Sales Strategy)"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                + Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs text-slate-700 font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium animate-fadeIn">
              ⚠️ {formError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#853A3A] hover:bg-[#722f2f] active:scale-[0.99] text-white py-3 rounded-lg font-bold text-sm sm:text-base tracking-wide transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Employee...</span>
                </>
              ) : (
                <span>Update Employee</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
