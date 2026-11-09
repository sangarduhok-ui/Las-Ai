import { useState, useRef, useEffect } from "react";
import {
  Receipt,
  FileText,
  FileSpreadsheet,
  Truck,
  ShoppingCart,
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  Copy,
  Check,
  Building2,
  User,
  Calendar,
  DollarSign,
  Palette,
  Eye,
  Edit3,
  Sparkles,
  RefreshCw,
  Stamp,
  Globe,
  Percent,
} from "lucide-react";

export type DocType = "invoice" | "receipt" | "quotation" | "purchase_order" | "delivery_note";
export type TemplateStyle = "modern" | "classic" | "corporate" | "minimal" | "emerald";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // in percent
  tax: number; // in percent
}

export interface InvoiceData {
  docType: DocType;
  docNumber: string;
  date: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | "PENDING" | "OVERDUE";
  currency: string;
  
  // Seller
  companyName: string;
  companyLogo: string | null;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyTaxId: string;

  // Buyer
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientTaxId: string;

  // Items
  items: InvoiceItem[];

  // Extras
  notes: string;
  terms: string;
  taxRate: number; // general tax if applicable
  shippingFee: number;
  discountAmount: number;
  paymentMethod: string;
  bankDetails: string;
  signatureName: string;
}

const DEFAULT_INVOICE_DATA: InvoiceData = {
  docType: "invoice",
  docNumber: "INV-2026-001",
  date: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  status: "UNPAID",
  currency: "$",

  companyName: "کۆمپانیا تەکنەلۆژیایا پێشکەفتی",
  companyLogo: null,
  companyAddress: "جادەیا سەرەکی، دهۆک / هەولێر / سلێمانی",
  companyPhone: "+964 750 123 4567",
  companyEmail: "info@company.com",
  companyTaxId: "TRN-998877",

  clientName: "ڕێزدار محەمەد ئەحمەد",
  clientAddress: "تاخێ ئازادی، کۆڵانا 12",
  clientPhone: "+964 750 765 4321",
  clientEmail: "client@example.com",
  clientTaxId: "",

  items: [
    {
      id: "1",
      description: "دیزاین و پێشڤەبرنا سیستەمێ وێب و ئەپڵیکەیشنان (Web Development)",
      quantity: 1,
      unitPrice: 450,
      discount: 0,
      tax: 0,
    },
    {
      id: "2",
      description: "شێوەرمەندی و ڕاهێنانا ستافی ل سەر پلاتفۆڕما ژیرییا دەستکرد",
      quantity: 3,
      unitPrice: 75,
      discount: 10,
      tax: 0,
    },
    {
      id: "3",
      description: "خزمەتگوزاریا هۆستینگ و دۆمەینێ لەزگین (ساڵانە)",
      quantity: 1,
      unitPrice: 120,
      discount: 0,
      tax: 0,
    },
  ],

  notes: "سوپاس بۆ باوەری و مامەلەکرنا هەوە دگەل کۆمپانیا مە.",
  terms: "هیڤیدارین کوژمێ پارەی د ماوێ دیاریکریدا ب ئێک ژ شێوازێن پارەدانی ب دووماهی بینن.",
  taxRate: 0,
  shippingFee: 0,
  discountAmount: 0,
  paymentMethod: "کاش / حەواڵە / FIB / FastPay",
  bankDetails: "FIB Account: 0750 123 4567 / Bank Name: RT Bank",
  signatureName: "ڕێڤەبەرێ دارایی و فرۆتنێ",
};

