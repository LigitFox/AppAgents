import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const SidebarNavigation = ({ isExpanded, onToggle, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      badge: null,
      tooltip: 'Main dashboard with metrics and overview'
    },
    {
      label: 'Data Management',
      path: '/data',
      icon: 'Database',
      badge: null,
      tooltip: 'Manage and organize your data'
    },
    {
      label: 'Files',
      path: '/files',
      icon: 'FolderOpen',
      badge: '12',
      tooltip: 'File upload and management'
    },
    {
      label: 'Users',
      path: '/users',
      icon: 'Users',
      badge: null,
      tooltip: 'User management and profiles'
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'BarChart3',
      badge: 'New',
      tooltip: 'Analytics and reporting tools'
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      badge: null,
      tooltip: 'Application settings and preferences'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobile && isExpanded) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isExpanded, onToggle]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-surface border-r border-border z-50
          transition-all duration-300 ease-smooth shadow-elevation-2
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobile ? (isExpanded ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          lg:fixed
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-muted">
            {isExpanded && (
              <h2 className="font-semibold text-text-primary">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="hidden lg:flex"
              iconName={isExpanded ? "ChevronLeft" : "ChevronRight"}
              iconSize={18}
            />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              
              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                      transition-all duration-150 ease-smooth group
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-elevation-1' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background'
                      }
                      ${!isExpanded ? 'justify-center' : 'justify-start'}
                    `}
                  >
                    <Icon 
                      name={item.icon} 
                      size={20} 
                      className={`flex-shrink-0 ${
                        isActive ? 'text-primary-foreground' : 'text-current'
                      }`}
                    />
                    
                    {isExpanded && (
                      <>
                        <span className="font-medium truncate flex-1 text-left">
                          {item.label}
                        </span>
                        
                        {item.badge && (
                          <span className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${isActive 
                              ? 'bg-primary-foreground text-primary' 
                              : item.badge === 'New' ?'bg-accent text-accent-foreground' :'bg-secondary-100 text-secondary-700'
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.path && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-60">
                      <div className="bg-secondary-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-elevation-3 animate-fade-in">
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 bg-white text-secondary-800 text-xs rounded">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-secondary-800" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border-muted">
            <div className={`flex items-center space-x-3 ${!isExpanded ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <Icon name="Sparkles" size={16} className="text-secondary-600" />
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    FullStack App
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    v1.0.0
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;