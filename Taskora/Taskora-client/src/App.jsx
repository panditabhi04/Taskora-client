import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './common/Navbar.jsx'
import Task from './page/task/Task.jsx'
import Dashboard from './page/dashborad/dashborad.jsx'
import Employee from './page/employee/employee.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col w-full bg-slate-50 text-slate-800 antialiased selection:bg-slate-200">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Task />} />
            <Route path="/tasks/add" element={<Task initialView="add" />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/employees/add" element={<Employee initialView="add" />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
