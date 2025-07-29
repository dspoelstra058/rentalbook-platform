import React, { useState } from 'react';
import { Users, Database, Settings, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { mockLocalInfo } from '../utils/data';
import { LocalInfo } from '../types';

type AdminView = 'dashboard' | 'users' | 'local-info' | 'settings';

export const AdminPanel: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [localInfo, setLocalInfo] = useState(mockLocalInfo);
  const [editingInfo, setEditingInfo] = useState<LocalInfo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggleVerified = (id: string) => {
    setLocalInfo(prev => prev.map(info => 
      info.id === id ? { ...info, verified: !info.verified } : info
    ));
  };

  const handleDeleteInfo = (id: string) => {
    setLocalInfo(prev => prev.filter(info => info.id !== id));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">347</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
            </div>
            <Database className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Local Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{localInfo.length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { id: '1', name: 'John Doe', email: 'john@example.com', properties: 3, status: 'active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', properties: 1, status: 'active' },
            { id: '3', name: 'Bob Wilson', email: 'bob@example.com', properties: 2, status: 'inactive' }
          ].map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.properties} properties</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLocalInfo = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Local Information Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Local Info
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Local Information</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {localInfo.map((info) => (
            <div key={info.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {info.category}
                    </span>
                    <button
                      onClick={() => handleToggleVerified(info.id)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                        info.verified 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {info.verified ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>{info.verified ? 'Verified' : 'Unverified'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {info.address}, {info.city}, {info.country}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingInfo(info)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInfo(info.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (EUR)
              </label>
              <input
                type="number"
                defaultValue={29.99}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hosting Fee (EUR/year)
              </label>
              <input
                type="number"
                defaultValue={19.99}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@rentalbook.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'local-info':
        return renderLocalInfo();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Settings },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'local-info', label: 'Local Info', icon: Database },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as AdminView)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};