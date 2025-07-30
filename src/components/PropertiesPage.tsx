import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, ExternalLink, Download, BarChart3, Palette, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Property } from '../types';
import { templates } from '../utils/data';
import { PDFGenerator } from '../utils/pdfGenerator';
import { TemplatePreview } from './TemplatePreview';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/auth';

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern-blue');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;
      
      // Transform the data to match the Property interface
      const transformedProperties: Property[] = (propertiesData || []).map(prop => ({
        id: prop.id,
        ownerId: prop.owner_id,
        name: prop.name,
        address: prop.address || '',
        zipCode: prop.zip_code || '',
        city: prop.city || '',
        country: prop.country || '',
        description: prop.description || '',
        checkInInstructions: prop.checkin_instructions || '',
        wifiPassword: prop.wifi_password || '',
        houseRules: prop.house_rules || '',
        emergencyContacts: prop.emergency_contacts || '',
        templateId: prop.template_id || 'modern-blue',
        isPublished: prop.is_published,
        websiteUrl: prop.website_url || undefined,
        createdAt: new Date(prop.created_at),
        updatedAt: new Date(prop.updated_at)
      }));

      setProperties(transformedProperties);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    setIsGeneratingPDF(true);
    try {
      const template = templates.find(t => t.id === property.templateId) || templates[0];
      const pdfGenerator = new PDFGenerator(property, [], template);
      await pdfGenerator.generatePDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleChangeTemplate = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Here you would typically update the property in your backend
    console.log(`Updated property ${selectedProperty} with template ${templateId}`);
    setShowTemplateModal(false);
    setSelectedProperty(null);
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
        <p>{t('properties.errorLoading')}: {error}</p>
        <button 
          onClick={loadProperties}
          className="mt-2 text-sm underline hover:no-underline"
        >
          {t('properties.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('properties.title')}</h1>
          <p className="text-gray-600">{t('properties.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/properties/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('properties.addProperty')}
        </button>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('properties.allProperties')}</h2>
        </div>
        {properties.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Home className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('properties.noProperties')}</h3>
            <p className="text-gray-600 mb-6">{t('properties.getStartedMessage')}</p>
            <button
              onClick={() => navigate('/properties/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('properties.createFirstProperty')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {properties.map((property) => (
              <div key={property.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                      {property.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('common.published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {t('common.draft')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {property.address}
                      {property.zipCode && `, ${property.zipCode}`}
                      {property.city && `, ${property.city}`}
                      {property.country && `, ${property.country}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('properties.created')} {property.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {property.isPublished && property.websiteUrl && (
                      <a
                        href={property.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title={t('properties.viewWebsite')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(property.id)}
                      disabled={isGeneratingPDF}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title={t('properties.downloadPdf')}
                    >
                      {isGeneratingPDF ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleChangeTemplate(property.id)}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                      title={t('properties.changeTemplate')}
                    >
                      <Palette className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title={t('properties.editProperty')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title={t('properties.deleteProperty')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('properties.chooseTemplate')}
                </h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => {
                  const property = properties.find(p => p.id === selectedProperty);
                  return (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      property={property!}
                      isSelected={selectedTemplate === template.id}
                      onSelect={() => handleTemplateSelect(template.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};