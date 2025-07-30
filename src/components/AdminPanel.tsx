import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Database, Settings, Plus, Edit, Trash2, Check, X, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  country: string;
  is_published: boolean;
  created_at: string;
}

interface LocalInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  description: string;
  city: string;
  country: string;
  verified: boolean;
  rating?: number;
  opening_hours?: string;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showAddLocalInfo, setShowAddLocalInfo] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newLocalInfo, setNewLocalInfo] = useState({
    name: '',
    category: 'restaurant' as const,
    address: '',
    phone: '',
    website: '',
    description: '',
    city: '',
    country: '',
    verified: false,
    rating: '',
    opening_hours: ''
  });

  useEffect(() => {
    // Set active tab based on URL
    const path = location.pathname;
    if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/local-info')) setActiveTab('local-info');
    else if (path.includes('/settings')) setActiveTab('settings');
    else setActiveTab('dashboard');
  }, [location]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Load local info
      const { data: localInfoData, error: localInfoError } = await supabase
        .from('local_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (localInfoError) throw localInfoError;
      setLocalInfo(localInfoData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'owner' | 'admin') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their properties.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const addLocalInfo = async () => {
    try {
      const { error } = await supabase
        .from('local_info')
        .insert({
          name: newLocalInfo.name,
          category: newLocalInfo.category,
          address: newLocalInfo.address,
          phone: newLocalInfo.phone || null,
          website: newLocalInfo.website || null,
          description: newLocalInfo.description,
          city: newLocalInfo.city,
          country: newLocalInfo.country,
          verified: newLocalInfo.verified,
          rating: newLocalInfo.rating ? parseFloat(newLocalInfo.rating) : null,
          opening_hours: newLocalInfo.opening_hours || null
        });

      if (error) throw error;

      // Reload data
      await loadData();
      
      // Reset form
      setNewLocalInfo({
        name: '',
        category: 'restaurant',
        address: '',
        phone: '',
        website: '',
        description: '',
        city: '',
        country: '',
        verified: false,
        rating: '',
        opening_hours: ''
      });
      setShowAddLocalInfo(false);
    } catch (err) {
      console.error('Error adding local info:', err);
      alert('Failed to add local information');
    }
  };

  const deleteLocalInfo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this local information?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('local_info')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setLocalInfo(localInfo.filter(info => info.id !== id));
    } catch (err) {
      console.error('Error deleting local info:', err);
      alert('Failed to delete local information');
    }
  };

  const toggleLocalInfoVerification = async (id: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('local_info')
        .update({ verified: !verified, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setLocalInfo(localInfo.map(info => 
        info.id === id ? { ...info, verified: !verified } : info
      ));
    } catch (err) {
      console.error('Error updating verification:', err);
      alert('Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        <p>Error loading admin data: {error}</p>
        <button 
          onClick={loadData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = [
    { 
      label: t('admin.totalUsers'), 
      value: users.length.toString(), 
      icon: Users, 
      color: 'blue' 
    },
    { 
      label: 'Total Properties', 
      value: properties.length.toString(), 
      icon: BarChart3, 
      color: 'green' 
    },
    { 
      label: 'Published Properties', 
      value: properties.filter(p => p.is_published).length.toString(), 
      icon: Check, 
      color: 'purple' 
    },
    { 
      label: t('admin.localListings'), 
      value: localInfo.length.toString(), 
      icon: Database, 
      color: 'orange' 
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.dashboard')}</h2>
        <p className="text-gray-600">Platform overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className="p-6 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.userManagement')}</h2>
        <p className="text-gray-600">Manage platform users and their roles</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.allUsers')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userProperties = properties.filter(p => p.owner_id === user.id);
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as 'owner' | 'admin')}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userProperties.length} {t('admin.properties')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingUser === user.id ? (
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingUser(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLocalInfo = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.localInfoManagement')}</h2>
          <p className="text-gray-600">Manage local information database</p>
        </div>
        <button
          onClick={() => setShowAddLocalInfo(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.addLocalInfo')}
        </button>
      </div>

      {/* Add Local Info Form */}
      {showAddLocalInfo && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Local Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newLocalInfo.name}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newLocalInfo.category}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, category: e.target.value as any})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="restaurant">Restaurant</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="supermarket">Supermarket</option>
              <option value="hospital">Hospital</option>
              <option value="doctor">Doctor</option>
              <option value="attraction">Attraction</option>
              <option value="beach">Beach</option>
              <option value="activity">Activity</option>
            </select>
            <input
              type="text"
              placeholder="Address"
              value={newLocalInfo.address}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, address: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Phone"
              value={newLocalInfo.phone}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Website"
              value={newLocalInfo.website}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, website: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="City"
              value={newLocalInfo.city}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, city: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Country"
              value={newLocalInfo.country}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, country: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Opening Hours"
              value={newLocalInfo.opening_hours}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, opening_hours: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <textarea
              placeholder="Description"
              value={newLocalInfo.description}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, description: e.target.value})}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="verified"
              checked={newLocalInfo.verified}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, verified: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="verified" className="text-sm text-gray-700">Verified</label>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddLocalInfo(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addLocalInfo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.allLocalInfo')}</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {localInfo.map((info) => (
            <div key={info.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                      {info.category}
                    </span>
                    {info.verified ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    📍 {info.address}, {info.city}, {info.country}
                    {info.phone && <span> • 📞 {info.phone}</span>}
                    {info.opening_hours && <span> • 🕒 {info.opening_hours}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleLocalInfoVerification(info.id, info.verified)}
                    className={`p-2 rounded ${
                      info.verified 
                        ? 'text-red-600 hover:text-red-800' 
                        : 'text-green-600 hover:text-green-800'
                    }`}
                    title={info.verified ? 'Remove verification' : 'Mark as verified'}
                  >
                    {info.verified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteLocalInfo(info.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete"
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.platformSettings')}</h2>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.paymentSettings')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.basePrice')}
              </label>
              <input
                type="number"
                defaultValue="29.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.hostingFee')}
              </label>
              <input
                type="number"
                defaultValue="19.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.emailSettings')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.supportEmail')}
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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
            { id: 'users', label: t('nav.users'), icon: Users },
            { id: 'local-info', label: t('nav.localInfo'), icon: Database },
            { id: 'settings', label: t('nav.settings'), icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'local-info' && renderLocalInfo()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};