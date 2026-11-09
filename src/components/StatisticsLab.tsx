import { useState, useRef, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  BarChart2,
  TrendingUp,
  FileSpreadsheet,
  Upload,
  Download,
  Printer,
  Table2,
  Sparkles,
  PieChart as PieIcon,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Sliders,
  CheckCircle2,
  Info,
  LineChart as LineChartIcon,
  Edit,
  Plus,
  Trash2,
  ClipboardPaste,
  FileUp,
  Shuffle,
  Grid,
  CheckCheck,
} from "lucide-react";

interface ColumnStats {
  column: string;
  count: number;
  validCount: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  outliers: number[];
  values: number[];
}

interface RegressionResult {
  xCol: string;
  yCol: string;
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  equation: string;
}

// Preset Datasets for quick exploration
const PRESET_DATASETS = [
  {
    name: "نمرەیێن قوتابیان و دەمژمێرێن خاندنێ (Student Grades & Study Hours)",
    data: [
      { Student: "ئاسۆ", StudyHours: 12, ExamScore: 88, Attendance: 95, SleepHours: 7.5 },
      { Student: "دیار", StudyHours: 8, ExamScore: 72, Attendance: 80, SleepHours: 6 },
      { Student: "هەڵمەت", StudyHours: 15, ExamScore: 94, Attendance: 98, SleepHours: 8 },
      { Student: "کاروان", StudyHours: 5, ExamScore: 58, Attendance: 65, SleepHours: 5.5 },
      { Student: "سۆران", StudyHours: 10, ExamScore: 82, Attendance: 90, SleepHours: 7 },
      { Student: "ڕێبین", StudyHours: 7, ExamScore: 68, Attendance: 75, SleepHours: 6.5 },
      { Student: "شوان", StudyHours: 14, ExamScore: 91, Attendance: 92, SleepHours: 8 },
      { Student: "بەهمەن", StudyHours: 4, ExamScore: 50, Attendance: 60, SleepHours: 5 },
      { Student: "لانە", StudyHours: 16, ExamScore: 97, Attendance: 100, SleepHours: 8.5 },
      { Student: "شنۆ", StudyHours: 9, ExamScore: 79, Attendance: 85, SleepHours: 7 },
      { Student: "ئارام", StudyHours: 11, ExamScore: 85, Attendance: 90, SleepHours: 7.5 },
      { Student: "هێرش", StudyHours: 6, ExamScore: 64, Attendance: 70, SleepHours: 6 },
    ],
  },
  {
    name: "فرۆتن و بودجەیا ڕیکلاما مەهانە (Sales & Ad Budget)",
    data: [
      { Month: "January", AdBudget: 1200, SalesUnits: 450, Revenue: 22500, Customers: 320 },
      { Month: "February", AdBudget: 1500, SalesUnits: 520, Revenue: 26000, Customers: 380 },
      { Month: "March", AdBudget: 1800, SalesUnits: 610, Revenue: 30500, Customers: 430 },
      { Month: "April", AdBudget: 1400, SalesUnits: 490, Revenue: 24500, Customers: 350 },
      { Month: "May", AdBudget: 2200, SalesUnits: 750, Revenue: 37500, Customers: 510 },
      { Month: "June", AdBudget: 2500, SalesUnits: 840, Revenue: 42000, Customers: 580 },
      { Month: "July", AdBudget: 2800, SalesUnits: 920, Revenue: 46000, Customers: 640 },
      { Month: "August", AdBudget: 2000, SalesUnits: 680, Revenue: 34000, Customers: 470 },
      { Month: "September", AdBudget: 1900, SalesUnits: 650, Revenue: 32500, Customers: 450 },
      { Month: "October", AdBudget: 2400, SalesUnits: 800, Revenue: 40000, Customers: 550 },
      { Month: "November", AdBudget: 3100, SalesUnits: 1050, Revenue: 52500, Customers: 710 },
      { Month: "December", AdBudget: 3500, SalesUnits: 1200, Revenue: 60000, Customers: 820 },
    ],
  },
  {
    name: "ساخلەمی و پێوەرێن بایۆمەتری (Health & Biometrics)",
    data: [
      { Person: "P1", Age: 25, WeightKg: 68, HeightCm: 175, HeartRate: 72, SystolicBP: 118 },
      { Person: "P2", Age: 34, WeightKg: 82, HeightCm: 180, HeartRate: 78, SystolicBP: 128 },
      { Person: "P3", Age: 42, WeightKg: 90, HeightCm: 172, HeartRate: 84, SystolicBP: 135 },
      { Person: "P4", Age: 29, WeightKg: 62, HeightCm: 165, HeartRate: 68, SystolicBP: 115 },
      { Person: "P5", Age: 55, WeightKg: 95, HeightCm: 178, HeartRate: 88, SystolicBP: 142 },
      { Person: "P6", Age: 22, WeightKg: 70, HeightCm: 182, HeartRate: 65, SystolicBP: 112 },
      { Person: "P7", Age: 48, WeightKg: 86, HeightCm: 170, HeartRate: 80, SystolicBP: 130 },
      { Person: "P8", Age: 38, WeightKg: 75, HeightCm: 176, HeartRate: 74, SystolicBP: 122 },
    ],
  },
];

