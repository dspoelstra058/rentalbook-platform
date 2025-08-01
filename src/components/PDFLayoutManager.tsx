import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Download, 
  Upload, 
  Search, 
  Filter,
  FileText,
  Layout,
  Palette,
  Settings
} from 'lucide-react';
import { PDFTemplate, PDFLayoutTemplate, Property } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PDFLayoutEditor } from './PDFLayoutEditor';
import { supabase } from '../utils/supabase';
import { ConfirmationModal } from './ConfirmationModal';

interface PDFLayoutManagerProps {
  onBack?: () => void;
}

export const PDFLayoutManager: React.FC<PDFLayoutManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<PDFLayoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PDFTemplate | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PDFLayoutTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load PDF layout templates from database
      const { data, error } = await supabase
        .from('pdf_layout_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading PDF templates:', err);
      setError('Failed to load PDF templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<PDFLayoutTemplate>) => {
    try {
      const defaultTemplate: PDFTemplate = {
        id: `template-${Date.now()}`,
        name: templateData.name || 'New Template',
        layout: {
          pageSize: 'a4',
          orientation: 'portrait',
          margins: { top: 40, right: 40, bottom: 40, left: 40 },
          columns: 1,
          grid: { enabled: true, size: 20, snapToGrid: false }
        },
        sections: [],
        styling: {
          fontFamily: 'Arial, sans-serif',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          accentColor: '#3b82f6',
          backgroundColor: '#ffffff',
          headerGradient: false,
          roundedCorners: true,
          shadows: true
        },
        pages: [{
          id: `page-${Date.now()}`,
          name: 'Page 1',
          order: 1,
          elements: [],
          pageBreak: 'auto'
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newTemplate: PDFLayoutTemplate = {
        id: `layout-${Date.now()}`,
        name: templateData.name || 'New Template',
        description: templateData.description || '',
        category: templateData.category || 'general',
        thumbnail: '',
        template: defaultTemplate,
        isDefault: false,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data, error } = await supabase
        .from('pdf_layout_templates')
        .insert([newTemplate])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create template');
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<PDFTemplate>) => {
    try {
      const templateToUpdate = templates.find(t => t.id === templateId);
      if (!templateToUpdate) return;

      const updatedLayoutTemplate = {
        ...templateToUpdate,
        template: { ...templateToUpdate.template, ...updates },
        updatedAt: new Date()
      };

      const { error } = await supabase
        .from('pdf_layout_templates')
        .update(updatedLayoutTemplate)
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.map(t => 
        t.id === templateId ? updatedLayoutTemplate : t
      ));
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('pdf_layout_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  const duplicateTemplate = async (template: PDFLayoutTemplate) => {
    try {
      const duplicatedTemplate: PDFLayoutTemplate = {
        ...template,
        id: `layout-${Date.now()}`,
        name: `${template.name} (Copy)`,
        template: {
          ...template.template,
          id: `template-${Date.now()}`,
          name: `${template.template.name} (Copy)`
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { data, error } = await supabase
        .from('pdf_layout_templates')
        .insert([duplicatedTemplate])
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error duplicating template:', err);
      setError('Failed to duplicate template');
    }
  };

  const exportTemplate = (template: PDFLayoutTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${template.name.replace(/\s+/g, '_')}_template.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedTemplate = JSON.parse(e.target?.result as string) as PDFLayoutTemplate;
        
        // Generate new IDs to avoid conflicts
        const newTemplate: PDFLayoutTemplate = {
          ...importedTemplate,
          id: `layout-${Date.now()}`,
          name: `${importedTemplate.name} (Imported)`,
          template: {
            ...importedTemplate.template,
            id: `template-${Date.now()}`
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const { data, error } = await supabase
          .from('pdf_layout_templates')
          .insert([newTemplate])
          .select()
          .single();

        if (error) throw error;

        setTemplates(prev => [data, ...prev]);
      } catch (err) {
        console.error('Error importing template:', err);
        setError('Failed to import template. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['business', 'hospitality', 'real-estate', 'general'];

  if (showEditor && editingTemplate) {
    return (
      <PDFLayoutEditor
        template={editingTemplate}
        onSave={async (updatedTemplate) => {
          await updateTemplate(editingTemplate.id, updatedTemplate);
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PDF Layout Manager</h2>
            <p className="text-gray-600 mt-1">Create and manage PDF templates for property information books</p>
          </div>
          <div className="flex space-x-3">
            <label className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Template
              <input
                type="file"
                accept=".json"
                onChange={importTemplate}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Template Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {template.name}
                  </h3>
                  {template.isDefault && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="capitalize">
                    {template.category.replace('-', ' ')}
                  </span>
                  <span>
                    {template.template.pages?.length || 0} page{(template.template.pages?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingTemplate(template.template);
                      setShowEditor(true);
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => exportTemplate(template)}
                    className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {!template.isDefault && (
                    <button
                      onClick={() => {
                        setTemplateToDelete(template);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first PDF template to get started'
            }
          </p>
          {!searchTerm && !categoryFilter && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          )}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onCreate={createTemplate}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && templateToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTemplateToDelete(null);
          }}
          onConfirm={() => deleteTemplate(templateToDelete.id)}
          title="Delete Template"
          message={`Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

// Create Template Modal Component
const CreateTemplateModal: React.FC<{
  onCreate: (template: Partial<PDFLayoutTemplate>) => void;
  onCancel: () => void;
}> = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreate(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter template description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="business">Business</option>
              <option value="hospitality">Hospitality</option>
              <option value="real-estate">Real Estate</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};