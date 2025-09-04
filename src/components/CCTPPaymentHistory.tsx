import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CCTPPaymentHistoryProps {
  paymentId?: string;
}

export const CCTPPaymentHistory = ({ paymentId }: CCTPPaymentHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Chain Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>No cross-chain payment history available</p>
          {paymentId && (
            <Badge variant="outline" className="mt-2">
              Payment ID: {paymentId}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
