import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CCTPTransferLogsProps {
  transferId?: string;
}

export const CCTPTransferLogs = ({ transferId }: CCTPTransferLogsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          <p>No transfer logs available</p>
          {transferId && (
            <Badge variant="outline" className="mt-2">
              Transfer ID: {transferId}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