const DOC_TITLES: Record<DocType, { ku: string; en: string; prefix: string; icon: any; color: string }> = {
  invoice: { ku: "فاکتۆرا فرۆتنێ", en: "INVOICE", prefix: "INV", icon: FileText, color: "blue" },
  receipt: { ku: "پسوولەیا پارەدانی و وەرگرتنێ", en: "PAYMENT RECEIPT", prefix: "REC", icon: Receipt, color: "emerald" },
  quotation: { ku: "پێشنیازا بهایی (تەخمین)", en: "PRICE QUOTATION", prefix: "QTN", icon: FileSpreadsheet, color: "purple" },
  purchase_order: { ku: "داخوازی و فەرمانا کڕینێ", en: "PURCHASE ORDER", prefix: "PO", icon: ShoppingCart, color: "amber" },
  delivery_note: { ku: "پسوولەیا گەهاندنا کەلۆپەلان", en: "DELIVERY NOTE", prefix: "DLV", icon: Truck, color: "rose" },
};

export function InvoiceGenerator({ initialDocType = "invoice" }: { initialDocType?: DocType }) {
  const [data, setData] = useState<InvoiceData>({
    ...DEFAULT_INVOICE_DATA,
    docType: initialDocType,
    docNumber: `${DOC_TITLES[initialDocType].prefix}-${new Date().getFullYear()}-001`,
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [template, setTemplate] = useState<TemplateStyle>("modern");
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync docType change with appropriate prefix
  const handleTypeChange = (type: DocType) => {
    setData((prev) => ({
      ...prev,
      docType: type,
      docNumber: `${DOC_TITLES[type].prefix}-${new Date().getFullYear()}-001`,
    }));
  };

  // Calculations
  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const discounted = lineTotal - (lineTotal * (item.discount || 0)) / 100;
      return sum + discounted;
    }, 0);
  };

  const calculateTotalDiscount = () => {
    const itemsDiscount = data.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      return sum + (lineTotal * (item.discount || 0)) / 100;
    }, 0);
    return itemsDiscount + (data.discountAmount || 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (data.taxRate || 0)) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTaxAmount();
    const shipping = data.shippingFee || 0;
    return subtotal + tax + shipping - (data.discountAmount || 0);
  };

  // Item Handlers
  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(36).substring(2, 9),
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          tax: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: val } : item)),
    }));
  };

  // Logo Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData((prev) => ({ ...prev, companyLogo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Isolated Print Handler: Prints ONLY the invoice/receipt without website navbar, sidebar, or controls
  const handlePrint = () => {
    setIsPrinting(true);
    const invoiceEl = document.getElementById("printable-invoice");
    if (!invoiceEl) {
      window.print();
      setIsPrinting(false);
      return;
    }

    // Create an isolated hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      setIsPrinting(false);
      return;
    }

    // Collect all stylesheets and style definitions
    let styles = "";
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      styles += node.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ckb">
        <head>
          <meta charset="utf-8" />
          <title>${data.docNumber || "Invoice"}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              direction: rtl;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-invoice {
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
              width: 100% !important;
              max-width: 850px !important;
              margin: 0 auto !important;
              min-height: auto !important;
              padding: 24px !important;
              display: block !important;
              visibility: visible !important;
            }
          </style>
        </head>
        <body>
          ${invoiceEl.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setIsPrinting(false);
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  };

  // Export to Microsoft Excel (.xlsx) Handler
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const docTitleKu = DOC_TITLES[data.docType]?.ku || "فاکتۆرا فەرمی";
      const docTitleEn = DOC_TITLES[data.docType]?.en || "INVOICE";

      // Prepare rich worksheet content
      const rows: any[][] = [
        [`${docTitleEn} - ${docTitleKu}`, "", "", "", "", ""],
        [],
        ["هژمارا بەڵگەنامەیێ (Doc #):", data.docNumber, "", "مێژوویا دەرچوونێ (Date):", data.date],
        ["دراڤ (Currency):", data.currency, "", "دووماهیک ژڤان (Due Date):", data.dueDate],
        ["دۆخێ دانێ (Status):", data.status],
        [],
        ["=== زانیاریێن فرۆشیاری (From) ===", "", "", "=== زانیاریێن کڕیاری (Bill To) ==="],
        ["ناڤێ کۆمپانیایێ:", data.companyName, "", "ناڤێ کڕیاری:", data.clientName],
        ["هژمارا پەیوەندیێ:", data.companyPhone, "", "تەلەفۆنا کڕیاری:", data.clientPhone],
        ["ئیمەیل:", data.companyEmail, "", "ئیمەیلێ کڕیاری:", data.clientEmail],
        ["ناڤونیشان:", data.companyAddress, "", "ناڤونیشانێ کڕیاری:", data.clientAddress],
        [],
        [
          "#",
          "وەسف / ناڤێ کەلۆپەل و خزمەتگوزاریێ (Description)",
          "هژمار (Quantity)",
          `بهایێ ئێک دانە (${data.currency})`,
          "داشکاندن (%)",
          `سەرجەمێ گشتی (${data.currency})`,
        ],
      ];

      // Add item rows
      data.items.forEach((item, index) => {
        const lineTotal = item.quantity * item.unitPrice;
        const finalLine = lineTotal - (lineTotal * (item.discount || 0)) / 100;
        rows.push([
          index + 1,
          item.description || "—",
          item.quantity,
          item.unitPrice,
          item.discount ? `${item.discount}%` : 0,
          finalLine,
        ]);
      });

      // Totals
      rows.push([]);
      rows.push(["", "", "", "", "سەرجەمێ دەستپێکی (Subtotal):", calculateSubtotal()]);
      if (data.discountAmount > 0) {
        rows.push(["", "", "", "", "داشکاندنا زێدە (Discount):", -data.discountAmount]);
      }
      if (data.taxRate > 0) {
        rows.push(["", "", "", "", `باج (Tax ${data.taxRate}%):`, calculateTaxAmount()]);
      }
      if (data.shippingFee > 0) {
        rows.push(["", "", "", "", "تێچوونا گەهاندنێ (Shipping):", data.shippingFee]);
      }
      rows.push(["", "", "", "", "سەرجەمێ گشتی (Grand Total):", calculateGrandTotal()]);

      // Notes & Bank Details
      rows.push([]);
      if (data.paymentMethod) {
        rows.push(["شێوازێ پارەدانی (Payment Method):", data.paymentMethod]);
      }
      if (data.bankDetails) {
        rows.push(["زانیاریێن حیسابا بانکێ (Bank Details):", data.bankDetails]);
      }
      if (data.terms) {
        rows.push(["مەرجێن مامەلێ (Terms & Conditions):", data.terms]);
      }
      if (data.notes) {
        rows.push(["تێبینی و ڕێنمایی (Notes):", data.notes]);
      }
      if (data.signatureName) {
        rows.push(["ئیمزا و مۆر (Authorized Signature):", data.signatureName]);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Set clean column widths for Excel
      ws["!cols"] = [
        { wch: 8 },  // #
        { wch: 45 }, // Description
        { wch: 16 }, // Quantity
        { wch: 22 }, // Unit Price
        { wch: 16 }, // Discount
        { wch: 24 }, // Total
      ];

      // Enable right-to-left in Excel
      if (!ws["!views"]) ws["!views"] = [];
      ws["!views"].push({ rightToLeft: true });

      XLSX.utils.book_append_sheet(wb, ws, docTitleEn.substring(0, 30));

      const fileCleanName = `${docTitleEn}_${data.docNumber || "Doc"}_${data.date || ""}`
        .replace(/[\/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_");

      // Generate ArrayBuffer and create explicit Blob download with .xlsx MIME type and exact filename
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileCleanName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      setExcelSuccess(true);
      setTimeout(() => setExcelSuccess(false), 2500);
    } catch (err) {
      console.error("Excel export error:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Copy JSON Backup
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMeta = DOC_TITLES[data.docType];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Global Print Isolation Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside, footer, .sidebar, #sidebar {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" /> سیستەمێ چێکرنا فاکتۆر و پسوولەیێن فەرمی
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              Professional Invoice & Receipt Generator
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View / Edit Mode Switch */}
            <div className="flex items-center p-1 rounded-xl bg-secondary border border-border">
              <button
                onClick={() => setActiveTab("edit")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "edit" ? "bg-primary text-primary-foreground shadow-sm font-extrabold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                دەستکاریکرن
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "preview" ? "bg-primary text-primary-foreground shadow-sm font-extrabold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                پێشبینی
              </button>
            </div>

            {/* Export & Print Group: Always side-by-side */}
            <div className="flex items-center gap-1.5">
              {/* Print / Save as PDF Button */}
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                title="تەنها چاپکرن یان خەزنکرنا وەسلێ ب شێوازێ PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                {isPrinting ? "ئامادەکاری..." : "چاپکرن / PDF"}
              </button>

              {/* Microsoft Excel (.xlsx) Export Button */}
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className={`py-1.5 px-3 rounded-xl text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                  excelSuccess
                    ? "bg-emerald-700"
                    : "bg-[#107c41] hover:bg-[#0c6334]"
                }`}
                title="داگرتنا وەسلێ وەک فایلی فەرمیێ Microsoft Excel (.xlsx)"
              >
                {excelSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    سەرکەوت!
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                    {isExportingExcel ? "ئامادەکرن..." : "فایلی Excel (.xlsx)"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 5 Main Document Types Selection */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-secondary/60 border border-border mb-6">
          {(Object.keys(DOC_TITLES) as DocType[]).map((type) => {
            const item = DOC_TITLES[type];
            const Icon = item.icon;
            const isSelected = data.docType === type;
            const typeColorStyles: Record<DocType, string> = {
              invoice: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25",
              receipt: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25",
              quotation: "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25",
              purchase_order: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25",
              delivery_note: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25",
            };

            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isSelected
                    ? `${typeColorStyles[type]} font-extrabold scale-[1.02]`
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.en} ({item.ku.split(" ")[0]})</span>
              </button>
            );
          })}
        </div>

        {/* Template Design Preset Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">دیزاینا تێمپلەیتی (Style):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "modern", label: "Modern Blue (مۆدێرن)" },
              { id: "emerald", label: "Emerald Clean (سەوز)" },
              { id: "corporate", label: "Corporate Dark (ڕەش و شین)" },
              { id: "minimal", label: "Minimalist (سادە)" },
              { id: "classic", label: "Classic Studio (کلاسیک)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as TemplateStyle)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  template === t.id
                    ? "bg-primary/10 border-primary text-primary font-black ring-2 ring-primary/20"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "edit" ? (
        /* ========================================================================= */
        /* EDITING MODE FORM                                                         */
        /* ========================================================================= */
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-8 animate-in fade-in-0 duration-200">
          {/* Section 1: Header Meta (Doc No, Date, Currency, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/[0.08] via-blue-500/[0.05] to-cyan-500/[0.08] dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-cyan-950/40 border-2 border-indigo-200/90 dark:border-indigo-800/70 shadow-xs">
            <div>
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 mb-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                هژمارا بەڵگەنامەیێ (Doc #):
              </label>
              <input
                type="text"
                dir="ltr"
                value={data.docNumber}
                onChange={(e) => setData({ ...data, docNumber: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                مێژوویا دەرچوونێ (Date):
              </label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-blue-200 dark:border-blue-800 text-xs font-mono text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                دووماهیک ژڤان (Due Date):
              </label>
              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-purple-200 dark:border-purple-800 text-xs font-mono text-foreground focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-cyan-950 dark:text-cyan-200 flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                دراڤ (Currency):
              </label>
              <select
                value={data.currency}
                onChange={(e) => setData({ ...data, currency: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-background border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-foreground focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition shadow-2xs cursor-pointer"
              >
                <option value="$">$ USD (دۆلار)</option>
                <option value="د.ع">د.ع IQD (دینارێ عێراقی)</option>
                <option value="€">€ EUR (یۆرۆ)</option>
                <option value="£">£ GBP (پاوەند)</option>
                <option value="TL">TL TRY (لیرەیا تورکی)</option>
                <option value="AED">AED (دیرهەمێ ئیماراتی)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Seller & Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller Information (Corporate Blue Theme) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-500/[0.06] to-blue-500/[0.02] dark:from-blue-950/35 dark:to-blue-950/15 border-2 border-blue-200/90 dark:border-blue-800/70 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200/80 dark:border-blue-800/60">
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </span>
                  زانیاریێن فرۆشیاری / کۆمپانیا (From)
                </span>
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> بارکرنا لۆگۆی
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-blue-900/80 dark:text-blue-300/80 block mb-1">ناڤێ کۆمپانیایێ یان دوکانێ:</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="ناڤێ کۆمپانیایێ"
                  className="w-full h-9 px-3 rounded-xl bg-background border border-blue-200/90 dark:border-blue-900/70 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-blue-900/80 dark:text-blue-300/80 block mb-1">هژمارا پەیوەندیێ:</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={data.companyPhone}
                    onChange={(e) => setData({ ...data, companyPhone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-blue-200/90 dark:border-blue-900/70 text-xs text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-900/80 dark:text-blue-300/80 block mb-1">ئیمەیل:</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={data.companyEmail}
                    onChange={(e) => setData({ ...data, companyEmail: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-blue-200/90 dark:border-blue-900/70 text-xs text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-blue-900/80 dark:text-blue-300/80 block mb-1">ناڤونیشان:</label>
                <input
                  type="text"
                  value={data.companyAddress}
                  onChange={(e) => setData({ ...data, companyAddress: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-blue-200/90 dark:border-blue-900/70 text-xs text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* Client Information (Emerald Green Theme) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-500/[0.06] to-emerald-500/[0.02] dark:from-emerald-950/35 dark:to-emerald-950/15 border-2 border-emerald-200/90 dark:border-emerald-800/70 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                    <User className="w-4 h-4" />
                  </span>
                  زانیاریێن کڕیاری / مشتەری (Bill To)
                </span>
                <select
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value as any })}
                  className={`h-7 px-2.5 rounded-lg border text-[11px] font-extrabold focus:outline-none transition cursor-pointer ${
                    data.status === "PAID"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                      : data.status === "OVERDUE"
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300"
                      : data.status === "PENDING"
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                      : "bg-background border-emerald-300 dark:border-emerald-800 text-foreground"
                  }`}
                >
                  <option value="UNPAID">نەهاتیە دان (UNPAID)</option>
                  <option value="PAID">هاتیە دان (PAID)</option>
                  <option value="PENDING">د چاڤەڕوانیێدا (PENDING)</option>
                  <option value="OVERDUE">بەسەرڤەچووی (OVERDUE)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300/80 block mb-1">ناڤێ کڕیاری / کۆمپانیا:</label>
                <input
                  type="text"
                  value={data.clientName}
                  onChange={(e) => setData({ ...data, clientName: e.target.value })}
                  placeholder="ناڤێ کڕیاری"
                  className="w-full h-9 px-3 rounded-xl bg-background border border-emerald-200/90 dark:border-emerald-900/70 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300/80 block mb-1">تەلەفۆنا کڕیاری:</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={data.clientPhone}
                    onChange={(e) => setData({ ...data, clientPhone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-emerald-200/90 dark:border-emerald-900/70 text-xs text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300/80 block mb-1">ئیمەیلێ کڕیاری:</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={data.clientEmail}
                    onChange={(e) => setData({ ...data, clientEmail: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl bg-background border border-emerald-200/90 dark:border-emerald-900/70 text-xs text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-900/80 dark:text-emerald-300/80 block mb-1">ناڤونیشانێ کڕیاری:</label>
                <input
                  type="text"
                  value={data.clientAddress}
                  onChange={(e) => setData({ ...data, clientAddress: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-emerald-200/90 dark:border-emerald-900/70 text-xs text-foreground focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Items Table (Royal Violet Theme) */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-500/[0.05] to-purple-500/[0.02] dark:from-purple-950/25 dark:to-purple-950/10 border-2 border-purple-200/90 dark:border-purple-800/70 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </span>
                خشتەیا کەلۆپەل و خزمەتگوزارییان (Items List)
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-500/25 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> زێدەکرنا ڕیزێ
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-background shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-purple-500/10 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800/60 font-extrabold text-purple-950 dark:text-purple-200">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[220px]">وەسف / ناڤێ کەلۆپەل یان خزمەتگوزاریێ</th>
                    <th className="p-3 w-24 text-center">هژمار (Qty)</th>
                    <th className="p-3 w-32 text-center">بهایێ ئێک دانە ({data.currency})</th>
                    <th className="p-3 w-24 text-center">داشکاندن (%)</th>
                    <th className="p-3 w-32 text-center">سەرجەمێ گشتی ({data.currency})</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-900/30">
                  {data.items.map((item, idx) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const finalLine = lineTotal - (lineTotal * (item.discount || 0)) / 100;
                    return (
                      <tr key={item.id} className="hover:bg-purple-500/[0.04] transition">
                        <td className="p-2.5 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{idx + 1}</td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="ناڤێ کەلۆپەل یان خزمەتگوزاریێ..."
                            className="w-full h-8 px-2.5 rounded-lg bg-background border border-purple-200 dark:border-purple-900/50 text-xs text-foreground focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Math.max(1, Number(e.target.value)))}
                            className="w-full h-8 px-2 text-center font-mono rounded-lg bg-background border border-purple-200 dark:border-purple-900/50 text-xs text-foreground focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                            className="w-full h-8 px-2 text-center font-mono rounded-lg bg-background border border-purple-200 dark:border-purple-900/50 text-xs text-foreground focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, "discount", Math.min(100, Math.max(0, Number(e.target.value))))}
                            className="w-full h-8 px-2 text-center font-mono rounded-lg bg-background border border-purple-200 dark:border-purple-900/50 text-xs text-foreground focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-purple-700 dark:text-purple-300">
                          {finalLine.toLocaleString()} {data.currency}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={data.items.length <= 1}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Extra Terms, Bank & Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Notes & Bank Details (Warm Amber Theme) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-b from-amber-500/[0.06] to-amber-500/[0.02] dark:from-amber-950/25 dark:to-amber-950/10 border-2 border-amber-200/90 dark:border-amber-800/70 space-y-4 shadow-xs">
              <div>
                <label className="text-xs font-bold text-amber-950 dark:text-amber-200 block mb-1">تێبینی و ڕێنمایی (Notes):</label>
                <textarea
                  rows={2}
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-background border border-amber-200 dark:border-amber-900/50 text-xs text-foreground focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-950 dark:text-amber-200 block mb-1">مەرجێن مامەلێ (Terms & Conditions):</label>
                <textarea
                  rows={2}
                  value={data.terms}
                  onChange={(e) => setData({ ...data, terms: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-background border border-amber-200 dark:border-amber-900/50 text-xs text-foreground focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-amber-950 dark:text-amber-200 block mb-1">زانیاریێن حیسابا بانکێ / ئەکاونت:</label>
                  <input
                    type="text"
                    value={data.bankDetails}
                    onChange={(e) => setData({ ...data, bankDetails: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-xl bg-background border border-amber-200 dark:border-amber-900/50 text-xs text-foreground focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-950 dark:text-amber-200 block mb-1">ناڤونیشانێ ئیمزا / مۆرکەری:</label>
                  <input
                    type="text"
                    value={data.signatureName}
                    onChange={(e) => setData({ ...data, signatureName: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-xl bg-background border border-amber-200 dark:border-amber-900/50 text-xs text-foreground focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Box (Emerald & Teal Financial Theme) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.05] to-cyan-500/[0.08] dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border-2 border-emerald-300 dark:border-emerald-700/60 space-y-3.5 shadow-md">
              <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200 pb-2.5 border-b border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                کۆکرنا دووماهیێ (Summary & Totals)
              </h4>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>سەرجەمێ دەستپێکی (Subtotal):</span>
                <span className="font-mono font-bold text-foreground">
                  {calculateSubtotal().toLocaleString()} {data.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">داشکاندنا زێدە ({data.currency}):</span>
                <input
                  type="number"
                  min="0"
                  value={data.discountAmount}
                  onChange={(e) => setData({ ...data, discountAmount: Number(e.target.value) })}
                  className="w-24 h-7 px-2 text-center font-mono rounded-lg bg-background border border-emerald-200 dark:border-emerald-900/50 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">باج / VAT (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.taxRate}
                  onChange={(e) => setData({ ...data, taxRate: Number(e.target.value) })}
                  className="w-24 h-7 px-2 text-center font-mono rounded-lg bg-background border border-emerald-200 dark:border-emerald-900/50 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">تێچوونا گەهاندنێ ({data.currency}):</span>
                <input
                  type="number"
                  min="0"
                  value={data.shippingFee}
                  onChange={(e) => setData({ ...data, shippingFee: Number(e.target.value) })}
                  className="w-24 h-7 px-2 text-center font-mono rounded-lg bg-background border border-emerald-200 dark:border-emerald-900/50 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/40 flex justify-between items-center">
                <span className="text-sm font-black text-emerald-950 dark:text-emerald-200">سەرجەمێ گشتی (Grand Total):</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {calculateGrandTotal().toLocaleString()} {data.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* PRINT & PREVIEW A4 CANVAS (Visible in Preview Mode AND during Print)       */}
      {/* ========================================================================= */}
      <div className={`${activeTab === "preview" ? "block" : "hidden print:block"} animate-in fade-in-0 duration-200`}>
        <div
          id="printable-invoice"
          className={`max-w-[850px] mx-auto p-8 sm:p-12 rounded-3xl border shadow-2xl transition-all duration-300 font-sans ${
            template === "modern"
              ? "bg-white text-slate-900 border-slate-200"
              : template === "emerald"
              ? "bg-white text-emerald-950 border-emerald-200"
              : template === "corporate"
              ? "bg-white text-slate-900 border-slate-900/20"
              : template === "minimal"
              ? "bg-white text-neutral-900 border-neutral-200"
              : "bg-white text-slate-950 border-slate-300"
          }`}
          style={{ minHeight: "1050px" }}
        >
          {/* Top Decorative Bar based on template */}
          {template === "modern" && (
            <div className="h-3.5 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl" />
          )}
          {template === "emerald" && (
            <div className="h-3.5 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-8 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 rounded-t-3xl" />
          )}
          {template === "corporate" && (
            <div className="h-3.5 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-8 bg-slate-900 rounded-t-3xl" />
          )}

          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {data.companyLogo ? (
                <img
                  src={data.companyLogo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  {data.companyName.charAt(0) || "C"}
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {data.companyName}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{data.companyAddress}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{data.companyPhone}</span>
                  <span>•</span>
                  <span>{data.companyEmail}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right self-stretch sm:self-auto flex flex-col justify-between">
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-black uppercase tracking-wider block ${
                    template === "emerald" ? "text-emerald-700" : "text-blue-700"
                  }`}
                >
                  {currentMeta.en}
                </span>
                <span className="text-xs font-bold text-slate-500 block mt-0.5">
                  {currentMeta.ku}
                </span>
              </div>

              <div className="mt-3 inline-block">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    data.status === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : data.status === "UNPAID"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {data.status === "PAID"
                    ? "هاتیە دان (PAID)"
                    : data.status === "UNPAID"
                    ? "نەهاتیە دان (UNPAID)"
                    : data.status === "PENDING"
                    ? "د چاڤەڕوانیێدا (PENDING)"
                    : "بەسەرڤەچووی (OVERDUE)"}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block mb-1">هژمارا فاکتۆرێ (Invoice No):</span>
              <span className="font-mono font-black text-sm text-slate-900">{data.docNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">مێژوو (Date):</span>
              <span className="font-mono font-bold text-slate-800">{data.date}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">دووماهیک ژڤان (Due Date):</span>
              <span className="font-mono font-bold text-slate-800">{data.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-1">دراڤێ مامەلێ (Currency):</span>
              <span className="font-bold text-slate-800">{data.currency}</span>
            </div>
          </div>

          {/* Bill To / Client Details */}
          <div className="py-6 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              بۆ ڕێزدار (Billed To):
            </span>
            <div className="text-sm">
              <h3 className="font-black text-base text-slate-900">{data.clientName}</h3>
              <p className="text-xs text-slate-600 mt-1">{data.clientAddress}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                <span>{data.clientPhone}</span>
                {data.clientEmail && (
                  <>
                    <span>•</span>
                    <span>{data.clientEmail}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800 font-black">
                  <th className="pb-3 w-8 text-center">#</th>
                  <th className="pb-3">وەسف / کەلۆپەل (Item Description)</th>
                  <th className="pb-3 w-20 text-center">هژمار</th>
                  <th className="pb-3 w-28 text-center">بهایێ ئێک دانە</th>
                  <th className="pb-3 w-20 text-center">داشکاندن</th>
                  <th className="pb-3 w-32 text-left">سەرجەمێ گشتی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  const finalLine = lineTotal - (lineTotal * (item.discount || 0)) / 100;
                  return (
                    <tr key={item.id}>
                      <td className="py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 font-bold text-slate-900">{item.description || "—"}</td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-center font-mono">
                        {item.unitPrice.toLocaleString()} {data.currency}
                      </td>
                      <td className="py-3 text-center font-mono">
                        {item.discount > 0 ? `${item.discount}%` : "—"}
                      </td>
                      <td className="py-3 text-left font-mono font-bold text-slate-900">
                        {finalLine.toLocaleString()} {data.currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t-2 border-slate-800 items-start">
            {/* Payment Info & Terms */}
            <div className="space-y-3 text-xs text-slate-600">
              {data.paymentMethod && (
                <div>
                  <span className="font-bold text-slate-800 block">شێوازێ پارەدانی:</span>
                  <span>{data.paymentMethod}</span>
                </div>
              )}
              {data.bankDetails && (
                <div>
                  <span className="font-bold text-slate-800 block">حیسابا بانکێ:</span>
                  <span className="font-mono">{data.bankDetails}</span>
                </div>
              )}
              {data.terms && (
                <div>
                  <span className="font-bold text-slate-800 block">مەرج:</span>
                  <span className="text-[11px] leading-relaxed">{data.terms}</span>
                </div>
              )}
              {data.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                  <strong>تێبینی:</strong> {data.notes}
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>سەرجەمێ دەستپێکی (Subtotal):</span>
                <span className="font-mono font-bold text-slate-900">
                  {calculateSubtotal().toLocaleString()} {data.currency}
                </span>
              </div>

              {calculateTotalDiscount() > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>سەرجەمێ داشکاندنێ (Discount):</span>
                  <span className="font-mono font-bold">
                    -{calculateTotalDiscount().toLocaleString()} {data.currency}
                  </span>
                </div>
              )}

              {data.taxRate > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>باج (Tax {data.taxRate}%):</span>
                  <span className="font-mono font-bold">
                    +{calculateTaxAmount().toLocaleString()} {data.currency}
                  </span>
                </div>
              )}

              {data.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>گەهاندن (Shipping):</span>
                  <span className="font-mono font-bold">
                    +{data.shippingFee.toLocaleString()} {data.currency}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center text-sm font-black text-slate-950">
                <span>سەرجەمێ گشتی (Grand Total):</span>
                <span className="text-lg font-mono text-blue-700">
                  {calculateGrandTotal().toLocaleString()} {data.currency}
                </span>
              </div>

              {/* Signature / Stamp line */}
              <div className="pt-8 text-center sm:text-left">
                <div className="inline-block border-t border-slate-400 pt-1.5 min-w-[160px]">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {data.signatureName || "ئیمزا و مۆر"}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block">
                    Authorized Signature
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
