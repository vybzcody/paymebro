import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar,
  FileSpreadsheet,
  FileJson,
  File,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { useExportUtils, ExportData } from "./ExportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  type: "payments" | "invoices" | "customers" | "analytics";
}

export const ExportModal = ({ isOpen, onClose, data, type }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const { exportToCSV, exportToJSON, exportToPDF, exportToExcel } = useExportUtils();

  const formats = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for spreadsheets',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      size: '~15KB'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation for APIs',
      icon: <FileJson className="w-5 h-5" />,
      size: '~25KB'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Portable Document Format for reports',
      icon: <FileText className="w-5 h-5" />,
      size: '~45KB'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Microsoft Excel spreadsheet',
      icon: <File className="w-5 h-5" />,
      size: '~20KB'
    }
  ];

  const getTypeTitle = () => {
    switch (type) {
      case 'payments': return 'Payment Transactions';
      case 'invoices': return 'Invoice Records';
      case 'customers': return 'Customer Database';
      case 'analytics': return 'Analytics Report';
      default: return 'Data Export';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const exportData = {
      ...data,
      title: `${getTypeTitle()} (${dateRange.startDate} to ${dateRange.endDate})`
    };

    switch (selectedFormat) {
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'json':
        exportToJSON(exportData);
        break;
      case 'pdf':
        exportToPDF(exportData);
        break;
      case 'excel':
        exportToExcel(exportData);
        break;
    }

    setIsExporting(false);
    setExportComplete(true);
    
    // Auto close after showing success
    setTimeout(() => {
      setExportComplete(false);
      onClose();
    }, 2000);
  };

  const resetModal = () => {
    setExportComplete(false);
    setIsExporting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetModal();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export {getTypeTitle()}
          </DialogTitle>
        </DialogHeader>

        {exportComplete ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Export Complete!</h3>
              <p className="text-muted-foreground">Your file has been downloaded successfully</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Range Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Date Range</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Format Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold">Export Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedFormat === format.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFormat(format.id as any)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{format.name}</h4>
                          <Badge variant="secondary" className="text-xs">{format.size}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Export Summary */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Export Summary</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Records:</span>
                  <span className="font-medium">{data.rows.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{selectedFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-medium">
                    {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Size:</span>
                  <span className="font-medium">
                    {formats.find(f => f.id === selectedFormat)?.size}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
