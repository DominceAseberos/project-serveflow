import type { Order, StoreSettings } from '../types';

/**
 * ESC/POS Hardware Command Bytes (Epson Standard)
 */
export const ESC_POS = {
  // Initialization
  INIT: new Uint8Array([0x1b, 0x40]), // ESC @

  // Alignment
  ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]), // ESC a 0
  ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]), // ESC a 1
  ALIGN_RIGHT: new Uint8Array([0x1b, 0x61, 0x02]), // ESC a 2

  // Typography
  BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]), // ESC E 1
  BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]), // ESC E 0
  DOUBLE_SIZE: new Uint8Array([0x1d, 0x21, 0x11]), // GS ! 17 (Double width & height)
  NORMAL_SIZE: new Uint8Array([0x1d, 0x21, 0x00]), // GS ! 0

  // Cash Drawer Kick Pulse (pin 2, standard 24V RJ11/RJ12 drawer)
  DRAWER_KICK: new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]), // ESC p 0 25 250

  // Feed & Cut
  FEED_LINES_4: new Uint8Array([0x1b, 0x64, 0x04]), // ESC d 4
  CUT_FULL: new Uint8Array([0x1d, 0x56, 0x00]), // GS V 0
  CUT_PARTIAL: new Uint8Array([0x1d, 0x56, 0x01]), // GS V 1
  CUT_FEED: new Uint8Array([0x1d, 0x56, 0x42, 0x00]), // GS V 66 0 (Feed and cut)
};

/**
 * Text formatting helper for fixed-width thermal rolls
 * @param left Text on left side
 * @param right Text on right side
 * @param width Column width (e.g. 48 chars for 80mm, 32 chars for 58mm)
 */
export function formatTwoColumns(left: string, right: string, width = 48): string {
  const availableSpace = width - right.length;
  if (left.length > availableSpace - 1) {
    left = left.substring(0, Math.max(0, availableSpace - 2)) + ' ';
  }
  const spaces = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(spaces) + right + '\n';
}

export function formatDivider(char = '-', width = 48): string {
  return char.repeat(width) + '\n';
}

export function centerText(text: string, width = 48): string {
  if (text.length >= width) return text.substring(0, width) + '\n';
  const totalSpaces = width - text.length;
  const leftPad = Math.floor(totalSpaces / 2);
  const rightPad = totalSpaces - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad) + '\n';
}

/**
 * Generate raw ESC/POS binary buffer for a customer receipt
 */
