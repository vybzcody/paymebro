import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

export const CCTPCrossChainPayment = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          Cross-Chain Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Cross-chain payment functionality coming soon
          </p>
          <Button variant="outline" disabled>
            Start Cross-Chain Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
