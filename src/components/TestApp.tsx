import React from 'react';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            PDF Layout System
          </h1>
          <p className="text-gray-600 mb-6">
            Application is loading successfully!
          </p>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">React components working</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Tailwind CSS loaded</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Lucide icons working</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">Database setup pending</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-800 text-left space-y-1">
              <li>1. Set up Supabase environment variables</li>
              <li>2. Run database migrations</li>
              <li>3. Access the full PDF layout system</li>
            </ol>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    </div>
  );
};