export function generateEscPosReceipt(
  order: Order,
  settings: StoreSettings,
  options: {
    paperWidth?: '80mm' | '58mm';
    kickDrawer?: boolean;
    cutPaper?: boolean;
  } = {}
): Uint8Array {
  const is58mm = (options.paperWidth || settings.paperWidth) === '58mm';
  const width = is58mm ? 32 : 48;
  const shouldKick = options.kickDrawer ?? settings.openCashDrawerOnReceipt ?? true;
  const shouldCut = options.cutPaper ?? true;

  const chunks: Uint8Array[] = [];
  const encoder = new TextEncoder();

  const append = (bytes: Uint8Array) => chunks.push(bytes);
  const appendText = (text: string) => chunks.push(encoder.encode(text));

  // 1. Hardware Init & Optional Drawer Kick
  append(ESC_POS.INIT);
  if (shouldKick) {
    append(ESC_POS.DRAWER_KICK);
  }

  // 2. Header (Centered, Store title emphasized)
  append(ESC_POS.ALIGN_CENTER);
  append(ESC_POS.BOLD_ON);
  if (!is58mm) append(ESC_POS.DOUBLE_SIZE);
  appendText(settings.storeName + '\n');
  append(ESC_POS.NORMAL_SIZE);
  append(ESC_POS.BOLD_OFF);

  if (settings.tagline) appendText(settings.tagline + '\n');
  appendText(settings.address + '\n');
  appendText(`TIN: ${settings.tin} | Tel: ${settings.phone}\n`);
  if (settings.machineIdentificationNumber) {
    appendText(`MIN: ${settings.machineIdentificationNumber}\n`);
  }
  if (settings.permitNumber) {
    appendText(`Permit No: ${settings.permitNumber}\n`);
  }
  appendText(formatDivider('=', width));

  // 3. Order Metadata (Left aligned)
  append(ESC_POS.ALIGN_LEFT);
  appendText(formatTwoColumns('ORDER NO:', `#${order.orderNumber}`, width));
  appendText(formatTwoColumns('DATE/TIME:', new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }), width));
  appendText(formatTwoColumns('CASHIER:', order.cashierName, width));
  appendText(formatTwoColumns('ORDER TYPE:', order.orderType.toUpperCase().replace('_', ' ') + (order.tableNumber ? ` (${order.tableNumber})` : ''), width));
  if (order.customerName) {
    appendText(formatTwoColumns('CUSTOMER:', order.customerName, width));
  }
  if (order.seniorPwdId) {
    append(ESC_POS.BOLD_ON);
    appendText(formatTwoColumns('SC/PWD ID:', `${order.seniorPwdId} (RA 9994)`, width));
    append(ESC_POS.BOLD_OFF);
  }
  appendText(formatDivider('-', width));

  // 4. Line Items
  appendText(formatTwoColumns('ITEM DESCRIPTION', 'AMOUNT', width));
  appendText(formatDivider('-', width));

  for (const item of order.items) {
    const qtyPrice = `${item.quantity} x ${settings.currencySymbol}${item.unitPrice.toFixed(2)}`;
    const lineSubtotal = `${settings.currencySymbol}${item.subtotal.toFixed(2)}`;
    appendText(item.name + '\n');
    appendText(formatTwoColumns(`  ${qtyPrice}`, lineSubtotal, width));
    if (item.notes) {
      appendText(`  * Note: ${item.notes}\n`);
    }
  }
  appendText(formatDivider('-', width));

  // 5. Totals & Tax Accounting
  appendText(formatTwoColumns('SUBTOTAL:', `${settings.currencySymbol}${order.subtotal.toFixed(2)}`, width));
  if (order.discountAmount > 0) {
    appendText(formatTwoColumns(`DISCOUNT (${(order.discountRate * 100).toFixed(0)}%):`, `-${settings.currencySymbol}${order.discountAmount.toFixed(2)}`, width));
  }

  if (order.vatExemptSales && order.vatExemptSales > 0) {
    appendText(formatTwoColumns('VAT-Exempt Sales (SC/PWD):', `${settings.currencySymbol}${order.vatExemptSales.toFixed(2)}`, width));
  } else {
    appendText(formatTwoColumns('VATable Sales (12%):', `${settings.currencySymbol}${(order.vatableSales || (order.total / 1.12)).toFixed(2)}`, width));
    appendText(formatTwoColumns('12% Output VAT:', `${settings.currencySymbol}${order.taxAmount.toFixed(2)}`, width));
  }

  appendText(formatDivider('=', width));

  append(ESC_POS.BOLD_ON);
  if (!is58mm) append(ESC_POS.DOUBLE_SIZE);
  appendText(formatTwoColumns('TOTAL DUE:', `${settings.currencySymbol}${order.total.toFixed(2)}`, is58mm ? width : Math.floor(width / 2)));
  append(ESC_POS.NORMAL_SIZE);
  append(ESC_POS.BOLD_OFF);

  appendText(formatDivider('-', width));

  // 6. Tender & Payment
  appendText(formatTwoColumns(`PAYMENT (${order.paymentMethod.toUpperCase()}):`, `${settings.currencySymbol}${order.amountPaid.toFixed(2)}`, width));
  if (order.change > 0) {
    append(ESC_POS.BOLD_ON);
    appendText(formatTwoColumns('CHANGE:', `${settings.currencySymbol}${order.change.toFixed(2)}`, width));
    append(ESC_POS.BOLD_OFF);
  }
  if (order.referenceNo) {
    appendText(formatTwoColumns('REF NO:', order.referenceNo, width));
  }

  // 7. Footer & BIR Accreditation
  appendText(formatDivider('=', width));
  append(ESC_POS.ALIGN_CENTER);
  appendText('THIS SERVES AS AN OFFICIAL SALES INVOICE\n');
  if (settings.receiptFooterMessage) {
    appendText(settings.receiptFooterMessage + '\n');
  }
  appendText(`ServeFlow POS v2.0 - Offline IndexedDB\n`);

  // 8. Bottom Paper Feed Margin (prevents auto-cutter from slicing text)
  appendText('\n\n\n\n');

  // 9. Auto Cut
  if (shouldCut) {
    append(ESC_POS.CUT_FEED);
  }

  // Merge chunks into single Uint8Array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Trigger manual cash drawer pop pulse via standard ESC/POS command
 */
export function generateCashDrawerKick(): Uint8Array {
  const buffer = new Uint8Array(ESC_POS.INIT.length + ESC_POS.DRAWER_KICK.length);
  buffer.set(ESC_POS.INIT, 0);
  buffer.set(ESC_POS.DRAWER_KICK, ESC_POS.INIT.length);
  return buffer;
}

/**
 * Download raw ESC/POS binary file (.bin) for printer spooler / RawBT / CUPS
 */
export function downloadEscPosFile(bytes: Uint8Array, filename = 'receipt.bin'): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Direct print via Chromium Web Serial API (USB-to-Serial / RS232 thermal printers)
 */
export async function printViaWebSerial(bytes: Uint8Array): Promise<{ success: boolean; message: string }> {
  // @ts-expect-error - Web Serial API
  if (!navigator.serial) {
    return { success: false, message: 'Web Serial API is not supported in this browser. Use Chrome/Edge desktop.' };
  }
  try {
    // @ts-expect-error - Web Serial API
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    const writer = port.writable.getWriter();
    await writer.write(bytes);
    writer.releaseLock();
    await port.close();
    return { success: true, message: 'Receipt dispatched directly to Serial POS printer!' };
  } catch (err: unknown) {
    return { success: false, message: `Serial print aborted or failed: ${(err as Error)?.message}` };
  }
}
