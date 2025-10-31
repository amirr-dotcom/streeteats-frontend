import QRCode from 'qrcode';

/**
 * Generate QR code as base64 data URL
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code for a shop URL
 */
export async function generateShopQRCode(shopId: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('generateShopQRCode can only be called on the client side');
  }
  const shopUrl = `${window.location.origin}/shops/${shopId}`;
  return generateQRCode(shopUrl);
}

/**
 * Download QR code as image
 */
export function downloadQRCode(dataUrl: string, filename: string = 'qrcode.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

