import { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Printer, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface SessionData {
  patientName: string;
  patientId: string;
  sessionDate: Date;
  chiefComplaint?: string;
  pulseFindings?: string[];
  tongueFindings?: string[];
  tcmPattern?: string;
  treatmentPrinciple?: string;
  planNotes?: string;
  herbsPrescribed?: string;
  selectedPoints?: string[];
  followUpRecommended?: string;
}

interface PrintSessionButtonProps {
  sessionData: SessionData;
  clinicName?: string;
  therapistName?: string;
}

export const PrintSessionButton = forwardRef<HTMLButtonElement, PrintSessionButtonProps>(
  function PrintSessionButton({ 
    sessionData, 
    clinicName = 'TCM Clinic',
    therapistName = 'Practitioner'
  }, ref) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // ===== HEADER =====
      // Clinic name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34); // Jade green
      doc.text(clinicName, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Clinical Session Record', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Divider line
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // ===== SESSION INFO =====
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const infoTable = [
        ['Patient Name:', sessionData.patientName],
        ['Session Date:', format(sessionData.sessionDate, 'MMMM d, yyyy')],
        ['Practitioner:', therapistName],
        ['Record ID:', sessionData.patientId.slice(0, 8).toUpperCase()],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: infoTable,
        theme: 'plain',
        styles: { 
          fontSize: 10,
          cellPadding: 2,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 },
        },
        margin: { left: margin },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // ===== S.O.A.P. SECTIONS =====
      const sections = [
        {
          title: 'SUBJECTIVE',
          color: [220, 53, 69], // Rose/red
          content: sessionData.chiefComplaint || 'No chief complaint recorded'
        },
        {
          title: 'OBJECTIVE',
          color: [0, 123, 255], // Blue
          content: [
            sessionData.pulseFindings?.length 
              ? `Pulse: ${sessionData.pulseFindings.join(', ')}`
              : null,
            sessionData.tongueFindings?.length 
              ? `Tongue: ${sessionData.tongueFindings.join(', ')}`
              : null,
          ].filter(Boolean).join('\n') || 'No objective findings recorded'
        },
        {
          title: 'ASSESSMENT',
          color: [255, 193, 7], // Amber
          content: [
            sessionData.tcmPattern 
              ? `TCM Pattern: ${sessionData.tcmPattern}`
              : null,
          ].filter(Boolean).join('\n') || 'No assessment recorded'
        },
        {
          title: 'PLAN',
          color: [34, 139, 34], // Jade green
          content: [
            sessionData.treatmentPrinciple 
              ? `Treatment Principle: ${sessionData.treatmentPrinciple}`
              : null,
            sessionData.selectedPoints?.length 
              ? `\nAcupuncture Points: ${sessionData.selectedPoints.join(', ')}`
              : null,
            sessionData.herbsPrescribed 
              ? `\nHerbal Prescription:\n${sessionData.herbsPrescribed}`
              : null,
            sessionData.planNotes 
              ? `\nNotes:\n${sessionData.planNotes}`
              : null,
            sessionData.followUpRecommended 
              ? `\nFollow-up: ${sessionData.followUpRecommended}`
              : null,
          ].filter(Boolean).join('') || 'No treatment plan recorded'
        },
      ];

      for (const section of sections) {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }

        // Section header with colored bar
        doc.setFillColor(...section.color as [number, number, number]);
        doc.rect(margin, yPos, 5, 8, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...section.color as [number, number, number]);
        doc.text(section.title, margin + 8, yPos + 6);
        yPos += 12;

        // Section content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const lines = doc.splitTextToSize(section.content, pageWidth - (margin * 2) - 10);
        doc.text(lines, margin + 8, yPos);
        yPos += lines.length * 5 + 10;
      }

      // ===== FOOTER =====
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = doc.internal.pageSize.getHeight() - 15;
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          footerY,
          { align: 'center' }
        );
        doc.text(
          'CONFIDENTIAL - For Clinical Use Only',
          pageWidth / 2,
          footerY + 4,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `session_${sessionData.patientName.replace(/\s+/g, '_')}_${format(sessionData.sessionDate, 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={ref} variant="outline" size="sm" className="gap-2" disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          Print
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={generatePDF} className="gap-2">
          <FileText className="h-4 w-4" />
          Clinic Record (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            window.print();
          }}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Browser Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
