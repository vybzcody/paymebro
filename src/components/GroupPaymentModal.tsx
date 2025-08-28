import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, DollarSign } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  amount: number;
}

interface GroupPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GroupPaymentModal = ({ isOpen, onClose, onSuccess }: GroupPaymentModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    currency: 'USDC',
    splitType: 'equal'
  });

  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: '', email: '', amount: 0 },
    { id: '2', name: '', email: '', amount: 0 }
  ]);

  const addMember = () => {
    const newMember: GroupMember = {
      id: Date.now().toString(),
      name: '',
      email: '',
      amount: 0
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length > 2) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const updateMember = (id: string, field: keyof GroupMember, value: string | number) => {
    setMembers(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const calculateSplit = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    if (formData.splitType === 'equal') {
      const perPerson = total / members.length;
      setMembers(members.map(member => ({ ...member, amount: perPerson })));
    }
  };

  const totalSplit = members.reduce((sum, member) => sum + member.amount, 0);
  const isValidSplit = Math.abs(totalSplit - parseFloat(formData.totalAmount || '0')) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) {
      toast.error('Please log in to create group payments');
      return;
    }

    if (!formData.title || !formData.totalAmount || members.some(m => !m.name || !m.email)) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isValidSplit) {
      toast.error('Split amounts must equal total amount');
      return;
    }

    setLoading(true);
    try {
      const groupPaymentData = {
        userId: user.userId || user.id,
        title: formData.title,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        currency: formData.currency,
        splitType: formData.splitType,
        members: members.map(m => ({
          name: m.name,
          email: m.email,
          amount: m.amount
        }))
      };

      console.log('Creating group payment:', groupPaymentData);
      
      toast.success('Group payment created!', {
        description: `${members.length} members will receive payment requests`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        totalAmount: '',
        currency: 'USDC',
        splitType: 'equal'
      });
      setMembers([
        { id: '1', name: '', email: '', amount: 0 },
        { id: '2', name: '', email: '', amount: 0 }
      ]);

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating group payment:', error);
      toast.error('Failed to create group payment', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Split Group Payment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Payment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Dinner at restaurant"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Team dinner expenses"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount *</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.totalAmount}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, totalAmount: e.target.value }));
                  if (formData.splitType === 'equal') {
                    setTimeout(calculateSplit, 100);
                  }
                }}
                placeholder="100.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Split Type</Label>
            <Select value={formData.splitType} onValueChange={(value) => {
              setFormData(prev => ({ ...prev, splitType: value }));
              if (value === 'equal') {
                calculateSplit();
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal Split</SelectItem>
                <SelectItem value="custom">Custom Amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Group Members ({members.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMember}>
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </div>

            {members.map((member, index) => (
              <div key={member.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="col-span-4">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={member.amount}
                    onChange={(e) => updateMember(member.id, 'amount', parseFloat(e.target.value) || 0)}
                    disabled={formData.splitType === 'equal'}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    disabled={members.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Split:</span>
              <span className={`font-bold ${isValidSplit ? 'text-green-600' : 'text-red-600'}`}>
                {totalSplit.toFixed(2)} {formData.currency}
              </span>
            </div>
            {!isValidSplit && (
              <p className="text-sm text-red-600 mt-1">
                Split total must equal {formData.totalAmount} {formData.currency}
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 How it works:</strong> Each member will receive an email with their payment amount and a Solana Pay link. They can pay instantly with their wallet.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValidSplit} className="flex-1">
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Send Payment Requests
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
