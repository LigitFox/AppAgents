import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const BreadcrumbTrail = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route mapping for breadcrumb generation
  const routeMap = {
    '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/data': { label: 'Data Management', icon: 'Database' },
    '/files': { label: 'Files', icon: 'FolderOpen' },
    '/users': { label: 'Users', icon: 'Users' },
    '/reports': { label: 'Reports', icon: 'BarChart3' },
    '/settings': { label: 'Settings', icon: 'Settings' },
    '/profile': { label: 'Profile', icon: 'User' },
    '/billing': { label: 'Billing', icon: 'CreditCard' },
    '/help': { label: 'Help & Support', icon: 'HelpCircle' }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Dashboard as home
    if (location.pathname !== '/dashboard') {
      breadcrumbs.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap[currentPath];
      
      if (routeInfo) {
        breadcrumbs.push({
          label: routeInfo.label,
          path: currentPath,
          icon: routeInfo.icon,
          isLast: index === pathSegments.length - 1
        });
      } else {
        // Handle dynamic segments or unknown routes
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          path: currentPath,
          icon: 'ChevronRight',
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if only one item (current page) or if on dashboard without custom breadcrumbs
  if (breadcrumbs.length <= 1 && location.pathname === '/dashboard' && !customBreadcrumbs) {
    return null;
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  const handleBackClick = () => {
    if (breadcrumbs.length > 1) {
      const previousBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
      navigate(previousBreadcrumb.path);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className="flex items-center space-x-2 py-3 px-4 lg:px-6 bg-background border-b border-border-muted" aria-label="Breadcrumb">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="mr-2 text-text-muted hover:text-text-primary"
        iconName="ArrowLeft"
        iconSize={16}
      />

      {/* Breadcrumb Items */}
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-text-muted mx-2 flex-shrink-0"
              />
            )}
            
            <div className="flex items-center space-x-1.5">
              {breadcrumb.icon && (
                <Icon 
                  name={breadcrumb.icon} 
                  size={16} 
                  className={`flex-shrink-0 ${
                    breadcrumb.isLast 
                      ? 'text-primary' :'text-text-muted'
                  }`}
                />
              )}
              
              {breadcrumb.isLast ? (
                <span className="font-medium text-primary truncate max-w-xs">
                  {breadcrumb.label}
                </span>
              ) : (
                <button
                  onClick={() => handleBreadcrumbClick(breadcrumb.path)}
                  className="font-medium text-text-muted hover:text-text-primary transition-smooth truncate max-w-xs focus:outline-none focus:underline"
                >
                  {breadcrumb.label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Actions */}
      <div className="flex items-center space-x-2 ml-auto">
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-text-muted hover:text-text-primary"
          iconName="RefreshCw"
          iconSize={16}
        />

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            console.log('URL copied to clipboard');
          }}
          className="text-text-muted hover:text-text-primary"
          iconName="Share"
          iconSize={16}
        />

        {/* More Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => console.log('More actions')}
          className="text-text-muted hover:text-text-primary"
          iconName="MoreHorizontal"
          iconSize={16}
        />
      </div>
    </nav>
  );
};

export default BreadcrumbTrail;