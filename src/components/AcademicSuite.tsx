import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  Search,
  ExternalLink,
  Code2,
  Download,
  FileCode,
  Layers,
  HelpCircle,
  FileText,
  RotateCcw,
  Plus,
  ArrowRight,
  Calculator,
  Binary,
  CheckCircle2,
  Upload,
  X,
  File,
} from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CITATION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
type CitationStyle = "apa" | "mla" | "chicago" | "harvard" | "ieee" | "vancouver";
type SourceType = "journal" | "book" | "website" | "conference" | "thesis";

export function CitationTool() {
  const [activeTab, setActiveTab] = useState<"form" | "ai">("form");
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [sourceType, setSourceType] = useState<SourceType>("journal");

  // Form states
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [sourceName, setSourceName] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [doiUrl, setDoiUrl] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);

  // AI Citation State
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Generate reference and in-text from form
  const getFormattedCitation = () => {
    const rawAuthors = authors.trim() || "Author, A.";
    const rawTitle = title.trim() || "Title of the Work";
    const rawYear = year.trim() || "n.d.";
    const rawSource = sourceName.trim() || "Journal Name";
    const rawVol = volume.trim();
    const rawIssue = issue.trim();
    const rawPages = pages.trim();
    const rawDoi = doiUrl.trim();

    let fullRef = "";
    let inText = `(${rawAuthors.split(",")[0] || "Author"}, ${rawYear})`;

    if (style === "apa") {
      const volPart = rawVol && rawIssue ? `${rawVol}(${rawIssue})` : rawVol || "";
      const pagePart = rawPages ? `, ${rawPages}` : "";
      const doiPart = rawDoi ? ` https://doi.org/${rawDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}` : "";
      fullRef = `${rawAuthors} (${rawYear}). ${rawTitle}. ${rawSource}${volPart ? `, ${volPart}` : ""}${pagePart}.${doiPart}`;
      inText = `(${rawAuthors.split(",")[0] || "Author"}, ${rawYear})`;
    } else if (style === "mla") {
      const volPart = rawVol ? `, vol. ${rawVol}` : "";
      const issPart = rawIssue ? `, no. ${rawIssue}` : "";
      const pagePart = rawPages ? `, pp. ${rawPages}` : "";
      const doiPart = rawDoi ? `, https://doi.org/${rawDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")}` : "";
      fullRef = `${rawAuthors}. "${rawTitle}." ${rawSource}${volPart}${issPart}, ${rawYear}${pagePart}${doiPart}.`;
      inText = `(${rawAuthors.split(",")[0] || "Author"} ${rawPages ? rawPages.split("-")[0] : ""})`.trim();
    } else if (style === "chicago") {
      const volPart = rawVol ? ` ${rawVol}` : "";
      const issPart = rawIssue ? `, no. ${rawIssue}` : "";
      const pagePart = rawPages ? `: ${rawPages}` : "";
      fullRef = `${rawAuthors} "${rawTitle}." ${rawSource}${volPart}${issPart} (${rawYear})${pagePart}.`;
      inText = `(${rawAuthors.split(",")[0] || "Author"} ${rawYear})`;
    } else if (style === "harvard") {
      const volPart = rawVol && rawIssue ? `${rawVol}(${rawIssue})` : rawVol || "";
      const pagePart = rawPages ? `, pp.${rawPages}` : "";
      fullRef = `${rawAuthors}, ${rawYear}. ${rawTitle}. ${rawSource}, ${volPart}${pagePart}.`;
      inText = `(${rawAuthors.split(",")[0] || "Author"}, ${rawYear})`;
    } else if (style === "ieee") {
      fullRef = `${rawAuthors}, "${rawTitle}," ${rawSource}${rawVol ? `, vol. ${rawVol}` : ""}${rawIssue ? `, no. ${rawIssue}` : ""}${rawPages ? `, pp. ${rawPages}` : ""}, ${rawYear}.`;
      inText = `[1]`;
    } else if (style === "vancouver") {
      fullRef = `${rawAuthors}. ${rawTitle}. ${rawSource}. ${rawYear}${rawVol ? `;${rawVol}` : ""}${rawIssue ? `(${rawIssue})` : ""}${rawPages ? `:${rawPages}` : ""}.`;
      inText = `(1)`;
    }

    return { fullRef, inText };
  };

  const { fullRef, inText } = getFormattedCitation();

  const handleCopy = (text: string, type: "ref" | "intext") => {
    navigator.clipboard.writeText(text);
    if (type === "ref") {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedInText(true);
      setTimeout(() => setCopiedInText(false), 2000);
    }
  };

  const handleAiFormat = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "citation_generator",
          input: `Format this reference or paper details in ${style.toUpperCase()} style and provide other styles too:\n${aiInput}`,
        }),
      });
      const data = await res.json();
      if (data.output) {
        setAiResult(data.output);
      }
    } catch {
      setAiResult("شاشیەک رویدا د دەمێ چێکرنا سایتەیشنێ دا.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              چێکەرێ ژێدەر و سایتەیشن (Citation Generator)
            </h2>
          </div>

          {/* Style Selector Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border">
            {(["apa", "mla", "chicago", "harvard", "ieee", "vancouver"] as CitationStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                  style === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mt-6 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "form"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            فۆڕمێ دەستی (Manual Form)
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "ai"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            شیکاری ب AI (Smart Paste)
          </button>
        </div>

        {/* FORM TAB */}
        {activeTab === "form" && (
          <div className="mt-6 space-y-5">
            {/* Source Type Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "journal", label: "📄 وتارا گۆڤارێ (Journal Article)" },
                { id: "book", label: "📚 پەرتووک (Book)" },
                { id: "website", label: "🌐 ماڵپەر (Website)" },
                { id: "conference", label: "🏛️ کۆنفرانس (Conference)" },
                { id: "thesis", label: "🎓 تێز و ناما ماستەرێ (Thesis)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSourceType(st.id as SourceType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    sourceType === st.id
                      ? "bg-primary/10 border-primary text-primary font-bold"
                      : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ناڤونیشانێ ڤەکۆلینێ یان پەرتووکێ (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Residual Learning for Image Recognition"
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  نڤیسەر (Authors: پاشناڤ، ناڤ - ب کۆما جودا بکە)
                </label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  placeholder="e.g. He, K., Zhang, X., Ren, S., & Sun, J."
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  ناڤێ گۆڤارێ یان بەلاڤکەری (Journal / Publisher)
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. IEEE Conference on Computer Vision and Pattern Recognition"
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">ساڵ (Year)</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                    className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">بەرگ و ژمارە (Vol / Issue)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="Vol"
                      className="w-1/2 h-11 px-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                    />
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="No"
                      className="w-1/2 h-11 px-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">لاپەڕە (Pages)</label>
                  <input
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="770-778"
                    className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  لینکێ DOI یان URL
                </label>
                <input
                  type="text"
                  value={doiUrl}
                  onChange={(e) => setDoiUrl(e.target.value)}
                  placeholder="e.g. 10.1109/CVPR.2016.90"
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Generated Output Preview Box */}
            <div className="mt-6 p-5 rounded-2xl bg-secondary/40 border border-primary/20 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase">
                    {style} Reference (لیستا ژێدەران)
                  </span>
                  <button
                    onClick={() => handleCopy(fullRef, "ref")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedRef ? "کۆپی بوو!" : "کۆپیکرن"}
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-background border border-border font-serif text-sm leading-relaxed text-foreground select-all">
                  {fullRef}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    In-Text Citation (د ناڤ دەقی دا)
                  </span>
                  <button
                    onClick={() => handleCopy(inText, "intext")}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary border border-border text-foreground text-xs font-semibold hover:bg-secondary/80 transition cursor-pointer"
                  >
                    {copiedInText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedInText ? "کۆپی بوو!" : "کۆپی In-Text"}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-background border border-border font-serif text-xs text-foreground select-all">
                  {inText}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === "ai" && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              هەر دەق، ناڤونیشان، لینک، یان پارچە پێزانینەکا ڤەکۆلینا تە هەبیت ل ڤێرێ بدانە، ژیرییا دەستکرد ب شێوازەکێ فەرمی دێ رێکئێخیت:
            </p>
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              rows={4}
              placeholder="میناک: Attention Is All You Need, Ashish Vaswani, Noam Shazeer, NIPS 2017..."
              className="w-full p-4 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAiFormat}
              disabled={aiLoading || !aiInput.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? "چێکرنا سایتەیشنێ..." : "چێکرنا ژێدەری ب ژیرییا دەستکرد"}
            </button>

            {aiResult && (
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">ئەنجامێ سایتەیشنێ</span>
                  <button
                    onClick={() => handleCopy(aiResult, "ref")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedRef ? "کۆپی بوو!" : "کۆپیکرن"}
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-xs md:text-sm text-foreground leading-relaxed p-3 bg-background rounded-xl border border-border">
                  {aiResult}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOI → CITATION
// ─────────────────────────────────────────────────────────────────────────────
export function DoiCitationTool() {
  const [doi, setDoi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [activeStyle, setActiveStyle] = useState<"apa" | "mla" | "chicago" | "ieee" | "harvard" | "bibtex">("apa");
  const [copied, setCopied] = useState(false);

  const sampleDois = [
    { label: "Deep Learning (Nature)", doi: "10.1038/nature14539" },
    { label: "COVID-19 Vaccine (NEJM)", doi: "10.1056/NEJMoa2034577" },
    { label: "Transformer Attention (NeurIPS)", doi: "10.48550/arXiv.1706.03762" },
  ];

  const handleFetchDoi = async (inputDoi?: string) => {
    const targetDoi = (inputDoi || doi).trim();
    if (!targetDoi) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/doi-citation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: targetDoi }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "ژمارەیا DOI نەهاتە دیتن.");
      } else {
        setData(json.data);
      }
    } catch (err: any) {
      setError("شاشیەک د پەیوەندیا سێرڤەری دا رویدا: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
          <Binary className="w-3.5 h-3.5" /> وەرگرتنا ئێکسەر ب DOI
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
          DOI → Citation Generator
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-5">
          بەس ژمارەیا DOI بنڤیسە، سیستەم دێ ئێکسەر هەمی پێزانین و سایتەیشنێن ڤەکۆلینا تە دەتە تە ب ڕێکا CrossRef.
        </p>

        {/* DOI Input */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchDoi()}
              placeholder="e.g. 10.1038/nature14539 یان لینکێ تەمام"
              className="w-full h-12 pr-11 pl-4 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => handleFetchDoi()}
            disabled={loading || !doi.trim()}
            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "وەرگرتنا داتایێ..." : "وەرگرتنا ژێدەری"}
          </button>
        </div>

        {/* Sample DOIs */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>میناکێن لەزگین:</span>
          {sampleDois.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDoi(s.doi);
                handleFetchDoi(s.doi);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition cursor-pointer text-[11px]"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Result Card */}
        {data && (
          <div className="mt-6 p-6 rounded-3xl bg-secondary/30 border border-emerald-500/30 space-y-5 animate-in fade-in-50 duration-300">
            {/* Paper Info Banner */}
            <div className="p-4 rounded-2xl bg-background border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-foreground leading-snug">
                    {data.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {data.authors?.map((a: any) => `${a.given || ""} ${a.family || ""}`).join(", ") || "Unknown Author"}
                  </p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {data.journal} ({data.year}) {data.volume ? `Vol. ${data.volume}` : ""} {data.issue ? `No. ${data.issue}` : ""} {data.pages ? `pp. ${data.pages}` : ""}
                  </p>
                </div>
                <a
                  href={data.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition shrink-0"
                  title="سەردانا فەرمی یا پەڕاوی ل سەر وێبێ"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Style Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex flex-wrap gap-1.5">
                {(["apa", "mla", "chicago", "harvard", "ieee", "bibtex"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setActiveStyle(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                      activeStyle === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(data.citations[activeStyle])}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "کۆپی بوو!" : `کۆپیکرنا ${activeStyle.toUpperCase()}`}
              </button>
            </div>

            {/* Citation Box */}
            <div className="p-4 rounded-2xl bg-background border border-border">
              {activeStyle === "bibtex" ? (
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed select-all">
                  {data.citations.bibtex}
                </pre>
              ) : (
                <div className="font-serif text-sm text-foreground leading-relaxed select-all">
                  {data.citations[activeStyle]}
                </div>
              )}
            </div>

            {/* In-text Citation Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border text-xs">
              <span className="text-muted-foreground">In-Text Citation (د ناڤ دەقی دا):</span>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-foreground">{data.citations.inText}</span>
                <button
                  onClick={() => handleCopy(data.citations.inText)}
                  className="px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 text-[11px] font-semibold"
                >
                  کۆپی
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BIBTEX GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function BibTexTool() {
  const [entryType, setEntryType] = useState<"article" | "book" | "inproceedings" | "phdthesis" | "misc">("article");
  const [citeKey, setCiteKey] = useState("vaswani2017attention");
  const [title, setTitle] = useState("Attention Is All You Need");
  const [authors, setAuthors] = useState("Vaswani, Ashish and Shazeer, Noam and Parmar, Niki");
  const [journal, setJournal] = useState("Advances in Neural Information Processing Systems");
  const [year, setYear] = useState("2017");
  const [volume, setVolume] = useState("30");
  const [pages, setPages] = useState("5998--6008");
  const [publisher, setPublisher] = useState("");
  const [doi, setDoi] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate BibTeX code string
  const bibCode = `@${entryType}{${citeKey || "key"},
  author    = {${authors}},
  title     = {${title}},
  year      = {${year}}${journal ? `,\n  journal   = {${journal}}` : ""}${publisher ? `,\n  publisher = {${publisher}}` : ""}${volume ? `,\n  volume    = {${volume}}` : ""}${pages ? `,\n  pages     = {${pages}}` : ""}${doi ? `,\n  doi       = {${doi}}` : ""}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([bibCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${citeKey || "reference"}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold mb-2">
          <FileCode className="w-3.5 h-3.5" /> چێکەرێ ژێدەرێ LaTeX
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
          چێکەرێ BibTeX (BibTeX Generator)
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-6">
          چێکرنا کۆدێ پاقژ و بێ شاشی یێ BibTeX بۆ بکارئینانێ دگەل Overleaf, TeXstudio, و پەڕاوێن ئەکادیمی.
        </p>

        {/* Entry Type Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "article", label: "وتارا گۆڤارێ (@article)" },
            { id: "book", label: "پەرتووک (@book)" },
            { id: "inproceedings", label: "کۆنفرانس (@inproceedings)" },
            { id: "phdthesis", label: "تێزا دکتۆرا/ماستەرێ (@phdthesis)" },
            { id: "misc", label: "ژێدەرێن جۆراوجۆر (@misc)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setEntryType(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                entryType === t.id
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">کلیل (Citation Key)</label>
            <input
              type="text"
              value={citeKey}
              onChange={(e) => setCiteKey(e.target.value)}
              placeholder="e.g. vaswani2017attention"
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1.5">ناڤونیشان (Title) *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Attention Is All You Need"
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1.5">نڤیسەر (Authors - ب 'and' جودا بکە)</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Vaswani, Ashish and Shazeer, Noam and Parmar, Niki"
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">گۆڤار یان کۆنفرانس (Journal / Booktitle)</label>
            <input
              type="text"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="e.g. Advances in Neural Information Processing Systems"
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">ساڵ (Year)</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">بەرگ و لاپەڕە (Volume & Pages)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Vol"
                className="w-1/2 h-11 px-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
              />
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="Pages"
                className="w-1/2 h-11 px-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">DOI</label>
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              placeholder="10.1145/..."
              className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>
        </div>

        {/* BibTeX Code Preview */}
        <div className="p-5 rounded-2xl bg-secondary/40 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-primary">BibTeX Output (.bib)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "کۆپی بوو!" : "کۆپی کۆد"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                داگرتنا .bib
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border font-mono text-xs text-foreground leading-relaxed select-all overflow-x-auto">
            <pre>{bibCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LATEX EQUATION EDITOR (Visual + Live KaTeX Preview)
// ─────────────────────────────────────────────────────────────────────────────
export function LatexEditorTool() {
  const [latex, setLatex] = useState("\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedWord, setCopiedWord] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"powers" | "logs" | "calculus" | "greek" | "operators" | "sets" | "matrices">("powers");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const html = katex.renderToString(latex || "", {
        displayMode: true,
        throwOnError: true,
      });
      setRenderedHtml(html);
      setRenderError(null);
    } catch (err: any) {
      setRenderError(err.message || "LaTeX syntax error");
      try {
        const fallback = katex.renderToString(latex || "", {
          displayMode: true,
          throwOnError: false,
        });
        setRenderedHtml(fallback);
      } catch {}
    }
  }, [latex]);

  const insertSymbol = (code: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLatex((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + code);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevVal = latex;
    const nextVal = prevVal.substring(0, start) + code + prevVal.substring(end);
    setLatex(nextVal);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + code.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 15);
  };

  const symbolCategories = {
    powers: {
      label: "توان، کەرت و ڕەگ",
      symbols: [
        { label: "a/b", code: "\\frac{a}{b}" },
        { label: "1/x", code: "\\frac{1}{x}" },
        { label: "xⁿ", code: "x^{n}" },
        { label: "x²", code: "x^{2}" },
        { label: "x³", code: "x^{3}" },
        { label: "xₙ", code: "x_{n}" },
        { label: "xᵢⁿ", code: "x_{i}^{n}" },
        { label: "√x", code: "\\sqrt{x}" },
        { label: "ⁿ√x", code: "\\sqrt[n]{x}" },
        { label: "dy/dx", code: "\\frac{dy}{dx}" },
        { label: "∂y/∂x", code: "\\frac{\\partial y}{\\partial x}" },
        { label: "∂²y/∂x²", code: "\\frac{\\partial^2 y}{\\partial x^2}" },
      ],
    },
    logs: {
      label: "لوگاریتم و سێگۆشەزانی",
      symbols: [
        { label: "log(x)", code: "\\log(x)" },
        { label: "ln(x)", code: "\\ln(x)" },
        { label: "log_b(x)", code: "\\log_{b}(x)" },
        { label: "log₁₀(x)", code: "\\log_{10}(x)" },
        { label: "eˣ", code: "e^{x}" },
        { label: "sin(x)", code: "\\sin(x)" },
        { label: "cos(x)", code: "\\cos(x)" },
        { label: "tan(x)", code: "\\tan(x)" },
        { label: "cot(x)", code: "\\cot(x)" },
        { label: "sec(x)", code: "\\sec(x)" },
        { label: "csc(x)", code: "\\csc(x)" },
        { label: "arcsin(x)", code: "\\arcsin(x)" },
        { label: "arccos(x)", code: "\\arccos(x)" },
        { label: "arctan(x)", code: "\\arctan(x)" },
        { label: "sinh(x)", code: "\\sinh(x)" },
        { label: "cosh(x)", code: "\\cosh(x)" },
        { label: "tanh(x)", code: "\\tanh(x)" },
        { label: "det(A)", code: "\\det(A)" },
      ],
    },
    calculus: {
      label: "ئینتیگڕاڵ، کۆ و سنوور",
      symbols: [
        { label: "∫ dx", code: "\\int f(x) \\, dx" },
        { label: "∫ₐᵇ dx", code: "\\int_{a}^{b} f(x) \\, dx" },
        { label: "∬", code: "\\iint" },
        { label: "∭", code: "\\iiint" },
        { label: "∮", code: "\\oint" },
        { label: "∑ᵢ₌₁ⁿ", code: "\\sum_{i=1}^{n}" },
        { label: "∏ᵢ₌₁ⁿ", code: "\\prod_{i=1}^{n}" },
        { label: "lim(x→0)", code: "\\lim_{x \\to 0}" },
        { label: "lim(x→∞)", code: "\\lim_{x \\to \\infty}" },
        { label: "∇ (Nabla)", code: "\\nabla" },
        { label: "f'(x)", code: "f'(x)" },
        { label: "f''(x)", code: "f''(x)" },
      ],
    },
    greek: {
      label: "پیتێن یۆنانی",
      symbols: [
        { label: "α", code: "\\alpha" },
        { label: "β", code: "\\beta" },
        { label: "γ", code: "\\gamma" },
        { label: "δ", code: "\\delta" },
        { label: "ε", code: "\\epsilon" },
        { label: "θ", code: "\\theta" },
        { label: "λ", code: "\\lambda" },
        { label: "μ", code: "\\mu" },
        { label: "π", code: "\\pi" },
        { label: "ρ", code: "\\rho" },
        { label: "σ", code: "\\sigma" },
        { label: "τ", code: "\\tau" },
        { label: "φ", code: "\\phi" },
        { label: "ψ", code: "\\psi" },
        { label: "ω", code: "\\omega" },
        { label: "Δ", code: "\\Delta" },
        { label: "Γ", code: "\\Gamma" },
        { label: "Θ", code: "\\Theta" },
        { label: "Λ", code: "\\Lambda" },
        { label: "Σ", code: "\\Sigma" },
        { label: "Φ", code: "\\Phi" },
        { label: "Ψ", code: "\\Psi" },
        { label: "Ω", code: "\\Omega" },
      ],
    },
    operators: {
      label: "کردار و بەراوردکاری",
      symbols: [
        { label: "±", code: "\\pm" },
        { label: "∓", code: "\\mp" },
        { label: "×", code: "\\times" },
        { label: "÷", code: "\\div" },
        { label: "·", code: "\\cdot" },
        { label: "≠", code: "\\neq" },
        { label: "≤", code: "\\le" },
        { label: "≥", code: "\\ge" },
        { label: "≈", code: "\\approx" },
        { label: "≡", code: "\\equiv" },
        { label: "∝", code: "\\propto" },
        { label: "∞", code: "\\infty" },
        { label: "°", code: "^\\circ" },
        { label: "∠", code: "\\angle" },
        { label: "⊥", code: "\\perp" },
        { label: "∥", code: "\\parallel" },
      ],
    },
    sets: {
      label: "کۆمەڵە، لۆجیک و تیرەکان",
      symbols: [
        { label: "∈", code: "\\in" },
        { label: "∉", code: "\\notin" },
        { label: "⊂", code: "\\subset" },
        { label: "⊆", code: "\\subseteq" },
        { label: "∪", code: "\\cup" },
        { label: "∩", code: "\\cap" },
        { label: "∅", code: "\\emptyset" },
        { label: "∀", code: "\\forall" },
        { label: "∃", code: "\\exists" },
        { label: "¬", code: "\\neg" },
        { label: "∧", code: "\\land" },
        { label: "∨", code: "\\lor" },
        { label: "→", code: "\\rightarrow" },
        { label: "⇒", code: "\\Rightarrow" },
        { label: "↔", code: "\\leftrightarrow" },
        { label: "⇔", code: "\\iff" },
        { label: "↦", code: "\\mapsto" },
      ],
    },
    matrices: {
      label: "کەوانە و ماتریکس",
      symbols: [
        { label: "( … )", code: "\\left( x \\right)" },
        { label: "[ … ]", code: "\\left[ x \\right]" },
        { label: "{ … }", code: "\\left\\{ x \\right\\}" },
        { label: "| x |", code: "\\left| x \\right|" },
        { label: "|| x ||", code: "\\left\\| x \\right\\|" },
        { label: "2x2 Matrix", code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
        { label: "3x3 Matrix", code: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
        { label: "Cases (پارچەیی)", code: "\\begin{cases} x^2 & x > 0 \\\\ -x & x \\le 0 \\end{cases}" },
      ],
    },
  };



  return (
    <div className="space-y-6">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
              <Calculator className="w-3.5 h-3.5" /> دەستکاریکەرێ هاوکێشەیێن LaTeX
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              LaTeX Equation Editor & KaTeX Live Preview
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              نڤیسین و دەستکاریکرنا هاوکێشەیێن LaTeX ب دیتنا ئێکسەر.
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border mb-4">
          {(Object.keys(symbolCategories) as (keyof typeof symbolCategories)[]).map((catKey) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategory === catKey
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {symbolCategories[catKey].label}
            </button>
          ))}
        </div>

        {/* Visual Symbol Palette for Active Category */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {symbolCategories[activeCategory].symbols.map((s, idx) => (
              <button
                key={idx}
                onClick={() => insertSymbol(s.code)}
                className="px-3 py-1.5 rounded-xl bg-background border border-border/80 hover:border-primary text-xs font-mono font-bold hover:bg-primary/10 hover:text-primary transition cursor-pointer shadow-2xs active:scale-95"
                title={s.code}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Input (Keyboard editable) */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              کۆدێ هاوکێشەیێ (تۆ دشێی ب ڕێکا کیبۆردێ ژی ل ڤێرێ بنڤیسی):
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(latex);
                  setCopiedLatex(true);
                  setTimeout(() => setCopiedLatex(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
              >
                {copiedLatex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLatex ? "کۆپی بوو!" : "کۆپیکرنا LaTeX"}
              </button>
              <button
                onClick={() => setLatex("")}
                className="p-1.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition cursor-pointer text-xs"
                title="پاقژکرن"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            rows={3}
            dir="ltr"
            placeholder="\log_b(x^n) = n \cdot \log_b(x) \quad \text{یان} \quad \int_{0}^{\pi} \sin(x) dx"
            className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed shadow-inner"
          />
        </div>

        {/* Live Equation Render Box (Right Below Input) */}
        <div className="mb-6 p-6 md:p-8 rounded-3xl bg-secondary/30 border border-primary/25 flex flex-col items-center justify-center min-h-[130px] text-center relative shadow-sm">
          <span className="absolute top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            دیتنا ئێکسەر (KaTeX Live Preview)
          </span>
          <div
            dir="ltr"
            className="text-lg sm:text-xl md:text-2xl text-foreground font-serif overflow-x-auto max-w-full py-2 select-all math-formula-box"
            style={{ direction: "ltr", unicodeBidi: "isolate" }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
          {renderError && (
            <span className="text-xs text-destructive mt-2 font-mono">
              ⚠️ {renderError}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LATEX ↔ WORD CONVERTER
// ─────────────────────────────────────────────────────────────────────────────
export function LatexWordTool() {
  const [mode, setMode] = useState<"latex2word" | "word2latex">("latex2word");
  const [input, setInput] = useState("\\frac{a + b}{c - d} = \\sqrt{x^2 + y^2}");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedWord, setCopiedWord] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const fileName = selectedFile.name.toLowerCase();

    // If it's a LaTeX or text file, read text directly into the input
    if (fileName.endsWith(".tex") || fileName.endsWith(".latex") || fileName.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setInput(content);
        if (fileName.endsWith(".tex") || fileName.endsWith(".latex")) {
          setMode("latex2word");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleConvert = async () => {
    if (!input.trim() && !file) return;
    setLoading(true);
    setOutput("");

    try {
      const payload: Record<string, unknown> = {
        tool: "latex_word",
        input: `Mode: ${
          mode === "latex2word"
            ? "Convert LaTeX equation / markup to Microsoft Word equation (UnicodeMath format ready for Alt+=) and provide step-by-step breakdown"
            : "Convert Microsoft Word equations / plain text math formula to clean compilable LaTeX code with packages"
        }\n${input ? `Text / Formula Input:\n${input}` : ""}`,
      };

      if (file) {
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = file.type || "application/octet-stream";
      }

      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.output) {
        setOutput(data.output);
      } else if (data.error) {
        setOutput(`هەڵە: ${data.error}`);
      }
    } catch {
      setOutput("هەڵەیەک لە کاتی گۆڕین ڕوویدا. تکایە دووبارە هەوڵ بدەوە.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (textToCopy: string, isWord = false) => {
    navigator.clipboard.writeText(textToCopy);
    if (isWord) {
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="space-y-6">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold mb-2">
            <Code2 className="w-3.5 h-3.5" /> گۆڕەرێ هاوکێشە و دۆکیۆمێنتان
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            LaTeX ↔ Microsoft Word Converter
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            گوهۆڕینا هاوکێشەیان د ناڤبەرا LaTeX و Microsoft Word دا.
          </p>
        </div>

        {/* Mode Switcher (Centered below header) */}
        <div className="flex items-center justify-center my-4">
          <div className="inline-flex p-1 rounded-2xl bg-secondary/80 border border-border shadow-xs">
            <button
              onClick={() => {
                setMode("latex2word");
                setOutput("");
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "latex2word"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              LaTeX ➔ Microsoft Word
            </button>
            <button
              onClick={() => {
                setMode("word2latex");
                setOutput("");
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "word2latex"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Word / دەق ➔ LaTeX
            </button>
          </div>
        </div>

        {/* Compact Drag & Drop File Upload Area */}
        <div className="mb-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            accept=".docx,.doc,.pdf,.tex,.latex,.txt,image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`py-3.5 px-4 rounded-2xl border border-dashed transition flex items-center justify-center gap-3 text-center cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border/80 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-foreground block">
                  فایلێ Word (.docx)، PDF، یان LaTeX (.tex) ل ڤێرێ دابنێ یان کلیک بکە
                </span>
                <span className="text-[10px] text-muted-foreground">
                  پشتەڤانییا فایلێن (.docx, .pdf, .tex, .txt) و وێنەیێن هاوکێشەیان دکەت
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2.5 px-4 rounded-xl bg-secondary/50 border border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {file.name.endsWith(".docx") || file.name.endsWith(".doc") ? (
                    <FileText className="w-4 h-4 text-blue-600" />
                  ) : file.name.endsWith(".pdf") ? (
                    <FileText className="w-4 h-4 text-red-500" />
                  ) : file.name.endsWith(".tex") || file.name.endsWith(".latex") ? (
                    <FileCode className="w-4 h-4 text-teal-600" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs text-foreground block truncate max-w-[240px] md:max-w-md">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 rounded-lg bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition cursor-pointer"
                title="لابردنا فایلی"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Input Textarea */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              {mode === "latex2word"
                ? "هاوکێشە یان کۆدێ LaTeX بنڤیسە:"
                : "هاوکێشە یان دەقێ Word بنڤیسە:"}
            </label>
            {input && (
              <button
                onClick={() => setInput("")}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> پاقژکرن
              </button>
            )}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            dir="ltr"
            placeholder={
              mode === "latex2word"
                ? "\\int_{0}^{1} x^2 \\, dx = \\frac{1}{3}\ny = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
                : "(a + b)/(c - d) = sqrt(x^2 + y^2)\nintegral from 0 to pi of sin(x) dx"
            }
            className="w-full p-4 rounded-2xl bg-background border border-border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>



        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading || (!input.trim() && !file)}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-primary text-primary-foreground text-xs md:text-sm font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "گۆڕینا هاوکێشەیێ ب ژیرییا دەستکرد..." : "نوکە بگوهاڕە (Convert Now)"}
        </button>

        {/* Output Box */}
        {output && (
          <div className="mt-8 p-6 rounded-3xl bg-secondary/40 border border-primary/30 space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">
                  ئەنجامێ گۆڕینێ بۆ {mode === "latex2word" ? "Microsoft Word (UnicodeMath)" : "LaTeX"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(output)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "کۆپی بوو!" : "کۆپیکرنا هەمیێ"}
                </button>
              </div>
            </div>

            {/* How to paste in Microsoft Word Tip */}
            {mode === "latex2word" && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                💡 <strong>چاوانییا بکارئینانێ د Word دا:</strong> د بەرنامێ Microsoft Word دا کلیک ل سەر دوگمەیا <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">Alt + =</kbd> بکە بۆ ڤەکرنا Equation، پاشان هاوکێشەیێ ل ڤێرێ کۆپی بکە و بدانە (Paste).
              </div>
            )}

            <div className="p-4 rounded-2xl bg-background border border-border whitespace-pre-wrap font-mono text-xs md:text-sm text-foreground leading-relaxed select-all overflow-x-auto">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
