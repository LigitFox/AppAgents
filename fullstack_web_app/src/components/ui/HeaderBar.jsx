import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import UserMenu from './UserMenu';

const HeaderBar = ({ onSidebarToggle, sidebarExpanded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New user registered', time: '2 min ago', unread: true },
    { id: 2, title: 'System backup completed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Monthly report ready', time: '3 hours ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border shadow-elevation-1">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onSidebarToggle}
            iconName="Menu"
            iconSize={20}
          />
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-text-primary hidden sm:block">
              FullStack
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
              />
              <Input
                ref={searchRef}
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`pl-10 pr-4 py-2 w-full bg-background border-border rounded-lg transition-smooth focus:ring-2 focus:ring-primary focus:border-primary ${
                  searchFocused ? 'bg-surface shadow-elevation-1' : ''
                }`}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setSearchQuery('')}
                  iconName="X"
                  iconSize={14}
                />
              )}
            </div>
          </form>
        </div>

        {/* Right Section - Actions and User Menu */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            iconName="Search"
            iconSize={20}
          />

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="relative"
              iconName="Bell"
              iconSize={20}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-elevation-3 z-50 animate-fade-in">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="text"
                        size="xs"
                        onClick={markAllAsRead}
                        className="text-primary hover:text-primary-700"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border-muted last:border-b-0 cursor-pointer hover:bg-background transition-smooth ${
                          notification.unread ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-primary' : 'bg-transparent'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Icon name="Bell" size={32} className="mx-auto text-text-muted mb-2" />
                      <p className="text-text-muted">No notifications</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="text"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="w-full text-error hover:text-error-700"
                    >
                      Clear all notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            iconName="HelpCircle"
            iconSize={20}
            onClick={() => console.log('Help clicked')}
          />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;