import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Link, DollarSign, Search, Copy, Eye, Trash2, Zap } from "lucide-react";
import { EmptyState, TransactionSkeleton } from "@/components/EmptyStates";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { MultiChainPaymentForm } from "@/components/MultiChainPaymentForm";
import { useState } from "react";
import { toast } from "sonner";

const PaymentLinks = () => {
  const { paymentLinks, loading, deletePaymentLink } = usePaymentLinks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLink, setSelectedLink] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, linkId: '', linkTitle: '' });

  const filteredLinks = paymentLinks.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && link.is_active) ||
      (statusFilter === 'inactive' && !link.is_active);

    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({ open: true, linkId: id, linkTitle: title });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePaymentLink(deleteModal.linkId);
      toast.success('Payment link deleted');
    } catch (error) {
      toast.error('Failed to delete payment link');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Links</h1>
          <p className="text-gray-600">Create and manage payment links for your business</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Create Multi-Chain Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Multi-Chain Payment Link</DialogTitle>
            </DialogHeader>
            <MultiChainPaymentForm />
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Payment Links</h2>
            <p className="text-gray-500">Manage your payment links</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Links List */}
        {loading ? (
          <TransactionSkeleton />
        ) : filteredLinks.length === 0 ? (
          <EmptyState type="payment-links" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2" />
                Payment Links ({filteredLinks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Link className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-sm text-gray-500">Ref: {link.reference}</p>
                        <p className="text-xs text-gray-400">{link.payment_count} payments • ${link.total_collected} collected</p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-semibold">${link.amount} {link.currency}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedLink(link)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Payment Link Details</DialogTitle>
                            </DialogHeader>
                            {selectedLink && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Title</label>
                                  <p className="text-sm text-gray-600">{selectedLink.title}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Amount</label>
                                  <p className="text-sm text-gray-600">${selectedLink.amount} {selectedLink.currency}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Reference</label>
                                  <p className="text-sm text-gray-600">{selectedLink.reference}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Payment URL</label>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm text-gray-600 truncate flex-1">{selectedLink.payment_url}</p>
                                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedLink.payment_url)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Stats</label>
                                  <p className="text-sm text-gray-600">{selectedLink.payment_count} payments • ${selectedLink.total_collected} collected</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(link.payment_url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(link.id, link.title)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmationModal
          open={deleteModal.open}
          onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
          title="Delete Payment Link"
          description={`Are you sure you want to delete "${deleteModal.linkTitle}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
};

export default PaymentLinks;
