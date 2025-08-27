# AfriPay Database Enhancements

## Overview
These migrations enhance your existing database schema to support a comprehensive Stripe-like payment dashboard with email services and invoice management.

## New Features Added

### 1. Enhanced Payment Tracking
- **Payment Request Status**: Added comprehensive status tracking (`pending`, `processing`, `completed`, `failed`, `expired`, `cancelled`)
- **Payment Attempts**: Track retry attempts and failure reasons
- **Success/Cancel URLs**: Support for redirect URLs after payment
- **Timestamps**: Detailed tracking of completion, failure, and attempt times

### 2. Email Communication System
- **Email Logs Table**: Complete tracking of all email communications
  - Payment confirmations
  - Invoices
  - Receipts
  - Refund notifications
  - Failure alerts
- **Email Status Tracking**: Monitor delivery status, opens, clicks
- **Provider Integration**: Support for Resend, SendGrid, SES, etc.
- **Template Management**: Track which email templates were used

### 3. Webhook Management
- **Webhook Events Table**: Track all webhook deliveries
- **Retry Logic**: Automatic retry with exponential backoff
- **Response Tracking**: Store webhook response codes and bodies
- **Event Types**: Support for various events (`payment.completed`, `payment.failed`, etc.)

### 4. Enhanced Invoicing
- **Auto-generated Invoice Numbers**: Format: `INV-YYYY-DDD-NNNN`
- **Invoice Line Items**: Detailed breakdown of charges
- **Invoice Status**: Draft, open, paid, void, uncollectible
- **Payment Tracking**: Track payments against invoices
- **Tax Support**: Tax amounts, tax-exempt customers
- **Due Dates**: Support for payment terms

### 5. Customer Enhancement
- **Preferences**: Currency, timezone, language preferences
- **Notifications**: Email and SMS notification preferences
- **Addresses**: Separate billing and shipping addresses
- **Tax Information**: Support for tax IDs and tax-exempt status

### 6. Transaction Enhancements
- **Refund Tracking**: Partial, full refund support
- **Dispute Management**: Comprehensive dispute status tracking
- **Email Receipts**: Track if receipts were sent
- **Customer Linking**: Link transactions to customers

## Database Tables

### Core Tables (Enhanced)
- `payment_requests` - Enhanced with status, customer linking, webhooks
- `transactions` - Enhanced with refunds, disputes, email tracking
- `customers` - Enhanced with preferences and addresses
- `invoices` - Enhanced with line items and payment tracking

### New Tables
- `email_logs` - Track all email communications
- `webhook_events` - Manage webhook deliveries and retries
- `invoice_line_items` - Detailed invoice breakdown

## Key Features for Dashboard

### 1. Payment Analytics
```sql
-- Get payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payment_requests 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status;
```

### 2. Email Delivery Tracking
```sql
-- Email delivery success rate
SELECT 
  email_type,
  status,
  COUNT(*) as count
FROM email_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY email_type, status;
```

### 3. Revenue Tracking
```sql
-- Revenue by day
SELECT 
  DATE(completed_at) as date,
  SUM(amount_usdc) as revenue,
  COUNT(*) as transactions
FROM transactions 
WHERE status = 'confirmed' 
  AND completed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(completed_at)
ORDER BY date;
```

## Email Integration Ready

The schema is ready for email service integration:

1. **Resend Integration**: Use `email_logs` to track Resend API calls
2. **Template Support**: Store template IDs and track usage
3. **Delivery Tracking**: Webhook support for delivery confirmations
4. **Error Handling**: Store and track email failures

## Webhook System

The webhook system supports:
- Automatic retry with exponential backoff
- Maximum retry attempts (configurable)
- Response logging
- Event type filtering
- User-specific webhook URLs

## Invoice Generation

Invoices support:
- Automatic numbering (INV-YYYY-DDD-NNNN format)
- Line item breakdown
- Tax calculations
- Payment tracking
- PDF generation (URL storage)
- Hosted invoice pages

## Security (RLS)

All new tables have Row Level Security enabled:
- Users can only see their own data
- Service role has full access for backend operations
- Anonymous users can create payment requests
- Proper customer data isolation

## Next Steps

1. **Run the migrations** in order:
   - `20250825062800_enhance_payment_tracking.sql`
   - `20250825062801_add_rls_policies.sql`

2. **Update your backend services** to use the new columns and tables

3. **Integrate email service** (Resend recommended) using the `email_logs` table

4. **Implement webhook processing** using the `webhook_events` table

5. **Create dashboard queries** using the enhanced analytics capabilities

## Migration Files

1. `20250825062800_enhance_payment_tracking.sql` - Core enhancements
2. `20250825062801_add_rls_policies.sql` - Security policies
3. `20250825061604_add_currency_column.sql` - Currency support (already applied)

These migrations are designed to be safe and use `IF NOT EXISTS` clauses to prevent conflicts with existing data.
