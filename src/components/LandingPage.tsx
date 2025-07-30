import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, BookOpen, Globe, FileText, CreditCard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: t('features.digitalBooks'),
      description: t('features.digitalBooksDesc'),
      image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: Globe,
      title: t('features.responsiveWebsites'),
      description: t('features.responsiveWebsitesDesc'),
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: FileText,
      title: t('features.pdfExport'),
      description: t('features.pdfExportDesc'),
      image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: CreditCard,
      title: t('features.easyPayment'),
      description: t('features.easyPaymentDesc'),
      image: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const templates = [
    { name: t('templates.modernBlue'), preview: 'linear-gradient(135deg, #3B82F6, #1E40AF)' },
    { name: t('templates.classicGreen'), preview: 'linear-gradient(135deg, #059669, #047857)' },
    { name: t('templates.luxuryGold'), preview: 'linear-gradient(135deg, #D97706, #92400E)' },
    { name: t('templates.minimalGray'), preview: 'linear-gradient(135deg, #6B7280, #374151)' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">RentalBook Platform</h1>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                {t('common.login')}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110"
          style={{
            backgroundImage: 'url(/pexels-joachim-hoholm-371880152-29453302.jpg)',
            willChange: 'transform'
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/80" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('landing.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg">
              {t('landing.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('landing.startFreeTrial')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('landing.viewDemo')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.everythingYouNeed')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.everythingSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.beautifulTemplates')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('landing.templatesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div key={template.name} className="bg-white rounded-lg shadow-sm border p-4">
                <div 
                  className="aspect-video rounded-md mb-3"
                  style={{ background: template.preview }}
                />
                <h4 className="font-medium text-gray-900 text-center">{template.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('landing.whyChoose')}
              </h2>
              <div className="space-y-4">
                {[
                  t('benefits.centralDatabase'),
                  t('benefits.responsiveDesigns'),
                  t('benefits.easyWizard'),
                  t('benefits.professionalTemplates'),
                  t('benefits.securePayment'),
                  t('benefits.pdfExport'),
                  t('benefits.adminPanel')
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                {t('landing.readyToStart')}
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {t('landing.createAccount')}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('landing.signIn')}
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                {t('landing.noCreditCard')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">RentalBook Platform</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.tagline')}
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">{t('footer.privacyPolicy')}</a>
              <a href="#" className="hover:text-white">{t('footer.termsOfService')}</a>
              <a href="#" className="hover:text-white">{t('footer.support')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};