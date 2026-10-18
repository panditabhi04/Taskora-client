import React from 'react';
import EmployeeManager from '../../components/employee/EmployeeManager.jsx';

const Employee = ({ initialView = 'list' }) => {
  return (
    <div className="w-full pb-8 sm:pb-12">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Employees
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage, view, and onboard organization employees and track their availability.
        </p>
      </div>
      <EmployeeManager initialView={initialView} />
    </div>
  );
};

export default Employee;
