import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Check,
  Download,
  ImagePlus,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from './studioUtils';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceState {
  docTitle: string;
  invoiceNumber: string;
  currency: string;
  paperSize: 'letter' | 'a4';
  accentColor: string;
  issueDate: string;
  terms: 'receipt' | 'net15' | 'net30' | 'net45';
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  fromTaxId: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  poNumber: string;
  items: LineItem[];
  discountType: 'percent' | 'flat';
  discountValue: number;
  taxRate: number;
  amountPaid: number;
  notes: string;
  paymentInstructions: string;
  logoDataUrl: string | null;
}

const STORAGE_KEY = 'taprico-invoice-defaults-v1';

const ACCENT_PRESETS = [
  { label: 'Indigo', hex: '#4f46e5' },
  { label: 'Obsidian', hex: '#0f172a' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Ocean', hex: '#0284c7' },
  { label: 'Rose', hex: '#e11d48' },
];

function addDaysIso(baseIso: string, days: number): string {
  const dt = new Date(`${baseIso}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return baseIso;
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function createInitialState(today = '2026-11-17'): InvoiceState {
  return {
    docTitle: 'INVOICE',
    invoiceNumber: 'INV-2026-014',
    currency: 'USD',
    paperSize: 'letter',
    accentColor: '#4f46e5',
    issueDate: today,
    terms: 'net30',
    dueDate: addDaysIso(today, 30),
    fromName: 'Northstar Studio LLC',
    fromEmail: 'billing@northstarstudio.co',
    fromAddress: '548 Market St, Suite 41200\nSan Francisco, CA 94104',
    fromTaxId: 'EIN 88-4120934 · Form W-9 on file',
    toName: 'Acme SaaS Inc.',
    toEmail: 'ap@acmesaas.com',
    toAddress: '2200 Clarendon Blvd\nArlington, VA 22201',
    poNumber: 'PO-4402',
    items: [
      { id: '1', description: 'Senior Full-Stack Engineering Sprint (Next.js & Postgres API)', quantity: 35, rate: 145 },
      { id: '2', description: 'Stripe Webhook & Billing Ledger Integration', quantity: 10, rate: 145 },
      { id: '3', description: 'Cloudflare Edge Caching & Performance Audit', quantity: 1, rate: 850 },
    ],
    discountType: 'percent',
    discountValue: 0,
    taxRate: 0,
    amountPaid: 0,
    notes: 'Thank you for your partnership! Please reference the invoice number on ACH or wire transfers.',
    paymentInstructions:
      'ACH / Direct Deposit (US):\nBank: Mercury / Choice Financial\nRouting #: 091311229 · Account #: 4029184420\nZelle / Wire: billing@northstarstudio.co',
    logoDataUrl: null,
  };
}

export default function InvoiceGenerator() {
  const [inv, setInv] = useState<InvoiceState>(() => createInitialState('2026-11-17'));
  const [savedNotice, setSavedNotice] = useState(false);

  // Load saved business defaults + today's local date on client mount
  useEffect(() => {
    const today = getTodayIso();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setInv((prev) => ({
          ...prev,
          issueDate: today,
          dueDate: addDaysIso(today, 30),
        }));
        return;
      }
      const saved = JSON.parse(raw) as Partial<InvoiceState>;
      setInv((prev) => ({
        ...prev,
        issueDate: today,
        dueDate: addDaysIso(today, 30),
        fromName: saved.fromName ?? prev.fromName,
        fromEmail: saved.fromEmail ?? prev.fromEmail,
        fromAddress: saved.fromAddress ?? prev.fromAddress,
        fromTaxId: saved.fromTaxId ?? prev.fromTaxId,
        paymentInstructions: saved.paymentInstructions ?? prev.paymentInstructions,
        notes: saved.notes ?? prev.notes,
        accentColor: saved.accentColor ?? prev.accentColor,
        currency: saved.currency ?? prev.currency,
        paperSize: saved.paperSize ?? prev.paperSize,
        logoDataUrl: saved.logoDataUrl ?? prev.logoDataUrl,
      }));
    } catch {
      // ignore storage parse failure
    }
  }, []);

  const totals = useMemo(() => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const discountAmount =
      inv.discountType === 'percent'
        ? subtotal * (Math.min(100, Math.max(0, inv.discountValue)) / 100)
        : Math.max(0, inv.discountValue);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableBase * (Math.max(0, inv.taxRate) / 100);
    const total = taxableBase + taxAmount;
    const balanceDue = Math.max(0, total - Math.max(0, inv.amountPaid));
    return { subtotal, discountAmount, taxAmount, total, balanceDue };
  }, [inv.items, inv.discountType, inv.discountValue, inv.taxRate, inv.amountPaid]);

  const updateField = <K extends keyof InvoiceState>(key: K, val: InvoiceState[K]) => {
    setInv((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'issueDate' || key === 'terms') {
        const dMap = { receipt: 0, net15: 15, net30: 30, net45: 45 };
        next.dueDate = addDaysIso(next.issueDate, dMap[next.terms]);
      }
      return next;
    });
  };

  const updateItem = (id: string, field: keyof LineItem, val: string | number) => {
    setInv((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: val } : it)),
    }));
  };

  const addItem = () => {
    setInv((prev) => ({
      ...prev,
      items: [...prev.items, { id: String(Date.now()), description: 'Consulting Service', quantity: 1, rate: 125 }],
    }));
  };

  const removeItem = (id: string) => {
    setInv((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((i) => i.id !== id) : prev.items,
    }));
  };

  const handleLogoUpload = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => updateField('logoDataUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const saveDefaults = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fromName: inv.fromName,
          fromEmail: inv.fromEmail,
          fromAddress: inv.fromAddress,
          fromTaxId: inv.fromTaxId,
          paymentInstructions: inv.paymentInstructions,
          notes: inv.notes,
          accentColor: inv.accentColor,
          currency: inv.currency,
          paperSize: inv.paperSize,
          logoDataUrl: inv.logoDataUrl,
        })
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    } catch {
      // ignore quota error
    }
  };

  const generateVectorPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: inv.paperSize,
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentW = pageW - margin * 2;
    const [r, g, b] = hexToRgb(inv.accentColor);

    // Top Accent Bar
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageW, 8, 'F');

    let y = 46;

    // Optional Logo + From Info
    if (inv.logoDataUrl) {
      try {
        const format = inv.logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(inv.logoDataUrl, format, margin, y - 8, 52, 52, undefined, 'FAST');
      } catch {
        // skip invalid image format
      }
    }

    const fromX = inv.logoDataUrl ? margin + 64 : margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(inv.fromName || 'Your Business Name', fromX, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const fromLines = [
      inv.fromEmail,
      ...inv.fromAddress.split('\n').filter(Boolean),
      inv.fromTaxId,
    ].filter(Boolean);
    doc.text(fromLines, fromX, y + 22);

    // Right Header: Title + Invoice Meta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(r, g, b);
    doc.text(inv.docTitle || 'INVOICE', pageW - margin, y + 8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`# ${inv.invoiceNumber}`, pageW - margin, y + 26, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Issued: ${inv.issueDate}`, pageW - margin, y + 42, { align: 'right' });
    doc.text(`Due: ${inv.dueDate}`, pageW - margin, y + 56, { align: 'right' });
    if (inv.poNumber.trim()) {
      doc.text(`PO #: ${inv.poNumber}`, pageW - margin, y + 70, { align: 'right' });
    }

    y = Math.max(y + 92, y + 24 + fromLines.length * 13 + 18);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, y, pageW - margin, y);
    y += 22;

    // Bill To + Balance Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('BILL TO', margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(inv.toName || 'Client Name', margin, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const toLines = [inv.toEmail, ...inv.toAddress.split('\n').filter(Boolean)].filter(Boolean);
    doc.text(toLines, margin, y + 31);

    // Balance Summary Card on Right
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(pageW - margin - 185, y - 8, 185, 58, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('BALANCE DUE', pageW - margin - 14, y + 10, { align: 'right' });
    doc.setFontSize(18);
    doc.setTextColor(r, g, b);
    doc.text(formatCurrency(totals.balanceDue, inv.currency), pageW - margin - 14, y + 34, { align: 'right' });

    y += Math.max(76, 36 + toLines.length * 13 + 14);

    // Table Header
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, contentW, 24, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION', margin + 10, y + 15);
    doc.text('QTY', pageW - margin - 165, y + 15, { align: 'right' });
    doc.text('RATE', pageW - margin - 90, y + 15, { align: 'right' });
    doc.text('AMOUNT', pageW - margin - 10, y + 15, { align: 'right' });
    y += 32;

    // Table Rows
    inv.items.forEach((item, index) => {
      const descLines = doc.splitTextToSize(item.description || 'Service item', contentW - 220) as string[];
      const rowH = Math.max(24, descLines.length * 12 + 12);

      if (y + rowH > pageH - 170) {
        doc.addPage();
        y = 48;
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 10, contentW, rowH, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(descLines, margin + 10, y + 4);
      doc.text(String(item.quantity), pageW - margin - 165, y + 4, { align: 'right' });
      doc.text(formatCurrency(item.rate, inv.currency), pageW - margin - 90, y + 4, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.quantity * item.rate, inv.currency), pageW - margin - 10, y + 4, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + rowH - 10, pageW - margin, y + rowH - 10);
      y += rowH;
    });

    y += 14;

    // Totals Block
    const totalsX = pageW - margin - 210;
    const addTotalRow = (label: string, val: string, bold = false, highlight = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 11 : 9.5);
      if (highlight) doc.setTextColor(r, g, b);
      else doc.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);
      doc.text(label, totalsX, y);
      doc.text(val, pageW - margin - 8, y, { align: 'right' });
      y += bold ? 18 : 15;
    };

    addTotalRow('Subtotal', formatCurrency(totals.subtotal, inv.currency));
    if (totals.discountAmount > 0) {
      addTotalRow(
        inv.discountType === 'percent' ? `Discount (${inv.discountValue}%)` : 'Discount',
        `-${formatCurrency(totals.discountAmount, inv.currency)}`
      );
    }
    if (inv.taxRate > 0) {
      addTotalRow(`Tax (${inv.taxRate}%)`, formatCurrency(totals.taxAmount, inv.currency));
    }
    addTotalRow('Total', formatCurrency(totals.total, inv.currency), true);
    if (inv.amountPaid > 0) {
      addTotalRow('Amount Paid', `-${formatCurrency(inv.amountPaid, inv.currency)}`);
      addTotalRow('Balance Due', formatCurrency(totals.balanceDue, inv.currency), true, true);
    }

    y += 16;

    // Payment Instructions & Notes
    if (y > pageH - 130) {
      doc.addPage();
      y = 48;
    }

    if (inv.paymentInstructions.trim()) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const payLines = doc.splitTextToSize(inv.paymentInstructions, contentW - 24) as string[];
      const boxH = payLines.length * 12 + 28;
      doc.roundedRect(margin, y, contentW, boxH, 6, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(r, g, b);
      doc.text('PAYMENT INSTRUCTIONS', margin + 12, y + 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(payLines, margin + 12, y + 30);
      y += boxH + 14;
    }

    if (inv.notes.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('NOTES', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(inv.notes, contentW) as string[];
      doc.text(noteLines, margin, y + 14);
    }

    const safeFile = (inv.invoiceNumber || 'invoice').replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`${safeFile}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme:</span>
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => updateField('accentColor', c.hex)}
                className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                  inv.accentColor === c.hex ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <select
            value={inv.currency}
            onChange={(e) => updateField('currency', e.target.value)}
            aria-label="Currency"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <option value="USD" className="dark:bg-slate-900">USD ($)</option>
            <option value="CAD" className="dark:bg-slate-900">CAD ($)</option>
            <option value="GBP" className="dark:bg-slate-900">GBP (£)</option>
            <option value="EUR" className="dark:bg-slate-900">EUR (€)</option>
            <option value="AUD" className="dark:bg-slate-900">AUD ($)</option>
          </select>

          <select
            value={inv.paperSize}
            onChange={(e) => updateField('paperSize', e.target.value as 'letter' | 'a4')}
            aria-label="Paper size"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            <option value="letter" className="dark:bg-slate-900">US Letter (8.5×11")</option>
            <option value="a4" className="dark:bg-slate-900">A4 International</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer"
          >
            {savedNotice ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
            {savedNotice ? 'Saved Profile!' : 'Save Business Defaults'}
          </button>

          <button
            type="button"
            onClick={() => setInv(createInitialState(getTodayIso()))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>

          <button
            type="button"
            onClick={generateVectorPdf}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Vector PDF
          </button>
        </div>
      </div>

      {/* Main Split: Left Form Editor / Right Crisp US Letter Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Editor */}
        <div className="no-print xl:col-span-6 space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] p-5 shadow-xl">
          {/* Logo & Doc Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] p-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-500 cursor-pointer">
              <ImagePlus className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="truncate">{inv.logoDataUrl ? 'Change Logo' : 'Upload Logo'}</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
            </label>
            <input
              type="text"
              value={inv.docTitle}
              onChange={(e) => updateField('docTitle', e.target.value)}
              placeholder="INVOICE"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={inv.invoiceNumber}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              placeholder="INV-2026-001"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-3 py-2 font-mono text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Dates & Terms */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Issue Date</label>
              <input
                type="date"
                value={inv.issueDate}
                onChange={(e) => updateField('issueDate', e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Terms</label>
              <select
                value={inv.terms}
                onChange={(e) => updateField('terms', e.target.value as InvoiceState['terms'])}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="receipt" className="dark:bg-slate-900">Due on Receipt</option>
                <option value="net15" className="dark:bg-slate-900">Net 15</option>
                <option value="net30" className="dark:bg-slate-900">Net 30</option>
                <option value="net45" className="dark:bg-slate-900">Net 45</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Due Date</label>
              <input
                type="date"
                value={inv.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">PO # (Optional)</label>
              <input
                type="text"
                value={inv.poNumber}
                onChange={(e) => updateField('poNumber', e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* From & Bill To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090e1b] p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">From (Your Business)</div>
              <input
                type="text"
                value={inv.fromName}
                onChange={(e) => updateField('fromName', e.target.value)}
                placeholder="Your Name / LLC"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold"
              />
              <input
                type="email"
                value={inv.fromEmail}
                onChange={(e) => updateField('fromEmail', e.target.value)}
                placeholder="billing@yourcompany.com"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
              <textarea
                rows={2}
                value={inv.fromAddress}
                onChange={(e) => updateField('fromAddress', e.target.value)}
                placeholder="Street, City, State ZIP"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
              <input
                type="text"
                value={inv.fromTaxId}
                onChange={(e) => updateField('fromTaxId', e.target.value)}
                placeholder="EIN / W-9 Note"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090e1b] p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Bill To (Client)</div>
              <input
                type="text"
                value={inv.toName}
                onChange={(e) => updateField('toName', e.target.value)}
                placeholder="Client Company Name"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold"
              />
              <input
                type="email"
                value={inv.toEmail}
                onChange={(e) => updateField('toEmail', e.target.value)}
                placeholder="ap@client.com"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
              <textarea
                rows={3}
                value={inv.toAddress}
                onChange={(e) => updateField('toAddress', e.target.value)}
                placeholder="Client Billing Address"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Line Items</span>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/15 border border-indigo-500/30 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {inv.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090e1b] p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Deliverable or service..."
                    className="col-span-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 0)}
                    aria-label="Quantity"
                    className="col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-right font-mono text-xs"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value) || 0)}
                    aria-label="Rate"
                    className="col-span-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-right font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="col-span-1 flex justify-center text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount / Tax / Deposit */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Discount</label>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] overflow-hidden">
                <input
                  type="number"
                  min={0}
                  value={inv.discountValue}
                  onChange={(e) => updateField('discountValue', Number(e.target.value) || 0)}
                  className="w-full bg-transparent px-2 py-1.5 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateField('discountType', inv.discountType === 'percent' ? 'flat' : 'percent')}
                  className="border-l border-slate-200 dark:border-slate-700 px-2 font-mono font-bold text-indigo-500 cursor-pointer"
                >
                  {inv.discountType === 'percent' ? '%' : '$'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Sales Tax (%)</label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={inv.taxRate}
                onChange={(e) => updateField('taxRate', Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Deposit Paid</label>
              <input
                type="number"
                min={0}
                value={inv.amountPaid}
                onChange={(e) => updateField('amountPaid', Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] px-2.5 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          {/* Payment Instructions & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                ACH / Wire / Payment Instructions
              </label>
              <textarea
                rows={4}
                value={inv.paymentInstructions}
                onChange={(e) => updateField('paymentInstructions', e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Notes / Terms
              </label>
              <textarea
                rows={4}
                value={inv.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#090e1b] p-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Crisp White Paper Preview */}
        <div className="xl:col-span-6 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 p-3 sm:p-5 border border-slate-300 dark:border-slate-800">
          <div className="print-only-sheet mx-auto max-w-[680px] rounded-xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
            <div className="h-2 w-full" style={{ backgroundColor: inv.accentColor }} />
            <div className="p-6 sm:p-8 space-y-6 text-xs">
              {/* Header */}
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-start gap-3">
                  {inv.logoDataUrl && (
                    <img src={inv.logoDataUrl} alt="Company Logo" className="h-14 w-14 rounded-lg object-contain border border-slate-100" />
                  )}
                  <div className="space-y-0.5">
                    <div className="text-lg font-extrabold text-slate-900">{inv.fromName}</div>
                    <div className="text-slate-500">{inv.fromEmail}</div>
                    <div className="whitespace-pre-line text-slate-500">{inv.fromAddress}</div>
                    {inv.fromTaxId && <div className="text-[11px] font-medium text-slate-400 pt-0.5">{inv.fromTaxId}</div>}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-2xl font-black tracking-tight" style={{ color: inv.accentColor }}>
                    {inv.docTitle}
                  </div>
                  <div className="font-mono font-bold text-slate-800"># {inv.invoiceNumber}</div>
                  <div className="text-slate-500">Issued: {inv.issueDate}</div>
                  <div className="text-slate-500 font-medium">Due: {inv.dueDate}</div>
                  {inv.poNumber && <div className="text-slate-500">PO: {inv.poNumber}</div>}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Bill To & Balance Box */}
              <div className="flex flex-wrap justify-between gap-4 items-start">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bill To</div>
                  <div className="text-sm font-bold text-slate-900">{inv.toName}</div>
                  <div className="text-slate-500">{inv.toEmail}</div>
                  <div className="whitespace-pre-line text-slate-500">{inv.toAddress}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right min-w-[175px]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance Due</div>
                  <div className="mt-0.5 text-xl font-black tabular-nums" style={{ color: inv.accentColor }}>
                    {formatCurrency(totals.balanceDue, inv.currency)}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-white text-[10px] uppercase tracking-wider" style={{ backgroundColor: inv.accentColor }}>
                      <th className="py-2.5 px-3 font-bold">Description</th>
                      <th className="py-2.5 px-2 font-bold text-right">Qty</th>
                      <th className="py-2.5 px-2 font-bold text-right">Rate</th>
                      <th className="py-2.5 px-3 font-bold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inv.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 text-slate-800">{item.description}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                          {formatCurrency(item.rate, inv.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {formatCurrency(item.quantity * item.rate, inv.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatCurrency(totals.subtotal, inv.currency)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">-{formatCurrency(totals.discountAmount, inv.currency)}</span>
                    </div>
                  )}
                  {inv.taxRate > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax ({inv.taxRate}%)</span>
                      <span className="font-mono tabular-nums">{formatCurrency(totals.taxAmount, inv.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-sm text-slate-900">
                    <span>Total</span>
                    <span className="font-mono tabular-nums">{formatCurrency(totals.total, inv.currency)}</span>
                  </div>
                  {inv.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>Deposit Paid</span>
                        <span className="font-mono tabular-nums">-{formatCurrency(inv.amountPaid, inv.currency)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-sm" style={{ color: inv.accentColor }}>
                        <span>Balance Due</span>
                        <span className="font-mono tabular-nums">{formatCurrency(totals.balanceDue, inv.currency)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Instructions & Notes */}
              {inv.paymentInstructions.trim() && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: inv.accentColor }}>
                    Payment Instructions
                  </div>
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed">{inv.paymentInstructions}</p>
                </div>
              )}

              {inv.notes.trim() && (
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Notes: </span>
                  {inv.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
