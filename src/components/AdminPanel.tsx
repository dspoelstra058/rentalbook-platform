import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  Database, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Check, 
  X,
  BarChart3,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LocalInfo, User } from '../types';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// List of countries for the dropdown
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

const categories = [
  'doctor', 'pharmacy', 'supermarket', 'restaurant', 'hospital', 'attraction', 'beach', 'activity'
];

export const AdminPanel: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add local info form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant' as LocalInfo['category'],
    address: '',
    phone: '',
    website: '',
    description: '',
    city: '',
    country: '',
    rating: '',
    openingHours: '',
    is24Hours: false,
    openTime: '09:00',
    closeTime: '17:00',
    verified: false
  });

  // Edit state
  const [editingItem, setEditingItem] = useState<LocalInfo | null>(null);
  const [editFormData, setEditFormData] = useState(formData);

  // User management state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner' as 'owner' | 'admin'
  });

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/local-info')) {
      setActiveTab('local-info');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  // Load data
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

      const transformedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'owner' | 'admin',
        createdAt: new Date(user.created_at)
      }));

      setUsers(transformedUsers);

      // Load local info
      const { data: localInfoData, error: localInfoError } = await supabase
        .from('local_info')
        .select('*')
        .order('name');

      if (localInfoError) throw localInfoError;

      const transformedLocalInfo: LocalInfo[] = (localInfoData || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as LocalInfo['category'],
        address: item.address,
        zipCode: item.zip_code || undefined,
        phone: item.phone || undefined,
        website: item.website || undefined,
        description: item.description,
        city: item.city,
        country: item.country,
        verified: item.verified,
        rating: item.rating || undefined,
        openingHours: item.opening_hours || undefined
      }));

      setLocalInfo(transformedLocalInfo);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocalInfo = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.country || !formData.description) {
      setError(t('admin.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const openingHours = formData.is24Hours 
        ? '24/7' 
        : formData.openTime && formData.closeTime 
          ? `${formData.openTime} - ${formData.closeTime}`
          : null;

      const { error } = await supabase
        .from('local_info')
        .insert({
          name: formData.name,
          category: formData.category,
          address: formData.address,
          phone: formData.phone || null,
          website: formData.website || null,
          description: formData.description,
          city: formData.city,
          country: formData.country,
          rating: formData.rating ? parseFloat(formData.rating) : null,
          opening_hours: openingHours,
          verified: formData.verified
        });

      if (error) throw error;

      // Reset form and reload data
      setFormData({
        name: '',
        category: 'restaurant',
        address: '',
        phone: '',
        website: '',
        description: '',
        city: '',
        country: '',
        rating: '',
        openingHours: '',
        is24Hours: false,
        openTime: '09:00',
        closeTime: '17:00',
        verified: false
      });
      setShowAddForm(false);
      await loadData();
      setSuccessMessage(t('admin.localInfoAdded'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding local info:', err);
      setError(t('admin.failedToAdd'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLocalInfo = (info: LocalInfo) => {
    setEditingItem(info);
    
    // Parse opening hours
    let is24Hours = false;
    let openTime = '09:00';
    let closeTime = '17:00';
    
    if (info.openingHours) {
      if (info.openingHours === '24/7' || info.openingHours.toLowerCase().includes('24')) {
        is24Hours = true;
      } else if (info.openingHours.includes(' - ')) {
        const [open, close] = info.openingHours.split(' - ');
        openTime = open.trim();
        closeTime = close.trim();
      }
    }

    setEditFormData({
      name: info.name,
      category: info.category,
      address: info.address,
      phone: info.phone || '',
      website: info.website || '',
      description: info.description,
      city: info.city,
      country: info.country,
      rating: info.rating?.toString() || '',
      openingHours: info.openingHours || '',
      is24Hours,
      openTime,
      closeTime,
      verified: info.verified
    });
  };

  const handleUpdateLocalInfo = async () => {
    if (!editFormData.name || !editFormData.address || !editFormData.city || !editFormData.country || !editFormData.description) {
      setError(t('admin.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const openingHours = editFormData.is24Hours 
        ? '24/7' 
        : editFormData.openTime && editFormData.closeTime 
          ? `${editFormData.openTime} - ${editFormData.closeTime}`
          : null;

      const { error } = await supabase
        .from('local_info')
        .update({
          name: editFormData.name,
          category: editFormData.category,
          address: editFormData.address,
          phone: editFormData.phone || null,
          website: editFormData.website || null,
          description: editFormData.description,
          city: editFormData.city,
          country: editFormData.country,
          rating: editFormData.rating ? parseFloat(editFormData.rating) : null,
          opening_hours: openingHours,
          verified: editFormData.verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingItem!.id);

      if (error) throw error;

      setEditingItem(null);
      await loadData();
      setSuccessMessage(t('admin.localInfoUpdated'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating local info:', err);
      setError(t('admin.failedToUpdate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocalInfo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this local information?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('local_info')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting local info:', err);
      setError('Failed to delete local information');
    }
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('local_info')
        .update({ 
          verified: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error updating verification:', err);
      setError('Failed to update verification status');
    }
  };

  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password || !userFormData.confirmPassword) {
      setError(t('admin.fillAllFields'));
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      setError(t('admin.passwordsNotMatch'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          email: userFormData.email,
          password: userFormData.password,
          name: userFormData.name,
          role: userFormData.role
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Reset form and reload data
      setUserFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'owner'
      });
      setShowAddUserForm(false);
      await loadData();
      setSuccessMessage(t('admin.userCreated'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : t('admin.failedToCreateUser'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let data: any[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        data = result.data as any[];
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new Error(t('admin.invalidFileFormat'));
      }

      // Validate required columns
      const requiredColumns = ['Name', 'Address', 'City', 'Country', 'Description'];
      const columns = Object.keys(data[0] || {});
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(t('admin.missingRequiredColumns').replace('{columns}', missingColumns.join(', ')));
      }

      // Process and insert data
      const insertData = data.map(row => ({
        name: row.Name,
        category: categories.includes(row.Category?.toLowerCase()) ? row.Category.toLowerCase() : 'restaurant',
        address: row.Address,
        phone: row.Phone || null,
        website: row.Website || null,
        description: row.Description,
        city: row.City,
        country: row.Country,
        rating: row.Rating ? parseFloat(row.Rating) : null,
        opening_hours: row['Opening Hours'] || null,
        verified: row.Verified === 'true' || row.Verified === true || false
      }));

      const { error } = await supabase
        .from('local_info')
        .insert(insertData);

      if (error) throw error;

      setShowImportModal(false);
      await loadData();
      setSuccessMessage(t('admin.importSuccess').replace('{count}', data.length.toString()));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Import error:', err);
      setError(t('admin.importError').replace('{error}', err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const template = t('admin.templateColumns');
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'local-info-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      doctor: 'bg-red-100 text-red-800',
      pharmacy: 'bg-green-100 text-green-800',
      supermarket: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-orange-100 text-orange-800',
      hospital: 'bg-red-100 text-red-800',
      attraction: 'bg-purple-100 text-purple-800',
      beach: 'bg-cyan-100 text-cyan-800',
      activity: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-600">Platform administration and management</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
            { id: 'users', label: t('admin.userManagement'), icon: Users },
            { id: 'local-info', label: t('admin.localInfoManagement'), icon: Database },
            { id: 'settings', label: t('admin.platformSettings'), icon: Settings }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('admin.localListings')}</p>
                  <p className="text-2xl font-bold text-gray-900">{localInfo.length}</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>System initialized successfully</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>{users.length} users registered</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span>{localInfo.length} local information entries</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('admin.allUsers')}</h2>
            <button
              onClick={() => setShowAddUserForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.addUser')}
            </button>
          </div>

          {/* Add User Form */}
          {showAddUserForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.addUserForm')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.fullName')}
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.emailAddress')}
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.password')}
                  </label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={userFormData.confirmPassword}
                    onChange={(e) => setUserFormData({...userFormData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.userRole')}
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value as 'owner' | 'admin'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="owner">{t('admin.owner')}</option>
                    <option value="admin">{t('admin.admin')}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddUserForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? t('admin.creating') : t('admin.createUser')}
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.allUsers')}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {t('dashboard.created')} {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? t('admin.admin') : t('admin.owner')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Local Info Tab */}
      {activeTab === 'local-info' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('admin.allLocalInfo')}</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('admin.import')}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.addLocalInfo')}
              </button>
            </div>
          </div>

          {/* Add Local Info Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.addLocalInfoForm')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as LocalInfo['category']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.address')} *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.website')}
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.city')} *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.selectCountry')} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('admin.selectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.rating')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.openingHours')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is24Hours}
                        onChange={(e) => setFormData({...formData, is24Hours: e.target.checked})}
                        className="mr-2"
                      />
                      {t('admin.open24Hours')}
                    </label>
                    {!formData.is24Hours && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{t('admin.openTime')}</label>
                          <input
                            type="time"
                            value={formData.openTime}
                            onChange={(e) => setFormData({...formData, openTime: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{t('admin.closeTime')}</label>
                          <input
                            type="time"
                            value={formData.closeTime}
                            onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.description')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                      className="mr-2"
                    />
                    {t('admin.verified')}
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleAddLocalInfo}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? t('admin.adding') : t('admin.addLocalInfoBtn')}
                </button>
              </div>
            </div>
          )}

          {/* Edit Local Info Form */}
          {editingItem && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.editLocalInfoForm')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.name')} *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.category')}
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value as LocalInfo['category']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.address')} *
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.phone')}
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.website')}
                  </label>
                  <input
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.city')} *
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.selectCountry')} *
                  </label>
                  <select
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('admin.selectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.rating')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editFormData.rating}
                    onChange={(e) => setEditFormData({...editFormData, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.openingHours')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.is24Hours}
                        onChange={(e) => setEditFormData({...editFormData, is24Hours: e.target.checked})}
                        className="mr-2"
                      />
                      {t('admin.open24Hours')}
                    </label>
                    {!editFormData.is24Hours && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{t('admin.openTime')}</label>
                          <input
                            type="time"
                            value={editFormData.openTime}
                            onChange={(e) => setEditFormData({...editFormData, openTime: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">{t('admin.closeTime')}</label>
                          <input
                            type="time"
                            value={editFormData.closeTime}
                            onChange={(e) => setEditFormData({...editFormData, closeTime: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.description')} *
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.verified}
                      onChange={(e) => setEditFormData({...editFormData, verified: e.target.checked})}
                      className="mr-2"
                    />
                    {t('admin.verified')}
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={handleUpdateLocalInfo}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? t('admin.updating') : t('admin.updateLocalInfo')}
                </button>
              </div>
            </div>
          )}

          {/* Import Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.importLocalInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.importFromFile')}
                    </label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImport(file);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('admin.selectFile')}</p>
                  </div>
                  <div>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t('admin.downloadTemplate')}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('admin.importInstructions')}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('admin.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Local Info List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.allLocalInfo')}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {localInfo.map((info) => (
                <div key={info.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{info.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(info.category)}`}>
                          {t(`categories.${info.category}`)}
                        </span>
                        {info.verified && (
                          <Check className="h-4 w-4 text-green-500" title={t('common.verified')} />
                        )}
                        {info.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-600 ml-1">{info.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {info.address}, {info.city}, {info.country}
                        </div>
                        {info.phone && (
                          <div className="flex items-center">
                            <span className="mr-1">📞</span>
                            {info.phone}
                          </div>
                        )}
                        {info.openingHours && (
                          <div className="flex items-center">
                            <span className="mr-1">🕒</span>
                            {info.openingHours}
                          </div>
                        )}
                        {info.website && (
                          <div className="flex items-center">
                            <span className="mr-1">🌐</span>
                            <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {info.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleVerification(info.id, info.verified)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          info.verified 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        title={info.verified ? t('common.verified') : t('common.unverified')}
                      >
                        {info.verified ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => handleEditLocalInfo(info)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('admin.editLocalInfo')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocalInfo(info.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title={t('admin.deleteLocalInfo')}
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
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('admin.platformSettings')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Settings */}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.hostingFee')}
                  </label>
                  <input
                    type="number"
                    defaultValue="19.99"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    defaultValue="support@rentalbook.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};