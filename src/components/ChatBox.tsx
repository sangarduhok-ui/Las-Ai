import { useRef, useState, useEffect } from "react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isTextLtr } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatBox() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "سلاڤ! 👋 ئەز هاریکارێ AI یێ تە مە. هەر پرسیارەکا تە هەبیت لسەر خواندنا خۆ، بپرسە.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || "چەوتی د پەیوەندیکرنێدا");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتی");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3.5 py-1 text-xs font-medium text-accent-foreground mb-2.5">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>ئاخفتن دگەل AI</span>
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold">
          پرسیارێ بکە، بەرسڤەکا گونجای وەربگرە
        </h2>
      </div>

      <div
        className="rounded-3xl bg-card border border-border overflow-hidden flex flex-col w-full"
        style={{ boxShadow: "var(--shadow-elegant)", height: "min(75vh, 660px)" }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-3.5">
          {messages.map((m, i) => {
            const isMsgLtr = isTextLtr(m.content);
            return (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  dir={isMsgLtr ? "ltr" : "rtl"}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                    isMsgLtr ? "text-left font-sans" : "text-right"
                  } ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-bl-sm"
                      : "bg-secondary text-foreground rounded-br-sm"
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            );
          })}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-end">
              <div className="bg-secondary rounded-2xl rounded-br-sm px-3.5 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="px-4 py-2 text-xs md:text-sm text-destructive border-t border-border bg-destructive/5">
            {error}
          </div>
        )}

        <div className="border-t border-border p-3 md:p-3.5 flex items-end gap-2 bg-background/50">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={input.trim() ? (isTextLtr(input) ? "ltr" : "rtl") : "auto"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="پەیاما خۆ بنڤیسە..."
            rows={1}
            className={`flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs md:text-sm focus:outline-none focus:border-primary max-h-32 ${
              input.trim() && isTextLtr(input) ? "text-left font-sans" : "text-right"
            }`}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
