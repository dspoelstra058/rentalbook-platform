import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, MapPin, Home, FileText, Palette, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Property, LocalInfo, Template } from '../types';
import { templates, mockLocalInfo } from '../utils/data';

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


export const PropertyWizard: React.FC = () => {
  const navigate = useNavigate();
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
    templateId: ''
  });
  const [selectedLocalInfo, setSelectedLocalInfo] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate('/dashboard');
  };

  const updateFormData = (updates: Partial<Property>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const filteredLocalInfo = mockLocalInfo.filter(info => 
    info.city === formData.city && info.country === formData.country
  );

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
                  onChange={(e) => updateFormData({ city: e.target.value })}
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
                  onChange={(e) => updateFormData({ country: e.target.value })}
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
          </div>
        );

      case 'local':
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              {t('wizard.selectLocalServices')}
            </div>
            {filteredLocalInfo.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('wizard.noLocalInfo', { city: formData.city, country: formData.country })}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredLocalInfo.map((info) => (
                  <label
                    key={info.id}
                    className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
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
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{info.name}</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                          {info.category}
                        </span>
                        {info.verified && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {info.address} • {info.phone} • {info.openingHours}
                      </div>
                    </div>
                  </label>
                ))}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Property</h1>
        <p className="text-gray-600">Follow the steps to create your vacation rental information book.</p>
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
                {t('wizard.completePaymentBtn')}
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