import { useState, useRef, useEffect } from "react";
import {
  Users,
  Plus,
  MessageSquare,
  FileText,
  FolderOpen,
  HelpCircle,
  Pencil,
  Bot,
  Send,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Sparkles,
  Award,
  Clock,
  Play,
  RotateCcw,
  Eraser,
  Palette,
  Eye,
  LogOut,
  Settings,
  BookOpen,
  Calculator,
  Smile,
  Maximize2,
} from "lucide-react";

// Types
interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  topic: string;
  membersCount: number;
  activeMembers: { name: string; avatar: string; role: "admin" | "member"; color: string }[];
  code: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isAi?: boolean;
  color?: string;
}

interface SharedNote {
  id: string;
  title: string;
  content: string;
  author: string;
  updatedAt: string;
}

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploader: string;
  uploadedAt: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DEFAULT_ROOMS: StudyRoom[] = [
  {
    id: "room_math",
    name: "Mathematics Study Group (گرووپی بیرکاری)",
    subject: "Calculus & Linear Algebra",
    topic: "شیکاری تەواوکاری و هاوکێشەی دیفرانسیاڵ",
    membersCount: 4,
    code: "MATH-7824",
    activeMembers: [
      { name: "سەنگەر (تۆ)", avatar: "س", role: "admin", color: "bg-indigo-500" },
      { name: "ڕەوەند", avatar: "ڕ", role: "member", color: "bg-emerald-500" },
      { name: "لانە", avatar: "ل", role: "member", color: "bg-rose-500" },
      { name: "دانا", avatar: "د", role: "member", color: "bg-amber-500" },
    ],
  },
  {
    id: "room_med",
    name: "Medical & Biology Group (گرووپی پزیشکی)",
    subject: "Human Anatomy & Physiology",
    topic: "سیستەمی کۆئەندامی دەمار و مێشک",
    membersCount: 3,
    code: "MED-3391",
    activeMembers: [
      { name: "سەنگەر (تۆ)", avatar: "س", role: "admin", color: "bg-indigo-500" },
      { name: "ژوان", avatar: "ژ", role: "member", color: "bg-teal-500" },
      { name: "کارۆخ", avatar: "ک", role: "member", color: "bg-purple-500" },
    ],
  },
  {
    id: "room_cs",
    name: "Computer Science & AI (گرووپی کۆمپیوتەر)",
    subject: "Data Structures & AI Algorithms",
    topic: "شیکاری ئالگۆریتمەکانی Machine Learning",
    membersCount: 5,
    code: "CS-9012",
    activeMembers: [
      { name: "سەنگەر (تۆ)", avatar: "س", role: "admin", color: "bg-indigo-500" },
      { name: "ئارام", avatar: "ئـ", role: "member", color: "bg-blue-500" },
      { name: "سۆما", avatar: "سـ", role: "member", color: "bg-pink-500" },
    ],
  },
];

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "تەواوکاری (Integral) نەگۆڕی ∫ x² dx یەکسانە بە چی؟",
    options: ["(1/3)x³ + C", "2x + C", "(1/2)x² + C", "x³ + C"],
    correctIndex: 0,
    explanation: "بەپێی یاسای هێزی تەواوکاری: ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C، کەواتە بۆ x² دەبێتە (1/3)x³ + C.",
  },
  {
    id: 2,
    question: "لادانی پێوانەیی (Standard Deviation) چی دەپێوێت لە داتاکاندا؟",
    options: ["تێکڕای ژمارەکان", "بڕی بڵاوبوونەوە و دوورکەوتنەوە لە ناوەند", "باوترین ژمارەی دووبارەبوو", "خاڵی نێوەڕاست"],
    correctIndex: 1,
    explanation: "لادانی پێوانەیی پێوەرێکە بۆ زانینی چڕی و بڵاوبوونەوەی داتاکان لە دەوری تێکڕای ژمێرەیی (Mean).",
  },
  {
    id: 3,
    question: "ڕەگی دووجای ژمارە 144 یەکسانە بە چەند؟",
    options: ["10", "14", "12", "16"],
    correctIndex: 2,
    explanation: "12 × 12 = 144، کەواتە √144 = 12.",
  },
];

