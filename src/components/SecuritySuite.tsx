import { useState, useRef, useEffect, useId } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import {
  QrCode,
  Scan,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  FileCode,
  Globe,
  Fingerprint,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  Camera,
  CameraOff,
  ExternalLink,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  Wifi,
  Mail,
  MessageSquare,
  User,
  Type,
  Link as LinkIcon,
  Trash2,
  FileText,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";

// ==========================================
// UTILITY: MD5 Hash implementation (pure JS)
// ==========================================
function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue: number) {
    let WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function utf8Encode(string: string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  let x = Array();
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = utf8Encode(string);
  x = convertToWordArray(string);
  a = 0x67452301; b = 0xefcdab89; c = 0x98badcfe; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

async function computeSubtleHash(algorithm: string, data: BufferSource): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ==========================================
// 1. QR CODE GENERATOR COMPONENT
// ==========================================
export function QrCodeGenerator() {
  const [qrType, setQrType] = useState<"text" | "url" | "wifi" | "vcard" | "whatsapp" | "email">("url");
  const [textVal, setTextVal] = useState("https://las-ai.com");
  
  // Wi-Fi fields
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEnc, setWifiEnc] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard fields
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardCompany, setVcardCompany] = useState("");

  // WhatsApp fields
  const [waPhone, setWaPhone] = useState("");
  const [waMsg, setWaMsg] = useState("");

  // Email fields
  const [mailTo, setMailTo] = useState("");
  const [mailSub, setMailSub] = useState("");
  const [mailBody, setMailBody] = useState("");

  // Styling
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Generate payload string based on type
  const getPayload = () => {
    switch (qrType) {
      case "url":
      case "text":
        return textVal || " ";
      case "wifi":
        return `WIFI:T:${wifiEnc};S:${wifiSsid};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "whatsapp":
        const cleanPhone = waPhone.replace(/[^0-9]/g, "");
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
      case "email":
        return `mailto:${mailTo}?subject=${encodeURIComponent(mailSub)}&body=${encodeURIComponent(mailBody)}`;
      default:
        return textVal;
    }
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload.trim()) return;

    QRCode.toDataURL(payload, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [qrType, textVal, wifiSsid, wifiPass, wifiEnc, wifiHidden, vcardName, vcardPhone, vcardEmail, vcardCompany, waPhone, waMsg, mailTo, mailSub, mailBody, fgColor, bgColor, qrSize, errorLevel]);

  const handleCopy = () => {
    if (!qrDataUrl) return;
    fetch(qrDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        navigator.clipboard.writeText(getPayload());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2">
              <QrCode className="w-3.5 h-3.5" /> چێکەرێ بارکۆد و کۆدێ QR
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-2">
              <span>چێکەرێ کۆدێ QR</span>
              <span className="text-muted-foreground/80 font-normal text-xs sm:text-sm md:text-base" dir="ltr">
                (QR Code Generator)
              </span>
            </h2>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border mb-6">
          {[
            { id: "url", label: "لینکێ وێبێ (URL)", icon: LinkIcon },
            { id: "text", label: "دەق (Text)", icon: Type },
            { id: "wifi", label: "وایفای (Wi-Fi)", icon: Wifi },
            { id: "whatsapp", label: "واتسئاپ (WhatsApp)", icon: MessageSquare },
            { id: "vcard", label: "کارتا پەیوەندیێ (vCard)", icon: User },
            { id: "email", label: "ئیمەیل (Email)", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = qrType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setQrType(tab.id as any)}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs Section */}
          <div className="lg:col-span-7 space-y-4">
            {qrType === "url" && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">لینکێ ماڵپەڕی یان لاپەڕەی:</label>
                <input
                  type="url"
                  dir="ltr"
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full h-11 px-4 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {qrType === "text" && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">دەقێ دلخواز یان پەیام:</label>
                <textarea
                  rows={4}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="دەقێ خۆ ل ڤێرێ بنڤیسە..."
                  className="w-full p-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {qrType === "wifi" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ناڤێ وایفایێ (SSID):</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="MyHome_WiFi"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">پاسۆردێ وایفایێ:</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="Password123"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-muted-foreground">جۆرێ پاراستنێ:</span>
                  {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                    <label key={enc} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="wifiEnc"
                        checked={wifiEnc === enc}
                        onChange={() => setWifiEnc(enc)}
                      />
                      <span>{enc === "nopass" ? "ڤەکری (بێ پاسۆرد)" : enc}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {qrType === "whatsapp" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ژمارا تەلەفۆنێ (دگەل کۆدێ وەلاتى):</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="9647501234567"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">پەیامێ ئامادەکری (ب دلخواز):</label>
                  <textarea
                    rows={2}
                    value={waMsg}
                    onChange={(e) => setWaMsg(e.target.value)}
                    placeholder="سڵاڤ، دخوازم پەیوەندیێ ب تە بکەم..."
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {qrType === "vcard" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ناڤێ تمام:</label>
                  <input
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    placeholder="سەنگەر محەمەد"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ژمارا مۆبایلێ:</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    placeholder="+964 750 000 0000"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ئیمەیل:</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">کۆمپانیا / کار:</label>
                  <input
                    type="text"
                    value={vcardCompany}
                    onChange={(e) => setVcardCompany(e.target.value)}
                    placeholder="زانکۆ / کۆمپانیا"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {qrType === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">ئیمەیلێ وەرگری:</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={mailTo}
                    onChange={(e) => setMailTo(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">بابەت (Subject):</label>
                  <input
                    type="text"
                    value={mailSub}
                    onChange={(e) => setMailSub(e.target.value)}
                    placeholder="پەیوەندی ل دۆر..."
                    className="w-full h-10 px-3 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">دەقێ ئیمەیلێ:</label>
                  <textarea
                    rows={2}
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    placeholder="دەقێ ئیمەیلێ خۆ ل ڤێرێ بنڤیسە..."
                    className="w-full p-2.5 rounded-xl bg-secondary/40 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Customization Options */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> ڕێکخستنا ڕەنگ و کوالێتیێ:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                <div>
                  <span className="text-muted-foreground block mb-1">ڕەنگێ کۆدی:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">ڕەنگێ باکگراوندی:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">ئاستێ ڕاستڤەکرنێ (Correction):</span>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs"
                  >
                    <option value="L">کێم (L - 7%)</option>
                    <option value="M">ناڤین (M - 15%)</option>
                    <option value="Q">بەرز (Q - 25%)</option>
                    <option value="H">گەلەک بەرز (H - 30%)</option>
                  </select>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">قەبارەیێ پیکسلی:</span>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs font-mono"
                  >
                    <option value={200}>200 px</option>
                    <option value={300}>300 px</option>
                    <option value={500}>500 px (HD)</option>
                    <option value={1000}>1000 px (Ultra)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Download Section */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/20 border border-border text-center space-y-4">
            <div className="p-4 rounded-2xl bg-white shadow-md border border-border/50 inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="w-52 h-52 object-contain mx-auto rounded-lg"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-muted-foreground text-xs">
                  چێکرنا کۆدی...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <a
                href={qrDataUrl}
                download={`qrcode_${Date.now()}.png`}
                className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                داگرتنا وێنەی (PNG)
              </a>
              <button
                onClick={handleCopy}
                className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "هاتە کۆپیکرن!" : "کۆپیکرنا وێنەی"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. QR CODE SCANNER COMPONENT
// ==========================================
export function QrCodeScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        setScanResult(code.data);
        stopCamera();
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error(err);
      setCameraError("دەستویریا کامیرایێ نەهاتیە دان یان ئامیرەی کەنالێ کامیرایێ نینە.");
      setIsCameraActive(false);
    }
  };

  // Decode from file image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanResult(null);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScanResult(code.data);
          } else {
            setCameraError("چ کۆدێن QR د ڤی وێنەی دا نەهاتنە دیتن.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const copyResult = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <Scan className="w-3.5 h-3.5" /> سکێنەرێ کۆدێ QR ب کامیرە و وێنەی
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-2">
              <span>سکێنەرێ کۆدێ QR</span>
              <span className="text-muted-foreground/80 font-normal text-xs sm:text-sm md:text-base" dir="ltr">
                (QR Code Scanner)
              </span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Scanner Controls & Camera View */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-black/90 aspect-4/3 flex items-center justify-center border-2 border-border shadow-inner">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isCameraActive ? "block" : "hidden"}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!isCameraActive && (
                <div className="text-center p-6 text-slate-300 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-emerald-400">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">کامیرا نەچالاکە</p>
                    <p className="text-xs text-slate-400 mt-1">
                      کامیرایێ پێبکە یان وێنەیێ کۆدی ل ڤێرێ باربکە
                    </p>
                  </div>
                </div>
              )}

              {/* Scanning Target Box Over Camera */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-md" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  دەستپێکرنا کامیرایێ
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 px-4 rounded-2xl bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  ڕاگرتنا کامیرایێ
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                بارکرنا وێنەی
              </button>
            </div>

            {cameraError && (
              <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Decoded Result Box */}
          <div className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ئەنجامێ سکانکری
            </h3>

            {scanResult ? (
              <div className="space-y-4 animate-in fade-in-0 duration-200">
                <div className="p-4 rounded-2xl bg-card border border-border text-right max-h-60 overflow-y-auto">
                  <p className="text-sm font-mono break-all select-all text-foreground whitespace-pre-wrap" dir="ltr">
                    {scanResult}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyResult}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "هاتە کۆپیکرن!" : "کۆپیکرنا دەقی"}
                  </button>

                  {scanResult.startsWith("http://") || scanResult.startsWith("https://") ? (
                    <a
                      href={scanResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ڤەکرنا لینکێ
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs">
                کۆدی بدەنە بەرامبەر کامیرایێ یان وێنەیەکێ باربکەن بو خاندنێ.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. HASH GENERATOR COMPONENT
// ==========================================
export function HashGenerator() {
  const [inputText, setInputText] = useState("Las AI Security");
  const [hashes, setHashes] = useState<{ [key: string]: string }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isUppercase, setIsUppercase] = useState(false);
  const [compareHash, setCompareHash] = useState("");

  const calculateHashes = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const md5Hash = md5(text);
    const sha1Hash = await computeSubtleHash("SHA-1", data);
    const sha256Hash = await computeSubtleHash("SHA-256", data);
    const sha384Hash = await computeSubtleHash("SHA-384", data);
    const sha512Hash = await computeSubtleHash("SHA-512", data);

    setHashes({
      MD5: md5Hash,
      "SHA-1": sha1Hash,
      "SHA-256": sha256Hash,
      "SHA-384": sha384Hash,
      "SHA-512": sha512Hash,
    });
  };

  useEffect(() => {
    calculateHashes(inputText);
  }, [inputText]);

  // Handle file hashing
  const handleFileHash = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (!buffer) return;

      const sha1Hash = await computeSubtleHash("SHA-1", buffer);
      const sha256Hash = await computeSubtleHash("SHA-256", buffer);
      const sha384Hash = await computeSubtleHash("SHA-384", buffer);
      const sha512Hash = await computeSubtleHash("SHA-512", buffer);

      // Convert buffer chunk to string for MD5
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < Math.min(bytes.length, 500000); i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const md5Hash = md5(binary);

      setHashes({
        MD5: md5Hash,
        "SHA-1": sha1Hash,
        "SHA-256": sha256Hash,
        "SHA-384": sha384Hash,
        "SHA-512": sha512Hash,
      });
      setInputText(`[فایل: ${file.name} - ${(file.size / 1024).toFixed(1)} KB]`);
    };
    reader.readAsArrayBuffer(file);
  };

  const copyHash = (key: string, val: string) => {
    const finalVal = isUppercase ? val.toUpperCase() : val.toLowerCase();
    navigator.clipboard.writeText(finalVal);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
              <Hash className="w-3.5 h-3.5" /> چێکەرێ هاشان (MD5, SHA-1, SHA-256, SHA-512)
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-2">
              <span>چێکەر و بەراوردکەرێ هاشان</span>
              <span className="text-muted-foreground/80 font-normal text-xs sm:text-sm md:text-base" dir="ltr">
                (Hash Generator & Checksum)
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUppercase(!isUppercase)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isUppercase ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border"
              }`}
            >
              {isUppercase ? "UPPERCASE" : "lowercase"}
            </button>
          </div>
        </div>

        {/* Input Text & File Upload */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">دەق یان پەیام بۆ چێکرنا هاشێ (Hash):</label>
            <label className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> هاشکرنا فایلی
              <input type="file" onChange={handleFileHash} className="hidden" />
            </label>
          </div>
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="دەقێ خۆ ل ڤێرێ بنڤیسە..."
            className="w-full p-3.5 rounded-2xl bg-secondary/30 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Hash Comparison Box */}
        <div className="p-4 rounded-2xl bg-secondary/20 border border-border mb-6">
          <label className="text-xs font-bold text-foreground block mb-1.5">
            بەراوردکرنا هاشی (بۆ پشتڕاستبوون ژ دروستیا فایلی):
          </label>
          <input
            type="text"
            dir="ltr"
            value={compareHash}
            onChange={(e) => setCompareHash(e.target.value.trim())}
            placeholder="هاشێ چاڤەڕێکری ل ڤێرێ دانێ..."
            className="w-full h-10 px-3.5 rounded-xl bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Hashes List */}
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hashVal]) => {
            const displayHash = isUppercase ? hashVal.toUpperCase() : hashVal.toLowerCase();
            const isMatch = compareHash && (compareHash.toLowerCase() === hashVal.toLowerCase());
            return (
              <div
                key={algo}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isMatch
                    ? "bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/20"
                    : "bg-secondary/30 border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="w-20 font-extrabold text-xs text-primary uppercase font-mono px-2 py-1 rounded-lg bg-primary/10 text-center">
                    {algo}
                  </span>
                  {isMatch && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> وەکهەڤە (یەکسانە)
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0" dir="ltr">
                  <span className="font-mono text-xs text-foreground break-all select-all block text-right">
                    {displayHash}
                  </span>
                </div>

                <button
                  onClick={() => copyHash(algo, hashVal)}
                  className="py-1.5 px-3 rounded-xl bg-background hover:bg-secondary border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedKey === algo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === algo ? "هاتە کۆپیکرن" : "کۆپی"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. BASE64 ENCODER / DECODER COMPONENT
// ==========================================
export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputVal, setInputVal] = useState("سڵاڤ جیهان! Las AI");
  const [outputVal, setOutputVal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setError(null);
    if (!inputVal) {
      setOutputVal("");
      return;
    }

    try {
      if (mode === "encode") {
        // Safe UTF-8 Base64 Encoding
        const bytes = new TextEncoder().encode(inputVal);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        setOutputVal(btoa(binString));
      } else {
        // Safe UTF-8 Base64 Decoding
        const binString = atob(inputVal.trim());
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        setOutputVal(new TextDecoder().decode(bytes));
      }
    } catch (err: any) {
      setError(mode === "decode" ? "ئەڤ دەقە Base64 یێ دروست نینە." : "شاشیەک د کۆدکرنێدا چێبوو.");
      setOutputVal("");
    }
  }, [inputVal, mode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOutputVal(base64);
      setInputVal(`[فایل: ${file.name}]`);
      setMode("encode");
    };
    reader.readAsDataURL(file);
  };

  const copyOutput = () => {
    if (outputVal) {
      navigator.clipboard.writeText(outputVal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
              <FileCode className="w-3.5 h-3.5" /> گوهۆڕینا دەق و فایلی بۆ Base64
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              Base64 Encoder & Decoder
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary border border-border">
            <button
              onClick={() => {
                setMode("encode");
                setInputVal("سڵاڤ جیهان! Las AI");
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "encode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Encode (کۆدکرن)
            </button>
            <button
              onClick={() => {
                setMode("decode");
                setInputVal("2LPZhNin2Ygg2KzbjNmH2KfZhiE=");
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "decode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Decode (شیکارکرن)
            </button>
          </div>
        </div>

        {/* Input Box */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              {mode === "encode" ? "دەقێ سەرەکی (Plain Text):" : "کۆدێ Base64 بۆ ڤەکرنێ:"}
            </label>
            {mode === "encode" && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> گوهۆڕینا فایل / وێنەی بۆ Base64
                </button>
              </>
            )}
          </div>
          <textarea
            rows={4}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={mode === "encode" ? "دەقێ خۆ ل ڤێرێ بنڤیسە..." : "کۆدێ Base64 ل ڤێرێ دانە..."}
            className="w-full p-3.5 rounded-2xl bg-secondary/30 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Output Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              {mode === "encode" ? "ئەنجامێ کۆدکری یێ Base64:" : "دەقێ شیکارکری (Decoded Text):"}
            </label>
            {outputVal && (
              <button
                onClick={copyOutput}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "هاتە کۆپیکرن!" : "کۆپیکرن"}
              </button>
            )}
          </div>
          <textarea
            readOnly
            rows={4}
            value={outputVal}
            placeholder="ئەنجام دێ ل ڤێرێ دیار بیت..."
            className="w-full p-3.5 rounded-2xl bg-secondary/20 border border-border text-sm font-mono text-foreground focus:outline-none select-all"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. URL ENCODER / DECODER COMPONENT
// ==========================================
export function UrlEncoderTool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputVal, setInputVal] = useState("https://example.com/search?q=کوردستان زانکۆ");
  const [outputVal, setOutputVal] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!inputVal) {
      setOutputVal("");
      return;
    }
    try {
      if (mode === "encode") {
        setOutputVal(encodeURIComponent(inputVal));
      } else {
        setOutputVal(decodeURIComponent(inputVal));
      }
    } catch {
      setOutputVal("شاشی د شیکارکرنا URL دا چێبوو");
    }
  }, [inputVal, mode]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
              <Globe className="w-3.5 h-3.5" /> کۆدکرن و شیکارکرنا لینکێ وێبێ
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              URL Encoder & Decoder
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-secondary border border-border">
            <button
              onClick={() => setMode("encode")}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "encode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Encode (کۆدکرن)
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === "decode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Decode (شیکارکرن)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              {mode === "encode" ? "لینکێ ئاسایی (Normal URL):" : "لینکێ کۆدکری (Encoded URL):"}
            </label>
            <textarea
              rows={3}
              dir="ltr"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-secondary/30 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-foreground">ئەنجام:</label>
              {outputVal && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(outputVal);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "هاتە کۆپیکرن!" : "کۆپیکرن"}
                </button>
              )}
            </div>
            <textarea
              readOnly
              rows={3}
              dir="ltr"
              value={outputVal}
              className="w-full p-3.5 rounded-2xl bg-secondary/20 border border-border text-sm font-mono text-foreground focus:outline-none select-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. UUID & TOKEN GENERATOR COMPONENT
// ==========================================
export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(5);
  const [format, setFormat] = useState<"v4" | "nanoid" | "hex" | "password">("v4");
  const [isUppercase, setIsUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuidV4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateNanoId = (len = 21) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    let res = "";
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) {
      res += chars[arr[i] % chars.length];
    }
    return res;
  };

  const generateHex = (bytes = 16) => {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const generateSecurePassword = (len = 16) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
    let res = "";
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) {
      res += chars[arr[i] % chars.length];
    }
    return res;
  };

  const generateBatch = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let val = "";
      if (format === "v4") val = generateUuidV4();
      else if (format === "nanoid") val = generateNanoId();
      else if (format === "hex") val = generateHex(16);
      else if (format === "password") val = generateSecurePassword(16);

      if (removeHyphens) val = val.replace(/-/g, "");
      if (isUppercase) val = val.toUpperCase();
      list.push(val);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateBatch();
  }, [quantity, format, isUppercase, removeHyphens]);

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Fingerprint className="w-3.5 h-3.5" /> چێکەرێ ناسنامەیا بێهەڤتا (UUID / GUID)
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              UUID & Secure Token Generator
            </h2>
          </div>

          <button
            onClick={generateBatch}
            className="py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            دوبارە چێکە
          </button>
        </div>

        {/* Options */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
          <div>
            <span className="text-muted-foreground block mb-1">جۆرێ ناسنامەیێ:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full h-9 px-2 rounded-xl bg-background border border-border text-xs font-bold"
            >
              <option value="v4">UUID v4 (Standard)</option>
              <option value="nanoid">NanoID (Short & Safe)</option>
              <option value="hex">Crypto Hex Token (32-char)</option>
              <option value="password">Secure Password (پەیڤا نهێنی)</option>
            </select>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">هژمارا داخوازی:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-9 px-2 rounded-xl bg-background border border-border text-xs font-bold font-mono"
            >
              <option value={1}>1 دانە</option>
              <option value={5}>5 دانە</option>
              <option value={10}>10 دانە</option>
              <option value={25}>25 دانە</option>
              <option value={50}>50 دانە</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isUppercase}
                onChange={(e) => setIsUppercase(e.target.checked)}
                className="rounded"
              />
              <span>پیتێن مەزن (UPPER)</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeHyphens}
                onChange={(e) => setRemoveHyphens(e.target.checked)}
                className="rounded"
              />
              <span>بێ هێڵ (No Hyphens)</span>
            </label>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">لیستا چێکری ({uuids.length}):</span>
            <button
              onClick={copyAll}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? "هەمی هاتنە کۆپیکرن!" : "کۆپیکرنا هەمییان"}
            </button>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {uuids.map((id, index) => (
              <div
                key={index}
                className="p-2.5 px-3.5 rounded-xl bg-secondary/30 border border-border flex items-center justify-between gap-3 group hover:border-primary/40 transition"
              >
                <span className="font-mono text-xs text-foreground select-all">{id}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(id)}
                  className="text-muted-foreground hover:text-primary transition p-1 cursor-pointer"
                  title="کۆپیکرن"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. LINKS CHECKER (پشکنەرێ ساختەکاری و سەلامەتیا لینکێ)
// ==========================================
interface SecurityCheckResult {
  score: number;
  status: "safe" | "warning" | "danger";
  protocol: string;
  domain: string;
  tld: string;
  hasSuspiciousTld: boolean;
  hasIpHost: boolean;
  isShortener: boolean;
  hasPhishingKeywords: boolean;
  hasDangerousScheme: boolean;
  details: string[];
}

export function LinksChecker() {
  const [urlInput, setUrlInput] = useState("https://google.com");
  const [result, setResult] = useState<SecurityCheckResult | null>(null);

  const checkLinkSafety = (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setResult(null);
      return;
    }

    let urlToParse = targetUrl.trim();
    if (!urlToParse.startsWith("http://") && !urlToParse.startsWith("https://") && !urlToParse.startsWith("javascript:")) {
      urlToParse = "https://" + urlToParse;
    }

    const details: string[] = [];
    let score = 100;
    let hasDangerousScheme = false;
    let hasSuspiciousTld = false;
    let hasIpHost = false;
    let isShortener = false;
    let hasPhishingKeywords = false;

    // Check dangerous schemes
    if (urlToParse.toLowerCase().startsWith("javascript:") || urlToParse.toLowerCase().startsWith("data:")) {
      hasDangerousScheme = true;
      score -= 80;
      details.push("مەترسیدار: پرۆتۆکۆلێ سکریپتێ بجهئینەر هاتیە بکارئینان (XSS Risk).");
    }

    try {
      const parsed = new URL(urlToParse);
      const host = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname.toLowerCase();

      // Check protocol
      if (parsed.protocol === "http:") {
        score -= 25;
        details.push("هشیاربە: ئەڤ مالپەرە کۆدێ پاراستی یێ SSL (HTTPS) نینە و داتا ب شێوەیەکێ ڤەکری دچن.");
      } else if (parsed.protocol === "https:") {
        details.push("پاراستی: ب پرۆتۆکۆلێ پاراستی یێ HTTPS کاردکەت.");
      }

      // Check IP Host
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipPattern.test(host)) {
        hasIpHost = true;
        score -= 40;
        details.push("گوماناوی: ب ناڤونیشانێ ئێکسەر یێ IP ڤە هاتیە گرێدان نەک دۆمەینێ فەرمی.");
      }

      // Check Shorteners
      const shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "shorturl.at", "ow.ly", "rb.gy"];
      if (shorteners.some((s) => host.includes(s))) {
        isShortener = true;
        score -= 20;
        details.push("هشیاربە: ئەڤە کورتکریا لینکێیە (URL Shortener) و جهێ دووماهیێ یێ ڤەشارتییە.");
      }

      // Check Suspicious TLDs
      const suspiciousTlds = [".top", ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz", ".fit", ".rest", ".icu", ".cam", ".monster", ".work"];
      if (suspiciousTlds.some((tld) => host.endsWith(tld))) {
        hasSuspiciousTld = true;
        score -= 30;
        details.push("هشیاربە: پاشگرێ دۆمەینی (TLD) گەلەک جاران بۆ سپام و فیشینگێ دهێتە بکارئینان.");
      }

      // Check Phishing Keywords on non-official hosts
      const phishingWords = ["login", "signin", "verify", "secure", "bank", "account-update", "free-gift", "crypto-airdrop", "telegram-gift", "snapchat-verify"];
      const trustedHosts = ["google.com", "microsoft.com", "apple.com", "facebook.com", "instagram.com", "github.com"];
      const isTrusted = trustedHosts.some((th) => host.endsWith(th));

      if (!isTrusted && phishingWords.some((w) => host.includes(w) || pathname.includes(w))) {
        hasPhishingKeywords = true;
        score -= 35;
        details.push("گەلەک مەترسیدار: پەیڤێن هەستیار و خاپینۆک یێن وەک (login, verify, gift) تێدا هەنە بۆ دزینا ئەکاونتی.");
      }

      // Multiple subdomains check
      const parts = host.split(".");
      if (parts.length > 3 && !isTrusted) {
        score -= 15;
        details.push("گوماناوی: هژمارەکا زۆر ژ سەب-دۆمەینێن ساختە د لینکیدا هەنە.");
      }

      const domainParts = host.split(".");
      const tld = domainParts.slice(-1)[0] || "";

      score = Math.max(10, Math.min(100, score));
      let status: "safe" | "warning" | "danger" = "safe";
      if (score < 50) status = "danger";
      else if (score < 80) status = "warning";

      setResult({
        score,
        status,
        protocol: parsed.protocol,
        domain: host,
        tld,
        hasSuspiciousTld,
        hasIpHost,
        isShortener,
        hasPhishingKeywords,
        hasDangerousScheme,
        details,
      });
    } catch {
      setResult({
        score: 20,
        status: "danger",
        protocol: "نەدیار",
        domain: urlToParse,
        tld: "",
        hasSuspiciousTld: false,
        hasIpHost: false,
        isShortener: false,
        hasPhishingKeywords: false,
        hasDangerousScheme: true,
        details: ["لینکێ داخیلکری ستانداردێ دروست نینە یان دەستکاری لێ هاتیە کرن."],
      });
    }
  };

  useEffect(() => {
    checkLinkSafety(urlInput);
  }, [urlInput]);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> پشکنەرێ ساختەکاری و سەلامەتیا لینکێ
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              Link Safety & Phishing Checker
            </h2>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-foreground block">
            لینکێ گوماناوی ل ڤێرێ دانە بۆ پشکنینا هاک و فیشینگێ:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              dir="ltr"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example-secure-login.xyz/verify..."
              className="flex-1 h-12 px-4 rounded-2xl bg-secondary/30 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => checkLinkSafety(urlInput)}
              className="px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              پشکنین
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in-0 duration-200">
            {/* Score Banner */}
            <div
              className={`p-6 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                result.status === "safe"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : result.status === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
                    result.status === "safe"
                      ? "bg-emerald-500"
                      : result.status === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-600"
                  }`}
                >
                  {result.status === "safe" ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <ShieldAlert className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base block">
                    {result.status === "safe"
                      ? "ئەڤ لینکە ژ لایێ دەستپێکی ڤە پاراستی دیارە"
                      : result.status === "warning"
                      ? "هشیاربە! خالێن گوماناوی د لینکیدا هەنە"
                      : "گەلەک مەترسیدارە! مەترسیا هاک و ساختەکاریێ (Phishing) هەیە"}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5 font-mono dir-ltr text-right">
                    {result.domain}
                  </p>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="text-2xl font-black font-mono">{result.score}%</span>
                <span className="text-[11px] block font-bold">ئاستێ سەلامەتیێ</span>
              </div>
            </div>

            {/* Detailed Checks Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-1">پرۆتۆکۆل:</span>
                <span className="font-mono font-bold text-xs uppercase flex items-center gap-1 text-foreground">
                  {result.protocol === "https:" ? "🔒 HTTPS (پاراستی)" : "⚠️ HTTP (بێ پاراستن)"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-1">کورتکری (Shortener):</span>
                <span className="font-bold text-xs flex items-center gap-1 text-foreground">
                  {result.isShortener ? "⚠️ بەلێ (لینکێ ڤەشارتی)" : "✓ نەخێر (دۆمەینێ ئێکسەر)"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-1">پاشگرێ دۆمەینی (TLD):</span>
                <span className="font-mono font-bold text-xs flex items-center gap-1 text-foreground">
                  .{result.tld} {result.hasSuspiciousTld ? "(⚠️ جهێ گومانێیە)" : "(ستاندارد)"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border">
                <span className="text-[11px] text-muted-foreground block mb-1">پەیڤێن فیشینگێ:</span>
                <span className="font-bold text-xs flex items-center gap-1 text-foreground">
                  {result.hasPhishingKeywords ? "🔴 هاتە دیتن (مەترسیدار)" : "✓ نەهاتە دیتن"}
                </span>
              </div>
            </div>

            {/* Details List */}
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-primary" /> هوورکاریێن پشکنینێ:
              </h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {result.details.map((det, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{det}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ALL-IN-ONE SECURITY & QR SUITE (TABBED)
// ==========================================
export function SecuritySuite({ defaultTab = "qr_generator" }: { defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-secondary/80 border border-border no-scrollbar">
        {[
          { id: "qr_generator", label: "QR Code Generator", icon: QrCode },
          { id: "qr_scanner", label: "QR Code Scanner", icon: Scan },
          { id: "hash_generator", label: "Hash Generator", icon: Hash },
          { id: "base64_tool", label: "Base64 Encoder/Decoder", icon: FileCode },
          { id: "url_encoder", label: "URL Encoder/Decoder", icon: Globe },
          { id: "uuid_generator", label: "UUID Generator", icon: Fingerprint },
          { id: "link_checker", label: "Links Checker (پشکنینا لینکی)", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tool */}
      {activeTab === "qr_generator" && <QrCodeGenerator />}
      {activeTab === "qr_scanner" && <QrCodeScanner />}
      {activeTab === "hash_generator" && <HashGenerator />}
      {activeTab === "base64_tool" && <Base64Tool />}
      {activeTab === "url_encoder" && <UrlEncoderTool />}
      {activeTab === "uuid_generator" && <UuidGenerator />}
      {activeTab === "link_checker" && <LinksChecker />}
    </div>
  );
}
