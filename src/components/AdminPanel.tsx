import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Database, Settings, Plus, Edit, Trash2, Check, X, BarChart3, Upload, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// List of countries
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
  'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
  'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Time options for opening hours
const timeOptions = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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
    opening_hours: '',
    is24Hours: false,
    openTime: '09:00',
    closeTime: '17:00'
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
    // Validate required fields
    if (!newLocalInfo.name || !newLocalInfo.address || !newLocalInfo.city || !newLocalInfo.country || !newLocalInfo.description) {
      alert(t('admin.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Format opening hours
      let openingHours = '';
      if (newLocalInfo.is24Hours) {
        openingHours = '24/7';
      } else if (newLocalInfo.openTime && newLocalInfo.closeTime) {
        openingHours = `${newLocalInfo.openTime} - ${newLocalInfo.closeTime}`;
      }

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
          opening_hours: openingHours || null
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
        opening_hours: '',
        is24Hours: false,
        openTime: '09:00',
        closeTime: '17:00'
      });
      setShowAddLocalInfo(false);
    } catch (err) {
      console.error('Error adding local info:', err);
      alert(t('admin.failedToAdd'));
    } finally {
      setIsSubmitting(false);
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

  const downloadTemplate = () => {
    const headers = t('admin.templateColumns').split(',');
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'local_info_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = result.data as any[];
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Parse Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new Error(t('admin.invalidFileFormat'));
      }

      // Validate required columns
      const requiredColumns = ['Name', 'Address', 'City', 'Country', 'Description'];
      const fileColumns = Object.keys(data[0] || {});
      const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(t('admin.missingRequiredColumns').replace('{columns}', missingColumns.join(', ')));
      }

      // Process and insert data
      const insertPromises = data.map(async (row) => {
        // Map columns to database fields
        const localInfoData = {
          name: row.Name || '',
          category: (row.Category || 'restaurant').toLowerCase(),
          address: row.Address || '',
          phone: row.Phone || null,
          website: row.Website || null,
          description: row.Description || '',
          city: row.City || '',
          country: row.Country || '',
          verified: row.Verified === 'true' || row.Verified === '1' || row.Verified === 1,
          rating: row.Rating ? parseFloat(row.Rating) : null,
          opening_hours: row['Opening Hours'] || null
        };

        // Validate required fields
        if (!localInfoData.name || !localInfoData.address || !localInfoData.city || 
            !localInfoData.country || !localInfoData.description) {
          return null; // Skip invalid rows
        }

        return supabase.from('local_info').insert(localInfoData);
      });

      const results = await Promise.allSettled(insertPromises.filter(p => p !== null));
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      if (successCount > 0) {
        alert(t('admin.importSuccess').replace('{count}', successCount.toString()));
        await loadData(); // Reload data
        setShowImportModal(false);
      } else {
        throw new Error('No valid rows found to import');
      }

    } catch (error) {
      console.error('Import error:', error);
      alert(t('admin.importError').replace('{error}', error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
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
        <div className="flex space-x-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {t('admin.import')}
          </button>
          <button
            onClick={() => setShowAddLocalInfo(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.addLocalInfo')}
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('admin.importLocalInfo')}
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t('admin.importInstructions')}
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    {t('admin.selectFile')}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">CSV, XLSX, XLS</p>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('admin.downloadTemplate')}
                </button>
                
                {isImporting && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2" />
                    {t('admin.importing')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Local Info Form */}
      {showAddLocalInfo && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.addLocalInfoForm')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={`${t('admin.name')} *`}
              value={newLocalInfo.name}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={newLocalInfo.category}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, category: e.target.value as any})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="restaurant">{t('categories.restaurant')}</option>
              <option value="pharmacy">{t('categories.pharmacy')}</option>
              <option value="supermarket">{t('categories.supermarket')}</option>
              <option value="hospital">{t('categories.hospital')}</option>
              <option value="doctor">{t('categories.doctor')}</option>
              <option value="attraction">{t('categories.attraction')}</option>
              <option value="beach">{t('categories.beach')}</option>
              <option value="activity">{t('categories.activity')}</option>
            </select>
            
            <input
              type="text"
              placeholder={`${t('admin.address')} *`}
              value={newLocalInfo.address}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, address: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <input
              type="text"
              placeholder={t('admin.phone')}
              value={newLocalInfo.phone}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              placeholder={t('admin.website')}
              value={newLocalInfo.website}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, website: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              placeholder={`${t('admin.city')} *`}
              value={newLocalInfo.city}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, city: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <select
              value={newLocalInfo.country}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, country: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('admin.selectCountry')} *</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder={t('admin.rating')}
              value={newLocalInfo.rating}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, rating: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="5"
              step="0.1"
            />
            
            {/* Opening Hours Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.openingHours')}</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is24Hours"
                    checked={newLocalInfo.is24Hours}
                    onChange={(e) => setNewLocalInfo({...newLocalInfo, is24Hours: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is24Hours" className="text-sm text-gray-700">{t('admin.open24Hours')}</label>
                </div>
                
                {!newLocalInfo.is24Hours && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('admin.openTime')}</label>
                      <select
                        value={newLocalInfo.openTime}
                        onChange={(e) => setNewLocalInfo({...newLocalInfo, openTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('admin.closeTime')}</label>
                      <select
                        value={newLocalInfo.closeTime}
                        onChange={(e) => setNewLocalInfo({...newLocalInfo, closeTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <textarea
              placeholder={`${t('admin.description')} *`}
              value={newLocalInfo.description}
              onChange={(e) => setNewLocalInfo({...newLocalInfo, description: e.target.value})}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
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
            <label htmlFor="verified" className="text-sm text-gray-700">{t('admin.verified')}</label>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddLocalInfo(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('admin.cancel')}
            </button>
            <button
              onClick={addLocalInfo}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  {t('admin.adding')}
                </>
              ) : t('admin.addLocalInfoBtn')}
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