// Helper: Statistical Math Computations
function computeStats(values: number[], colName: string): ColumnStats {
  const cleanVals = values.filter((v) => typeof v === "number" && !isNaN(v)).sort((a, b) => a - b);
  const n = cleanVals.length;

  if (n === 0) {
    return {
      column: colName,
      count: 0,
      validCount: 0,
      mean: 0,
      median: 0,
      mode: [],
      variance: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      skewness: 0,
      kurtosis: 0,
      outliers: [],
      values: [],
    };
  }

  // Mean
  const sum = cleanVals.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? cleanVals[mid] : (cleanVals[mid - 1] + cleanVals[mid]) / 2;

  // Mode
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  cleanVals.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) maxFreq = frequency[val];
  });
  const mode = maxFreq > 1 ? Object.keys(frequency).filter((k) => frequency[Number(k)] === maxFreq).map(Number) : [];

  // Variance & Standard Deviation (Sample: n - 1)
  const variance = n > 1 ? cleanVals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Min, Max, Range
  const min = cleanVals[0];
  const max = cleanVals[n - 1];
  const range = max - min;

  // Quartiles (Q1, Q3) & IQR
  const q1 = cleanVals[Math.floor(n * 0.25)] ?? min;
  const q3 = cleanVals[Math.floor(n * 0.75)] ?? max;
  const iqr = q3 - q1;

  // Skewness & Kurtosis
  let m3 = 0;
  let m4 = 0;
  cleanVals.forEach((val) => {
    m3 += Math.pow(val - mean, 3);
    m4 += Math.pow(val - mean, 4);
  });
  const skewness = n > 2 && stdDev > 0 ? (n * m3) / ((n - 1) * (n - 2) * Math.pow(stdDev, 3)) : 0;
  const kurtosis = n > 3 && stdDev > 0 ? (n * (n + 1) * m4) / ((n - 1) * (n - 2) * (n - 3) * Math.pow(stdDev, 4)) - 3 : 0;

  // Outliers (IQR Method: < Q1 - 1.5*IQR or > Q3 + 1.5*IQR)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = cleanVals.filter((v) => v < lowerBound || v > upperBound);

  return {
    column: colName,
    count: n,
    validCount: n,
    mean,
    median,
    mode,
    variance,
    stdDev,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    outliers,
    values: cleanVals,
  };
}

// Compute Pearson Correlation between 2 numeric arrays
function computeCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

// Compute Linear Regression y = mx + b
function computeLinearRegression(x: number[], y: number[], xName: string, yName: string): RegressionResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) {
    return {
      xCol: xName,
      yCol: yName,
      slope: 0,
      intercept: 0,
      r: 0,
      r2: 0,
      equation: "y = 0",
    };
  }

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;

  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    den += Math.pow(x[i] - meanX, 2);
  }

  const slope = den !== 0 ? num / den : 0;
  const intercept = meanY - slope * meanX;
  const r = computeCorrelation(x, y);
  const r2 = Math.pow(r, 2);

  const sign = intercept >= 0 ? "+" : "-";
  const equation = `y = ${slope.toFixed(3)}x ${sign} ${Math.abs(intercept).toFixed(3)}`;

  return {
    xCol: xName,
    yCol: yName,
    slope,
    intercept,
    r,
    r2,
    equation,
  };
}

