import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = ({
  title = 'Taskora-Employee & Task Management',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'employees', label: 'Employees', path: '/employees' },
    { id: 'tasks', label: 'Tasks', path: '/tasks' },
  ];

  return (
    <header className="w-full bg-[#212529] border-b border-[#2b3035] shadow-sm sticky top-0 left-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between box-border">
        {/* Desktop & Tablet Navigation */}
        <div className="flex items-center">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `text-[15px] transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold border-b-2 border-slate-300 pb-0.5'
                      : 'text-gray-300 hover:text-white font-medium'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu hamburger button */}
          <button
            type="button"
            className="md:hidden text-gray-300 hover:text-white p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Center / Brand Title */}
        <div className="flex-1 flex justify-center items-center px-2 sm:px-4">
          <Link
            to="/"
            className="text-[#f8f9fa] text-sm sm:text-base font-semibold tracking-wide truncate max-w-[240px] sm:max-w-none text-center hover:opacity-90 transition-opacity"
          >
            {title}
          </Link>
        </div>

        {/* Spacer for symmetrical layout */}
        <div className="hidden md:flex items-center min-w-[40px] justify-end" />
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1a1d20] border-t border-[#2b3035] px-4 pt-2 pb-3 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base transition-colors ${
                  isActive
                    ? 'bg-[#2b3036] text-white font-semibold'
                    : 'text-gray-300 hover:bg-[#25292e] hover:text-white font-medium'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
