import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Settings, Users, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { authService } from '../utils/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin ? [
    { path: '/admin', label: t('nav.dashboard'), icon: Home },
    { path: '/admin/users', label: t('nav.users'), icon: Users },
    { path: '/admin/local-info', label: t('nav.localInfo'), icon: Database },
    { path: '/admin/settings', label: t('nav.settings'), icon: Settings },
  ] : [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/properties', label: t('nav.properties'), icon: Home },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                RentalBook Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <span className="text-sm text-gray-700">
                {t('common.welcome')}, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};