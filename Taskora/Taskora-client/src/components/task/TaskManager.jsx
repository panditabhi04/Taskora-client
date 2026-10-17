import React, { useState } from 'react';
import TaskHeaderActions from './TaskHeaderActions.jsx';
import TaskTable from './TaskTable.jsx';
import AddTask from './AddTask.jsx';
import EditTask from './EditTask.jsx';
import ViewTask from './ViewTask.jsx';
import Toast from '../../common/Toast.jsx';
import { useTaskController } from '../../controller/Task/TaskController.jsx';

const TaskManager = ({ initialView = 'list' }) => {
  const {
    tasks,
    pagination,
    loading,
    isSearching,
    error,
    search,
    setSearch,
    submitSearch,
    department,
    setDepartment,
    priority,
    setPriority,
    status,
    setStatus,
    dueDateFilter,
    setDueDateFilter,
    resetFilters,
    handleStatusChange,
    exportCsv,
    refreshTasks,
  } = useTaskController({ limit: 10 });

  const [currentView, setCurrentView] = useState(initialView);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isExporting, setIsExporting] = useState(false);

  const handleAddTaskClick = () => {
    setCurrentView('add');
  };

  const handleTaskCreated = (newTask) => {
    refreshTasks();
    setCurrentView('list');
    setToast({
      show: true,
      message: `Task "${newTask?.title || 'New Task'}" created successfully!`,
      type: 'success',
    });
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
    setIsViewModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setCurrentView('edit');
  };

  const handleTaskUpdated = (updatedTask) => {
    refreshTasks();
    setEditingTask(null);
    setCurrentView('list');
    setToast({
      show: true,
      message: `Task "${updatedTask?.title || 'Task'}" updated successfully!`,
      type: 'success',
    });
  };

  const handleDeleteTask = (task) => {
    refreshTasks();
    setToast({
      show: true,
      message: `Task "${task?.title || 'Task'}" deleted successfully!`,
      type: 'success',
    });
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportCsv();
      setToast({
        show: true,
        message: 'Tasks CSV exported successfully from server!',
        type: 'success',
      });
    } catch (err) {
      console.warn('Backend CSV export endpoint returned error, using fallback:', err.message);
      
      // Fallback per PDF specification ensuring overdue calculation consistency
      const headers = ['Task ID', 'Title', 'Assigned Employee', 'Department', 'Priority', 'Status', 'Start Date', 'Due Date'];
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const rows = tasks.map((t) => {
        const rawDue = t.rawDueDate || t.dueDate;
        const isOverdue =
          rawDue &&
          new Date(rawDue) < today &&
          t.status !== 'Completed' &&
          t.status !== 'Cancelled';

        const displayDue = isOverdue
          ? `${t.dueDate && t.dueDate.includes('Overdue') ? t.dueDate : (t.dueDate || '') + ' (Overdue)'}`
          : t.dueDate;

        return [
          t.taskCode || t.taskId || t._id || t.id,
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${(t.employee || '').replace(/"/g, '""')}"`,
          `"${(t.department || '').replace(/"/g, '""')}"`,
          t.priority || '',
          t.status || '',
          t.startDate || '',
          `"${displayDue || ''}"`,
        ];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({
        show: true,
        message: 'Downloaded CSV file.',
        type: 'info',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (currentView === 'add') {
    return (
      <AddTask
        onBack={() => setCurrentView('list')}
        onTaskCreated={handleTaskCreated}
        existingTasks={tasks}
      />
    );
  }

  if (currentView === 'edit') {
    return (
      <EditTask
        task={editingTask}
        onBack={() => {
          setEditingTask(null);
          setCurrentView('list');
        }}
        onTaskUpdated={handleTaskUpdated}
        existingTasks={tasks}
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

      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between text-xs sm:text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={refreshTasks}
            className="underline font-semibold ml-2 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <TaskHeaderActions
        searchQuery={search}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        isSearching={isSearching}
        selectedDepartment={department}
        onDepartmentChange={(val) => {
          setDepartment(val);
          pagination.onPageChange(1);
        }}
        selectedPriority={priority}
        onPriorityChange={(val) => {
          setPriority(val);
          pagination.onPageChange(1);
        }}
        selectedStatus={status}
        onStatusChange={(val) => {
          setStatus(val);
          pagination.onPageChange(1);
        }}
        selectedDueDateFilter={dueDateFilter}
        onDueDateFilterChange={(val) => {
          setDueDateFilter(val);
          pagination.onPageChange(1);
        }}
        onResetFilters={resetFilters}
        onAddTask={handleAddTaskClick}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
      />

      <TaskTable
        tasks={tasks}
        loading={loading}
        onStatusChange={handleStatusChange}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        paginationProps={pagination}
      />

      <ViewTask
        isOpen={isViewModalOpen}
        task={viewingTask}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingTask(null);
        }}
        onEdit={(task) => {
          setIsViewModalOpen(false);
          setViewingTask(null);
          handleEditTask(task);
        }}
      />
    </div>
  );
};

export default TaskManager;
