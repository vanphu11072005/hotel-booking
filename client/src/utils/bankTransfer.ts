import generateQRCode from './qrcode';

export interface BankTransferInfo {
  bank_name: string;
  account_number: string;
  account_name?: string;
  amount: number;
  content: string;
}

/**
 * Generate QR code for bank transfer
 */
export async function generateBankTransferQR(
  info: BankTransferInfo
): Promise<string> {
  const qrContent = `Bank: ${info.bank_name}\nAccount: ${info.account_number}\nAmount: ${info.amount}\nContent: ${info.content}`;
  
  return await generateQRCode(qrContent);
}

/**
 * Default bank info configuration
 */
export const DEFAULT_BANK_INFO = {
  bank_name: 'Vietcombank',
  bank_code: 'VCB',
  account_number: '0123456789',
  account_name: 'KHACH SAN ABC',
} as const;
