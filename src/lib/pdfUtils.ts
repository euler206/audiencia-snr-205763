
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AspiranteWithPrioridades, Plaza } from '@/types';

// Add type definition for jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      }
    }
  }
}

export const exportAspirantesToPDF = (aspirantes: AspiranteWithPrioridades[]): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO', 105, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Convocatoria OPEC 205763', 105, 22, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Listado de Aspirantes', 105, 30, { align: 'center' });
  
  // Current date
  const today = new Date();
  doc.setFontSize(10);
  doc.text(`Fecha: ${today.toLocaleDateString('es-CO')}`, 195, 10, { align: 'right' });
  
  // Table headers and data
  const tableColumn = ["Puesto", "Puntaje", "Cédula", "Nombre", "Plaza Asignada"];
  const tableData = aspirantes.map(a => [
    a.puesto.toString(),
    a.puntaje.toString(),
    a.cedula,
    a.nombre,
    a.plaza_deseada || "No asignada"
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [179, 0, 0], textColor: [255, 255, 255] }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, 195, doc.internal.pageSize.height - 10, { align: 'right' });
    doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO - OPEC 205763', 105, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  doc.save('listado_aspirantes_snr_opec_205763.pdf');
};

export const exportPrioridadesToPDF = (
  aspirante: AspiranteWithPrioridades, 
  plazas: Plaza[]
): void => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO', 105, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Convocatoria OPEC 205763', 105, 22, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Selección de Plazas', 105, 30, { align: 'center' });
  
  // Aspirante info
  doc.setFontSize(12);
  doc.text(`Aspirante: ${aspirante.nombre}`, 14, 45);
  doc.text(`Cédula: ${aspirante.cedula}`, 14, 52);
  doc.text(`Puesto: ${aspirante.puesto}`, 14, 59);
  doc.text(`Puntaje: ${aspirante.puntaje}`, 14, 66);
  
  // Current date
  const today = new Date();
  doc.setFontSize(10);
  doc.text(`Fecha: ${today.toLocaleDateString('es-CO')}`, 195, 10, { align: 'right' });
  
  // Sort prioridades
  const prioridades = [...aspirante.prioridades].sort((a, b) => a.prioridad - b.prioridad);
  
  if (prioridades.length === 0) {
    doc.setFontSize(12);
    doc.text('No ha seleccionado plazas de preferencia.', 14, 80);
  } else {
    // Table headers and data
    const tableColumn = ["Prioridad", "Municipio", "Departamento", "Vacantes"];
    const tableData = prioridades.map(p => {
      const plaza = plazas.find(pl => pl.municipio === p.municipio);
      return [
        p.prioridad.toString(),
        p.municipio,
        plaza?.departamento || "",
        plaza?.vacantes.toString() || "0"
      ];
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableData,
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [179, 0, 0], textColor: [255, 255, 255] }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, 195, doc.internal.pageSize.height - 10, { align: 'right' });
    doc.text('SUPERINTENDENCIA DE NOTARIADO Y REGISTRO - OPEC 205763', 105, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  doc.save(`seleccion_plazas_${aspirante.cedula}.pdf`);
};
