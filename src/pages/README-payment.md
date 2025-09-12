# Payment Page Component

This component handles the display of payment pages accessible via URLs like `/payment/58dXZq2t5Fkjh6yNJzvfwJaqFPYkof8MGyBJ8Kf16Uyz`.

## Features

- **Public Access**: Payment pages are accessible without authentication
- **Real-time Updates**: Uses WebSocket connections for live payment status updates
- **QR Code Display**: Shows QR codes for pending payments
- **Status Polling**: Fallback polling mechanism if WebSocket fails
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS
- **Copy to Clipboard**: Easy URL copying functionality

## Usage

The payment page is automatically accessible at `/payment/:reference` where `:reference` is the payment reference ID.

### Example URLs
- `/payment/58dXZq2t5Fkjh6yNJzvfwJaqFPYkof8MGyBJ8Kf16Uyz`
- `/payment/HhHzqDKCVN9XXpq4kvwTJkhEz2haqy3FCSGwYRf7We3z`

## Components Used

- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout components
- `Button` - Interactive elements
- `Input` - URL display field
- `Badge` - Status indicators
- `Separator` - Visual dividers
- Various Lucide React icons

## API Endpoints

The component interacts with these backend endpoints:

- `GET /api/payments/:reference` - Fetch payment details
- `GET /api/payments/:reference/qr` - Generate QR code
- `GET /api/payments/:reference/status` - Check payment status (polling)

## WebSocket Events

- `join-payment` - Join payment room for updates
- `payment-update` - Receive real-time payment status changes

## Payment Status Flow

1. **Loading** - Initial state while fetching payment data
2. **Pending** - Payment created, waiting for blockchain confirmation
   - Shows QR code for wallet scanning
   - Displays payment URL for copying
   - Real-time monitoring active
3. **Confirmed** - Payment successfully processed
   - Shows success message
   - Displays transaction signature if available
4. **Failed** - Payment processing failed
   - Shows error state

## Error Handling

- Network errors during API calls
- Invalid payment references
- WebSocket connection failures
- Clipboard API fallbacks for older browsers

## Mobile Responsiveness

The component is fully responsive and optimized for mobile devices, ensuring customers can easily complete payments on any device.