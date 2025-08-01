import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  Type, 
  Image, 
  Table, 
  Minus, 
  Space, 
  Database, 
  Grid, 
  QrCode, 
  Code,
  Eye,
  Save,
  Undo,
  Redo,
  Settings,
  Layers,
  PageBreak,
  Palette
} from 'lucide-react';
import { PDFTemplate, PDFPage, PDFElement, PDFElementContent, PDFElementStyling, PDFLayout } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PDFLayoutEditorProps {
  template: PDFTemplate;
  onSave: (template: PDFTemplate) => void;
  onCancel: () => void;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startPosition: { x: number; y: number };
  elementStartPosition: { x: number; y: number };
}

const ELEMENT_TYPES = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'table', icon: Table, label: 'Table' },
  { type: 'divider', icon: Minus, label: 'Divider' },
  { type: 'spacer', icon: Space, label: 'Spacer' },
  { type: 'property-data', icon: Database, label: 'Property Data' },
  { type: 'local-info-grid', icon: Grid, label: 'Local Info Grid' },
  { type: 'qr-code', icon: QrCode, label: 'QR Code' },
  { type: 'custom-html', icon: Code, label: 'Custom HTML' }
];

const PAGE_SIZES = {
  a4: { width: 794, height: 1123 },
  letter: { width: 816, height: 1056 },
  legal: { width: 816, height: 1344 },
  a3: { width: 1123, height: 1587 },
  a5: { width: 559, height: 794 }
};

