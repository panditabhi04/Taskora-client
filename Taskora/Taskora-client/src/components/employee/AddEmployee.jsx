import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployeeAPI } from '../../api.js';
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

const AddEmployee = ({ onBack, onEmployeeCreated }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joiningDate: '',
    status: 'Active',
    skills: [],
    leaveStart: '',
    leaveEnd: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Get today's local date string in YYYY-MM-DD
  const todayString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const {
    employeeId,
    fullName,
    email,
    phone,
    department,
    role,
    joiningDate,
    status,
    skills,
    leaveStart,
    leaveEnd,
  } = form;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleJoiningDateChange = (e) => {
    const val = e.target.value;
    if (val && val < todayString) {
      const msg = 'Joining Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      setForm((prev) => ({ ...prev, joiningDate: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, joiningDate: val }));
    setFormError('');
  };

  const handleLeaveStartChange = (e) => {
    const val = e.target.value;
    if (val && val < todayString) {
      const msg = 'Leave Start Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      setForm((prev) => ({ ...prev, leaveStart: '' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      leaveStart: val,
      leaveEnd: prev.leaveEnd && val && prev.leaveEnd < val ? '' : prev.leaveEnd,
    }));
    setFormError('');
  };

  const handleLeaveEndChange = (e) => {
    const val = e.target.value;
    const minAllowed = leaveStart || todayString;
    if (val && val < minAllowed) {
      const msg = leaveStart
        ? 'Leave End Date must be on or after Leave Start Date.'
        : 'Leave End Date cannot be in the past.';
      setFormError(msg);
      setToast({ show: true, message: msg, type: 'error' });
      setForm((prev) => ({ ...prev, leaveEnd: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, leaveEnd: val }));
    setFormError('');
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
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
    if (joiningDate < todayString) {
      const msg = 'Joining Date cannot be in the past.';
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
      if (leaveStart < todayString) {
        const msg = 'Leave Start Date cannot be in the past.';
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
      if (leaveEnd < leaveStart) {
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

      const result = await createEmployeeAPI(payload);

      setToast({
        show: true,
        message: `Employee "${fullName}" created successfully!`,
        type: 'success',
      });

      if (onEmployeeCreated) {
        onEmployeeCreated(result?.employee || result?.data || result);
      } else if (onBack) {
        onBack();
      } else {
        navigate('/employees');
      }
    } catch (err) {
      const errorMsg =
        err.message || 'Failed to create employee. Please verify your inputs and try again.';
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
        Add Employee
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
                name="employeeId"
                value={employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-010"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={handleChange}
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
                name="email"
                value={email}
                onChange={handleChange}
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
                name="phone"
                value={phone}
                onChange={handleChange}
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
                  name="department"
                  value={department}
                  onChange={handleChange}
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
                name="role"
                value={role}
                onChange={handleChange}
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
                name="joiningDate"
                min={todayString}
                value={joiningDate}
                onChange={handleJoiningDateChange}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={status}
                  onChange={handleChange}
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
                    name="leaveStart"
                    min={todayString}
                    value={leaveStart}
                    onChange={handleLeaveStartChange}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#853A3A]/30 focus:border-[#853A3A] transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Leave End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="leaveEnd"
                    min={leaveStart || todayString}
                    value={leaveEnd}
                    onChange={handleLeaveEndChange}
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
                  <span>Creating Employee...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
