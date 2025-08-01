import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Property, LocalInfo, PDFTemplate, PDFPage, PDFElement } from '../types';

export class EnhancedPDFGenerator {
  private property: Property;
  private localInfo: LocalInfo[];
  private template: PDFTemplate;

  constructor(property: Property, localInfo: LocalInfo[], template: PDFTemplate) {
    this.property = property;
    this.localInfo = localInfo;
    this.template = template;
  }

  async generatePDF(): Promise<void> {
    const pdf = new jsPDF(
      this.template.layout.orientation,
      'mm',
      this.template.layout.pageSize
    );

    const pageSize = this.getPageDimensions();
    
    // Generate each page
    for (let i = 0; i < (this.template.pages?.length || 0); i++) {
      const page = this.template.pages![i];
      
      if (i > 0) {
        pdf.addPage();
      }
      
      await this.renderPage(pdf, page, pageSize);
    }

    // Download the PDF
    pdf.save(`${this.property.name}-information-book.pdf`);
  }

  private async renderPage(pdf: jsPDF, page: PDFPage, pageSize: { width: number; height: number }): Promise<void> {
    // Create a container for the page content
    const container = this.createPageContainer(page, pageSize);
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: page.background?.color || '#ffffff',
        width: pageSize.width * 3.78, // Convert mm to pixels (96 DPI)
        height: pageSize.height * 3.78
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageSize.width - this.template.layout.margins.left - this.template.layout.margins.right;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to PDF
      pdf.addImage(
        imgData, 
        'PNG', 
        this.template.layout.margins.left, 
        this.template.layout.margins.top, 
        imgWidth, 
        imgHeight
      );
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  private createPageContainer(page: PDFPage, pageSize: { width: number; height: number }): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${pageSize.width * 3.78}px`; // Convert mm to pixels
    container.style.height = `${pageSize.height * 3.78}px`;
    container.style.backgroundColor = page.background?.color || '#ffffff';
    container.style.fontFamily = this.template.styling.fontFamily;
    container.style.overflow = 'hidden';
    container.style.position = 'relative';

    // Add background image if specified
    if (page.background?.image) {
      container.style.backgroundImage = `url(${page.background.image})`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      if (page.background.opacity) {
        container.style.opacity = page.background.opacity.toString();
      }
    }

    // Sort elements by order and render them
    const sortedElements = [...page.elements].sort((a, b) => a.order - b.order);
    
    for (const element of sortedElements) {
      if (this.shouldRenderElement(element)) {
        const elementDiv = this.createElementDiv(element);
        container.appendChild(elementDiv);
      }
    }

    return container;
  }

  private createElementDiv(element: PDFElement): HTMLElement {
    const div = document.createElement('div');
    
    // Apply positioning
    div.style.position = 'absolute';
    div.style.left = `${element.position.x * 3.78}px`;
    div.style.top = `${element.position.y * 3.78}px`;
    div.style.width = `${element.position.width * 3.78}px`;
    div.style.height = `${element.position.height * 3.78}px`;
    
    // Apply styling
    this.applyElementStyling(div, element);
    
    // Add content based on element type
    this.addElementContent(div, element);
    
    return div;
  }

  private applyElementStyling(div: HTMLElement, element: PDFElement): void {
    const styling = element.styling;
    
    if (styling.fontSize) div.style.fontSize = `${styling.fontSize * 3.78}px`;
    if (styling.fontWeight) div.style.fontWeight = styling.fontWeight;
    if (styling.fontFamily) div.style.fontFamily = styling.fontFamily;
    if (styling.color) div.style.color = styling.color;
    if (styling.backgroundColor) div.style.backgroundColor = styling.backgroundColor;
    if (styling.textAlign) div.style.textAlign = styling.textAlign;
    if (styling.opacity) div.style.opacity = styling.opacity.toString();
    if (styling.zIndex) div.style.zIndex = styling.zIndex.toString();
    
    // Apply padding
    if (styling.padding) {
      div.style.padding = `${styling.padding.top * 3.78}px ${styling.padding.right * 3.78}px ${styling.padding.bottom * 3.78}px ${styling.padding.left * 3.78}px`;
    }
    
    // Apply margin
    if (styling.margin) {
      div.style.margin = `${styling.margin.top * 3.78}px ${styling.margin.right * 3.78}px ${styling.margin.bottom * 3.78}px ${styling.margin.left * 3.78}px`;
    }
    
    // Apply border
    if (styling.border) {
      div.style.border = `${styling.border.width}px ${styling.border.style} ${styling.border.color}`;
      if (styling.border.radius) {
        div.style.borderRadius = `${styling.border.radius}px`;
      }
    }
    
    // Apply shadow
    if (styling.shadow) {
      div.style.boxShadow = `${styling.shadow.x}px ${styling.shadow.y}px ${styling.shadow.blur}px ${styling.shadow.color}`;
    }
  }

  private addElementContent(div: HTMLElement, element: PDFElement): void {
    switch (element.type) {
      case 'text':
        div.innerHTML = this.replaceVariables(element.content.text || '');
        break;
        
      case 'property-data':
        div.innerHTML = this.getPropertyData(element.content.dataField || '');
        break;
        
      case 'local-info-grid':
        div.innerHTML = this.generateLocalInfoGrid();
        break;
        
      case 'qr-code':
        div.innerHTML = this.generateQRCode(element.content.qrData || '');
        break;
        
      case 'image':
        if (element.content.imageUrl) {
          const img = document.createElement('img');
          img.src = element.content.imageUrl;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          div.appendChild(img);
        }
        break;
        
      case 'table':
        if (element.content.tableData) {
          div.innerHTML = this.generateTable(element.content.tableData);
        }
        break;
        
      case 'divider':
        div.style.backgroundColor = element.styling.color || '#e5e7eb';
        div.style.height = '2px';
        break;
        
      case 'spacer':
        // Spacer elements don't need content
        break;
        
      case 'custom-html':
        div.innerHTML = this.replaceVariables(element.content.html || '');
        break;
        
      default:
        div.innerHTML = this.replaceVariables(element.content.text || '');
    }
  }

  private shouldRenderElement(element: PDFElement): boolean {
    if (!element.conditions || element.conditions.length === 0) {
      return true;
    }
    
    // Check all conditions
    return element.conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not-equals':
          return fieldValue !== condition.value;
        case 'contains':
          return fieldValue.includes(condition.value);
        case 'not-contains':
          return !fieldValue.includes(condition.value);
        case 'exists':
          return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        case 'not-exists':
          return fieldValue === null || fieldValue === undefined || fieldValue === '';
        default:
          return true;
      }
    });
  }

  private getFieldValue(field: string): string {
    const propertyFields: Record<string, string> = {
      name: this.property.name,
      address: this.property.address,
      city: this.property.city,
      country: this.property.country,
      description: this.property.description,
      checkInInstructions: this.property.checkInInstructions,
      wifiPassword: this.property.wifiPassword,
      houseRules: this.property.houseRules,
      emergencyContacts: this.property.emergencyContacts
    };
    
    return propertyFields[field] || '';
  }

  private getPropertyData(dataField: string): string {
    const data = this.getFieldValue(dataField);
    return this.replaceVariables(data);
  }

  private generateLocalInfoGrid(): string {
    if (this.localInfo.length === 0) {
      return '<div style="text-align: center; color: #9ca3af; font-style: italic;">No local information available</div>';
    }
    
    const gridItems = this.localInfo.map(info => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
        <h4 style="color: ${this.template.styling.primaryColor}; font-size: 14px; margin: 0 0 4px 0; font-weight: bold;">
          ${info.name}
        </h4>
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0; text-transform: uppercase; font-weight: bold;">
          ${info.category}
        </p>
        <p style="font-size: 12px; color: #374151; margin: 0 0 6px 0; line-height: 1.4;">
          ${info.description}
        </p>
        <p style="font-size: 10px; color: #6b7280; margin: 0;">
          📍 ${info.address}
          ${info.phone ? `<br>📞 ${info.phone}` : ''}
          ${info.openingHours ? `<br>🕒 ${info.openingHours}` : ''}
        </p>
      </div>
    `).join('');
    
