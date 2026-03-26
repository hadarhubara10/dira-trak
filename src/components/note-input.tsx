"use client";

import { useCreateNote } from "@/hooks/use-create-note";
import { getEventValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import { useState } from "react";

interface NoteInputProps {
  apartmentId: string;
}

export function NoteInput({ apartmentId }: NoteInputProps) {
  const [content, setContent] = useState("");
  const createNote = useCreateNote();

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    createNote.mutate(
      { apartment_id: apartmentId, content: trimmed },
      { onSuccess: () => setContent("") }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(getEventValue(e))}
        onKeyDown={handleKeyDown}
        placeholder="הוסף הערה..."
        className="flex-1 rounded-xl border-border bg-bg-app text-sm"
        disabled={createNote.isPending}
      />
      <Button
        size="icon-sm"
        onClick={handleSubmit}
        disabled={!content.trim() || createNote.isPending}
        className="shrink-0 rounded-xl bg-accent-blue text-white hover:bg-blue-700"
      >
        <SendHorizonal className="h-4 w-4 scale-x-[-1]" />
      </Button>
    </div>
  );
}
