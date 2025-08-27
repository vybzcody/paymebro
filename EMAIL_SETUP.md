# 📧 Email Notifications Setup with Resend

AfriPay uses **Resend** for sending payment notifications to merchants and customers. This enhances the SaaS experience with professional email notifications.

## 🚀 **Quick Setup**

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Go to **API Keys** in dashboard
4. Create a new API key
5. Copy the key (starts with `re_`)

### 2. Configure Environment

Add to your `.env` file:

```bash
# Email Configuration (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=AfriPay <noreply@yourdomain.com>
```

### 3. Domain Setup (Optional but Recommended)

For production, add your domain to Resend:

1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records as instructed
4. Verify domain
5. Update `RESEND_FROM_EMAIL` to use your domain

## 📧 **Email Types**

### Payment Confirmation (to Merchant)
- ✅ Sent when payment is received
- 💰 Shows net amount received
- 🔗 Includes transaction link
- 📊 Fee breakdown

### Payment Receipt (to Customer)  
- ✅ Sent when payment is completed
- 🧾 Professional receipt format
- 🔗 Transaction verification link
- 💳 Payment details

### Test Email
- ✅ Verify configuration
- 🧪 Test email delivery
- ⚙️ Check formatting

## 🧪 **Testing Email Setup**

### Test via API:
```bash
curl -X POST http://localhost:3001/api/confirm/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "re_abc123..."
}
```

## 📊 **Email Templates**

### Merchant Confirmation Email Features:
- 🎨 Professional design with AfriPay branding
- 💰 Highlighted net amount received
- 📋 Complete transaction details
- 🔗 Solana Explorer link
- 📱 Mobile-responsive design

### Customer Receipt Email Features:
- 🧾 Clean receipt format
- 💳 Payment breakdown with fees
- 🔒 Security information
- 📞 Support contact information
- 🔗 Transaction verification

## 🔧 **Configuration Options**

### Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_abc123...` |
| `RESEND_FROM_EMAIL` | From email address | `AfriPay <noreply@yourdomain.com>` |

### Email Service Features:
- ✅ Automatic retry on failure
- ✅ Error logging and monitoring
- ✅ Graceful fallback (payment succeeds even if email fails)
- ✅ HTML and text formats
- ✅ Mobile-optimized templates

## 💰 **Pricing**

### Resend Pricing:
- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Tier**: $20/month for 50,000 emails
- **Scale Tier**: Custom pricing for high volume

### Cost per Transaction:
- **Free Tier**: $0 (up to 3,000 emails/month)
- **Pro Tier**: ~$0.0004 per email
- **Very cost-effective for SaaS notifications**

## 🚨 **Troubleshooting**

### Email Not Sending:
1. ✅ Check `RESEND_API_KEY` is correct
2. ✅ Verify from email domain is added to Resend
3. ✅ Check server logs for error messages
4. ✅ Test with `/api/confirm/test-email` endpoint

### Email in Spam:
1. ✅ Add your domain to Resend
2. ✅ Set up SPF, DKIM, DMARC records
3. ✅ Use professional from address
4. ✅ Avoid spam trigger words

### Domain Issues:
1. ✅ Verify domain in Resend dashboard
2. ✅ Check DNS records are correct
3. ✅ Wait for DNS propagation (up to 24 hours)
4. ✅ Use Resend's domain verification tool

## 📈 **SaaS Benefits**

### For Merchants:
- 📧 Instant payment notifications
- 📊 Professional transaction records
- 🔗 Easy transaction verification
- 📱 Mobile-friendly emails

### For Customers:
- 🧾 Automatic receipts
- 🔒 Payment confirmation
- 📞 Support contact information
- 🔗 Transaction proof

### For AfriPay:
- 🏢 Professional brand image
- 📈 Improved user experience
- 🔄 Reduced support requests
- 💼 Enterprise-ready features

## 🎯 **Next Steps**

1. ✅ Get Resend API key
2. ✅ Configure environment variables
3. ✅ Test email delivery
4. ✅ Set up custom domain (optional)
5. ✅ Monitor email delivery rates
6. ✅ Customize email templates (optional)

Your AfriPay SaaS now has professional email notifications! 🚀
