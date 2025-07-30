import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, Home, Settings, Image, Upload, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, LocalInfo } from '../types';
import { templates } from '../utils/data';
import { facilityCategories } from '../utils/facilities';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';

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

export const PropertyEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    country: '',
    description: '',
    checkInInstructions: '',
    wifiPassword: '',
    houseRules: '',
    emergencyContacts: '',
    templateId: 'modern-blue',
    facilities: [],
    images: {
      front: '',
      general: [],
      back: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      loadPropertyData();
    }
  }, [propertyId]);

  const loadPropertyData = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      // Transform database data to form data
      setFormData({
        name: data.name || '',
        address: data.address || '',
        zipCode: data.zip_code || '',
        city: data.city || '',
        country: data.country || '',
        description: data.description || '',
        checkInInstructions: data.checkin_instructions || '',
        wifiPassword: data.wifi_password || '',
        houseRules: data.house_rules || '',
        emergencyContacts: data.emergency_contacts || '',
        templateId: data.template_id || 'modern-blue',
        facilities: data.facilities || [],
        images: data.images || {
          front: '',
          general: [],
          back: ''
        }
      });
    } catch (err) {
      console.error('Error loading property:', err);
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!propertyId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('properties')
        .update({
          name: formData.name || '',
          address: formData.address || '',
          zip_code: formData.zipCode || null,
          city: formData.city || '',
          country: formData.country || '',
          description: formData.description || '',
          checkin_instructions: formData.checkInInstructions || '',
          wifi_password: formData.wifiPassword || '',
          house_rules: formData.houseRules || '',
          emergency_contacts: formData.emergencyContacts || '',
          template_id: formData.templateId || 'modern-blue',
          facilities: formData.facilities || [],
          images: formData.images || { front: '', general: [], back: '' },
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        throw new Error(error.message);
      }

      console.log('Property updated successfully:', data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update property:', err);
      setError(err instanceof Error ? err.message : 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<Property>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleImageUpload = (type: 'front' | 'back' | 'general', index?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const currentImages = formData.images || { front: '', general: [], back: '' };
          
          if (type === 'front') {
            updateFormData({
              images: { ...currentImages, front: imageUrl }
            });
          } else if (type === 'back') {
            updateFormData({
              images: { ...currentImages, back: imageUrl }
            });
          } else if (type === 'general' && typeof index === 'number') {
            const newGeneral = [...(currentImages.general || [])];
            newGeneral[index] = imageUrl;
            updateFormData({
              images: { ...currentImages, general: newGeneral }
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = (type: 'front' | 'back' | 'general', index?: number) => {
    const currentImages = formData.images || { front: '', general: [], back: '' };
    
    if (type === 'front') {
      updateFormData({
        images: { ...currentImages, front: '' }
      });
    } else if (type === 'back') {
      updateFormData({
        images: { ...currentImages, back: '' }
      });
    } else if (type === 'general' && typeof index === 'number') {
      const newGeneral = [...(currentImages.general || [])];
      newGeneral[index] = '';
      updateFormData({
        images: { ...currentImages, general: newGeneral }
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General Information', icon: Home },
    { id: 'facilities', label: 'Facilities', icon: Settings },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'template', label: 'Template', icon: Palette }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading property...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        <p>Error: {error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Seaside Villa"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 123 Ocean View Drive"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData({ zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 90401"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Santa Monica"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateFormData({ country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Content</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your property..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Instructions
                  </label>
                  <textarea
                    value={formData.checkInInstructions}
                    onChange={(e) => updateFormData({ checkInInstructions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How should guests check in?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WiFi Password
                  </label>
                  <input
                    type="text"
                    value={formData.wifiPassword}
                    onChange={(e) => updateFormData({ wifiPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="WiFi password for guests"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Rules
                  </label>
                  <textarea
                    value={formData.houseRules}
                    onChange={(e) => updateFormData({ houseRules: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Important rules for guests..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contacts
                  </label>
                  <textarea
                    value={formData.emergencyContacts}
                    onChange={(e) => updateFormData({ emergencyContacts: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Emergency contact information for guests..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'facilities':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Facilities</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {facilityCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {category.facilities.map((facility) => (
                      <label
                        key={facility.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.facilities?.includes(facility.id) || false}
                          onChange={(e) => {
                            const currentFacilities = formData.facilities || [];
                            if (e.target.checked) {
                              updateFormData({ facilities: [...currentFacilities, facility.id] });
                            } else {
                              updateFormData({ 
                                facilities: currentFacilities.filter(id => id !== facility.id) 
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{facility.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {formData.facilities && formData.facilities.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{formData.facilities.length}</strong> facilities selected
                </p>
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
            
            {/* Front Image */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Front Image</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {formData.images?.front ? (
                  <div className="relative">
                    <img 
                      src={formData.images.front} 
                      alt="Front view" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage('front')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <button
                      onClick={() => handleImageUpload('front')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Upload Front Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* General Images */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">General Images (8 images)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {formData.images?.general?.[index] ? (
                      <div className="relative">
                        <img 
                          src={formData.images.general[index]} 
                          alt={`General view ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage('general', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <button
                          onClick={() => handleImageUpload('general', index)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Upload
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Back Image */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Back Image</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {formData.images?.back ? (
                  <div className="relative">
                    <img 
                      src={formData.images.back} 
                      alt="Back view" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage('back')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <button
                      onClick={() => handleImageUpload('back')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Upload Back Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Template Selection
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <label
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-3 ${
                    formData.templateId === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={formData.templateId === template.id}
                    onChange={(e) => updateFormData({ templateId: e.target.value })}
                    className="sr-only"
                  />
                  <div className="aspect-video bg-gradient-to-br rounded-md mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
                    }}
                  />
                  <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                  {formData.templateId === template.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Property</h1>
        <p className="text-gray-600">Update your property information</p>
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
                  onClick={() => setActiveTab(tab.id)}
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

        {/* Save Button */}
        <div className="px-8 py-6 bg-gray-50 border-t flex justify-end space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};