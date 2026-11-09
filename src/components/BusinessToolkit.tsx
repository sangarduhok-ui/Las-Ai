import { useState, useId } from "react";
import {
  TrendingUp,
  Percent,
  Wallet,
  Tag,
  CreditCard,
  ArrowRightLeft,
  Target,
  BarChart3,
  FileSpreadsheet,
  DollarSign,
  Calculator,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  PieChart as PieIcon,
  ShieldCheck,
  Building,
  Coins,
} from "lucide-react";
import { InvoiceGenerator } from "./InvoiceGenerator";

export type BusinessToolId =
  | "profit_calc"
  | "vat_calc"
  | "salary_calc"
  | "discount_calc"
  | "loan_calc"
  | "currency_calc"
  | "breakeven_calc"
  | "roi_calc"
  | "invoice_gen";

// ==========================================
// 1. PROFIT CALCULATOR
// ==========================================
export function ProfitCalculator() {
  const [costPrice, setCostPrice] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(85);
  const [units, setUnits] = useState<number>(100);
  const [operatingExpenses, setOperatingExpenses] = useState<number>(500);
  const [currency, setCurrency] = useState<string>("$");

  const totalCost = costPrice * units;
  const totalRevenue = sellingPrice * units;
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - operatingExpenses;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const markupPercent = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;
  const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> هژمێرەرا قازانج و داهاتی
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Profit & Margin Calculator</h3>
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="h-9 px-3 rounded-xl bg-secondary border border-border text-xs font-bold"
        >
          <option value="$">$ USD</option>
          <option value="د.ع">د.ع IQD</option>
          <option value="€">€ EUR</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              تێچوونا کڕین / چێکرنا ئێک دانە (Cost Price):
            </label>
            <input
              type="number"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              بهایێ فرۆتنا ئێک دانە (Selling Price):
            </label>
            <input
              type="number"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              هژمارا دانەیێن هاتینە فرۆتن (Units Sold):
            </label>
            <input
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              مەسرەفێن دی یێن بگەڕخستنێ (کرێ، ریکلام، هتد):
            </label>
            <input
              type="number"
              min="0"
              value={operatingExpenses}
              onChange={(e) => setOperatingExpenses(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Output Cards */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
              قازانجێ پۆختە (Net Profit):
            </span>
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {netProfit.toLocaleString()} {currency}
            </span>
            <span className="text-xs text-muted-foreground block mt-1 font-bold">
              ڕێژەیا قازانجێ پۆختە: {netMarginPercent.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">سەرجەمێ داهاتی (Revenue):</span>
              <span className="text-base font-black font-mono text-foreground">
                {totalRevenue.toLocaleString()} {currency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">قازانجێ خاڤ (Gross):</span>
              <span className="text-base font-black font-mono text-foreground">
                {grossProfit.toLocaleString()} {currency}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">Profit Margin:</span>
              <span className="text-base font-black font-mono text-primary">
                {marginPercent.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border">
              <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">Markup Rate:</span>
              <span className="text-base font-black font-mono text-primary">
                {markupPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. VAT CALCULATOR
// ==========================================
export function VatCalculator() {
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState<number>(1000);
  const [vatRate, setVatRate] = useState<number>(15);
  const [currency, setCurrency] = useState<string>("$");

  let netAmount = 0;
  let vatAmount = 0;
  let grossAmount = 0;

  if (mode === "add") {
    netAmount = amount;
    vatAmount = (amount * vatRate) / 100;
    grossAmount = amount + vatAmount;
  } else {
    grossAmount = amount;
    netAmount = amount / (1 + vatRate / 100);
    vatAmount = grossAmount - netAmount;
  }

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
            <Percent className="w-3.5 h-3.5" /> هژمێرەرا باجێ بهایێ زێدەکری (VAT)
          </div>
          <h3 className="text-xl font-extrabold text-foreground">VAT Calculator</h3>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setMode("add")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === "add" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            زێدەکرنا باجێ (Add VAT)
          </button>
          <button
            onClick={() => setMode("remove")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === "remove" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            دەرئینانا باجێ (Remove VAT)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              {mode === "add" ? "کوژمێ پارەی بەری باجێ (Net Amount):" : "سەرجەمێ پارەی دگەل باجێ (Gross Amount):"}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">ڕێژەیا باجێ (% VAT Rate):</label>
            <div className="flex gap-1.5 mb-2">
              {[5, 10, 15, 18, 20].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setVatRate(rate)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                    vatRate === rate
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={vatRate}
              onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">
              کوژمێ باجێ (VAT Amount):
            </span>
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {vatAmount.toFixed(2)} {currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">کوژمێ بێ باج (Net):</span>
            <span className="font-mono font-bold text-base text-foreground">{netAmount.toFixed(2)} {currency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground">سەرجەمێ گشتی دگەل باجێ (Gross):</span>
            <span className="font-mono font-black text-base text-primary">{grossAmount.toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. SALARY CALCULATOR
// ==========================================
export function SalaryCalculator() {
  const [baseSalary, setBaseSalary] = useState<number>(1200);
  const [overtimeHours, setOvertimeHours] = useState<number>(10);
  const [overtimeRate, setOvertimeRate] = useState<number>(10);
  const [bonuses, setBonuses] = useState<number>(150);
  const [deductions, setDeductions] = useState<number>(80);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [currency, setCurrency] = useState<string>("$");

  const overtimePay = overtimeHours * overtimeRate;
  const grossSalary = baseSalary + overtimePay + bonuses;
  const taxAmount = (grossSalary * taxPercent) / 100;
  const totalDeductions = deductions + taxAmount;
  const netSalary = grossSalary - totalDeductions;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold mb-2">
            <Wallet className="w-3.5 h-3.5" /> هژمێرەرا مووچەی و دەمژمێرێن زێدە
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Salary & Payroll Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3.5 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">مووچەیێ بنەڕەتی (Base Salary):</label>
            <input
              type="number"
              min="0"
              value={baseSalary}
              onChange={(e) => setBaseSalary(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">دەمژمێرێن زێدە (Overtime):</label>
              <input
                type="number"
                min="0"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Math.max(0, Number(e.target.value)))}
                className="w-full h-9 px-2 text-center font-mono rounded-lg bg-background border border-border text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">بهایێ دەمژمێرێ ({currency}):</label>
              <input
                type="number"
                min="0"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(Math.max(0, Number(e.target.value)))}
                className="w-full h-9 px-2 text-center font-mono rounded-lg bg-background border border-border text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">پاداشت و دەرماڵە (Bonuses):</label>
              <input
                type="number"
                min="0"
                value={bonuses}
                onChange={(e) => setBonuses(Math.max(0, Number(e.target.value)))}
                className="w-full h-9 px-2 text-center font-mono rounded-lg bg-background border border-border text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">بڕینا ئێکسەر (Deductions):</label>
              <input
                type="number"
                min="0"
                value={deductions}
                onChange={(e) => setDeductions(Math.max(0, Number(e.target.value)))}
                className="w-full h-9 px-2 text-center font-mono rounded-lg bg-background border border-border text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">ڕێژەیا باجا داهاتی (% Income Tax):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-violet-500/10 border-2 border-violet-500/30">
            <span className="text-xs font-bold text-violet-800 dark:text-violet-300 block mb-1">
              مووچەیێ پۆختە یێ وەرگرتی (Net Take-Home Salary):
            </span>
            <span className="text-3xl font-black font-mono text-violet-600 dark:text-violet-400">
              {netSalary.toFixed(2)} {currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">سەرجەمێ مووچەیێ خاڤ (Gross):</span>
            <span className="font-mono font-bold text-foreground">{grossSalary.toFixed(2)} {currency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">پارەیێ دەمژمێرێن زێدە (Overtime):</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{overtimePay.toFixed(2)} {currency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">سەرجەمێ باج و بڕینان (Total Deductions):</span>
            <span className="font-mono font-bold text-destructive">-{totalDeductions.toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. DISCOUNT CALCULATOR
// ==========================================
export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("$");

  const firstDiscountAmount = (originalPrice * discountPercent) / 100;
  const priceAfterFirst = originalPrice - firstDiscountAmount;
  const extraDiscountAmount = (priceAfterFirst * extraDiscount) / 100;
  const finalPrice = priceAfterFirst - extraDiscountAmount;
  const totalSaved = originalPrice - finalPrice;
  const effectivePercent = originalPrice > 0 ? (totalSaved / originalPrice) * 100 : 0;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
            <Tag className="w-3.5 h-3.5" /> هژمێرەرا داشکاندن و پاشەکەوتی
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Discount & Sale Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">بهایێ دەستپێکی (Original Price):</label>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">ڕێژەیا داشکاندنێ (% Discount):</label>
            <div className="flex gap-1.5 mb-2">
              {[10, 20, 25, 50, 70].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountPercent(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                    discountPercent === d
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}%
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">داشکاندنا دووێ / کۆپۆن (% Extra Promo):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={extraDiscount}
              onChange={(e) => setExtraDiscount(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs font-mono"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
              بهایێ دووماهیێ پشتی داشکاندنێ (Final Price):
            </span>
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {finalPrice.toFixed(2)} {currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">کوژمێ پاشەکەوتکری (You Save):</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {totalSaved.toFixed(2)} {currency} ({effectivePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. LOAN & EMI CALCULATOR
// ==========================================
export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(20000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [years, setYears] = useState<number>(5);
  const [currency, setCurrency] = useState<string>("$");

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = years * 12;

  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  } else {
    monthlyPayment = loanAmount / totalMonths;
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" /> هژمێرەرا قەرز و قیستێ مەهانە
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Loan & EMI Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">کوژمێ قەرزی (Loan Amount):</label>
            <input
              type="number"
              min="0"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">ڕێژەیا فایدا ساڵانە (% Annual Interest):</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={interestRate}
              onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">ماوێ دانەڤەیێ (ساڵ / Years):</label>
            <input
              type="number"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30">
            <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 block mb-1">
              قیستێ مەهانە (Monthly Payment / EMI):
            </span>
            <span className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {monthlyPayment.toFixed(2)} {currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">سەرجەمێ فایدا هاتیە دان (Total Interest):</span>
            <span className="font-mono font-bold text-destructive">{totalInterest.toFixed(2)} {currency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">سەرجەمێ گشتی یێ کوژمێ زڤڕاندی (Total Payment):</span>
            <span className="font-mono font-black text-foreground">{totalPayment.toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. CURRENCY CONVERTER
// ==========================================
export function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("IQD");
  const [customRate, setCustomRate] = useState<number>(1530); // 1 USD = 1530 IQD

  const ratesToUSD: Record<string, number> = {
    USD: 1,
    IQD: 1 / 1530,
    EUR: 1.08,
    GBP: 1.28,
    TRY: 0.031,
    AED: 0.27,
    SAR: 0.27,
  };

  const convertValue = () => {
    if (fromCurr === "USD" && toCurr === "IQD") {
      return amount * customRate;
    }
    if (fromCurr === "IQD" && toCurr === "USD") {
      return customRate > 0 ? amount / customRate : 0;
    }
    const inUSD = amount * ratesToUSD[fromCurr];
    const target = inUSD / ratesToUSD[toCurr];
    return target;
  };

  const converted = convertValue();

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
            <Coins className="w-3.5 h-3.5" /> گوهۆڕکەرێ لەزگینێ دراڤان
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Currency Converter</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 space-y-2">
          <label className="text-xs font-bold text-foreground block">کوژمێ دراڤی (Amount):</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="md:col-span-3 space-y-2">
          <label className="text-xs font-bold text-foreground block">ژ (From):</label>
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-bold font-mono"
          >
            <option value="USD">USD ($)</option>
            <option value="IQD">IQD (د.ع)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="TRY">TRY (TL)</option>
            <option value="AED">AED (دیرهەم)</option>
          </select>
        </div>

        <div className="md:col-span-1 flex items-center justify-center pt-5">
          <button
            onClick={() => {
              const temp = fromCurr;
              setFromCurr(toCurr);
              setToCurr(temp);
            }}
            className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition cursor-pointer"
            title="پێچەوانەکرن"
          >
            <ArrowRightLeft className="w-4 h-4 text-primary" />
          </button>
        </div>

        <div className="md:col-span-4 space-y-2">
          <label className="text-xs font-bold text-foreground block">بۆ (To):</label>
          <select
            value={toCurr}
            onChange={(e) => setToCurr(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-xs font-bold font-mono"
          >
            <option value="IQD">IQD (د.ع)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="TRY">TRY (TL)</option>
            <option value="AED">AED (دیرهەم)</option>
          </select>
        </div>
      </div>

      {(fromCurr === "USD" || toCurr === "USD") && (fromCurr === "IQD" || toCurr === "IQD") && (
        <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="text-muted-foreground font-bold">دەستکاریکرنا بهایێ دۆلاری بۆ دیناری (100 دۆلار = {customRate * 100} د.ع):</span>
          <div className="flex items-center gap-2">
            <span className="font-bold">1 دۆلار =</span>
            <input
              type="number"
              value={customRate}
              onChange={(e) => setCustomRate(Number(e.target.value))}
              className="w-24 h-7 px-2 text-center font-mono rounded-lg bg-background border border-border text-xs font-bold"
            />
            <span>د.ع</span>
          </div>
        </div>
      )}

      {/* Big Result Box */}
      <div className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 text-center space-y-1">
        <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
          ئەنجامێ گوهۆڕینێ (Converted Value):
        </span>
        <span className="text-4xl font-black font-mono text-rose-600 dark:text-rose-400">
          {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurr}
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 7. BREAK-EVEN CALCULATOR
// ==========================================
export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<number>(3000); // Rent, salaries
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(20);
  const [salePricePerUnit, setSalePricePerUnit] = useState<number>(50);
  const [currency, setCurrency] = useState<string>("$");

  const contributionMargin = salePricePerUnit - variableCostPerUnit;
  const contributionRatio = salePricePerUnit > 0 ? (contributionMargin / salePricePerUnit) * 100 : 0;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * salePricePerUnit;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5" /> خالا یەکسانبوونێ (Break-even Point)
          </div>
          <h3 className="text-xl font-extrabold text-foreground">Break-Even Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              مەسرەفێن جێگیر (Fixed Costs - کرێ، مووچە، سێرڤەر):
            </label>
            <input
              type="number"
              min="0"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              تێچوونا گوهۆڕۆک یا هەر ئێک دانە (Variable Cost Per Unit):
            </label>
            <input
              type="number"
              min="0"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              بهایێ فرۆتنا هەر ئێک دانە (Sale Price Per Unit):
            </label>
            <input
              type="number"
              min="0"
              value={salePricePerUnit}
              onChange={(e) => setSalePricePerUnit(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-teal-500/10 border-2 border-teal-500/30">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 block mb-1">
              هژمارا فرۆتنا پێدڤی بۆ پڕکرنا مەسرەفان (Break-Even Units):
            </span>
            <span className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
              {breakEvenUnits.toLocaleString()} دانە
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">سەرجەمێ داهاتێ یەکسانبوونێ (Break-Even Revenue):</span>
            <span className="font-mono font-black text-foreground">{breakEvenRevenue.toLocaleString()} {currency}</span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">Contribution Margin Per Unit:</span>
            <span className="font-mono font-bold text-primary">{contributionMargin.toLocaleString()} {currency} ({contributionRatio.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. ROI CALCULATOR
// ==========================================
export function RoiCalculator() {
  const [investedAmount, setInvestedAmount] = useState<number>(5000);
  const [returnedAmount, setReturnedAmount] = useState<number>(8500);
  const [durationYears, setDurationYears] = useState<number>(2);
  const [currency, setCurrency] = useState<string>("$");

  const netProfit = returnedAmount - investedAmount;
  const totalRoi = investedAmount > 0 ? (netProfit / investedAmount) * 100 : 0;
  const annualizedRoi =
    durationYears > 0 && investedAmount > 0
      ? (Math.pow(returnedAmount / investedAmount, 1 / durationYears) - 1) * 100
      : totalRoi;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> زڤڕینا وەبەرهێنانێ (Return On Investment)
          </div>
          <h3 className="text-xl font-extrabold text-foreground">ROI Calculator</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 p-5 rounded-2xl bg-secondary/30 border border-border">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">کوژمێ سەرمایێ دانای (Invested Amount):</label>
            <input
              type="number"
              min="0"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">سەرجەمێ زڤڕی / داهات (Total Return):</label>
            <input
              type="number"
              min="0"
              value={returnedAmount}
              onChange={(e) => setReturnedAmount(Math.max(0, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">ماوێ وەبەرهێنانێ ب ساڵان (Years):</label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={durationYears}
              onChange={(e) => setDurationYears(Math.max(0.1, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
              ڕێژەیا زڤڕینا سەرجەمێ وەبەرهێنانێ (Total ROI):
            </span>
            <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {totalRoi.toFixed(2)}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">قازانجێ پۆختە (Net Profit):</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {netProfit.toLocaleString()} {currency}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-bold">ڕێژەیا ساڵانە یا زڤڕینێ (Annualized ROI):</span>
            <span className="font-mono font-bold text-primary">{annualizedRoi.toFixed(2)}% ساڵانە</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ALL-IN-ONE BUSINESS TOOLKIT (TABBED)
// ==========================================
export function BusinessToolkit({ defaultTool = "profit_calc" }: { defaultTool?: BusinessToolId }) {
  const [activeTab, setActiveTab] = useState<BusinessToolId>(defaultTool);

  const tools = [
    { id: "profit_calc", label: "Profit Calculator", icon: TrendingUp },
    { id: "vat_calc", label: "VAT Calculator", icon: Percent },
    { id: "salary_calc", label: "Salary Calculator", icon: Wallet },
    { id: "discount_calc", label: "Discount Calculator", icon: Tag },
    { id: "loan_calc", label: "Loan Calculator", icon: CreditCard },
    { id: "currency_calc", label: "Currency Converter", icon: Coins },
    { id: "breakeven_calc", label: "Break-even Calculator", icon: Target },
    { id: "roi_calc", label: "ROI Calculator", icon: BarChart3 },
    { id: "invoice_gen", label: "Invoice Generator", icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Sub navigation pills */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-secondary/80 border border-border no-scrollbar">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as BusinessToolId)}
              className={`shrink-0 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "profit_calc" && <ProfitCalculator />}
      {activeTab === "vat_calc" && <VatCalculator />}
      {activeTab === "salary_calc" && <SalaryCalculator />}
      {activeTab === "discount_calc" && <DiscountCalculator />}
      {activeTab === "loan_calc" && <LoanCalculator />}
      {activeTab === "currency_calc" && <CurrencyConverter />}
      {activeTab === "breakeven_calc" && <BreakEvenCalculator />}
      {activeTab === "roi_calc" && <RoiCalculator />}
      {activeTab === "invoice_gen" && <InvoiceGenerator />}
    </div>
  );
}