    return `<div style="display: flex; flex-direction: column;">${gridItems}</div>`;
  }

  private generateQRCode(data: string): string {
    const qrData = this.replaceVariables(data);
    // For now, return a placeholder. In a real implementation, you'd generate an actual QR code
    return `
      <div style="border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; height: 100%; text-align: center; color: #6b7280; font-size: 12px;">
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">QR Code</div>
          <div style="font-size: 10px;">${qrData}</div>
        </div>
      </div>
    `;
  }

  private generateTable(tableData: { headers: string[]; rows: string[][]; dataSource?: 'property' | 'local-info' }): string {
    let headers = tableData.headers;
    let rows = tableData.rows;
    
    // If data source is specified, generate dynamic data
    if (tableData.dataSource === 'local-info') {
      headers = ['Name', 'Category', 'Address', 'Phone'];
      rows = this.localInfo.map(info => [
        info.name,
        info.category,
        info.address,
        info.phone || 'N/A'
      ]);
    }
    
    const headerRow = `
      <tr style="background-color: ${this.template.styling.primaryColor}; color: white;">
        ${headers.map(header => `<th style="padding: 8px; text-align: left; font-size: 12px;">${header}</th>`).join('')}
      </tr>
    `;
    
    const dataRows = rows.map(row => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        ${row.map(cell => `<td style="padding: 6px 8px; font-size: 11px;">${cell}</td>`).join('')}
      </tr>
    `).join('');
    
    return `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
        ${headerRow}
        ${dataRows}
      </table>
    `;
  }

  private replaceVariables(content: string): string {
    return content
      .replace(/\{\{propertyName\}\}/g, this.property.name)
      .replace(/\{\{propertyAddress\}\}/g, this.property.address)
      .replace(/\{\{propertyCity\}\}/g, this.property.city)
      .replace(/\{\{propertyCountry\}\}/g, this.property.country)
      .replace(/\{\{propertyDescription\}\}/g, this.property.description)
      .replace(/\{\{wifiPassword\}\}/g, this.property.wifiPassword)
      .replace(/\{\{checkInInstructions\}\}/g, this.property.checkInInstructions)
      .replace(/\{\{houseRules\}\}/g, this.property.houseRules)
      .replace(/\{\{emergencyContacts\}\}/g, this.property.emergencyContacts)
      .replace(/\{\{propertyUrl\}\}/g, this.property.websiteUrl || '')
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{currentTime\}\}/g, new Date().toLocaleTimeString());
  }

  private getPageDimensions(): { width: number; height: number } {
    const dimensions = {
      a4: { width: 210, height: 297 },
      letter: { width: 216, height: 279 },
      legal: { width: 216, height: 356 },
      a3: { width: 297, height: 420 },
      a5: { width: 148, height: 210 }
    };
    
    const size = dimensions[this.template.layout.pageSize] || dimensions.a4;
    
    if (this.template.layout.orientation === 'landscape') {
      return { width: size.height, height: size.width };
    }
    
    return size;
  }
}