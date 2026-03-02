"use client";

import { useState, useRef, useCallback } from "react";
import { SendHorizontal, Paperclip, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSend: (content: string) => void;
  windowExpired?: boolean;
  disabled?: boolean;
  onTemplateClick?: () => void;
}

export function MessageInput({ onSend, windowExpired = false, disabled = false, onTemplateClick }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-t bg-card">
      {windowExpired && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-950/30 border-b text-xs text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Janela de 24h expirada. Use um modelo aprovado para reengajar.</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-6 text-xs"
            onClick={onTemplateClick}
          >
            <FileText className="h-3 w-3 mr-1" />
            Modelos
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" disabled>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={windowExpired ? "Use um modelo para enviar..." : "Digite uma mensagem..."}
          className="min-h-9 max-h-[120px] resize-none py-2"
          rows={1}
          disabled={disabled || windowExpired}
        />
        <Button
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={handleSend}
          disabled={!text.trim() || disabled || windowExpired}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
