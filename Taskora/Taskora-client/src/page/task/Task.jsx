import React from 'react';
import TaskManager from '../../components/task/TaskManager.jsx';

/**
 * Task Page Component
 * Located at: src/page/task/Task.jsx
 * Renders the Task Management page incorporating all task subcomponents.
 */
const Task = ({ initialView = 'list' }) => {
  return (
    <div className="w-full pb-8 sm:pb-12">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Tasks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage, track, and assign organizational tasks across team members.
        </p>
      </div>

      {/* Main Task Component (Combines Search, Filters, Add/Export, Table & Pagination) */}
      <TaskManager initialView={initialView} />
    </div>
  );
};

export default Task;
