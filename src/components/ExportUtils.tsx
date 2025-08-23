import { useToast } from "@/hooks/use-toast";

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  title: string;
}

export const useExportUtils = () => {
  const { toast } = useToast();

  const generateCSV = (data: ExportData): string => {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const generateJSON = (data: ExportData): string => {
    const jsonData = data.rows.map(row => {
      const obj: Record<string, string | number> = {};
      data.headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return JSON.stringify({
      title: data.title,
      exportDate: new Date().toISOString(),
      totalRecords: jsonData.length,
      data: jsonData
    }, null, 2);
  };

  const generatePDF = (data: ExportData): string => {
    // Mock PDF content - in real app, you'd use a PDF library like jsPDF
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(${data.title}) Tj
0 -20 Td
(Export Date: ${new Date().toLocaleDateString()}) Tj
0 -20 Td
(Total Records: ${data.rows.length}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
456
%%EOF`;
    
    return pdfContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: ExportData) => {
    const csvContent = generateCSV(data);
    const filename = `${data.filename}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    
    toast({
      title: "Export Successful",
      description: `${data.title} exported as CSV file`,
    });
  };

  const exportToJSON = (data: ExportData) => {
    const jsonContent = generateJSON(data);
    const filename = `${data.filename}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
    
    toast({
      title: "Export Successful",
      description: `${data.title} exported as JSON file`,
    });
  };

  const exportToPDF = (data: ExportData) => {
    const pdfContent = generatePDF(data);
    const filename = `${data.filename}_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadFile(pdfContent, filename, 'application/pdf');
    
    toast({
      title: "Export Successful",
      description: `${data.title} exported as PDF file`,
    });
  };

  const exportToExcel = (data: ExportData) => {
    // Mock Excel export - in real app, you'd use a library like xlsx
    const csvContent = generateCSV(data);
    const filename = `${data.filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadFile(csvContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    toast({
      title: "Export Successful",
      description: `${data.title} exported as Excel file`,
    });
  };

  return {
    exportToCSV,
    exportToJSON,
    exportToPDF,
    exportToExcel
  };
};
