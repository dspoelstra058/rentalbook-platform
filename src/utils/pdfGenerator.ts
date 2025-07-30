import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Property, LocalInfo, Template } from '../types';

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
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = '#333333';

    container.innerHTML = `
      <div style="padding: 40px; background: linear-gradient(135deg, ${this.template.colors.primary}, ${this.template.colors.secondary});">
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${this.template.colors.primary}; padding-bottom: 20px;">
            <h1 style="color: ${this.template.colors.primary}; font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">
              ${this.property.name}
            </h1>
            <p style="color: #666; font-size: 16px; margin: 0;">
              ${this.property.address}, ${this.property.city}, ${this.property.country}
            </p>
          </div>

          <!-- Property Description -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: ${this.template.colors.secondary}; font-size: 24px; margin-bottom: 15px; border-left: 4px solid ${this.template.colors.accent}; padding-left: 15px;">
              Welcome to Your Stay
            </h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.description}
            </p>
          </div>

          <!-- Check-in Instructions -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: ${this.template.colors.secondary}; font-size: 20px; margin-bottom: 15px; border-left: 4px solid ${this.template.colors.accent}; padding-left: 15px;">
              Check-in Instructions
            </h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.checkInInstructions}
            </p>
          </div>

          <!-- WiFi Information -->
          <div style="margin-bottom: 30px; background: ${this.template.colors.primary}15; padding: 20px; border-radius: 8px;">
            <h3 style="color: ${this.template.colors.primary}; font-size: 18px; margin-bottom: 10px;">
              WiFi Information
            </h3>
            <p style="font-size: 16px; font-weight: bold; color: #333;">
              Password: ${this.property.wifiPassword}
            </p>
          </div>

          <!-- House Rules -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: ${this.template.colors.secondary}; font-size: 20px; margin-bottom: 15px; border-left: 4px solid ${this.template.colors.accent}; padding-left: 15px;">
              House Rules
            </h2>
            <p style="line-height: 1.6; font-size: 14px; color: #555;">
              ${this.property.houseRules}
            </p>
          </div>

          <!-- Local Information -->
          ${this.localInfo.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="color: ${this.template.colors.secondary}; font-size: 20px; margin-bottom: 20px; border-left: 4px solid ${this.template.colors.accent}; padding-left: 15px;">
                Local Information & Recommendations
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                ${this.localInfo.map(info => `
                  <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: #fafafa;">
                    <h4 style="color: ${this.template.colors.primary}; font-size: 16px; margin: 0 0 8px 0; text-transform: capitalize;">
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
          ` : ''}

          <!-- Emergency Contacts -->
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #856404; font-size: 18px; margin-bottom: 10px;">
              Emergency Contacts
            </h3>
            <p style="font-size: 14px; color: #856404; line-height: 1.6;">
              ${this.property.emergencyContacts}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid ${this.template.colors.primary}; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              Generated by RentalBook Platform • ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    `;

    return container;
  }
}