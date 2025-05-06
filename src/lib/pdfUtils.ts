
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Aspirante, Plaza, Prioridad, AspiranteWithPrioridades } from '@/types';

// Extend the jsPDF type to include autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Define a more complete internal interface
interface jsPDFWithInternal extends jsPDF {
  internal: {
    events: any;
    scaleFactor: number;
    pageSize: {
      width: number;
      height: number;
      getWidth: () => number;
      getHeight: () => number;
    };
    pages: any[];
    getNumberOfPages: () => number;
    getEncryptor: ((objectId: number) => (data: string) => string) | undefined;
  };
}

// Function to export dashboard data to PDF
export const exportAspirantesToPDF = (
  aspirantes: Aspirante[], 
  isAdmin: boolean = true,
  title: string = 'SNR - Lista de Aspirantes'
): void => {
  try {
    const doc = new jsPDF() as jsPDFWithInternal;
    
    // Add logo and title
    const logoUrl = 'https://www.supernotariado.gov.co/images/ImagenesAlianzas/Logo-SNR.png';
    const img = new Image();
    img.src = logoUrl;
    
    // Set font size and add title
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO', 14, 30);
    doc.text('OPEC 205763', 14, 38);
    doc.text('Audiencia Pública de Selección de Plazas', 14, 46);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 54);
    
    // Create headers for table
    const headers = ['Puesto', 'Cédula', 'Nombre', 'Puntaje'];
    if (isAdmin) {
      headers.push('Plaza Asignada');
    }
    
    // Create data for table
    const data = aspirantes.map(aspirante => {
      const row = [
        aspirante.puesto?.toString() || 'N/A',
        aspirante.cedula || 'N/A',
        aspirante.nombre || 'N/A',
        aspirante.puntaje?.toString() || 'N/A'
      ];
      
      if (isAdmin) {
        row.push(aspirante.plaza_deseada || 'No asignada');
      }
      
      return row;
    });
    
    // Add table to document
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 62,
      theme: 'striped',
      headStyles: { fillColor: [23, 124, 156] },
      margin: { top: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: isAdmin ? 50 : 70 },
        3: { cellWidth: 25 },
        4: isAdmin ? { cellWidth: 50 } : {}
      }
    });
    
    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save document
    doc.save(`aspirantes_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

// Function to export selection data to PDF
export const exportPrioridadesToPDF = (
  aspirante: AspiranteWithPrioridades, 
  plazas: Plaza[],
  title: string = 'SNR - Selección de Plazas'
): void => {
  try {
    const doc = new jsPDF() as jsPDFWithInternal;
    
    // Add logo and title
    const logoUrl = 'https://www.supernotariado.gov.co/images/ImagenesAlianzas/Logo-SNR.png';
    const img = new Image();
    img.src = logoUrl;
    
    // Set font size and add title
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO', 14, 30);
    doc.text('OPEC 205763', 14, 38);
    doc.text('Audiencia Pública de Selección de Plazas', 14, 46);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 54);
    
    // Check if aspirante has prioridades property
    if (!aspirante.prioridades || aspirante.prioridades.length === 0) {
      // If no prioridades, just show a message
      doc.text('No hay prioridades seleccionadas para este aspirante.', 14, 62);
      
      // Save document
      doc.save(`prioridades_${aspirante.cedula}_${new Date().toISOString().slice(0, 10)}.pdf`);
      return;
    }
    
    // Add aspirante information
    doc.text(`Aspirante: ${aspirante.nombre} (${aspirante.cedula})`, 14, 62);
    doc.text(`Puesto: ${aspirante.puesto}`, 14, 70);
    doc.text(`Puntaje: ${aspirante.puntaje}`, 14, 78);
    
    // Create headers for table
    const headers = ['Prioridad', 'Departamento', 'Municipio', 'Vacantes'];
    
    // Create data for table based on prioridades
    const data = aspirante.prioridades
      .sort((a, b) => a.prioridad - b.prioridad)
      .map(prioridad => {
        const plaza = plazas.find(p => p.municipio === prioridad.municipio);
        return [
          prioridad.prioridad.toString(),
          plaza?.departamento || 'N/A',
          prioridad.municipio || 'N/A',
          plaza?.vacantes?.toString() || 'N/A'
        ];
      });
    
    // Add table to document
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 86,
      theme: 'striped',
      headStyles: { fillColor: [23, 124, 156] },
      margin: { top: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 20 }
      }
    });
    
    // Add page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save document
    doc.save(`prioridades_${aspirante.cedula}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
