import React from 'react';
import { Template, Property } from '../types';

interface TemplatePreviewProps {
  template: Template;
  property: Property;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  property,
  isSelected = false,
  onSelect
}) => {
  return (
    <div
      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 ${
        isSelected
          ? 'border-blue-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Template Preview */}
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
        <div
          className="h-full w-full p-4 text-white relative"
          style={{
            background: `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary})`
          }}
        >
          {/* Mock content preview */}
          <div className="bg-white/95 rounded-lg p-3 h-full overflow-hidden">
            <div className="space-y-2">
              <div
                className="h-3 rounded"
                style={{ backgroundColor: template.colors.primary, width: '70%' }}
              />
              <div className="h-1 bg-gray-300 rounded w-full" />
              <div className="h-1 bg-gray-300 rounded w-4/5" />
              <div className="h-1 bg-gray-300 rounded w-3/5" />
              
              <div className="mt-3 space-y-1">
                <div
                  className="h-2 rounded"
                  style={{ backgroundColor: template.colors.accent, width: '50%' }}
                />
                <div className="h-1 bg-gray-200 rounded w-full" />
                <div className="h-1 bg-gray-200 rounded w-4/5" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1">
                <div className="bg-gray-100 rounded h-8" />
                <div className="bg-gray-100 rounded h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
        <p className="text-sm text-gray-500 capitalize">{template.category} style</p>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};