export const PDFLayoutEditor: React.FC<PDFLayoutEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const { t } = useLanguage();
  const [currentTemplate, setCurrentTemplate] = useState<PDFTemplate>(template);
  const [selectedPageId, setSelectedPageId] = useState<string>(template.pages?.[0]?.id || '');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    startPosition: { x: 0, y: 0 },
    elementStartPosition: { x: 0, y: 0 }
  });
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<PDFTemplate[]>([template]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const scale = 0.6; // Scale factor for the editor view

  // Initialize pages if they don't exist
  useEffect(() => {
    if (!currentTemplate.pages || currentTemplate.pages.length === 0) {
      const defaultPage: PDFPage = {
        id: `page-${Date.now()}`,
        name: 'Page 1',
        order: 1,
        elements: [],
        pageBreak: 'auto'
      };
      setCurrentTemplate(prev => ({
        ...prev,
        pages: [defaultPage]
      }));
      setSelectedPageId(defaultPage.id);
    }
  }, [currentTemplate.pages]);

  const getCurrentPage = (): PDFPage | undefined => {
    return currentTemplate.pages?.find(page => page.id === selectedPageId);
  };

  const updateHistory = (newTemplate: PDFTemplate) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTemplate);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentTemplate(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentTemplate(history[historyIndex + 1]);
    }
  };

  const addPage = () => {
    const newPage: PDFPage = {
      id: `page-${Date.now()}`,
      name: `Page ${(currentTemplate.pages?.length || 0) + 1}`,
      order: (currentTemplate.pages?.length || 0) + 1,
      elements: [],
      pageBreak: 'always'
    };

    const updatedTemplate = {
      ...currentTemplate,
      pages: [...(currentTemplate.pages || []), newPage]
    };

    setCurrentTemplate(updatedTemplate);
    setSelectedPageId(newPage.id);
    updateHistory(updatedTemplate);
  };

  const deletePage = (pageId: string) => {
    if (currentTemplate.pages && currentTemplate.pages.length > 1) {
      const updatedPages = currentTemplate.pages.filter(page => page.id !== pageId);
      const updatedTemplate = {
        ...currentTemplate,
        pages: updatedPages
      };

      setCurrentTemplate(updatedTemplate);
      if (selectedPageId === pageId) {
        setSelectedPageId(updatedPages[0]?.id || '');
      }
      updateHistory(updatedTemplate);
    }
  };

  const addElement = (elementType: string) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    const newElement: PDFElement = {
      id: `element-${Date.now()}`,
      type: elementType as any,
      position: { x: 50, y: 50, width: 200, height: 50 },
      content: getDefaultContent(elementType),
      styling: getDefaultStyling(),
      order: currentPage.elements.length,
      conditions: []
    };

    const updatedPages = currentTemplate.pages?.map(page => 
      page.id === selectedPageId 
        ? { ...page, elements: [...page.elements, newElement] }
        : page
    ) || [];

    const updatedTemplate = {
      ...currentTemplate,
      pages: updatedPages
    };

    setCurrentTemplate(updatedTemplate);
    setSelectedElementId(newElement.id);
    updateHistory(updatedTemplate);
  };

  const deleteElement = (elementId: string) => {
    const updatedPages = currentTemplate.pages?.map(page => 
      page.id === selectedPageId 
        ? { ...page, elements: page.elements.filter(el => el.id !== elementId) }
        : page
    ) || [];

    const updatedTemplate = {
      ...currentTemplate,
      pages: updatedPages
    };

    setCurrentTemplate(updatedTemplate);
    setSelectedElementId(null);
    updateHistory(updatedTemplate);
  };

  const updateElement = (elementId: string, updates: Partial<PDFElement>) => {
    const updatedPages = currentTemplate.pages?.map(page => 
      page.id === selectedPageId 
        ? { 
            ...page, 
            elements: page.elements.map(el => 
              el.id === elementId ? { ...el, ...updates } : el
            )
          }
        : page
    ) || [];

    const updatedTemplate = {
      ...currentTemplate,
      pages: updatedPages
    };

    setCurrentTemplate(updatedTemplate);
  };

  const getDefaultContent = (elementType: string): PDFElementContent => {
    switch (elementType) {
      case 'text':
        return { text: 'Sample text' };
      case 'property-data':
        return { dataSource: 'property', dataField: 'name' };
      case 'local-info-grid':
        return { dataSource: 'local-info' };
      case 'qr-code':
        return { qrData: '{{propertyUrl}}' };
      case 'custom-html':
        return { html: '<p>Custom HTML content</p>' };
      default:
        return { text: 'New element' };
    }
  };

  const getDefaultStyling = (): PDFElementStyling => ({
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Arial, sans-serif',
    color: '#333333',
    textAlign: 'left',
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = getCurrentPage()?.elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElementId(elementId);
    setDragState({
      isDragging: true,
      elementId,
      startPosition: { x: e.clientX, y: e.clientY },
      elementStartPosition: { x: element.position.x, y: element.position.y }
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId) return;

    const deltaX = (e.clientX - dragState.startPosition.x) / scale;
    const deltaY = (e.clientY - dragState.startPosition.y) / scale;

    const newX = Math.max(0, dragState.elementStartPosition.x + deltaX);
    const newY = Math.max(0, dragState.elementStartPosition.y + deltaY);

    updateElement(dragState.elementId, {
      position: {
        ...getCurrentPage()?.elements.find(el => el.id === dragState.elementId)?.position!,
        x: newX,
        y: newY
      }
    });
  }, [dragState, scale]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        elementId: null,
        startPosition: { x: 0, y: 0 },
        elementStartPosition: { x: 0, y: 0 }
      });
      updateHistory(currentTemplate);
    }
  }, [dragState.isDragging, currentTemplate]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const pageSize = PAGE_SIZES[currentTemplate.layout.pageSize] || PAGE_SIZES.a4;
  const canvasWidth = pageSize.width * scale;
  const canvasHeight = pageSize.height * scale;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Tools */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">PDF Layout Editor</h3>
        </div>

        {/* Element Tools */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Elements</h4>
          <div className="grid grid-cols-2 gap-2">
            {ELEMENT_TYPES.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addElement(type)}
                className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Pages</h4>
            <button
              onClick={addPage}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {currentTemplate.pages?.map((page) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                  selectedPageId === page.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPageId(page.id)}
              >
                <span className="text-sm">{page.name}</span>
                {currentTemplate.pages!.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </button>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">{currentTemplate.name}</h2>
              <span className="text-sm text-gray-500">
                {getCurrentPage()?.name || 'No page selected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSave(currentTemplate)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </button>
              <button
                onClick={onCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Grid */}
              {currentTemplate.layout.grid?.enabled && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                    `,
                    backgroundSize: `${currentTemplate.layout.grid.size}px ${currentTemplate.layout.grid.size}px`
                  }}
                />
              )}

              {/* Page Elements */}
              {getCurrentPage()?.elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 cursor-move ${
                    selectedElementId === element.id
                      ? 'border-blue-500 bg-blue-50 bg-opacity-20'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.position.width,
                    height: element.position.height,
                    fontSize: element.styling.fontSize,
                    fontWeight: element.styling.fontWeight,
                    color: element.styling.color,
                    backgroundColor: element.styling.backgroundColor,
                    textAlign: element.styling.textAlign,
                    padding: `${element.styling.padding?.top}px ${element.styling.padding?.right}px ${element.styling.padding?.bottom}px ${element.styling.padding?.left}px`,
                    zIndex: element.styling.zIndex || 1
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(element.id);
                  }}
                >
                  {renderElementContent(element)}
                  
                  {/* Delete button for selected element */}
                  {selectedElementId === element.id && (
                    <button
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElementId && (
        <ElementPropertiesPanel
          element={getCurrentPage()?.elements.find(el => el.id === selectedElementId)!}
          onUpdate={(updates) => updateElement(selectedElementId, updates)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <TemplateSettingsPanel
          template={currentTemplate}
          onUpdate={setCurrentTemplate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// Helper function to render element content
const renderElementContent = (element: PDFElement): React.ReactNode => {
  switch (element.type) {
    case 'text':
      return <div className="h-full overflow-hidden">{element.content.text}</div>;
    case 'property-data':
      return (
        <div className="h-full overflow-hidden text-blue-600">
          {`{{${element.content.dataField}}}`}
        </div>
      );
    case 'local-info-grid':
      return (
        <div className="h-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
          Local Info Grid
        </div>
      );
    case 'qr-code':
      return (
        <div className="h-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
          QR Code
        </div>
      );
    case 'image':
      return (
        <div className="h-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500">
          Image
        </div>
      );
    case 'divider':
      return <div className="w-full h-1 bg-gray-300" />;
    case 'custom-html':
      return (
        <div 
          className="h-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: element.content.html || '' }}
        />
      );
    default:
      return <div className="h-full overflow-hidden">{element.content.text}</div>;
  }
};

// Element Properties Panel Component
const ElementPropertiesPanel: React.FC<{
  element: PDFElement;
  onUpdate: (updates: Partial<PDFElement>) => void;
}> = ({ element, onUpdate }) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Element Properties</h3>
      
      {/* Position and Size */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X</label>
            <input
              type="number"
              value={element.position.x}
              onChange={(e) => onUpdate({
                position: { ...element.position, x: Number(e.target.value) }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y</label>
            <input
              type="number"
              value={element.position.y}
              onChange={(e) => onUpdate({
                position: { ...element.position, y: Number(e.target.value) }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={element.position.width}
              onChange={(e) => onUpdate({
                position: { ...element.position, width: Number(e.target.value) }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={element.position.height}
              onChange={(e) => onUpdate({
                position: { ...element.position, height: Number(e.target.value) }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
        {element.type === 'text' && (
          <textarea
            value={element.content.text || ''}
            onChange={(e) => onUpdate({
              content: { ...element.content, text: e.target.value }
            })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded resize-none"
            rows={3}
          />
        )}
        {element.type === 'property-data' && (
          <select
            value={element.content.dataField || ''}
            onChange={(e) => onUpdate({
              content: { ...element.content, dataField: e.target.value }
            })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
          >
            <option value="name">Property Name</option>
            <option value="address">Address</option>
            <option value="description">Description</option>
            <option value="checkInInstructions">Check-in Instructions</option>
            <option value="wifiPassword">WiFi Password</option>
            <option value="houseRules">House Rules</option>
            <option value="emergencyContacts">Emergency Contacts</option>
          </select>
        )}
      </div>

      {/* Styling */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Styling</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Font Size</label>
            <input
              type="number"
              value={element.styling.fontSize || 14}
              onChange={(e) => onUpdate({
                styling: { ...element.styling, fontSize: Number(e.target.value) }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={element.styling.color || '#333333'}
              onChange={(e) => onUpdate({
                styling: { ...element.styling, color: e.target.value }
              })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={element.styling.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate({
                styling: { ...element.styling, backgroundColor: e.target.value }
              })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Align</label>
            <select
              value={element.styling.textAlign || 'left'}
              onChange={(e) => onUpdate({
                styling: { ...element.styling, textAlign: e.target.value as any }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Settings Panel Component
const TemplateSettingsPanel: React.FC<{
  template: PDFTemplate;
  onUpdate: (template: PDFTemplate) => void;
  onClose: () => void;
}> = ({ template, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Template Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => onUpdate({ ...template, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
            <select
              value={template.layout.pageSize}
              onChange={(e) => onUpdate({
                ...template,
                layout: { ...template.layout, pageSize: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
              <option value="a3">A3</option>
              <option value="a5">A5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
            <select
              value={template.layout.orientation}
              onChange={(e) => onUpdate({
                ...template,
                layout: { ...template.layout, orientation: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={template.layout.grid?.enabled || false}
                onChange={(e) => onUpdate({
                  ...template,
                  layout: {
                    ...template.layout,
                    grid: {
                      ...template.layout.grid,
                      enabled: e.target.checked,
                      size: template.layout.grid?.size || 20,
                      snapToGrid: template.layout.grid?.snapToGrid || false
                    }
                  }
                })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Show Grid</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};