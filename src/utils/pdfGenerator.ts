import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Property, LocalInfo, Template, PDFSection } from '../types';

export class PDFGenerator {
  private property: Property;
  private localInfo: LocalInfo[];
  private template: Template;

  constructor(property: Property, localInfo: LocalInfo[], template: Template) {
    this.property = property;
    this.localInfo = localInfo;
    this.template = template;
  }

  async generatePDF(): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Create a temporary container for the PDF content
    const container = this.createPDFContainer();
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // Download the PDF
      pdf.save(`${this.property.name}-information-book.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  private createPDFContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width in pixels at 96 DPI
    container.style.backgroundColor = '#ffffff';
    container.style.fontFamily = this.template.pdfTemplate?.styling.fontFamily || 'Arial, sans-serif';
    container.style.color = '#333333';

    container.innerHTML = this.generatePDFContent();

    return container;
  }

  private generatePDFContent(): string {
    const pdfTemplate = this.template.pdfTemplate;
    if (!pdfTemplate) {
      return this.generateDefaultContent();
    }

    const { styling, sections, layout } = pdfTemplate;
    const enabledSections = sections.filter(section => section.enabled).sort((a, b) => a.order - b.order);

    const headerGradient = styling.headerGradient 
      ? `background: linear-gradient(135deg, ${styling.primaryColor}, ${styling.secondaryColor});`
      : `background: ${styling.primaryColor};`;

    const containerStyle = `
      padding: ${layout.margins.top}px; 
      ${headerGradient}
    `;

    const contentStyle = `
      background: ${styling.backgroundColor}; 
      ${styling.roundedCorners ? 'border-radius: 12px;' : ''} 
      padding: 40px; 
      ${styling.shadows ? 'box-shadow: 0 10px 30px rgba(0,0,0,0.1);' : ''}
    `;

    return `
      <div style="${containerStyle}">
        <div style="${contentStyle}">
          ${enabledSections.map(section => this.renderSection(section)).join('')}
        </div>
      </div>
    `;
  }

  private renderSection(section: PDFSection): string {
    const sectionStyle = `
      margin-top: ${section.styling.marginTop}px;
      margin-bottom: ${section.styling.marginBottom}px;
      padding: ${section.styling.padding}px;
      ${section.styling.backgroundColor ? `background: ${section.styling.backgroundColor};` : ''}
      ${section.styling.borderLeft ? `border-left: ${section.styling.borderLeft.width}px solid ${section.styling.borderLeft.color}; padding-left: 15px;` : ''}
      ${this.template.pdfTemplate?.styling.roundedCorners ? 'border-radius: 8px;' : ''}
    `;

    const titleStyle = `
      color: ${section.styling.color};
      font-size: ${section.styling.fontSize}px;
      font-weight: ${section.styling.fontWeight};
      margin: 0 0 ${section.type === 'header' ? '10px' : '15px'} 0;
    `;

    switch (section.type) {
      case 'header':
        return `
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${this.template.pdfTemplate?.styling.primaryColor}; padding-bottom: 20px;">
            <h1 style="${titleStyle}">
              ${this.replaceVariables(section.content)}
            </h1>
            <p style="color: #666; font-size: 16px; margin: 0;">
              ${this.property.address}, ${this.property.city}, ${this.property.country}
            </p>
          </div>
        `;

      case 'property-info':
        return `
          <div style="${sectionStyle}">
            <h2 style="${titleStyle}">${section.title}</h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.description}
            </p>
          </div>
        `;

      case 'checkin':
        return `
          <div style="${sectionStyle}">
            <h2 style="${titleStyle}">${section.title}</h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.checkInInstructions}
            </p>
          </div>
        `;

      case 'wifi':
        return `
          <div style="${sectionStyle}">
            <h3 style="${titleStyle}">${section.title}</h3>
            <p style="font-size: 16px; font-weight: bold; color: #333;">
              Password: ${this.property.wifiPassword}
            </p>
          </div>
        `;

      case 'rules':
        return `
          <div style="${sectionStyle}">
            <h2 style="${titleStyle}">${section.title}</h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.houseRules}
            </p>
          </div>
        `;

      case 'local-info':
        if (this.localInfo.length === 0) return '';
        return `
          <div style="${sectionStyle}">
            <h2 style="${titleStyle}">${section.title}</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${this.localInfo.map(info => `
                <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: #fafafa;">
                  <h4 style="color: ${this.template.pdfTemplate?.styling.primaryColor}; font-size: 16px; margin: 0 0 8px 0; text-transform: capitalize;">
                    ${info.name}
                  </h4>
                  <p style="font-size: 12px; color: #666; margin: 0 0 5px 0; text-transform: uppercase; font-weight: bold;">
                    ${info.category}
                  </p>
                  <p style="font-size: 13px; color: #555; margin: 0 0 8px 0; line-height: 1.4;">
                    ${info.description}
                  </p>
                  <p style="font-size: 12px; color: #777; margin: 0;">
                    📍 ${info.address}
                    ${info.phone ? `<br>📞 ${info.phone}` : ''}
                    ${info.openingHours ? `<br>🕒 ${info.openingHours}` : ''}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        `;

      case 'emergency':
        return `
          <div style="${sectionStyle}">
            <h3 style="${titleStyle}">${section.title}</h3>
            <p style="font-size: 14px; color: #856404; line-height: 1.6;">
              ${this.property.emergencyContacts}
            </p>
          </div>
        `;

      case 'footer':
        return `
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid ${this.template.pdfTemplate?.styling.primaryColor}; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              ${section.content} • ${new Date().toLocaleDateString()}
            </p>
          </div>
        `;

      case 'custom':
        return `
          <div style="${sectionStyle}">
            <h3 style="${titleStyle}">${section.title}</h3>
            <div style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.replaceVariables(section.content)}
            </div>
          </div>
        `;

      default:
        return '';
    }
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
      .replace(/\{\{emergencyContacts\}\}/g, this.property.emergencyContacts);
  }

  private generateDefaultContent(): string {
    // Fallback to original content if no PDF template is defined
    return `
      <div style="padding: 40px; background: linear-gradient(135deg, ${this.template.colors.primary}, ${this.template.colors.secondary});">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${this.template.colors.primary}; padding-bottom: 20px;">
            <h1 style="color: ${this.template.colors.primary}; font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">
              ${this.property.name}
            </h1>
            <p style="color: #666; font-size: 16px; margin: 0;">
              ${this.property.address}, ${this.property.city}, ${this.property.country}
            </p>
          </div>
          <div style="margin-bottom: 30px;">
            <h2 style="color: ${this.template.colors.secondary}; font-size: 24px; margin-bottom: 15px; border-left: 4px solid ${this.template.colors.accent}; padding-left: 15px;">
              Welcome to Your Stay
            </h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.description}
            </p>
          </div>
        </div>
      </div>
    `;
  }
}