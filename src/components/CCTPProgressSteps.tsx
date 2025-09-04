import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface CCTPProgressStepsProps {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export const CCTPProgressSteps = ({ status = 'pending' }: CCTPProgressStepsProps) => {
  const steps = [
    { id: 'initiate', label: 'Payment Initiated', status: 'completed' },
    { id: 'burn', label: 'Token Burn', status: status === 'pending' ? 'pending' : 'completed' },
    { id: 'attest', label: 'Attestation', status: status === 'processing' ? 'processing' : status === 'completed' ? 'completed' : 'pending' },
    { id: 'mint', label: 'Token Mint', status: status === 'completed' ? 'completed' : 'pending' }
  ];

  const getIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              {getIcon(step.status)}
              <span className={`text-sm ${step.status === 'completed' ? 'text-green-700' : 'text-gray-600'}`}>
                {step.label}
              </span>
              <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                {step.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