export function StatisticsLab() {
  const [dataset, setDataset] = useState<any[]>(PRESET_DATASETS[0].data);
  const [datasetName, setDatasetName] = useState<string>("Student Grades & Study Hours");
  const [activeTab, setActiveTab] = useState<"data_editor" | "summary" | "charts" | "regression" | "correlation" | "report">("summary");
  const [selectedCol, setSelectedCol] = useState<string>("ExamScore");
  const [regXCol, setRegXCol] = useState<string>("StudyHours");
  const [regYCol, setRegYCol] = useState<string>("ExamScore");
  const [predictX, setPredictX] = useState<number>(13);
  const [chartType, setChartType] = useState<"histogram" | "scatter" | "line" | "area">("histogram");
  const [copiedReport, setCopiedReport] = useState(false);

  // Data Editor Sub-tab & Inputs
  const [editorSubTab, setEditorSubTab] = useState<"table" | "paste" | "upload">("table");
  const [pasteRawText, setPasteRawText] = useState("");
  const [pasteVarName, setPasteVarName] = useState("MyData");
  const [newColumnInput, setNewColumnInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract Columns
  const allColumns = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    return Object.keys(dataset[0]);
  }, [dataset]);

  // Extract Numeric Columns
  const numericColumns = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    const keys = Object.keys(dataset[0]);
    return keys.filter((key) => {
      const vals = dataset.map((d) => d[key]);
      const validCount = vals.filter((v) => typeof v === "number" && !isNaN(v)).length;
      return validCount > dataset.length * 0.4;
    });
  }, [dataset]);

  // Make sure selected column is valid
  useEffect(() => {
    if (numericColumns.length > 0 && !numericColumns.includes(selectedCol)) {
      setSelectedCol(numericColumns[0]);
    }
    if (numericColumns.length >= 2) {
      if (!numericColumns.includes(regXCol)) setRegXCol(numericColumns[0]);
      if (!numericColumns.includes(regYCol)) setRegYCol(numericColumns[1]);
    }
  }, [numericColumns]);

  // Compute stats for all numeric columns
  const allStats = useMemo(() => {
    const map: Record<string, ColumnStats> = {};
    numericColumns.forEach((col) => {
      const rawVals = dataset.map((d) => Number(d[col])).filter((v) => !isNaN(v));
      map[col] = computeStats(rawVals, col);
    });
    return map;
  }, [dataset, numericColumns]);

  const currentStats = allStats[selectedCol] || null;

  // Compute Linear Regression
  const regression = useMemo(() => {
    if (!regXCol || !regYCol || !dataset.length) return null;
    const xVals: number[] = [];
    const yVals: number[] = [];
    dataset.forEach((row) => {
      const x = Number(row[regXCol]);
      const y = Number(row[regYCol]);
      if (!isNaN(x) && !isNaN(y)) {
        xVals.push(x);
        yVals.push(y);
      }
    });
    return computeLinearRegression(xVals, yVals, regXCol, regYCol);
  }, [dataset, regXCol, regYCol]);

  // Histogram Data for Selected Column
  const histogramData = useMemo(() => {
    if (!currentStats || currentStats.values.length === 0) return [];
    const vals = currentStats.values;
    const binCount = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(vals.length))));
    const binWidth = (currentStats.range || 1) / binCount;

    const bins: { binRange: string; count: number; min: number; max: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const bMin = currentStats.min + i * binWidth;
      const bMax = i === binCount - 1 ? currentStats.max : bMin + binWidth;
      const count = vals.filter((v) => (i === binCount - 1 ? v >= bMin && v <= bMax : v >= bMin && v < bMax)).length;
      bins.push({
        binRange: `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`,
        count,
        min: bMin,
        max: bMax,
      });
    }
    return bins;
  }, [currentStats]);

  // Scatter / Regression chart points
  const scatterData = useMemo(() => {
    if (!regression) return [];
    return dataset
      .map((row, idx) => ({
        index: idx + 1,
        x: Number(row[regXCol]),
        y: Number(row[regYCol]),
        predictedY: Number((regression.slope * Number(row[regXCol]) + regression.intercept).toFixed(2)),
        label: row.Student || row.Month || row.Person || `Item ${idx + 1}`,
      }))
      .filter((d) => !isNaN(d.x) && !isNaN(d.y))
      .sort((a, b) => a.x - b.x);
  }, [dataset, regression, regXCol, regYCol]);

  // Correlation Matrix
  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    numericColumns.forEach((c1) => {
      matrix[c1] = {};
      const v1 = dataset.map((d) => Number(d[c1])).filter((v) => !isNaN(v));
      numericColumns.forEach((c2) => {
        const v2 = dataset.map((d) => Number(d[c2])).filter((v) => !isNaN(v));
        matrix[c1][c2] = computeCorrelation(v1, v2);
      });
    });
    return matrix;
  }, [dataset, numericColumns]);

  // ── Data Editor Operations ──
  const handleCellChange = (rowIndex: number, colKey: string, value: string) => {
    const num = Number(value);
    const parsedVal = !isNaN(num) && value.trim() !== "" ? num : value;
    setDataset((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [colKey]: parsedVal };
      return updated;
    });
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    allColumns.forEach((col) => {
      newRow[col] = typeof dataset[0]?.[col] === "number" ? 0 : `Item ${dataset.length + 1}`;
    });
    if (Object.keys(newRow).length === 0) {
      newRow["X"] = 0;
      newRow["Y"] = 0;
    }
    setDataset((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    if (dataset.length <= 1) {
      alert("دڤێت کێمترین ئێک ڕێز بمینیت.");
      return;
    }
    setDataset((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const col = newColumnInput.trim();
    if (!col) return;
    if (allColumns.includes(col)) {
      alert("ئەڤ ستوونە بەری نوکە یا هەی.");
      return;
    }
    setDataset((prev) =>
      prev.map((row) => ({
        ...row,
        [col]: 0,
      })),
    );
    setNewColumnInput("");
  };

  const handleDeleteColumn = (colName: string) => {
    if (allColumns.length <= 1) {
      alert("دڤێت کێمترین ئێک ستوون هەبیت.");
      return;
    }
    setDataset((prev) =>
      prev.map((row) => {
        const copy = { ...row };
        delete copy[colName];
        return copy;
      }),
    );
  };

  const handleClearDataset = () => {
    if (confirm("تۆ یێ پشتڕاستی تە دڤێت خشتەیێ بەتال بکەی ژ بۆ نڤیسینا داتایێن نوو؟")) {
      setDataset([
        { ID: 1, X: 10, Y: 20 },
        { ID: 2, X: 15, Y: 35 },
        { ID: 3, X: 20, Y: 45 },
      ]);
      setDatasetName("داتایا نوو یا بکارهێنەری (Custom Data)");
    }
  };

  const handleGenerateRandomData = () => {
    const randomRows = Array.from({ length: 12 }, (_, i) => ({
      Sample: `S${i + 1}`,
      ValueA: Math.round(50 + Math.random() * 50),
      ValueB: Math.round(20 + Math.random() * 80),
      Score: Math.round(60 + Math.random() * 40),
    }));
    setDataset(randomRows);
    setDatasetName("داتایا تاقیکاری یا بەرهەمهاتی (Random Data)");
    setActiveTab("summary");
  };

  // Parse Text / Excel Paste
  const handleApplyPastedText = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = pasteRawText.trim();
    if (!raw) return;

    try {
      const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      // Check if it's a multi-column table (tab or comma separated)
      const hasSeparators = lines[0].includes("\t") || lines[0].includes(",") || lines[0].includes(";");

      if (hasSeparators) {
        const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(",") ? "," : ";";
        const headers = lines[0].split(delimiter).map((h, idx) => h.trim() || `Col_${idx + 1}`);

        const rows: Record<string, any>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(delimiter);
          const rowObj: Record<string, any> = {};
          headers.forEach((h, colIdx) => {
            const valStr = parts[colIdx]?.trim() ?? "";
            const num = Number(valStr);
            rowObj[h] = !isNaN(num) && valStr !== "" ? num : valStr;
          });
          rows.push(rowObj);
        }

        if (rows.length > 0) {
          setDataset(rows);
          setDatasetName(pasteVarName || "داتایا پێڤەکری یا خشتەیی");
          setApplySuccess(true);
          setTimeout(() => {
            setApplySuccess(false);
            setActiveTab("summary");
          }, 1000);
          return;
        }
      }

      // Single column list of numbers
      const singleColName = pasteVarName.trim() || "Value";
      const numberValues: number[] = [];

      // Extract all numbers separated by spaces, commas, or newlines
      const tokens = raw.split(/[\s,;\n\r]+/).filter(Boolean);
      tokens.forEach((tok) => {
        const n = Number(tok);
        if (!isNaN(n)) numberValues.push(n);
      });

      if (numberValues.length > 0) {
        const rows = numberValues.map((v, i) => ({
          Index: i + 1,
          [singleColName]: v,
        }));
        setDataset(rows);
        setDatasetName(`داتایا ${singleColName}`);
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setActiveTab("summary");
        }, 1000);
      } else {
        alert("هیڤیە پشتڕاست بە کو هژمار د ناڤ دەقیدا هەنە.");
      }
    } catch (err) {
      alert("خەلەتیەک چێبوو د دەمێ شیکاریا داتایێدا.");
    }
  };

  // File Upload Parser (Excel / CSV / JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const workbook = XLSX.read(dataBuffer, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        if (json && json.length > 0) {
          setDataset(json);
          setDatasetName(file.name.replace(/\.[^/.]+$/, ""));
          const firstRow = json[0] as Record<string, any>;
          const keys = Object.keys(firstRow);
          const numKey = keys.find((k) => typeof firstRow[k] === "number") || keys[0];
          setSelectedCol(numKey);
          setActiveTab("summary");
        }
      } catch (err) {
        alert("فایل نەهاتە خاندن. هیڤیە پشتڕاست بە کو فایلا CSV یان Excel ە.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Generate Formatted Academic Markdown Report
  const generateReportText = () => {
    let report = `# ڕاپۆرتا شیکاریا ئاماریا زانستی (Statistical Analysis Report)\n`;
    report += `**ناڤێ داتاسێتێ:** ${datasetName}\n`;
    report += `**هژمارا تۆماران (Sample Size N):** ${dataset.length}\n`;
    report += `**مێژوو:** ${new Date().toLocaleDateString()}\n\n`;
    report += `---\n\n`;

    report += `## 1. خشتەیا ئامارێ وەسفی (Descriptive Statistics Table)\n\n`;
    report += `| ستوون (Variable) | N | ناڤین (Mean) | نیڤەک (Median) | لادانا پێوانەیی (SD) | جوداهی (Variance) | کێمترین (Min) | بلندترین (Max) | چارەکا 1 (Q1) | چارەکا 3 (Q3) | لاری (Skewness) |\n`;
    report += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
    numericColumns.forEach((col) => {
      const s = allStats[col];
      if (s) {
        report += `| **${col}** | ${s.validCount} | ${s.mean.toFixed(2)} | ${s.median.toFixed(2)} | ${s.stdDev.toFixed(2)} | ${s.variance.toFixed(2)} | ${s.min} | ${s.max} | ${s.q1.toFixed(2)} | ${s.q3.toFixed(2)} | ${s.skewness.toFixed(2)} |\n`;
      }
    });

    if (regression) {
      report += `\n## 2. شیکاریا ڕیگرێشنا هێلی (Linear Regression Model)\n\n`;
      report += `- **گۆڕاوێ سەربەخۆ (X):** ${regXCol}\n`;
      report += `- **گۆڕاوێ پاشکۆ (Y):** ${regYCol}\n`;
      report += `- **هاوکێشەیا مۆدێلێ:** \`${regression.equation}\`\n`;
      report += `- **هاوکۆلکەیا پەیوەندیێ (Pearson r):** ${regression.r.toFixed(4)}\n`;
      report += `- **هاوکۆلکەیا دیاریکرنێ (R²):** ${(regression.r2 * 100).toFixed(2)}% (ئانکو ڕێژەیا گوهۆڕینێن ڕوونکری)\n`;
    }

    report += `\n## 3. دەستنیشانکرنا داتایا نامۆ (Outliers Detection)\n\n`;
    numericColumns.forEach((col) => {
      const s = allStats[col];
      if (s && s.outliers.length > 0) {
        report += `- **${col}:** داتایا نامۆ هاتە دیتن [${s.outliers.join(", ")}]\n`;
      } else {
        report += `- **${col}:** چو داتایەکا نامۆ (Outlier) نەهاتە دیتن (داتا ڕێکخستیە).\n`;
      }
    });

    return report;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 text-foreground font-sans text-right">
      {/* ── Top Header & Quick Action Buttons ── */}
      <div className="rounded-xl bg-card border border-border p-3.5 md:p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mb-1">
              <Calculator className="w-3 h-3" /> تاقیگەها ئامار و شیکاریا داتایان
            </div>
            <h2 className="text-base md:text-lg font-black text-foreground">
              Statistics Lab & Data Analysis Studio
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Direct Data Entry Button */}
            <button
              onClick={() => {
                setActiveTab("data_editor");
                setEditorSubTab("table");
              }}
              className={`h-7.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "data_editor"
                  ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                  : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              <Edit className="w-3 h-3" />
              <span>✍️ نڤیسین و دەستکاریکرن</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls,.tsv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-7.5 px-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1.5 shadow-2xs hover:opacity-95 transition cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>📁 بارکرنا Excel / CSV</span>
            </button>

            {/* Presets dropdown */}
            <select
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (PRESET_DATASETS[idx]) {
                  setDataset(PRESET_DATASETS[idx].data);
                  setDatasetName(PRESET_DATASETS[idx].name);
                  setActiveTab("summary");
                }
              }}
              className="h-7.5 px-2 rounded-lg bg-secondary border border-border text-[11px] font-bold cursor-pointer"
            >
              <option value="0">نموونە: قوتابی و نمرە</option>
              <option value="1">نموونە: فرۆتن و ڕیکلام</option>
              <option value="2">نموونە: ساخلەمی و کێش</option>
            </select>
          </div>
        </div>

        {/* Dataset Summary Pill */}
        <div className="py-2 px-3.5 rounded-lg bg-secondary/40 border border-border flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-3 h-3 text-primary" />
            <span className="font-bold text-foreground">داتاسێتێ چالاک:</span>
            <span className="font-mono text-primary font-bold">{datasetName}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground font-mono text-[10px]">
            <span>هژمارا ڕێزان (Rows): <strong className="text-foreground">{dataset.length}</strong></span>
            <span>ستوونێن هژماری: <strong className="text-foreground">{numericColumns.length}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-secondary/80 border border-border no-scrollbar">
        {[
          { id: "data_editor", label: "✍️ دەستکاریکرن", icon: Edit },
          { id: "summary", label: "📊 ئامارێ وەسفی", icon: Table2 },
          { id: "charts", label: "📈 هێلکاری", icon: BarChart2 },
          { id: "regression", label: "📉 ڕیگرێشن", icon: TrendingUp },
          { id: "correlation", label: "🔗 پەیوەندی", icon: Layers },
          { id: "report", label: "📑 ڕاپۆرت", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DATA EDITOR & UPLOAD STUDIO (NEW!) ── */}
      {activeTab === "data_editor" && (
        <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-5 animate-in fade-in-0 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3.5">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-primary" />
                نڤیسین، دەستکاریکرن و بارکرنا داتایا تایبەت یا تە
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                تۆ دشێی ب سێ ڕێکێن ب ساناهی داتایێن خۆ ل ڤێرێ دابنێی دا کو ئێکسەر ئامار و هێلکاریێن وێ دیار ببن.
              </p>
            </div>

            {/* Sub-modes Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-secondary border border-border shrink-0">
              <button
                onClick={() => setEditorSubTab("table")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  editorSubTab === "table"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>خشتەیا دەستکاریکرنێ</span>
              </button>
              <button
                onClick={() => setEditorSubTab("paste")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  editorSubTab === "paste"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>پێڤەکرن (Paste)</span>
              </button>
              <button
                onClick={() => setEditorSubTab("upload")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  editorSubTab === "upload"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileUp className="w-3 h-3" />
                <span>فایلا Excel/CSV</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab 1: Interactive Spreadsheet Table */}
          {editorSubTab === "table" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddRow}
                    className="h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:opacity-90 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ زێدەکرنا ڕێزێ (Add Row)</span>
                  </button>

                  <form onSubmit={handleAddColumn} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newColumnInput}
                      onChange={(e) => setNewColumnInput(e.target.value)}
                      placeholder="ناڤێ ستوونا نوو..."
                      className="h-8 px-2.5 rounded-lg bg-secondary border border-border text-[11px] focus:outline-none w-32 sm:w-36"
                    />
                    <button
                      type="submit"
                      className="h-8 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-[11px] font-bold text-foreground cursor-pointer"
                    >
                      + ستوون
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleGenerateRandomData}
                    className="h-8 px-2.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-[11px] font-bold text-foreground flex items-center gap-1.5 cursor-pointer"
                    title="دروستکرنا هژمارێن تاقیکاری"
                  >
                    <Shuffle className="w-3 h-3 text-primary" />
                    <span>داتایا تاقیکاری</span>
                  </button>
                  <button
                    onClick={handleClearDataset}
                    className="h-8 px-2.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>ژێبرنا هەمیێ</span>
                  </button>
                </div>
              </div>

              {/* Editable Table */}
              <div className="overflow-x-auto rounded-2xl border border-border max-h-[460px]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-secondary/80 border-b border-border text-muted-foreground font-bold sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      {allColumns.map((col) => (
                        <th key={col} className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-foreground font-extrabold">{col}</span>
                            {allColumns.length > 1 && (
                              <button
                                onClick={() => handleDeleteColumn(col)}
                                className="text-muted-foreground hover:text-destructive p-0.5 rounded cursor-pointer"
                                title="ژێبرنا ستوونێ"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 w-12 text-center">ژێبرن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dataset.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-secondary/20 transition">
                        <td className="p-2 text-center text-muted-foreground font-mono text-[11px]">
                          {rIdx + 1}
                        </td>
                        {allColumns.map((col) => (
                          <td key={col} className="p-1.5">
                            <input
                              type={typeof row[col] === "number" ? "number" : "text"}
                              value={row[col] ?? ""}
                              onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                              className="w-full h-8 px-2 rounded-lg bg-background border border-border/70 focus:ring-1 focus:ring-primary focus:outline-none text-xs font-mono font-bold text-foreground text-right"
                            />
                          </td>
                        ))}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteRow(rIdx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                            title="ژێبرنا ڤێ ڕێزێ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  💡 هەر گوهۆڕینەک ئێکسەر دهێتە پاشکەفتکرن و ئامارێن وێ نوو دبن.
                </span>
                <button
                  onClick={() => setActiveTab("summary")}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md hover:opacity-90 transition cursor-pointer"
                >
                  دیتنا ئامار و شیکاریان (View Stats) ←
                </button>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Paste & Raw Text Input */}
          {editorSubTab === "paste" && (
            <form onSubmit={handleApplyPastedText} className="space-y-4 max-w-3xl">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  📋 شێوازێ پێڤەکرن و نڤیسینا لەزگین:
                </span>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>خشتەیا Excel:</strong> تۆ دشێی ئێکسەر خانەیێن د ناڤ Excel یان Google Sheets کۆپی بکەی و ل ڤێرێ Paste بکەی.</li>
                  <li><strong>لیستا هژماران:</strong> هژماران بنڤیسە ب بۆشایی یان کۆما ژێک جوداکری (وەک: <code className="text-primary font-mono font-bold" dir="ltr">12, 15, 22, 30, 45, 60</code>).</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">ناڤێ گۆڕاو / داتاسێت:</label>
                <input
                  type="text"
                  value={pasteVarName}
                  onChange={(e) => setPasteVarName(e.target.value)}
                  placeholder="وەکی: نمرەیێن قوتابیان یان پلەیا گەرماتیێ..."
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">دەقێ داتایێ ل ڤێرێ پێڤە (Paste) بکە:</label>
                <textarea
                  required
                  rows={8}
                  value={pasteRawText}
                  onChange={(e) => setPasteRawText(e.target.value)}
                  placeholder="هژماران یان خشتەیا Excel ل ڤێرێ بنڤیسە یان Paste بکە..."
                  className="w-full p-4 rounded-2xl bg-background border border-border text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed text-right"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>شیکاریکردن و بکارئینانا داتایێ</span>
                </button>

                {applySuccess && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    داتا ب سەرکەفتیانە هاتە بارکرن!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Sub-Tab 3: Drag & Drop File Upload */}
          {editorSubTab === "upload" && (
            <div className="space-y-4 max-w-2xl">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) parseFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed text-center space-y-4 transition cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-secondary/20"
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-foreground">
                    فایلا Excel یان CSV ڕابکێشە ڤێرێ (Drag & Drop)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    پشتەڤانیا فایلا <span className="font-mono font-bold text-primary">.xlsx, .xls, .csv, .tsv, .json</span> دکەت
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs"
                >
                  هەلبژارتنا فایلێ ژ کۆمپیۆتەرێ تە
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DESCRIPTIVE SUMMARY STATS ── */}
      {activeTab === "summary" && (
        <div className="space-y-5 animate-in fade-in-0 duration-200">
          {/* Select Target Column */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between flex-wrap gap-2.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" /> هەلبژارتنا ستوونا هژماری ژ بۆ شیکاریا هویر:
            </span>
            <div className="flex flex-wrap gap-1">
              {numericColumns.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedCol(col)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                    selectedCol === col
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {currentStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "ناڤین (Mean)", val: currentStats.mean.toFixed(2), desc: "تێکڕایا هژمێریاری", highlight: true },
                { label: "نیڤەک (Median)", val: currentStats.median.toFixed(2), desc: "خالا ناڤین (50%)", highlight: true },
                { label: "باو (Mode)", val: currentStats.mode.length > 0 ? currentStats.mode.join(", ") : "بێ باو", desc: "دووبارەترین داتا" },
                { label: "لادانا پێوانەیی (SD)", val: currentStats.stdDev.toFixed(2), desc: "Standard Deviation (s)", highlight: true },
                { label: "جوداهی (Variance)", val: currentStats.variance.toFixed(2), desc: "Sample Variance (s²)" },
                { label: "مەودا (Range)", val: currentStats.range.toFixed(2), desc: "Max - Min" },
                { label: "کێمترین (Min)", val: currentStats.min.toString(), desc: "نزمترین هژمار" },
                { label: "بلندترین (Max)", val: currentStats.max.toString(), desc: "بلندترین هژمار" },
                { label: "چارەکا ئێکێ (Q1)", val: currentStats.q1.toFixed(2), desc: "25th Percentile" },
                { label: "چارەکا سیێ (Q3)", val: currentStats.q3.toFixed(2), desc: "75th Percentile" },
                { label: "مەودایا چارەکان (IQR)", val: currentStats.iqr.toFixed(2), desc: "Q3 - Q1" },
                { label: "لاری (Skewness)", val: currentStats.skewness.toFixed(2), desc: currentStats.skewness > 0 ? "ڕاست-لار (Right)" : currentStats.skewness < 0 ? "چەپ-لار (Left)" : "هاوسەنگ" },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition ${
                    card.highlight
                      ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                      : "bg-card border-border"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground block mb-0.5 font-medium">{card.label}</span>
                  <span className="text-lg font-black text-foreground font-mono block mb-0.5">
                    {card.val}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">{card.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* All Variables Summary Table */}
          <div className="rounded-2xl bg-card border border-border p-4.5 shadow-2xs space-y-3.5">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <Table2 className="w-4 h-4 text-primary" /> خشتەیا بەراوردکرنا هەمی ستوونان (All Variables Summary)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-bold">
                  <tr>
                    <th className="p-2.5">ستوون (Variable)</th>
                    <th className="p-2.5">N</th>
                    <th className="p-2.5 font-bold text-primary">Mean (ناڤین)</th>
                    <th className="p-2.5">Median</th>
                    <th className="p-2.5">Std Dev (SD)</th>
                    <th className="p-2.5">Min</th>
                    <th className="p-2.5">Max</th>
                    <th className="p-2.5">Q1</th>
                    <th className="p-2.5">Q3</th>
                    <th className="p-2.5">IQR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {numericColumns.map((col) => {
                    const s = allStats[col];
                    if (!s) return null;
                    return (
                      <tr key={col} className="hover:bg-secondary/30 transition">
                        <td className="p-2.5 font-bold text-foreground font-sans">{col}</td>
                        <td className="p-2.5">{s.validCount}</td>
                        <td className="p-2.5 font-bold text-primary">{s.mean.toFixed(2)}</td>
                        <td className="p-2.5">{s.median.toFixed(2)}</td>
                        <td className="p-2.5">{s.stdDev.toFixed(2)}</td>
                        <td className="p-2.5">{s.min}</td>
                        <td className="p-2.5">{s.max}</td>
                        <td className="p-2.5">{s.q1.toFixed(2)}</td>
                        <td className="p-2.5">{s.q3.toFixed(2)}</td>
                        <td className="p-2.5">{s.iqr.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CHARTS & VISUALIZATIONS ── */}
      {activeTab === "charts" && (
        <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-primary" /> بەلاڤبوونا داتایێ بۆ ستوونا: <span className="text-primary font-mono font-bold">{selectedCol}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                شیکاریا چڕی، هیستۆگرام و ڕەوتێ داتایان ب شێوازێ گرافیکی
              </p>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-secondary border border-border">
              {(["histogram", "line", "area"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    chartType === t ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "histogram" ? "هیستۆگرام (Histogram)" : t === "line" ? "هێلکاری (Line)" : "ڕووبەر (Area)"}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-72 w-full pt-3 dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "histogram" ? (
                <BarChart data={histogramData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="binRange" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px" }}
                    formatter={(val) => [`دووبارەبوون: ${val}`, "Frequency"]}
                  />
                  <Bar dataKey="count" fill="var(--color-primary, #6366f1)" radius={[6, 6, 0, 0]} name="دووبارەبوون" />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={dataset.map((d, i) => ({ index: i + 1, value: Number(d[selectedCol]) }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="value" stroke="var(--color-primary, #6366f1)" strokeWidth={2.5} dot={{ r: 3.5 }} name={selectedCol} />
                </LineChart>
              ) : (
                <AreaChart data={dataset.map((d, i) => ({ index: i + 1, value: Number(d[selectedCol]) }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px" }} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary, #6366f1)" fill="var(--color-primary, #6366f1)" fillOpacity={0.2} name={selectedCol} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TAB 4: LINEAR REGRESSION & PREDICTION ── */}
      {activeTab === "regression" && (
        <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4 animate-in fade-in-0 duration-200">
          <div>
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> شیکاریا ڕیگرێشنا هێلی و پێشبینیکرن (Linear Regression & Forecasting)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              دیتنا هاوکێشەیا پەیوەندیا د ناڤبەرا دوو گۆڕاواندا و پێشبینیکرنا پاشەڕۆژێ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">گۆڕاوێ سەربەخۆ X (Independent Variable):</label>
              <select
                value={regXCol}
                onChange={(e) => setRegXCol(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-bold"
              >
                {numericColumns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">گۆڕاوێ پاشکۆ Y (Dependent Variable):</label>
              <select
                value={regYCol}
                onChange={(e) => setRegYCol(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg bg-card border border-border text-xs font-bold"
              >
                {numericColumns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {regression && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-[11px] font-bold text-primary block mb-0.5">هاوکێشەیا هێلا ڕیگرێشنێ:</span>
                <span className="text-base font-black font-mono text-foreground" dir="ltr">{regression.equation}</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">هاوکۆلکەیا دیاریکرنێ (R² Score):</span>
                <span className="text-base font-black font-mono text-emerald-500">{(regression.r2 * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">ڕێژەیا گوهۆڕینێن ڕوونکری</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">پەیوەندی (Pearson r):</span>
                <span className="text-base font-black font-mono text-indigo-500">{regression.r.toFixed(3)}</span>
              </div>
            </div>
          )}

          {/* Interactive Predictor */}
          {regression && (
            <div className="p-3 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">پێشبینیکرنا بهایێ Y ل دیف X:</span>
                  <span className="text-[11px] text-muted-foreground">ئەگەر بهایێ ({regXCol}) =</span>
                </div>
                <input
                  type="number"
                  value={predictX}
                  onChange={(e) => setPredictX(Number(e.target.value))}
                  className="w-18 h-8 px-2 rounded-lg bg-secondary border border-border text-center font-mono font-bold text-xs"
                />
              </div>

              <div className="text-left">
                <span className="text-[11px] text-muted-foreground block">بهایێ پێشبینیکری بۆ ({regYCol}):</span>
                <span className="text-lg font-black text-emerald-500 font-mono">
                  {(regression.slope * predictX + regression.intercept).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Regression Chart */}
          <div className="h-72 w-full pt-3 dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scatterData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="x" name={regXCol} tick={{ fontSize: 11 }} />
                <YAxis dataKey="y" name={regYCol} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", borderRadius: "12px" }}
                  formatter={(val, name) => [val, name === "y" ? `Actual ${regYCol}` : `Predicted ${regYCol}`]}
                />
                <Legend />
                <Line type="monotone" dataKey="predictedY" stroke="#10b981" strokeWidth={2} dot={false} name={`هێلا ڕیگرێشنێ (Trend Line)`} />
                <Line type="monotone" dataKey="y" stroke="var(--color-primary, #6366f1)" strokeWidth={0} dot={{ r: 4, fill: "var(--color-primary, #6366f1)" }} name={`داتایا ڕاستەقینە (${regYCol})`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── TAB 5: CORRELATION MATRIX ── */}
      {activeTab === "correlation" && (
        <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4 animate-in fade-in-0 duration-200">
          <div>
            <h3 className="text-sm font-black text-foreground">
              ماتریسا پەیوەندیا ناڤبەرا گۆڕاوان (Pearson Correlation Matrix)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              بهایێ (1+) پەیوەندیا تەمام یا ئەرێنی دگەهینیت، (-1) پەیوەندیا تەمام یا نەرێنی، و (0) نەبوونا چو پەیوەندیان.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-center text-xs">
              <thead className="bg-secondary/50 border-b border-border font-bold text-foreground">
                <tr>
                  <th className="p-2.5 text-right">گۆڕاو (Variable)</th>
                  {numericColumns.map((col) => (
                    <th key={col} className="p-2.5 font-mono">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {numericColumns.map((rCol) => (
                  <tr key={rCol}>
                    <td className="p-2.5 text-right font-bold text-foreground font-sans">{rCol}</td>
                    {numericColumns.map((cCol) => {
                      const val = correlationMatrix[rCol]?.[cCol] ?? 0;
                      const isSelf = rCol === cCol;
                      const isStrong = Math.abs(val) >= 0.7 && !isSelf;
                      return (
                        <td
                          key={cCol}
                          className={`p-2.5 font-bold transition ${
                            isSelf
                              ? "bg-secondary/40 text-muted-foreground"
                              : isStrong
                              ? val > 0
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {val.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: AUTOMATED COMPREHENSIVE REPORT ── */}
      {activeTab === "report" && (
        <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold mb-1">
                <FileText className="w-3 h-3" /> ڕاپۆرتا زانستی یا ئامادەکری یا ئاماری
              </div>
              <h3 className="text-base font-black text-foreground">دروستکەرێ ڕاپۆرتا ئاماری (Statistical Report Generator)</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyReport}
                className="py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:opacity-95 transition cursor-pointer"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReport ? "کۆپی بوو!" : "کۆپیکرنا ڕاپۆرتێ (Markdown)"}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border text-[11px] leading-relaxed font-mono whitespace-pre-wrap select-all max-h-[450px] overflow-y-auto">
            {generateReportText()}
          </div>
        </div>
      )}
    </div>
  );
}
