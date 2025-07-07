import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Image from '../AppImage';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/assets/images/avatar-placeholder.jpg',
    role: 'Administrator',
    status: 'online'
  });
  
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const menuItems = [
    {
      label: 'Profile',
      icon: 'User',
      action: () => navigate('/profile'),
      description: 'Manage your account settings'
    },
    {
      label: 'Settings',
      icon: 'Settings',
      action: () => navigate('/settings'),
      description: 'Application preferences'
    },
    {
      label: 'Billing',
      icon: 'CreditCard',
      action: () => navigate('/billing'),
      description: 'Manage subscription and billing'
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      action: () => window.open('/help', '_blank'),
      description: 'Get help and documentation'
    },
    {
      label: 'Keyboard Shortcuts',
      icon: 'Keyboard',
      action: () => console.log('Show shortcuts'),
      description: 'View available shortcuts',
      shortcut: '?'
    },
    { type: 'divider' },
    {
      label: 'Sign Out',
      icon: 'LogOut',
      action: handleSignOut,
      description: 'Sign out of your account',
      variant: 'danger'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function handleSignOut() {
    console.log('Signing out...');
    // Clear authentication state
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Navigate to login
    navigate('/login');
    setIsOpen(false);
  }

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={handleMenuToggle}
        className={`
          flex items-center space-x-2 p-1.5 rounded-lg transition-smooth
          hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${isOpen ? 'bg-background' : ''}
        `}
      >
        <div className="relative">
          <Image
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-border"
          />
          <div className={`
            absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface
            ${user.status === 'online' ? 'bg-success' : 'bg-secondary-400'}
          `} />
        </div>
        
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text-primary truncate max-w-24">
            {user.name}
          </p>
          <p className="text-xs text-text-muted truncate max-w-24">
            {user.role}
          </p>
        </div>
        
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`text-text-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-lg shadow-elevation-3 z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="p-4 border-b border-border-muted">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className={`
                  absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface
                  ${user.status === 'online' ? 'bg-success' : 'bg-secondary-400'}
                `} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-sm text-text-muted truncate">
                  {user.email}
                </p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.status === 'online' ? 'bg-success' : 'bg-secondary-400'
                  }`} />
                  <span className="text-xs text-text-muted capitalize">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={index} className="my-2 border-t border-border-muted" />
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 text-left
                    transition-smooth hover:bg-background focus:outline-none focus:bg-background
                    ${item.variant === 'danger' ? 'hover:bg-error-50 focus:bg-error-50' : ''}
                  `}
                >
                  <Icon 
                    name={item.icon} 
                    size={18} 
                    className={`flex-shrink-0 ${
                      item.variant === 'danger' ? 'text-error' : 'text-text-muted'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      item.variant === 'danger' ? 'text-error' : 'text-text-primary'
                    }`}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.shortcut && (
                    <span className="text-xs text-text-muted bg-background px-2 py-1 rounded border">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border-muted bg-background rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>FullStack App v1.0.0</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="xs"
                  iconName="Moon"
                  iconSize={14}
                  onClick={() => console.log('Toggle theme')}
                />
                <Button
                  variant="ghost"
                  size="xs"
                  iconName="Globe"
                  iconSize={14}
                  onClick={() => console.log('Change language')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;