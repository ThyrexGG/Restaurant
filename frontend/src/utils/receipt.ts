// Receipt layout for the 58mm thermal printer (32 characters per line).
// Pure functions only (no Bluetooth) so the layout can be previewed and tested.

export const COLS = 32;
const KHR_PER_USD = 4000;

// Edit these to change the header and footer text
export const SHOP = {
  name: 'BEST KHMER RESTAURANT',
  tagline: '',
  phone: '',
  footerLines: ['THANK YOU!', 'Please come again']
};

export interface ReceiptLine {
  text: string;
  align?: 'left' | 'center' | 'right';
  size?: 'normal' | 'tall' | 'big';
  bold?: boolean;
}

// The printer only understands basic ASCII; anything else prints as garbage
export const toAscii = (s: unknown) =>
  String(s ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const money = (n: number) => `$${n.toFixed(2)}`;

// Word-wrap; the first line may be narrower than the rest (it shares its row with the price)
function wrap(text: string, firstWidth: number, restWidth: number): string[] {
  const out: string[] = [];
  let line = '';
  let width = firstWidth;
  for (let word of text.split(' ').filter(Boolean)) {
    while (word.length > width) {
      // A single word longer than the line: fill what is left, then continue on a new line
      const room = line ? width - line.length - 1 : width;
      if (line && room < 6) {
        out.push(line);
        line = '';
        width = restWidth;
        continue;
      }
      const cut = line ? `${line} ${word.slice(0, room)}` : word.slice(0, room);
      out.push(cut);
      word = word.slice(room);
      line = '';
      width = restWidth;
    }
    if (!word) continue;
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      out.push(line);
      line = word;
      width = restWidth;
    }
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

const row = (left: string, right: string) => {
  const gap = COLS - left.length - right.length;
  return gap >= 1 ? left + ' '.repeat(gap) + right : `${left} ${right}`;
};

function formatDate(value: unknown) {
  const d = new Date(value as any);
  const date = isNaN(d.getTime()) ? new Date() : d;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()} ${h % 12 || 12}:${min} ${h >= 12 ? 'PM' : 'AM'}`;
}

// "20261007-012" -> "012". The database id is never shown: it is not a readable number.
function orderNumber(order: any): string {
  if (order.dailyOrderNumber) return String(order.dailyOrderNumber);
  const n = order.orderNumber;
  if (typeof n === 'string' && n.includes('-')) return n.split('-')[1] ?? '';
  return '';
}

function tableLabel(order: any): string {
  const t = toAscii(order.table).replace(/^table\s*/i, '');
  return !t || /^(n\/a|na|undefined|null|none|-)$/i.test(t) ? '' : t.toUpperCase();
}

function typeLabel(order: any): string {
  const t = toAscii(order.type || order.diningType || 'DINE_IN').replace(/[_-]/g, ' ').toUpperCase();
  return t === 'TAKEOUT' ? 'TAKE OUT' : t;
}

// Same dish added twice (e.g. on a combined table bill) prints as one line
function mergeItems(items: any[]) {
  const merged = new Map<string, { name: string; price: number; quantity: number; notes: string }>();
  for (const it of items || []) {
    const name = toAscii(it.name) || 'Item';
    const price = Number(it.price) || 0;
    const notes = toAscii(it.notes);
    const quantity = Number(it.quantity) || 1;
    const key = `${name}|${price}|${notes}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += quantity;
    else merged.set(key, { name, price, quantity, notes });
  }
  return [...merged.values()];
}

export function buildReceipt(order: any): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  const add = (text: string, opts: Omit<ReceiptLine, 'text'> = {}) => lines.push({ text, ...opts });
  const rule = (ch = '-') => add(ch.repeat(COLS));

  // Header
  // The logo bitmap is printed above these lines by printer.ts
  add(SHOP.name, { align: 'center', bold: true });
  if (SHOP.tagline) add(SHOP.tagline, { align: 'center' });
  if (SHOP.phone) add(`Tel: ${SHOP.phone}`, { align: 'center' });
  rule('=');

  // Order info
  const num = orderNumber(order);
  const date = formatDate(order.timestamp || order.date || order.createdAt);
  add(num ? row(`Order #${num}`, date) : date);
  const type = typeLabel(order);
  const table = tableLabel(order);
  if (table) {
    add(type);
    add(`TABLE ${table}`, { align: 'center', size: 'tall', bold: true });
  } else {
    add(type, { align: 'center', size: 'tall', bold: true });
  }
  rule();

  // Items: "2x Name wraps nicely ...... $8.00", unit price and notes underneath
  const items = mergeItems(order.items);
  let count = 0;
  for (const it of items) {
    count += it.quantity;
    const qty = `${it.quantity}x`.padEnd(4);
    const price = money(it.price * it.quantity);
    const nameLines = wrap(it.name, COLS - 4 - price.length - 1, COLS - 4);
    add(row(qty + nameLines[0], price), { bold: true });
    for (const extra of nameLines.slice(1)) add(' '.repeat(4) + extra, { bold: true });
    if (it.quantity > 1) add(`    @ ${money(it.price)} each`);
    for (const note of it.notes.split('|').map(n => n.trim()).filter(Boolean)) {
      const noteLines = wrap(note, COLS - 6, COLS - 6);
      noteLines.forEach((l, i) => add(`${i === 0 ? '  - ' : '    '}${l}`));
    }
    add('');
  }
  if (items.length === 0) add('(no items)', { align: 'center' });
  rule();

  // Total
  const total = Number(order.total) || 0;
  add(row('Items', String(count)));
  const totalText = `TOTAL ${money(total)}`;
  if (totalText.length * 2 <= COLS) add(totalText, { align: 'center', size: 'big', bold: true });
  else add(row('TOTAL', money(total)), { bold: true });
  add(`${Math.round(total * KHR_PER_USD).toLocaleString('en-US')} KHR`, { align: 'center', size: 'tall', bold: true });
  rule('=');

  // Footer
  SHOP.footerLines.forEach((f, i) => add(f, { align: 'center', bold: i === 0 }));
  return lines;
}

// Plain-text version for previews and tests (big/tall text is marked, not enlarged)
export function receiptToText(lines: ReceiptLine[]): string {
  return lines
    .map(l => {
      const width = l.size === 'big' ? COLS / 2 : COLS;
      const pad = l.align === 'center' ? Math.max(0, Math.floor((width - l.text.length) / 2)) : 0;
      const text = ' '.repeat(pad) + l.text;
      return l.size && l.size !== 'normal' ? `${text}   [${l.size}${l.bold ? ',bold' : ''}]` : text;
    })
    .join('\n');
}
