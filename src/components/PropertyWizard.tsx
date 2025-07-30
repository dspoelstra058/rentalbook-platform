import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin, Home, FileText, Palette, CreditCard, Image, Upload, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, LocalInfo, Template } from '../types';
import { templates } from '../utils/data';
import { getFacilityCategories } from '../utils/facilities';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';
import { useParams } from 'react-router-dom';

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

interface WizardStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}

interface PropertyWizardProps {
  isEdit?: boolean;
}

export const PropertyWizard: React.FC<PropertyWizardProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { t } = useLanguage();
  
  const steps: WizardStep[] = [
    {
      id: 'basic',
      titleKey: 'wizard.basicInfo',
      descriptionKey: 'wizard.basicInfoDesc',
      icon: Home
    },
    {
      id: 'content',
      titleKey: 'wizard.propertyContent',
      descriptionKey: 'wizard.propertyContentDesc',
      icon: FileText
    },
    {
      id: 'facilities',
      titleKey: 'wizard.facilities',
      descriptionKey: 'wizard.facilitiesDesc',
      icon: Home
    },
    {
      id: 'images',
      titleKey: 'wizard.images',
      descriptionKey: 'wizard.imagesDesc',
      icon: Image
    },
    {
      id: 'local',
      titleKey: 'wizard.localInfo',
      descriptionKey: 'wizard.localInfoDesc',
      icon: MapPin
    },
    {
      id: 'template',
      titleKey: 'wizard.chooseTemplate',
      descriptionKey: 'wizard.chooseTemplateDesc',
      icon: Palette
    },
    {
      id: 'payment',
      titleKey: 'wizard.paymentPublish',
      descriptionKey: 'wizard.paymentPublishDesc',
      icon: CreditCard
    }
  ];
  
  const [currentStep, setCurrentStep] = useState(0);
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
    templateId: '',
    facilities: [],
    images: {
      front: '',
      general: [],
      back: ''
    }
  });
  const [selectedLocalInfo, setSelectedLocalInfo] = useState<string[]>([]);
  const [availableLocalInfo, setAvailableLocalInfo] = useState<LocalInfo[]>([]);
  const [loadingLocalInfo, setLoadingLocalInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEdit);

  // Load existing property data if editing
  useEffect(() => {
    if (isEdit && propertyId) {
      loadPropertyData();
    }
  }, [isEdit, propertyId]);

  const loadPropertyData = async () => {
    if (!propertyId) return;
    
    setIsLoadingProperty(true);
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
    } catch (error) {
      console.error('Error loading property:', error);
      alert('Failed to load property data');
      navigate('/dashboard');
    } finally {
      setIsLoadingProperty(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let data, error;

      if (isEdit && propertyId) {
        // Update existing property
        const result = await supabase
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
        
        data = result.data;
        error = result.error;
      } else {
        // Create new property
        const result = await supabase
          .from('properties')
          .insert({
            owner_id: user.id,
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
            is_published: true, // Assuming published after payment
            website_url: null // Will be generated later
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error(`Error ${isEdit ? 'updating' : 'creating'} property:`, error);
        throw new Error(error.message);
      }

      console.log(`Property ${isEdit ? 'updated' : 'created'} successfully:`, data);
      
      // TODO: Save selected local info associations if needed
      // This would require a junction table between properties and local_info
      
      navigate('/dashboard');
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} property:`, error);
      alert(`Failed to ${isEdit ? 'update' : 'create'} property. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<Property>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Load local info when city or country changes
  useEffect(() => {
    const loadLocalInfo = async () => {
      if (!formData.city?.trim() || !formData.country?.trim()) {
        setAvailableLocalInfo([]);
        return;
      }

      setLoadingLocalInfo(true);
      try {
        console.log('Loading local info for:', formData.city, formData.country);
        
        const { data, error } = await supabase
          .from('local_info')
          .select('*')
          .ilike('city', `%${formData.city.trim()}%`)
          .ilike('country', `%${formData.country.trim()}%`)
          .eq('verified', true)
          .order('name');

        console.log('Supabase query result:', { data, error });

        if (error) {
          console.error('Error loading local info:', error);
          setAvailableLocalInfo([]);
        } else {
          console.log('Found local info entries:', data?.length || 0);
          // Transform database data to LocalInfo interface
          const transformedData: LocalInfo[] = (data || []).map(item => ({
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
          setAvailableLocalInfo(transformedData);
        }
      } catch (err) {
        console.error('Failed to load local info:', err);
        setAvailableLocalInfo([]);
      } finally {
        setLoadingLocalInfo(false);
      }
    };

    loadLocalInfo();
  }, [formData.city, formData.country]);

  // Show loading spinner while loading property data
  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-2 text-gray-600">Loading property...</span>
      </div>
    );
  }

  // Helper function to get category colors
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

  const handleImageUpload = (type: 'front' | 'general' | 'back', index?: number) => {
    // TODO: Implement image upload functionality
    console.log('Upload image for:', type, index);
  };

  const removeImage = (type: 'front' | 'general' | 'back', index?: number) => {
    if (type === 'front') {
      updateFormData({
        images: {
          ...formData.images,
          front: ''
        }
      });
    } else if (type === 'back') {
      updateFormData({
        images: {
          ...formData.images,
          back: ''
        }
      });
    } else if (type === 'general' && typeof index === 'number') {
      const newGeneral = [...(formData.images?.general || [])];
      newGeneral[index] = '';
      updateFormData({
        images: {
          ...formData.images,
          general: newGeneral
        }
      });
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.propertyName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.propertyNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.address')}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateFormData({ address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.addressPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.zipCode')}
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => updateFormData({ zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.zipCodePlaceholder')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.city')}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    console.log('City changed to:', e.target.value);
                    updateFormData({ city: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('wizard.cityPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.country')}
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => {
                    console.log('Country changed to:', e.target.value);
                    updateFormData({ country: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('wizard.selectCountry')}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.propertyDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.describeProperty')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.checkInInstructions')}
              </label>
              <textarea
                value={formData.checkInInstructions}
                onChange={(e) => updateFormData({ checkInInstructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.howCheckIn')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.wifiPassword')}
              </label>
              <input
                type="text"
                value={formData.wifiPassword}
                onChange={(e) => updateFormData({ wifiPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.wifiPasswordPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.houseRules')}
              </label>
              <textarea
                value={formData.houseRules}
                onChange={(e) => updateFormData({ houseRules: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.importantRules')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wizard.emergencyContacts')}
              </label>
              <textarea
                value={formData.emergencyContacts}
                onChange={(e) => updateFormData({ emergencyContacts: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('wizard.emergencyContactsPlaceholder')}
              />
            </div>
          </div>
        );

      case 'facilities':
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              Select the facilities and amenities available at your property:
            </div>
            
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {getFacilityCategories(t).map((category) => (
                <div key={category.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        {category.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formData.facilities?.filter(id => category.facilities.some(f => f.id === id)).length || 0} selected
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.facilities.map((facility) => (
                        <label
                          key={facility.id}
                          className="flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200 border border-transparent hover:border-blue-200"
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
                          <span className="text-sm text-gray-700 font-medium">{facility.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {formData.facilities && formData.facilities.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800">
                    <strong>{formData.facilities.length}</strong> facilities selected
                  </p>
                  <button
                    onClick={() => updateFormData({ facilities: [] })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-8">
            <div className="text-sm text-gray-600 mb-4">
              Upload images to showcase your property. You can add 1 front image, 8 general images, and 1 back image.
            </div>
            
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

      case 'local':
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              {t('wizard.selectLocalServices')}
            </div>
            
            {!formData.city || !formData.country ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>{t('wizard.enterCityCountryFirst')}</p>
              </div>
            ) : loadingLocalInfo ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">{t('wizard.loadingLocalInfo')}</p>
              </div>
            ) : availableLocalInfo.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>{t('wizard.noLocalInfo')}</p>
                <p className="text-sm mt-2">{t('wizard.noLocalInfoDesc').replace('{city}', formData.city || '').replace('{country}', formData.country || '')}</p>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Debug Info:</strong><br/>
                    City: "{formData.city}"<br/>
                    Country: "{formData.country}"<br/>
                    Check browser console for more details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{availableLocalInfo.length}</strong> {t('wizard.localInfoFound').replace('{city}', formData.city || '').replace('{country}', formData.country || '')}
                  </p>
                </div>
                
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {availableLocalInfo.map((info) => (
                    <label
                      key={info.id}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLocalInfo.includes(info.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocalInfo.includes(info.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocalInfo([...selectedLocalInfo, info.id]);
                          } else {
                            setSelectedLocalInfo(selectedLocalInfo.filter(id => id !== info.id));
                          }
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{info.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            getCategoryColor(info.category)
                          }`}>
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
                            {info.address}
                            {info.zipCode && `, ${info.zipCode}`}
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
                              <a 
                                href={info.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {info.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {selectedLocalInfo.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>{selectedLocalInfo.length}</strong> {t('wizard.selectedLocalInfo')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              {t('wizard.chooseTemplateText')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <label
                  key={template.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 ${
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
                  <div className="aspect-video bg-gradient-to-br rounded-md mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
                    }}
                  />
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{template.category} style</p>
                  {formData.templateId === template.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">{t('wizard.readyToPublish')}</h3>
              <p className="text-sm text-blue-800">
                {t('wizard.completePayment')}
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">{t('wizard.orderSummary')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('wizard.bookCreation')}</span>
                  <span>€29.99</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('wizard.websiteHosting')}</span>
                  <span>€19.99</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>{t('wizard.total')}</span>
                    <span>€49.98</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">{t('wizard.paymentMethod')}</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'ideal', label: 'iDEAL', icon: '🏦' },
                  { id: 'creditcard', label: 'Credit Card', icon: '💳' },
                  { id: 'paypal', label: 'PayPal', icon: '🅿️' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <div className="text-sm font-medium">{method.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Property' : t('wizard.createNewProperty')}
        </h1>
        <p className="text-gray-600">{t('wizard.followSteps')}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="text-center" style={{ width: index < steps.length - 1 ? '128px' : 'auto' }}>
              <h3 className={`text-sm font-medium ${
                index === currentStep ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {t(step.titleKey)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{t(step.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t(steps[currentStep].titleKey)}
        </h2>
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('common.previous')}
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {t('wizard.processing')}
              </>
            ) : (
              <>
                {isEdit ? 'Save Changes' : t('wizard.completePaymentBtn')}
                <CreditCard className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            {t('common.next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};