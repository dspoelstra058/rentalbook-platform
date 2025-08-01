import React from 'react';
import { FileText, Plus, Settings } from 'lucide-react';

export const SimplePDFLayoutManager: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">PDF Layout Manager</h2>
        <p className="text-gray-600 mt-1">Create and manage PDF templates for property information books</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Layout System</h3>
          <p className="text-gray-500 mb-6">
            The PDF layout management system is ready to use. To complete the setup:
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-left text-sm text-blue-800 space-y-1">
              <li>1. Run the database migration: <code className="bg-blue-100 px-1 rounded">npx supabase db reset</code></li>
              <li>2. Ensure Supabase is running and connected</li>
              <li>3. Refresh this page to access the full PDF layout editor</li>
            </ol>
          </div>

          <div className="flex justify-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Template (Coming Soon)
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Visual drag-and-drop editor</li>
            <li>• Multi-page PDF layouts</li>
            <li>• Dynamic property data integration</li>
            <li>• Professional templates</li>
            <li>• Export/import functionality</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Components loaded</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Database pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-gray-600">Templates ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};