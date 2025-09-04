import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, CreditCard, FileText, TrendingUp } from "lucide-react"

interface EmptyStateProps {
  type: 'transactions' | 'payment-links' | 'invoices' | 'customers'
  onAction?: () => void
}

export const EmptyState = ({ type, onAction }: EmptyStateProps) => {
  const configs = {
    transactions: {
      icon: CreditCard,
      title: "No transactions yet",
      description: "Create a payment link or invoice to start receiving payments",
      actionText: "Create Payment Link",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    'payment-links': {
      icon: QrCode,
      title: "No payment links created",
      description: "Create your first payment link to start accepting payments instantly",
      actionText: "Create Payment Link",
      bgColor: "bg-green-50",
      iconColor: "text-green-500"
    },
    invoices: {
      icon: FileText,
      title: "No invoices created",
      description: "Send professional invoices to your customers via email",
      actionText: "Create Invoice",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    customers: {
      icon: TrendingUp,
      title: "No customers yet",
      description: "Your customer analytics will appear here after your first payment",
      actionText: "View Payment Links",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500"
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className={`rounded-full p-4 ${config.bgColor} mb-4`}>
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          {config.description}
        </p>
        {onAction && (
          <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
            {config.actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton for lists
export const TransactionSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
)
