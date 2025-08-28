import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { QRReceiptModal } from "@/components/ui/qr-receipt-modal";
import { QrCode, Eye, Copy, DollarSign, Trash2 } from "lucide-react";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { useQRCodes } from "@/hooks/useQRCodes";
import { useState } from "react";
import { toast } from "sonner";

const QRCodes = () => {
  const { qrCodes, loading, deleteQRCode } = useQRCodes();
  const [selectedQR, setSelectedQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, qrId: '', qrTitle: '' });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({ open: true, qrId: id, qrTitle: title });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteQRCode(deleteModal.qrId);
      toast.success('QR code deleted');
    } catch (error) {
      toast.error('Failed to delete QR code');
    }
  };

  const handleViewQR = (qr: any) => {
    setSelectedQR(qr);
    setShowQRModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-500">Manage your payment QR codes</p>
        </div>
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : qrCodes.length === 0 ? (
        <EmptyState type="payment-links" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <Card key={qr.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{qr.title}</span>
                  <Badge variant={qr.is_active ? 'default' : 'secondary'}>
                    {qr.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-200 inline-block">
                    <img 
                      src={qr.qr_code_url} 
                      alt="QR Code" 
                      className="w-24 h-24"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="font-medium">{qr.amount} {qr.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payments:</span>
                    <span className="font-medium">{qr.payment_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Collected:</span>
                    <span className="font-medium">{qr.total_collected} {qr.currency}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewQR(qr)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(qr.payment_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(qr.id, qr.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <QRReceiptModal
        open={showQRModal}
        onOpenChange={setShowQRModal}
        qrCode={selectedQR}
      />

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
        title="Delete QR Code"
        description={`Are you sure you want to delete "${deleteModal.qrTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default QRCodes;