export function StudyGroupRoom() {
  const [rooms, setRooms] = useState<StudyRoom[]>(DEFAULT_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string>("room_math");
  const [activeTab, setActiveTab] = useState<"notes" | "files" | "quiz" | "chat" | "whiteboard" | "ai_tutor">("notes");

  // Create Room Modal State
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomSubject, setNewRoomSubject] = useState("");

  // Join Room State
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  // 1. Shared Notes State
  const [notes, setNotes] = useState<SharedNote[]>([
    {
      id: "n1",
      title: "پوختەی یاساکانی تەواوکاری (Integration Rules)",
      content: `• یاسای هێز: ∫ x^n dx = (x^(n+1))/(n+1) + C
• یاسای دابەشکردن: ∫ (u + v) dx = ∫ u dx + ∫ v dx
• تەواوکاری بەش بەش (Integration by Parts): ∫ u dv = uv - ∫ v du
• هاوکێشەی دێریڤاتیڤی زنجیرەیی لەبیر مەکەن بۆ تاقیکردنەوەی هەفتەی داهاتوو!`,
      author: "سەنگەر",
      updatedAt: "10 خولەک لەمەوبەر",
    },
    {
      id: "n2",
      title: "پرسیارە گرنگەکانی ئیمتیحانی فایClass",
      content: `1. شیکاری ڕووبەری نێوان دوو کەوانەی لار لە نێوان [a, b]
2. دۆزینەوەی قەبارەی تەنی خولاوە (Solid of Revolution) بە شێوازی قاپ (Disk Method)
3. کاتی کۆبوونەوەی ئۆنلاینی داهاتوو: پێنجشەممە کاتژمێر 8:00ی شەو.`,
      author: "ڕەوەند",
      updatedAt: "35 خولەک لەمەوبەر",
    },
  ]);
  const [activeNoteId, setActiveNoteId] = useState<string>("n1");
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const currentNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // 2. Shared Files State
  const [files, setFiles] = useState<SharedFile[]>([
    { id: "f1", name: "Calculus_Chapter_4_Notes.pdf", size: "3.4 MB", type: "PDF", uploader: "سەنگەر", uploadedAt: "ئەمڕۆ، 10:30" },
    { id: "f2", name: "Exam_Formula_CheatSheet.png", size: "1.2 MB", type: "Image", uploader: "لانە", uploadedAt: "دوێنێ، 17:15" },
    { id: "f3", name: "Homework_Assignment_3.docx", size: "850 KB", type: "Word", uploader: "ڕەوەند", uploadedAt: "2 ڕۆژ لەمەوبەر" },
  ]);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "سەنگەر", avatar: "س", text: "سڵاو هاوڕێیان، بەخێربێن بۆ گرووپی بیرکاری! ئەمڕۆ لەسەر تەواوکاری بەش بەش دەخوێنین.", time: "10:15", color: "bg-indigo-500" },
    { id: "m2", sender: "ڕەوەند", avatar: "ڕ", text: "سڵاو سەنگەر گیان، تێبینییەکانم لە بەشی Shared Notes داناوە سەیری بکەن.", time: "10:18", color: "bg-emerald-500" },
    { id: "m3", sender: "لانە", avatar: "ل", text: "دەستت خۆش بێت، پرسیاری سێیەمی کویزەکە کەمێک زەحمەت بوو بەڵام شیکارم کرد!", time: "10:22", color: "bg-rose-500" },
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // 4. Interactive Quiz State
  const [quizQuestions] = useState<QuizQuestion[]>(SAMPLE_QUIZ);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // 5. Whiteboard State (HTML5 Canvas)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#6366f1");
  const [penWidth, setPenWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // 6. AI Tutor State
  const [aiTutorMessages, setAiTutorMessages] = useState<{ sender: "user" | "tutor"; text: string; time: string }[]>([
    {
      sender: "tutor",
      text: "سڵاڤ هەڤالێن ژوورا خواندنێ! 👋 ئەز مامۆستایێ ژیرییا دەستکرد (AI Tutor) یێ ڤێ ژوورێ مە. هەر پرسیار، هاوکێشە، شیکارکرن یان ڕوونکرنەکا هەوە بڤێت ل سەر بیرکاری و وانەیان لێرە ژ من بپرسن!",
      time: "10:00",
    },
  ]);
  const [aiTutorInput, setAiTutorInput] = useState("");
  const [aiTutorLoading, setAiTutorLoading] = useState(false);

  // Copy Room Code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const newR: StudyRoom = {
      id: `room_${Date.now()}`,
      name: newRoomName,
      subject: newRoomSubject || "General Study",
      topic: "تەوەری نوێی دیاریکراو",
      membersCount: 1,
      code: `ROOM-${Math.floor(1000 + Math.random() * 9000)}`,
      activeMembers: [{ name: "سەنگەر (تۆ)", avatar: "س", role: "admin", color: "bg-indigo-500" }],
    };
    setRooms((prev) => [newR, ...prev]);
    setCurrentRoomId(newR.id);
    setIsCreatingRoom(false);
    setNewRoomName("");
    setNewRoomSubject("");
  };

  // Send Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "سەنگەر",
      avatar: "س",
      text: chatInputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      color: "bg-indigo-500",
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInputText("");
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Send AI Tutor Message
  const handleSendAiTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTutorInput.trim() || aiTutorLoading) return;
    const userQ = aiTutorInput;
    const userMsg = {
      sender: "user" as const,
      text: userQ,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setAiTutorMessages((prev) => [...prev, userMsg]);
    setAiTutorInput("");
    setAiTutorLoading(true);

    // AI Response Simulation
    setTimeout(() => {
      let responseText = `بەرسڤا شیکاریا مامۆستایێ AI بۆ پرسیارا تە:\n\nبۆ چارەسەرکرنا ڤی بابەتی، دەستپێکێ پێدڤیە یاسایا سەرەکی بجهبینین. گۆڕاوکان ژ ئێک جودا دکەین و پاشان پێنگاڤ ب پێنگاڤ ب شێوازەکێ لۆژیکی ڕوون دکەین.\n\nئەرێ تە دڤێت نموونەیەکا دی یا وەکی ڤێ بۆ تە شیکار کەم هەڤالێ من؟`;
      if (userQ.includes("تەواوکاری") || userQ.includes("ئینتیگرال") || userQ.includes("integral")) {
        responseText = `شیکاریا تەواوکاریێ (ئینتیگرال):\n• یاسایا گشتی: ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C\n• بۆ نموونە: ئەگەر هاوکێشەیا تە ∫ 3x² dx بیت، ئەڤجا دبیتە:\n3 * (x³ / 3) + C = x³ + C.\n\nتێبینی: هەمیشە نەگۆڕێ C بنڤیسە د تەواوکاریێن نادیاردا!`;
      } else if (userQ.includes("دەمی") || userQ.includes("کاتی خوێندن") || userQ.includes("پلان")) {
        responseText = `پلانا پێشنیارکری بۆ ڤێ ژوورێ:\n1. 45 خولەک خواندنا چڕ (Deep Work)\n2. 10 خولەک بێهنڤەدان و گۆڕینەوەیا پرسیاران د چاتێ دا\n3. ئەنجامدانا کویزێ تاقیکرنێ د پشکا Quiz دا.\nسەرکەفتی بن!`;
      }

      setAiTutorMessages((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setAiTutorLoading(false);
    }, 1200);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = isEraser ? "#ffffff" : penColor;
    ctx.lineWidth = isEraser ? penWidth * 4 : penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Upload file simulation
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const newFile: SharedFile = {
      id: `f_${Date.now()}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.name.split(".").pop()?.toUpperCase() || "FILE",
      uploader: "سەنگەر (تۆ)",
      uploadedAt: "ئێستا",
    };
    setFiles((prev) => [newFile, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Current Room & Active Members */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              <Users className="w-3.5 h-3.5" /> ژووری خوێندنی گرووپی ئۆنلاین (Study Group Room)
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{currentRoom.name}</h2>
            <p className="text-xs text-muted-foreground">
              تەوەر: <strong className="text-foreground">{currentRoom.topic}</strong> • بابەت: {currentRoom.subject}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Room Code Pill */}
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-secondary border border-border text-xs font-bold">
              <span className="text-muted-foreground font-mono">کۆدی ژوور:</span>
              <span className="font-mono text-primary font-extrabold">{currentRoom.code}</span>
              <button
                onClick={copyRoomCode}
                className="p-1.5 rounded-xl bg-background hover:bg-card border border-border transition cursor-pointer text-muted-foreground hover:text-foreground"
                title="کۆپیکردنی کۆدی ژوور"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Switch / Create Room Buttons */}
            <select
              value={currentRoomId}
              onChange={(e) => setCurrentRoomId(e.target.value)}
              className="h-10 px-3 rounded-2xl bg-secondary border border-border text-xs font-bold"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.membersCount} ئەندام)
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsCreatingRoom(true)}
              className="py-2.5 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              دروستکردنی ژوور
            </button>
          </div>
        </div>

        {/* Active Members Bar */}
        <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground">ئەندامانی لەسەر هێڵ:</span>
            <div className="flex items-center -space-x-2">
              {currentRoom.activeMembers.map((m, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-full ${m.color} text-white font-bold text-xs flex items-center justify-center ring-2 ring-card shadow-xs`}
                  title={`${m.name} (${m.role})`}
                >
                  {m.avatar}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">
              {currentRoom.activeMembers.map((m) => m.name.split(" ")[0]).join("، ")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>دەستبەجێ پەیوەستە (Live Sync)</span>
          </div>
        </div>
      </div>

      {/* Main Room Navigation Tabs (6 Core Features) */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-secondary/80 border border-border no-scrollbar">
        {[
          { id: "notes", label: "تێبینییە هاوبەشەکان (Shared Notes)", icon: FileText },
          { id: "files", label: `فایلەکان (${files.length})`, icon: FolderOpen },
          { id: "quiz", label: "کویزی تاقیکردنەوە (Quiz)", icon: HelpCircle },
          { id: "chat", label: `چاتی گرووپ (${chatMessages.length})`, icon: MessageSquare },
          { id: "whiteboard", label: "تەختەی سپی (Whiteboard)", icon: Pencil },
          { id: "ai_tutor", label: "مامۆستای AI (AI Tutor)", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SHARED NOTES TAB */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-in fade-in-0 duration-200">
          {/* Notes Sidebar List */}
          <div className="md:col-span-4 p-5 rounded-3xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" /> تێبینییەکانی ژوور
              </h3>
              <button
                onClick={() => {
                  const newN: SharedNote = {
                    id: `n_${Date.now()}`,
                    title: "تێبینی نوێ...",
                    content: "دەقی تێبینییەکەت لێرە بنووسە...",
                    author: "سەنگەر (تۆ)",
                    updatedAt: "ئێستا",
                  };
                  setNotes((prev) => [newN, ...prev]);
                  setActiveNoteId(newN.id);
                  setIsEditingNote(true);
                }}
                className="p-1.5 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition cursor-pointer text-xs"
                title="زیادکردنی لاپەڕە"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {notes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                    activeNoteId === n.id
                      ? "bg-primary/10 border-primary/40"
                      : "bg-secondary/30 border-border hover:border-border/80"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground block truncate">{n.title}</span>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                    <span>{n.author}</span>
                    <span>{n.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Editor / Viewer Area */}
          <div className="md:col-span-8 p-6 md:p-8 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-foreground">{currentNote.title}</h3>
                <span className="text-[11px] text-muted-foreground font-mono">
                  دەستکاریکراوە لەلایەن: <strong className="text-foreground">{currentNote.author}</strong> ({currentNote.updatedAt})
                </span>
              </div>
              <button
                onClick={() => setIsEditingNote(!isEditingNote)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isEditingNote ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                {isEditingNote ? "پاشەکەوتکردن" : "دەستکاریکردن"}
              </button>
            </div>

            {isEditingNote ? (
              <textarea
                value={currentNote.content}
                onChange={(e) => {
                  const val = e.target.value;
                  setNotes((prev) =>
                    prev.map((n) => (n.id === currentNote.id ? { ...n, content: val, updatedAt: "ئێستا" } : n)),
                  );
                }}
                className="w-full h-80 p-4 rounded-2xl bg-secondary/30 border border-border text-xs leading-relaxed font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            ) : (
              <div className="p-6 rounded-2xl bg-secondary/20 border border-border text-xs leading-relaxed font-mono whitespace-pre-wrap min-h-[300px]">
                {currentNote.content}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SHARED FILES TAB */}
      {activeTab === "files" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in-0 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">فایل و سەرچاوە هاوبەشەکانی ژوور</h3>
              <p className="text-xs text-muted-foreground mt-0.5">پەڕاو، کتێب و مەلزەمەکانی تایبەت بەم گرووپەی خوێندن.</p>
            </div>

            <div>
              <input type="file" ref={fileUploadInputRef} onChange={handleUploadFile} className="hidden" />
              <button
                onClick={() => fileUploadInputRef.current?.click()}
                className="py-2.5 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-sm hover:opacity-95 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                بارکردنی فایل بۆ گرووپ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {files.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3 hover:border-primary/40 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                    {f.type}
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="font-bold text-xs text-foreground block truncate">{f.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                      <span>{f.size}</span>
                      <span>•</span>
                      <span>{f.uploader}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`داگرتنی پەڕگەی ${f.name}`)}
                  className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition cursor-pointer text-muted-foreground shrink-0"
                  title="داگرتن"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GROUP QUIZ TAB */}
      {activeTab === "quiz" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in-0 duration-200 max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block mb-0.5">
                    پرسیاری {currentQuizIndex + 1} لە {quizQuestions.length}
                  </span>
                  <h3 className="text-lg font-extrabold text-foreground">
                    {quizQuestions[currentQuizIndex].question}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>خاڵ: {quizScore}</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === quizQuestions[currentQuizIndex].correctIndex;
                  let btnClass = "bg-secondary/40 border-border hover:border-primary/50 text-foreground";
                  if (showExplanation) {
                    if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                    else if (isSelected) btnClass = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300";
                  } else if (isSelected) {
                    btnClass = "bg-primary/20 border-primary text-primary font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showExplanation}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-right text-xs transition cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                    >
                      <span className="font-sans font-bold">{opt}</span>
                      <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center font-mono text-[11px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {showExplanation && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/25 space-y-1 animate-in fade-in-0">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> ڕوونکردنەوەی شیکار:
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {quizQuestions[currentQuizIndex].explanation}
                  </p>
                </div>
              )}

              {/* Bottom Quiz Action Button */}
              <div className="flex justify-end gap-2 pt-2">
                {!showExplanation ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={() => {
                      if (selectedOption === quizQuestions[currentQuizIndex].correctIndex) {
                        setQuizScore((s) => s + 1);
                      }
                      setShowExplanation(true);
                    }}
                    className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50 transition cursor-pointer shadow-sm"
                  >
                    پشکنینی وەڵام
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (currentQuizIndex + 1 < quizQuestions.length) {
                        setCurrentQuizIndex((i) => i + 1);
                        setSelectedOption(null);
                        setShowExplanation(false);
                      } else {
                        setQuizFinished(true);
                      }
                    }}
                    className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    {currentQuizIndex + 1 < quizQuestions.length ? "پرسیاری دواتر" : "بینینی ئەنجامەکان"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">پیرۆزە! کویزەکەت تەواو کرد 🎉</h3>
              <p className="text-xs text-muted-foreground">
                ئەنجامی بەدەستهاتوو: <strong className="text-emerald-600 font-mono text-base font-extrabold">{quizScore}</strong> لە {quizQuestions.length}
              </p>
              <button
                onClick={() => {
                  setCurrentQuizIndex(0);
                  setSelectedOption(null);
                  setShowExplanation(false);
                  setQuizScore(0);
                  setQuizFinished(false);
                }}
                className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition cursor-pointer"
              >
                دووبارەکردنەوەی تاقیکردنەوە
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. LIVE GROUP CHAT TAB */}
      {activeTab === "chat" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" /> چاتی گرووپی ڕاستەوخۆ
            </h3>
            <span className="text-[11px] text-muted-foreground">{currentRoom.activeMembers.length} ئەندام لەسەر هێڵن</span>
          </div>

          {/* Messages Container */}
          <div className="h-80 overflow-y-auto space-y-3 p-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-full ${msg.color || "bg-primary"} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                  {msg.avatar}
                </div>
                <div className="space-y-0.5 max-w-[85%] text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-foreground">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{msg.time}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-xs text-foreground leading-relaxed inline-block">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-border">
            <input
              type="text"
              value={chatInputText}
              onChange={(e) => setChatInputText(e.target.value)}
              placeholder="پەیامێک بنووسە بۆ گرووپ..."
              className="flex-1 h-11 px-4 rounded-2xl bg-secondary/40 border border-border text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              ناردن
            </button>
          </form>
        </div>
      )}

      {/* 5. INTERACTIVE WHITEBOARD TAB */}
      {activeTab === "whiteboard" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-foreground">تەختەی سپی و نەخشاندنی هاوکێشە (Interactive Whiteboard)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">هاوبەشیپێکردنی کێشان و شیکارکردنی هاوکێشەکان لەگەڵ ئەندامان.</p>
            </div>

            {/* Whiteboard Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
                {["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#0f172a"].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPenColor(c);
                      setIsEraser(false);
                    }}
                    className={`w-6 h-6 rounded-lg transition cursor-pointer border ${penColor === c && !isEraser ? "ring-2 ring-primary scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isEraser ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-foreground"
                }`}
                title="پاکەرەوە (Eraser)"
              >
                <Eraser className="w-4 h-4" />
                پاکەرەوە
              </button>

              <button
                onClick={clearCanvas}
                className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold border border-destructive/25 transition cursor-pointer"
                title="پاککردنەوەی تەواوی تەختەکە"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-white overflow-hidden touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}

      {/* 6. AI TUTOR TAB */}
      {activeTab === "ai_tutor" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-foreground">مامۆستای ژیری دەستکردی ژوور (AI Room Tutor)</h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">ئامادەیە بۆ شیکارکردن و وەڵامدانەوە</span>
              </div>
            </div>
          </div>

          {/* AI Tutor Chat Stream */}
          <div className="h-80 overflow-y-auto space-y-3 p-2">
            {aiTutorMessages.map((m, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user" ? "bg-indigo-600 text-white" : "bg-primary/20 text-primary"
                }`}>
                  {m.sender === "user" ? "س" : <Bot className="w-4 h-4" />}
                </div>
                <div className={`space-y-0.5 max-w-[80%] ${m.sender === "user" ? "text-left" : "text-right"}`}>
                  <div className="p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap border ${
                    m.sender === 'user' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/40 border-border text-foreground'
                  }">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {aiTutorLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                <Sparkles className="w-4 h-4 animate-spin text-primary" />
                <span>مامۆستای AI خەریکی داڕشتنی شیکارەکەیە...</span>
              </div>
            )}
          </div>

          {/* Prompt input */}
          <form onSubmit={handleSendAiTutor} className="flex gap-2 pt-2 border-t border-border">
            <input
              type="text"
              value={aiTutorInput}
              onChange={(e) => setAiTutorInput(e.target.value)}
              placeholder="پرسیار لە مامۆستای AI بکە لەسەر ئەم وانەیە..."
              className="flex-1 h-11 px-4 rounded-2xl bg-secondary/40 border border-border text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={aiTutorLoading}
              className="h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              پرسیار بکە
            </button>
          </form>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {isCreatingRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> دروستکردنی ژووری خوێندنی نوێ
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">ناوی ژوور / گرووپ:</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="وەک: Mathematics Group یان Physics Exam Prep"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">بابەت / وانە (Subject):</label>
                <input
                  type="text"
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                  placeholder="وەک: Calculus, Biology, Computer Science"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoom(false)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-sm"
                >
                  دروستکردنی ژوور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
