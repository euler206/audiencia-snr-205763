
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Aspirante, Plaza, Prioridad } from '@/types';

// Extend the jsPDF type to include autotable and internal properties
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// We need this workaround to access internal properties
interface jsPDFWithInternal extends jsPDF {
  internal: {
    pages: any[];
    pageSize: {
      width: number;
      height: number;
      getWidth: () => number;
      getHeight: () => number;
    };
    getNumberOfPages: () => number;
  };
}

// Function to export dashboard data to PDF
export const exportDashboardToPDF = (
  aspirantes: Aspirante[], 
  isAdmin: boolean,
  title: string = 'SNR - Listado de Aspirantes'
): void => {
  try {
    // Create a new PDF document
    const doc = new jsPDF() as jsPDFWithInternal;
    
    // Set document properties
    doc.setProperties({
      title: title,
      subject: 'Listado de Aspirantes',
      author: 'Sistema SNR',
      keywords: 'SNR, aspirantes, plazas',
      creator: 'Sistema de Audiencia Pública SNR'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);
    
    // Prepare the table headers and data
    const headers = [
      { header: 'Puesto', dataKey: 'puesto' },
      { header: 'Puntaje', dataKey: 'puntaje' },
    ];
    
    // Add cédula column only for admin users
    if (isAdmin) {
      headers.push({ header: 'Cédula', dataKey: 'cedula' });
    }
    
    headers.push(
      { header: 'Nombre', dataKey: 'nombre' },
      { header: 'Plaza Asignada', dataKey: 'plaza_deseada' }
    );
    
    // Format data
    const data = aspirantes.map(aspirante => {
      const row: Record<string, any> = {
        puesto: aspirante.puesto,
        puntaje: aspirante.puntaje || 'N/A',
        nombre: aspirante.nombre,
        plaza_deseada: aspirante.plaza_deseada || 'No asignada'
      };
      
      // Add cédula for admin users
      if (isAdmin) {
        row.cedula = aspirante.cedula;
      }
      
      return row;
    });
    
    // Generate the table
    doc.autoTable({
      head: [headers.map(h => h.header)],
      body: data.map(row => headers.map(h => row[h.dataKey])),
      startY: 40,
      margin: { top: 40 },
      styles: { overflow: 'linebreak' },
      headStyles: { fillColor: [179, 0, 0] }, // SNR red color
      didDrawPage: function(data) {
        // Footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageNumber = data.pageNumber;
        doc.setFontSize(8);
        doc.text(
          `Página ${pageNumber} de ${pageCount}`,
          pageSize.width - 40,
          pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Ha ocurrido un error al generar el PDF');
  }
};

// Function to export selection data to PDF
export const exportSelectionToPDF = (
  aspirante: Aspirante, 
  prioridades: Prioridad[],
  plazas: Plaza[],
  title: string = 'SNR - Selección de Plazas'
): void => {
  try {
    // Create a new PDF document
    const doc = new jsPDF() as jsPDFWithInternal;
    
    // Set document properties
    doc.setProperties({
      title: title,
      subject: 'Selección de Plazas',
      author: 'Sistema SNR',
      keywords: 'SNR, aspirantes, selección, plazas',
      creator: 'Sistema de Audiencia Pública SNR'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // Add aspirante information
    doc.setFontSize(12);
    doc.text(`Aspirante: ${aspirante.nombre}`, 14, 30);
    doc.text(`Cédula: ${aspirante.cedula}`, 14, 38);
    doc.text(`Puesto: ${aspirante.puesto}`, 14, 46);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 54);
    
    // Sort prioridades by prioridad
    const sortedPrioridades = [...prioridades].sort((a, b) => a.prioridad - b.prioridad);
    
    // Prepare the table data
    const data = sortedPrioridades.map(prioridad => {
      const plaza = plazas.find(p => p.municipio === prioridad.municipio);
      return {
        prioridad: prioridad.prioridad,
        departamento: plaza ? plaza.departamento : 'N/A',
        municipio: prioridad.municipio,
        vacantes: plaza ? plaza.vacantes : 0
      };
    });
    
    // Generate the table
    doc.autoTable({
      head: [['Prioridad', 'Departamento', 'Municipio', 'Vacantes']],
      body: data.map(row => [
        row.prioridad,
        row.departamento,
        row.municipio,
        row.vacantes
      ]),
      startY: 60,
      margin: { top: 60 },
      styles: { overflow: 'linebreak' },
      headStyles: { fillColor: [179, 0, 0] }, // SNR red color
      didDrawPage: function(data) {
        // Footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageNumber = data.pageNumber;
        doc.setFontSize(8);
        doc.text(
          `Página ${pageNumber} de ${pageCount}`,
          pageSize.width - 40,
          pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    doc.save(`${title.replace(/\s+/g, '_')}_${aspirante.cedula}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Ha ocurrido un error al generar el PDF');
  }
};
