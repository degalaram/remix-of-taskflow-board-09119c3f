// Sidebar Component
// Navigation sidebar with menu items and routing - Responsive design

import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Star,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  // Get kanban state from Redux store
  const { sections, tasks } = useSelector((state) => state.kanban);
  
  // Get navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    onMobileMenuClose();
  }, [location.pathname, onMobileMenuClose]);

  // Calculate task statistics
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;

    // Count tasks across all sections
    Object.entries(tasks).forEach(([sectionId, sectionTasks]) => {
      total += sectionTasks.length;
      
      // Find section to determine type
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        const title = section.title.toLowerCase();
        if (title.includes('done') || title.includes('complete')) {
          completed += sectionTasks.length;
        } else if (title.includes('progress') || title.includes('doing')) {
          inProgress += sectionTasks.length;
        }
      }
    });

    return { total, completed, inProgress };
  }, [sections, tasks]);

  // Menu items array with routes
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'All Tasks', path: '/tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
    { id: 'favorites', icon: Star, label: 'Favorites', path: '/favorites' },
  ];

  const bottomMenuItems = [
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  // Handle menu item click
  const handleMenuClick = (path) => {
    navigate(path);
    onMobileMenuClose();
  };

  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <>
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {/* Main Menu */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-3">
            Menu
          </h3>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                active={isActive(item.path)}
                onClick={() => handleMenuClick(item.path)}
              />
            ))}
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 p-4 rounded-xl bg-sidebar-accent">
          <h4 className="text-sm font-medium text-sidebar-accent-foreground mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <StatItem label="Total Tasks" value={stats.total} color="primary" />
            <StatItem label="Completed" value={stats.completed} color="done" />
            <StatItem label="In Progress" value={stats.inProgress} color="inprogress" />
          </div>
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-sidebar-border">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              active={isActive(item.path)}
              onClick={() => handleMenuClick(item.path)}
            />
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay - click to close menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar - Desktop: visible in flex layout, Mobile: overlay drawer */}
      <aside 
        className={`
          bg-sidebar text-sidebar-foreground flex flex-col
          w-64 h-screen
          transition-transform duration-300 ease-in-out
          md:relative md:h-auto md:w-64 md:translate-x-0 md:sticky md:top-0
          fixed left-0 top-0 z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

// Menu Item Component
const MenuItem = ({ item, active, onClick }) => {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="flex-1 text-left">{item.label}</span>
        {active && <ChevronRight className="w-4 h-4" />}
      </button>
    </li>
  );
};

// Stat Item Component
const StatItem = ({ label, value, color }) => {
  const colorClasses = {
    primary: 'bg-sidebar-primary',
    done: 'bg-done',
    inprogress: 'bg-inprogress',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
        <span className="text-sidebar-foreground/70">{label}</span>
      </div>
      <span className="font-medium text-sidebar-foreground">{value}</span>
    </div>
  );
};

export default Sidebar;
