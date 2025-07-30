import React, { useState } from 'react';
import { Users, Database, Settings, Plus, Edit, Trash2, Check, X, FileText, Save, Eye, Copy, Search, Filter } from 'lucide-react';
import { mockLocalInfo } from '../utils/data';
import { LocalInfo, PDFTemplate, PDFSection, Template, User } from '../types';
import { templates } from '../utils/data';
import { useLanguage } from '../contexts/LanguageContext';

type AdminView = 'dashboard' | 'users' | 'local-info' | 'pdf-templates' | 'settings';

// Mock users data
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'owner',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'owner',
    createdAt: new Date('2024-02-10')
  },
  {
    id: 'user-3',
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    role: 'owner',
    createdAt: new Date('2024-03-05')
  },
  {
    id: 'admin-1',
    email: 'admin@platform.com',
    name: 'Platform Admin',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  }
];

export const AdminPanel: React.FC = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [localInfo, setLocalInfo] = useState(mockLocalInfo);
  const [users, setUsers] = useState(mockUsers);
  const [editingInfo, setEditingInfo] = useState<LocalInfo | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [pdfTemplates, setPdfTemplates] = useState<Template[]>(templates);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [settings, setSettings] = useState({
    basePrice: 29.99,
    hostingFee: 19.99,
    supportEmail: 'support@rentalbook.com',
    platformName: 'RentalBook Platform',
    maxPropertiesPerUser: 10,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maintenanceMode: false
  });

  const handleToggleVerified = (id: string) => {
    setLocalInfo(prev => prev.map(info => 
      info.id === id ? { ...info, verified: !info.verified } : info
    ));
  };

  const handleDeleteInfo = (id: string) => {
    if (confirm('Are you sure you want to delete this local information?')) {
      setLocalInfo(prev => prev.filter(info => info.id !== id));
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== id));
    }
  };

  const handleSaveLocalInfo = (info: LocalInfo) => {
    if (editingInfo) {
      setLocalInfo(prev => prev.map(item => item.id === info.id ? info : item));
    } else {
      setLocalInfo(prev => [...prev, { ...info, id: `local-${Date.now()}` }]);
    }
    setEditingInfo(null);
    setShowAddForm(false);
  };

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      setUsers(prev => prev.map(item => item.id === user.id ? user : item));
    } else {
      setUsers(prev => [...prev, { ...user, id: `user-${Date.now()}`, createdAt: new Date() }]);
    }
    setEditingUser(null);
    setShowAddUserForm(false);
  };

  const handleSaveTemplate = (template: Template) => {
    setPdfTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    setEditingTemplate(null);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      pdfTemplate: template.pdfTemplate ? {
        ...template.pdfTemplate,
        id: `${template.pdfTemplate.id}-copy-${Date.now()}`,
        name: `${template.pdfTemplate.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined
    };
    setPdfTemplates(prev => [...prev, newTemplate]);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  const filteredLocalInfo = localInfo.filter(info => {
    const matchesSearch = info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || info.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Properties</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
            </div>
            <Database className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.localListings')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{localInfo.length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PDF Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pdfTemplates.length}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500">jane.smith@example.com • 2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Property published</p>
                <p className="text-xs text-gray-500">Seaside Villa • 4 hours ago</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-2">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">PDF template updated</p>
                <p className="text-xs text-gray-500">Modern Blue template • 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.userManagement')}</h2>
        <button
          onClick={() => setShowAddUserForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.allUsers')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {user.createdAt.toLocaleDateString()} • Role: {user.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
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
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.localInfoManagement')}</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addLocalInfo')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search local information..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="supermarket">Supermarket</option>
              <option value="restaurant">Restaurant</option>
              <option value="hospital">Hospital</option>
              <option value="attraction">Attraction</option>
              <option value="beach">Beach</option>
              <option value="activity">Activity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.allLocalInfo')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredLocalInfo.map((info) => (
            <div key={info.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {t(`categories.${info.category}`)}
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
                      <span>{info.verified ? t('common.verified') : t('common.unverified')}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {info.address}, {info.city}, {info.country}
                    {info.phone && ` • ${info.phone}`}
                    {info.openingHours && ` • ${info.openingHours}`}
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

  const renderPDFTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">PDF Template Management</h2>
        <button
          onClick={() => setEditingTemplate({
            id: `template-${Date.now()}`,
            name: 'New Template',
            category: 'modern',
            preview: '',
            colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
            pdfTemplate: {
              id: `pdf-${Date.now()}`,
              name: 'New PDF Template',
              layout: {
                pageSize: 'a4',
                orientation: 'portrait',
                margins: { top: 40, right: 40, bottom: 40, left: 40 },
                columns: 1
              },
              sections: [],
              styling: {
                fontFamily: 'Arial, sans-serif',
                primaryColor: '#3B82F6',
                secondaryColor: '#1E40AF',
                accentColor: '#60A5FA',
                backgroundColor: '#ffffff',
                headerGradient: true,
                roundedCorners: true,
                shadows: true
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pdfTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div 
              className="h-32 p-4 text-white relative"
              style={{
                background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
              }}
            >
              <div className="bg-white/95 rounded-lg p-2 h-full overflow-hidden">
                <div className="space-y-1">
                  <div
                    className="h-2 rounded"
                    style={{ backgroundColor: template.colors.primary, width: '70%' }}
                  />
                  <div className="h-1 bg-gray-300 rounded w-full" />
                  <div className="h-1 bg-gray-300 rounded w-4/5" />
                  <div className="h-1 bg-gray-300 rounded w-3/5" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                  {template.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {template.pdfTemplate?.sections.filter(s => s.enabled).length || 0} sections enabled
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('admin.platformSettings')}</h2>
      
      <div className="grid gap-6">
        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.paymentSettings')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.basePrice')}
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.basePrice}
                onChange={(e) => setSettings(prev => ({ ...prev, basePrice: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.hostingFee')}
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.hostingFee}
                onChange={(e) => setSettings(prev => ({ ...prev, hostingFee: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Properties Per User
              </label>
              <input
                type="number"
                value={settings.maxPropertiesPerUser}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPropertiesPerUser: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                  className="mr-2"
                />
                Enable Email Notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableSMSNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableSMSNotifications: e.target.checked }))}
                  className="mr-2"
                />
                Enable SMS Notifications
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="mr-2"
                />
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.emailSettings')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.supportEmail')}
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
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
      case 'pdf-templates':
        return renderPDFTemplates();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'users', label: t('nav.users'), icon: Users },
              { id: 'local-info', label: t('nav.localInfo'), icon: Database },
              { id: 'pdf-templates', label: 'PDF Templates', icon: FileText },
              { id: 'settings', label: t('nav.settings'), icon: Settings }
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

      {/* Local Info Form Modal */}
      {(showAddForm || editingInfo) && (
        <LocalInfoForm
          info={editingInfo}
          onSave={handleSaveLocalInfo}
          onClose={() => {
            setShowAddForm(false);
            setEditingInfo(null);
          }}
        />
      )}

      {/* User Form Modal */}
      {(showAddUserForm || editingUser) && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowAddUserForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Template Editor Modal */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </>
  );
};

// Local Info Form Component
interface LocalInfoFormProps {
  info: LocalInfo | null;
  onSave: (info: LocalInfo) => void;
  onClose: () => void;
}

const LocalInfoForm: React.FC<LocalInfoFormProps> = ({ info, onSave, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<LocalInfo>>(
    info || {
      name: '',
      category: 'restaurant',
      address: '',
      phone: '',
      website: '',
      description: '',
      city: '',
      country: '',
      verified: false,
      openingHours: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as LocalInfo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {info ? 'Edit Local Information' : t('admin.addLocalInfo')}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.name')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="doctor">Doctor</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="supermarket">Supermarket</option>
                <option value="restaurant">Restaurant</option>
                <option value="hospital">Hospital</option>
                <option value="attraction">Attraction</option>
                <option value="beach">Beach</option>
                <option value="activity">Activity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.description')}
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.address')}
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.city')}
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.country')}
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.website')}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Hours
            </label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
              placeholder="e.g., 9:00 AM - 6:00 PM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                className="mr-2"
              />
              {t('common.verified')}
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Form Component
interface UserFormProps {
  user: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<User>>(
    user || {
      name: '',
      email: '',
      role: 'owner'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as User);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {user ? 'Edit User' : 'Add User'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Template Editor Component (keeping existing implementation)
interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
  onClose: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave, onClose }) => {
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);
  const [activeSection, setActiveSection] = useState<string>('general');

  const handleSave = () => {
    onSave({
      ...editedTemplate,
      pdfTemplate: editedTemplate.pdfTemplate ? {
        ...editedTemplate.pdfTemplate,
        updatedAt: new Date()
      } : undefined
    });
  };

  const updateStyling = (key: string, value: any) => {
    if (!editedTemplate.pdfTemplate) return;
    setEditedTemplate(prev => ({
      ...prev,
      pdfTemplate: {
        ...prev.pdfTemplate!,
        styling: {
          ...prev.pdfTemplate!.styling,
          [key]: value
        }
      }
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<PDFSection>) => {
    if (!editedTemplate.pdfTemplate) return;
    setEditedTemplate(prev => ({
      ...prev,
      pdfTemplate: {
        ...prev.pdfTemplate!,
        sections: prev.pdfTemplate!.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }
    }));
  };

  const addSection = () => {
    if (!editedTemplate.pdfTemplate) return;
    const newSection: PDFSection = {
      id: `section-${Date.now()}`,
      type: 'custom',
      title: 'New Section',
      enabled: true,
      order: editedTemplate.pdfTemplate.sections.length + 1,
      content: 'Custom content here...',
      styling: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#333333',
        padding: 15,
        marginTop: 0,
        marginBottom: 15
      }
    };
    setEditedTemplate(prev => ({
      ...prev,
      pdfTemplate: {
        ...prev.pdfTemplate!,
        sections: [...prev.pdfTemplate!.sections, newSection]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Edit Template</h3>
            <p className="text-sm text-gray-600">{editedTemplate.name}</p>
          </div>
          <nav className="p-2">
            {[
              { id: 'general', label: 'General Settings' },
              { id: 'styling', label: 'Styling' },
              { id: 'sections', label: 'Sections' },
              { id: 'layout', label: 'Layout' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeSection === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              {activeSection === 'general' && 'General Settings'}
              {activeSection === 'styling' && 'Styling Options'}
              {activeSection === 'sections' && 'PDF Sections'}
              {activeSection === 'layout' && 'Page Layout'}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editedTemplate.name}
                    onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editedTemplate.category}
                    onChange={(e) => setEditedTemplate(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                    <option value="luxury">Luxury</option>
                    <option value="cozy">Cozy</option>
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'styling' && editedTemplate.pdfTemplate && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={editedTemplate.pdfTemplate.styling.fontFamily}
                    onChange={(e) => updateStyling('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={editedTemplate.pdfTemplate.styling.primaryColor}
                      onChange={(e) => updateStyling('primaryColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={editedTemplate.pdfTemplate.styling.secondaryColor}
                      onChange={(e) => updateStyling('secondaryColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={editedTemplate.pdfTemplate.styling.accentColor}
                      onChange={(e) => updateStyling('accentColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedTemplate.pdfTemplate.styling.headerGradient}
                      onChange={(e) => updateStyling('headerGradient', e.target.checked)}
                      className="mr-2"
                    />
                    Header Gradient
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedTemplate.pdfTemplate.styling.roundedCorners}
                      onChange={(e) => updateStyling('roundedCorners', e.target.checked)}
                      className="mr-2"
                    />
                    Rounded Corners
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedTemplate.pdfTemplate.styling.shadows}
                      onChange={(e) => updateStyling('shadows', e.target.checked)}
                      className="mr-2"
                    />
                    Drop Shadows
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'sections' && editedTemplate.pdfTemplate && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium text-gray-900">PDF Sections</h5>
                  <button
                    onClick={addSection}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Section
                  </button>
                </div>
                <div className="space-y-3">
                  {editedTemplate.pdfTemplate.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={section.enabled}
                            onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                          />
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                          />
                        </div>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                          {section.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-gray-600 mb-1">Font Size</label>
                          <input
                            type="number"
                            value={section.styling.fontSize}
                            onChange={(e) => updateSection(section.id, {
                              styling: { ...section.styling, fontSize: parseInt(e.target.value) }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1">Color</label>
                          <input
                            type="color"
                            value={section.styling.color}
                            onChange={(e) => updateSection(section.id, {
                              styling: { ...section.styling, color: e.target.value }
                            })}
                            className="w-full h-8 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      {section.type === 'custom' && (
                        <div className="mt-3">
                          <label className="block text-gray-600 mb-1">Content</label>
                          <textarea
                            value={section.content}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            rows={3}
                            placeholder="Use {{propertyName}}, {{propertyAddress}}, etc. for dynamic content"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'layout' && editedTemplate.pdfTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Size
                    </label>
                    <select
                      value={editedTemplate.pdfTemplate.layout.pageSize}
                      onChange={(e) => setEditedTemplate(prev => ({
                        ...prev,
                        pdfTemplate: {
                          ...prev.pdfTemplate!,
                          layout: { ...prev.pdfTemplate!.layout, pageSize: e.target.value as any }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={editedTemplate.pdfTemplate.layout.orientation}
                      onChange={(e) => setEditedTemplate(prev => ({
                        ...prev,
                        pdfTemplate: {
                          ...prev.pdfTemplate!,
                          layout: { ...prev.pdfTemplate!.layout, orientation: e.target.value as any }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margins (px)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                      <div key={side}>
                        <label className="block text-xs text-gray-500 mb-1 capitalize">{side}</label>
                        <input
                          type="number"
                          value={editedTemplate.pdfTemplate!.layout.margins[side]}
                          onChange={(e) => setEditedTemplate(prev => ({
                            ...prev,
                            pdfTemplate: {
                              ...prev.pdfTemplate!,
                              layout: {
                                ...prev.pdfTemplate!.layout,
                                margins: {
                                  ...prev.pdfTemplate!.layout.margins,
                                  [side]: parseInt(e.target.value)
                                }
                              }
                            }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Preview Modal Component
interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ template, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Preview: {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="bg-gray-100 p-8 rounded-lg">
            <div 
              className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto"
              style={{ fontFamily: template.pdfTemplate?.styling.fontFamily || 'Arial, sans-serif' }}
            >
              {/* Preview Header */}
              <div 
                className="text-center mb-8 p-6 text-white rounded-lg"
                style={{
                  background: template.pdfTemplate?.styling.headerGradient
                    ? `linear-gradient(135deg, ${template.pdfTemplate.styling.primaryColor}, ${template.pdfTemplate.styling.secondaryColor})`
                    : template.pdfTemplate?.styling.primaryColor
                }}
              >
                <h1 className="text-2xl font-bold mb-2">Sample Property Name</h1>
                <p className="opacity-90">123 Sample Street, Sample City, Sample Country</p>
              </div>

              {/* Preview Sections */}
              {template.pdfTemplate?.sections
                .filter(section => section.enabled)
                .sort((a, b) => a.order - b.order)
                .slice(0, 4) // Show first 4 sections for preview
                .map((section) => (
                <div 
                  key={section.id}
                  className="mb-6"
                  style={{
                    marginTop: `${section.styling.marginTop}px`,
                    marginBottom: `${section.styling.marginBottom}px`,
                    padding: `${section.styling.padding}px`,
                    backgroundColor: section.styling.backgroundColor,
                    borderLeft: section.styling.borderLeft 
                      ? `${section.styling.borderLeft.width}px solid ${section.styling.borderLeft.color}`
                      : undefined,
                    paddingLeft: section.styling.borderLeft ? '15px' : `${section.styling.padding}px`,
                    borderRadius: template.pdfTemplate?.styling.roundedCorners ? '8px' : '0'
                  }}
                >
                  <h3 
                    style={{
                      color: section.styling.color,
                      fontSize: `${Math.min(section.styling.fontSize, 20)}px`,
                      fontWeight: section.styling.fontWeight,
                      margin: '0 0 10px 0'
                    }}
                  >
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {section.type === 'custom' 
                      ? section.content.substring(0, 100) + '...'
                      : `Sample content for ${section.title.toLowerCase()}...`
                    }
                  </p>
                </div>
              ))}
              
              <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t">
                <p>Generated by RentalBook Platform • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};