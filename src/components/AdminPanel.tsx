import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Database, Settings, Plus, Edit, Trash2, Upload, Download, Eye, EyeOff, Search, Filter, FileText, Layout } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User, LocalInfo } from '../types';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';
import { ConfirmationModal } from './ConfirmationModal';
import { SimplePDFLayoutManager } from './SimplePDFLayoutManager';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// List of countries for the form
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

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddLocalInfoModal, setShowAddLocalInfoModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingLocalInfo, setEditingLocalInfo] = useState<LocalInfo | null>(null);
  const [deletingLocalInfoId, setDeletingLocalInfoId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localInfoToDelete, setLocalInfoToDelete] = useState<LocalInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Form states
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner' as 'owner' | 'admin'
  });

  const [localInfoFormData, setLocalInfoFormData] = useState({
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
    verified: true,
    is24Hours: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    // Set active tab based on URL
    const path = location.pathname;
    if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/local-info')) {
      setActiveTab('local-info');
    } else if (path.includes('/pdf-layouts')) {
      setActiveTab('pdf-layouts');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    } else {
      setActiveTab('users');
    }

    loadData();
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([loadUsers(), loadLocalInfo()]);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading all users...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Users query result:', { data: usersData, error: usersError });

      if (usersError) {
        console.error('Error loading users:', usersError);
        throw usersError;
      }
      
      // Transform the data to match the User interface
      const transformedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'owner' | 'admin',
        createdAt: new Date(user.created_at)
      }));

      console.log('Transformed users:', transformedUsers);
      setUsers(transformedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      throw err;
    }
  };

  const loadLocalInfo = async () => {
    try {
      const { data: localInfoData, error: localInfoError } = await supabase
        .from('local_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (localInfoError) throw localInfoError;
      
      // Transform the data to match the LocalInfo interface
      const transformedLocalInfo: LocalInfo[] = (localInfoData || []).map(info => ({
        id: info.id,
        name: info.name,
        category: info.category as LocalInfo['category'],
        address: info.address,
        zipCode: info.zip_code || undefined,
        phone: info.phone || undefined,
        website: info.website || undefined,
        description: info.description,
        city: info.city,
        country: info.country,
        verified: info.verified,
        rating: info.rating || undefined,
        openingHours: info.opening_hours || undefined
      }));

      setLocalInfo(transformedLocalInfo);
    } catch (err) {
      console.error('Failed to load local info:', err);
      throw err;
    }
  };

  const handleCreateUser = async () => {
    if (!userFormData.name || !userFormData.email || !userFormData.password || !userFormData.confirmPassword) {
      alert(t('admin.fillAllFields'));
      return;
    }

    if (userFormData.password !== userFormData.confirmPassword) {
      alert(t('admin.passwordsNotMatch'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the edge function to create user
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json',
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

      console.log('User created successfully:', result);
      
      // Reset form and close modal
      setUserFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'owner'
      });
      setShowAddUserModal(false);
      
      // Reload users
      await loadUsers();
      
      alert(t('admin.userCreated'));
    } catch (error) {
      console.error('Failed to create user:', error);
      alert(t('admin.failedToCreateUser') + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLocalInfo = async () => {
    if (!localInfoFormData.name || !localInfoFormData.address || !localInfoFormData.city || !localInfoFormData.country || !localInfoFormData.description) {
      alert(t('admin.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const openingHours = localInfoFormData.is24Hours ? '24/7' : localInfoFormData.openingHours;
      
      const { data, error } = await supabase
        .from('local_info')
        .insert({
          name: localInfoFormData.name,
          category: localInfoFormData.category,
          address: localInfoFormData.address,
          phone: localInfoFormData.phone || null,
          website: localInfoFormData.website || null,
          description: localInfoFormData.description,
          city: localInfoFormData.city,
          country: localInfoFormData.country,
          rating: localInfoFormData.rating ? parseFloat(localInfoFormData.rating) : null,
          opening_hours: openingHours || null,
          verified: localInfoFormData.verified
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding local info:', error);
        throw new Error(error.message);
      }

      console.log('Local info added successfully:', data);
      
      // Reset form and close modal
      setLocalInfoFormData({
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
        verified: true,
        is24Hours: false
      });
      setShowAddLocalInfoModal(false);
      
      // Reload local info
      await loadLocalInfo();
      
      alert(t('admin.localInfoAdded'));
    } catch (error) {
      console.error('Failed to add local info:', error);
      alert(t('admin.failedToAdd') + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLocalInfo = (info: LocalInfo) => {
    setEditingLocalInfo(info);
    setLocalInfoFormData({
      name: info.name,
      category: info.category,
      address: info.address,
      phone: info.phone || '',
      website: info.website || '',
      description: info.description,
      city: info.city,
      country: info.country,
      rating: info.rating?.toString() || '',
      openingHours: info.openingHours === '24/7' ? '' : (info.openingHours || ''),
      verified: info.verified,
      is24Hours: info.openingHours === '24/7'
    });
    setShowAddLocalInfoModal(true);
  };

  const handleUpdateLocalInfo = async () => {
    if (!editingLocalInfo) return;
    
    if (!localInfoFormData.name || !localInfoFormData.address || !localInfoFormData.city || !localInfoFormData.country || !localInfoFormData.description) {
      alert(t('admin.fillRequiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const openingHours = localInfoFormData.is24Hours ? '24/7' : localInfoFormData.openingHours;
      
      const { data, error } = await supabase
        .from('local_info')
        .update({
          name: localInfoFormData.name,
          category: localInfoFormData.category,
          address: localInfoFormData.address,
          phone: localInfoFormData.phone || null,
          website: localInfoFormData.website || null,
          description: localInfoFormData.description,
          city: localInfoFormData.city,
          country: localInfoFormData.country,
          rating: localInfoFormData.rating ? parseFloat(localInfoFormData.rating) : null,
          opening_hours: openingHours || null,
          verified: localInfoFormData.verified,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLocalInfo.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating local info:', error);
        throw new Error(error.message);
      }

      console.log('Local info updated successfully:', data);
      
      // Reset form and close modal
      setLocalInfoFormData({
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
        verified: true,
        is24Hours: false
      });
      setEditingLocalInfo(null);
      setShowAddLocalInfoModal(false);
      
      // Reload local info
      await loadLocalInfo();
      
      alert(t('admin.localInfoUpdated'));
    } catch (error) {
      console.error('Failed to update local info:', error);
      alert(t('admin.failedToUpdate') + ': ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocalInfo = (info: LocalInfo) => {
    setLocalInfoToDelete(info);
    setShowDeleteModal(true);
  };

  const confirmDeleteLocalInfo = async () => {
    if (!localInfoToDelete) return;

    setDeletingLocalInfoId(localInfoToDelete.id);
    try {
      const { error } = await supabase
        .from('local_info')
        .delete()
        .eq('id', localInfoToDelete.id);

      if (error) {
        console.error('Error deleting local info:', error);
        alert('Failed to delete local information. Please try again.');
        return;
      }

      // Remove from local state
      setLocalInfo(prev => prev.filter(info => info.id !== localInfoToDelete.id));
      console.log('Local info deleted successfully');
      setShowDeleteModal(false);
      setLocalInfoToDelete(null);
    } catch (error) {
      console.error('Failed to delete local info:', error);
      alert('Failed to delete local information. Please try again.');
    } finally {
      setDeletingLocalInfoId(null);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
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
        category: row.Category || 'restaurant',
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

      const { data: insertedData, error } = await supabase
        .from('local_info')
        .insert(insertData)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Import successful:', insertedData);
      setShowImportModal(false);
      await loadLocalInfo();
      
      alert(t('admin.importSuccess').replace('{count}', insertedData?.length.toString() || '0'));
    } catch (error) {
      console.error('Import failed:', error);
      alert(t('admin.importError').replace('{error}', error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      Name: 'Example Restaurant',
      Category: 'restaurant',
      Address: '123 Main Street',
      Phone: '+1-555-0123',
      Website: 'https://example.com',
      Description: 'A great local restaurant',
      City: 'Amsterdam',
      Country: 'Netherlands',
      Rating: '4.5',
      'Opening Hours': '9:00 AM - 10:00 PM',
      Verified: 'true'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Local Info Template');
    XLSX.writeFile(wb, 'local-info-template.xlsx');
  };

  const tabs = [
    { id: 'users', label: t('admin.userManagement'), icon: Users },
    { id: 'local-info', label: t('admin.localInfoManagement'), icon: Database },
    { id: 'pdf-layouts', label: 'PDF Layout Manager', icon: FileText },
    { id: 'settings', label: t('admin.platformSettings'), icon: Settings }
  ];

  const categories = [
    'doctor', 'pharmacy', 'supermarket', 'restaurant', 
    'hospital', 'attraction', 'beach', 'activity'
  ];

  // Filter local info based on search and category
  const filteredLocalInfo = localInfo.filter(info => {
    const matchesSearch = info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || info.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        <p>Error: {error}</p>
        <button 
          onClick={loadData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('admin.allUsers')}</h2>
                <p className="text-gray-600">{users.length} users total</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('admin.addUser')}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.emailAddress')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.userRole')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Properties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? t('admin.admin') : t('admin.owner')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          0 {t('admin.properties')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'local-info':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('admin.allLocalInfo')}</h2>
                <p className="text-gray-600">{filteredLocalInfo.length} {t('admin.localListings')}</p>
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
                  onClick={() => setShowAddLocalInfoModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addLocalInfo')}
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name, city, or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="divide-y divide-gray-200">
                {filteredLocalInfo.map((info) => (
                  <div key={info.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{info.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(info.category)}`}>
                            {t(`categories.${info.category}`)}
                          </span>
                          {info.verified ? (
                            <span className="flex items-center text-green-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.verified')}
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-400">
                              <EyeOff className="h-4 w-4 mr-1" />
                              {t('common.unverified')}
                            </span>
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
                          <div>📍 {info.address}, {info.city}, {info.country}</div>
                          {info.phone && <div>📞 {info.phone}</div>}
                          {info.website && (
                            <div>
                              🌐 <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                {info.website}
                              </a>
                            </div>
                          )}
                          {info.openingHours && <div>🕒 {info.openingHours}</div>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditLocalInfo(info)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title={t('admin.editLocalInfo')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocalInfo(info)}
                          disabled={deletingLocalInfoId === info.id}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title={t('admin.deleteLocalInfo')}
                        >
                          {deletingLocalInfoId === info.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pdf-layouts':
        return <SimplePDFLayoutManager />;

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('admin.platformSettings')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-600">Platform administration and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Local Information</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{localInfo.length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Database className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{localInfo.filter(info => info.verified).length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/admin${tab.id === 'users' ? '' : `/${tab.id}`}`);
                  }}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
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

        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.addUserForm')}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.fullName')}
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.emailAddress')}
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.password')}
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={userFormData.confirmPassword}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.userRole')}
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value as 'owner' | 'admin' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="owner">{t('admin.owner')}</option>
                  <option value="admin">{t('admin.admin')}</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setUserFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'owner'
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? t('admin.creating') : t('admin.createUser')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Local Info Modal */}
      {showAddLocalInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLocalInfo ? t('admin.editLocalInfoForm') : t('admin.addLocalInfoForm')}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.name')} *
                  </label>
                  <input
                    type="text"
                    value={localInfoFormData.name}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.category')}
                  </label>
                  <select
                    value={localInfoFormData.category}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, category: e.target.value as LocalInfo['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.address')} *
                </label>
                <input
                  type="text"
                  value={localInfoFormData.address}
                  onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.phone')}
                  </label>
                  <input
                    type="text"
                    value={localInfoFormData.phone}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.website')}
                  </label>
                  <input
                    type="url"
                    value={localInfoFormData.website}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.city')} *
                  </label>
                  <input
                    type="text"
                    value={localInfoFormData.city}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.country')} *
                  </label>
                  <select
                    value={localInfoFormData.country}
                    onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('admin.selectCountry')}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
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
                  value={localInfoFormData.rating}
                  onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.openingHours')}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is24Hours"
                      checked={localInfoFormData.is24Hours}
                      onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, is24Hours: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="is24Hours" className="text-sm text-gray-700">
                      {t('admin.open24Hours')}
                    </label>
                  </div>
                  {!localInfoFormData.is24Hours && (
                    <input
                      type="text"
                      placeholder="e.g., 9:00 AM - 6:00 PM"
                      value={localInfoFormData.openingHours}
                      onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.description')} *
                </label>
                <textarea
                  rows={3}
                  value={localInfoFormData.description}
                  onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={localInfoFormData.verified}
                  onChange={(e) => setLocalInfoFormData(prev => ({ ...prev, verified: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="verified" className="text-sm text-gray-700">
                  {t('admin.verified')}
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddLocalInfoModal(false);
                  setEditingLocalInfo(null);
                  setLocalInfoFormData({
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
                    verified: true,
                    is24Hours: false
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={editingLocalInfo ? handleUpdateLocalInfo : handleAddLocalInfo}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (editingLocalInfo ? t('admin.updating') : t('admin.adding')) : (editingLocalInfo ? t('admin.updateLocalInfo') : t('admin.addLocalInfoBtn'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.importLocalInfo')}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.importFromFile')}
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportFile}
                  disabled={isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.selectFile')}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  {t('admin.importInstructions')}
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('admin.downloadTemplate')}
                </button>
              </div>
              
              {isImporting && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-2" />
                  <span className="text-sm text-gray-600">{t('admin.importing')}</span>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setLocalInfoToDelete(null);
        }}
        onConfirm={confirmDeleteLocalInfo}
        title="Delete Local Information"
        message={`Are you sure you want to delete "${localInfoToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deletingLocalInfoId === localInfoToDelete?.id}
        type="danger"
      />
    </div>
  );
};