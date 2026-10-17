import React, { useState } from 'react';
import AddEmployee from './AddEmployee.jsx';
import EditEmployee from './EditEmployee.jsx';
import EmployeeTable from './EmployeeTable.jsx';
import EmployeeHeaderActions from './EmployeeHeaderActions.jsx';
import Toast from '../../common/Toast.jsx';
import { useEmployeeController } from '../../controller/employee/employeeController.jsx';

const EmployeeManager = ({ initialView = 'list' }) => {
  const {
    employees,
    pagination,
    loading,
    isSearching,
    error,
    search,
    setSearch,
    submitSearch,
    department,
    setDepartment,
    status,
    setStatus,
    resetFilters,
    deleteEmployee,
    refreshEmployees,
  } = useEmployeeController({ limit: 10 });

  const [currentView, setCurrentView] = useState(initialView);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const handleAddEmployeeClick = () => {
    setCurrentView('add');
  };

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setCurrentView('edit');
  };

  const handleEmployeeCreated = (newEmp) => {
    refreshEmployees();
    setCurrentView('list');
    setToast({
      show: true,
      message: `Employee "${newEmp?.fullName || 'Employee'}" created successfully!`,
      type: 'success',
    });
  };

  const handleEmployeeUpdated = (updatedEmp) => {
    refreshEmployees();
    setEditingEmployee(null);
    setCurrentView('list');
    setToast({
      show: true,
      message: `Employee "${updatedEmp?.fullName || 'Employee'}" updated successfully!`,
      type: 'success',
    });
  };

  const handleDeleteEmployee = (emp) => {
    refreshEmployees();
    setToast({
      show: true,
      message: `Employee "${emp?.fullName || 'Employee'}" deleted successfully.`,
      type: 'success',
    });
  };

  if (currentView === 'add') {
    return (
      <AddEmployee
        onBack={() => setCurrentView('list')}
        onEmployeeCreated={handleEmployeeCreated}
      />
    );
  }

  if (currentView === 'edit') {
    return (
      <EditEmployee
        employee={editingEmployee}
        onBack={() => {
          setEditingEmployee(null);
          setCurrentView('list');
        }}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between text-xs sm:text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={refreshEmployees}
            className="underline font-semibold ml-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Actions (Search & Filters) */}
      <EmployeeHeaderActions
        searchQuery={search}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        isSearching={isSearching}
        selectedDepartment={department}
        onDepartmentChange={(val) => {
          setDepartment(val);
          pagination.onPageChange(1);
        }}
        selectedStatus={status}
        onStatusChange={(val) => {
          setStatus(val);
          pagination.onPageChange(1);
        }}
        onResetFilters={resetFilters}
        onAddEmployee={handleAddEmployeeClick}
      />

      {/* Employees Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onAddEmployeeClick={handleAddEmployeeClick}
        paginationProps={pagination}
      />
    </div>
  );
};

export default EmployeeManager;
