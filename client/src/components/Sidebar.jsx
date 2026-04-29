import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Sparkles,
  Settings,
  LogOut,
  Shield,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'night');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'night' ? 'light' : 'night');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app/dashboard' },
    { name: 'Clients', icon: <Users size={20} />, path: '/app/clients' },
    { name: 'Projects', icon: <Briefcase size={20} />, path: '/app/projects' },
    { name: 'Invoices', icon: <FileText size={20} />, path: '/app/invoices' },
    { name: 'AI Hub', icon: <Sparkles size={20} />, path: '/app/ai-hub' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/app/settings' },
  ];

  return (
    <aside className="w-64 bg-surface2 h-screen border-r border-border flex flex-col justify-between">
      {/* Top section - Logo */}
      <div>
        <div className="p-6 border-b border-border">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            InvoiceAI
          </span>
        </div>

        {/* Nav Links */}
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-primary text-white shadow-purple-glow'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Theme Toggle Button */}
      <div className="px-4 mb-4">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-surface rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-all text-sm font-semibold shadow-md"
        >
          {theme === 'night' ? (
            <>
              <Sun size={18} className="text-warning" /> <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} className="text-primary" /> <span>Night Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom section - User Profile */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {user?.businessName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-text-primary truncate">{user?.businessName}</p>
            <span className="flex items-center gap-1 text-xs text-secondary capitalize">
              <Shield size={12} /> {user?.plan || 'Free'} Plan
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-surface2 text-text-secondary hover:text-accent border border-border hover:border-accent rounded-xl transition-all text-sm font-semibold"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
