import QRCode from 'qrcode';

/**
 * Generate QR code for payment link
 */
export const generatePaymentQR = async (paymentUrl: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(paymentUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Download QR code as image
 */
export const downloadQRCode = (dataURL: string, filename: string = 'payment-qr.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
