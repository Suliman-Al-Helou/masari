"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getConversation,
  sendMessage,
  markMessagesRead,
  type Message,
} from "@/lib/api/api";
import { supabase } from "@/lib/db/client";
import { getInitials } from "@/lib/utils";

interface ChatPanelProps {
  student: { id: string; full_name: string } | null;
  onClose: () => void;
  isMobile?: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "اليوم";
  if (d.toDateString() === yesterday.toDateString()) return "أمس";
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

export default function ChatPanel({
  student,
  onClose,
  isMobile = false,
}: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // جلب المحادثة
  const fetchMessages = useCallback(async () => {
    if (!user || !student) return;
    setLoading(true);
    try {
      const data = await getConversation(user.id, student.id);
      setMessages(data);
      await markMessagesRead(user.id, student.id);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [user, student]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !student) return;

    const channel = supabase
      .channel(`chat:${[user.id, student.id].sort().join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === student.id) {
            setMessages((prev) => [...prev, msg]);
            markMessagesRead(user.id, student.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, student]);

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // focus input
  useEffect(() => {
    if (!loading) setTimeout(() => inputRef.current?.focus(), 100);
  }, [loading, student]);

  const handleSend = async () => {
    if (!input.trim() || !user || !student || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // optimistic
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      sender_id: user.id,
      receiver_id: student.id,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessage(user.id, student.id, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m)),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content); // restore
    } finally {
      setSending(false);
    }
  };

  // group messages by date
  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>(
    (acc, msg) => {
      const date = formatDate(msg.created_at);
      const last = acc[acc.length - 1];
      if (last?.date === date) {
        last.msgs.push(msg);
      } else {
        acc.push({ date, msgs: [msg] });
      }
      return acc;
    },
    [],
  );

  if (!student) return null;

  const initials = getInitials(student.full_name);

  const containerCls = isMobile
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : "flex flex-col h-full";

  return (
    <div className={containerCls} dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm truncate">
            {student.full_name}
          </p>
          <p className="text-[10px] text-emerald-500">متصل الآن</p>
        </div>

        {!isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-primary font-bold text-xl">{initials}</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {student.full_name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ابدأ المحادثة الآن
            </p>
          </div>
        ) : (
          grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground px-2">
                  {date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card shrink-0">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`اكتب رسالة لـ ${student.full_name.split(" ")[0]}...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            {sending ? (
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
