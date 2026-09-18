"use client";

import { useState, useEffect } from "react";
import { saveNoteAction } from "@/actions/notes";
import { Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/ThemeProvider";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface NoteEditorProps {
  problemId: string;
  initialBodyMd: string;
  initialSnippets: any[];
}

export default function NoteEditor({ problemId, initialBodyMd, initialSnippets }: NoteEditorProps) {
  const [bodyMd, setBodyMd] = useState(initialBodyMd);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { theme } = useTheme();



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
        <div className="flex items-center gap-4">
          <div className="text-sm">
            {isSaving ? (
              <span className="text-muted-foreground">Saving...</span>
            ) : lastSaved ? (
              <span className="text-green-500 font-medium">
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || bodyMd === initialBodyMd && !lastSaved}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Note
          </button>
        </div>
      </div>
      <div data-color-mode={theme === 'midnight' ? 'dark' : 'light'} className="rounded-lg overflow-hidden border shadow-sm">
        <MDEditor
          value={bodyMd}
          onChange={(val) => setBodyMd(val || '')}
          height={500}
          preview="live"
          className="w-full !border-none"
        />
      </div>
    </div>
  );
}
