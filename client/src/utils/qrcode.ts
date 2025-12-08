import QRCode from 'qrcode';

export async function generateQRCode(
  content: string,
  options?: any
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  const opts = { ...defaultOptions, ...(options || {}) };

  try {
    return await new Promise<string>((resolve, reject) => {
      QRCode.toDataURL(content, opts, (err: any, url?: string) => {
        if (err) {
          reject(err);
        } else if (url) {
          resolve(url);
        } else {
          reject(new Error('Empty QR code URL'));
        }
      });
    });
  } catch (err) {
    console.error('generateQRCode error:', err);
    throw err;
  }
}

export default generateQRCode;
