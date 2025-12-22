// Header Component
// Displays the application header with logo, search, theme toggle, user info, and logout button

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { setSearchQuery } from '../store/slices/kanbanSlice';
import { LogOut, User, Zap, RefreshCw, Search, Sun, Moon, X } from 'lucide-react';

const Header = () => {
  // Get dispatch function
  const dispatch = useDispatch();

  // Get auth state from Redux store
  const { user, session, isRefreshing } = useSelector((state) => state.auth);

  // Get kanban state
  const { isSaving, searchQuery } = useSelector((state) => state.kanban);

  // Local search state (synced with Redux)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskflow_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [isDarkMode]);

  // Handle logout button click
  const handleLogout = () => {
    dispatch(logout());
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle search input change - update Redux store in real-time
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    dispatch(setSearchQuery(value));
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
  };

  // Calculate time until token expires
  const getTokenStatus = () => {
    if (!session) return null;
    
    const now = Date.now();
    const expiresIn = session.accessTokenExpiry - now;
    
    if (expiresIn <= 0) {
      return { status: 'expired', text: 'Token expired' };
    }
    
    const seconds = Math.floor(expiresIn / 1000);
    if (seconds < 60) {
      return { status: 'warning', text: `Expires in ${seconds}s` };
    }
    
    return { status: 'valid', text: 'Token valid' };
  };

  const tokenStatus = getTokenStatus();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* Left side - Logo and App Name */}
      <div className="flex items-center gap-3 ml-10 md:ml-0">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-foreground">TaskFlow</h1>
          <p className="text-xs text-muted-foreground">Task Management</p>
        </div>
      </div>

      {/* Center - Search Bar and Status */}
      <div className="flex-1 flex items-center justify-center gap-4 mx-4">
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center relative max-w-md w-full">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-10 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {localSearchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 p-0.5 rounded hover:bg-muted"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search Button - Mobile */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Saving Indicator */}
        {isSaving && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}

        {/* Token Status */}
        {tokenStatus && (
          <div
            className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
              tokenStatus.status === 'expired'
                ? 'bg-destructive/10 text-destructive'
                : tokenStatus.status === 'warning'
                ? 'bg-inprogress/10 text-inprogress'
                : 'bg-done/10 text-done'
            }`}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${
                    tokenStatus.status === 'expired'
                      ? 'bg-destructive'
                      : tokenStatus.status === 'warning'
                      ? 'bg-inprogress'
                      : 'bg-done'
                  }`}
                />
                {tokenStatus.text}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side - Theme Toggle, User Info and Logout */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || 'user@taskflow.com'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-10 py-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {localSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {localSearchQuery && (
            <p className="mt-4 text-sm text-muted-foreground">
              Filtering tasks containing "{localSearchQuery}"
            </p>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
