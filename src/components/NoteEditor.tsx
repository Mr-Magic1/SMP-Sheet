"use client";

import { useState, useEffect } from "react";
import { saveNoteAction } from "@/actions/notes";
import { Save } from "lucide-react";

interface NoteEditorProps {
  problemId: string;
  initialBodyMd: string;
  initialSnippets: any[];
}

export default function NoteEditor({ problemId, initialBodyMd, initialSnippets }: NoteEditorProps) {
  const [bodyMd, setBodyMd] = useState(initialBodyMd);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 2000); // autosave after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [bodyMd]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNoteAction(problemId, bodyMd, initialSnippets); // snippets ignored for now for brevity
      setLastSaved(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
        <span>Markdown Editor</span>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span>Saving...</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1">
              <Save className="w-4 h-4" /> Saved at {lastSaved.toLocaleTimeString()}
            </span>
          ) : (
            <span>Unsaved</span>
          )}
        </div>
      </div>
      
      <textarea
        value={bodyMd}
        onChange={(e) => setBodyMd(e.target.value)}
        className="w-full h-96 p-4 border rounded-lg bg-card text-card-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Write your notes here in Markdown..."
      />
    </div>
  );
}
