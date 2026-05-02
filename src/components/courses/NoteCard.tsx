"use client";

import { useState } from "react";
import {
  Tag,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import type { Note } from "@/lib/constants/dashboard";

function extractLink(content: string) {
  const match = content.match(/\[رابط\]: (https?:\/\/\S+)/);
  if (!match) return { text: content, link: null };
  const link = match[1];
  const text = content
    .replace(`\n\n[رابط]: ${link}`, "")
    .replace(`[رابط]: ${link}`, "")
    .trim();
  return { text, link };
}

interface Props {
  note: Note;
  onDelete: () => void;
}

export default function NoteCard({ note, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { text, link } = extractLink(note.content);
  const isLong = text && text.length > 120;
  const displayText = isLong && !expanded ? text.slice(0, 120) + "..." : text;

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 hover:shadow-md transition-all flex flex-col gap-3">
      {/* Title + delete */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-foreground text-sm leading-snug">
          {note.title}
        </h4>
        <button
          onClick={onDelete}
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {text && (
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary mt-1 flex items-center gap-0.5 hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  أقل
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  المزيد
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span
              key={t}
              className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              {t}
            </span>
          ))}
        </div>
      )}

      {/* External link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="truncate">{link}</span>
        </a>
      )}

      {/* Date */}
      <p className="text-[10px] text-muted-foreground/60 mt-auto">
        {note.created_date
          ? format(new Date(note.created_date), "dd/MM/yyyy")
          : ""}
      </p>
    </div>
  );
}
