import { useEffect, useRef, useState } from "react";

export interface SuggestionDraft {
  title: string;
  description: string;
}

const emptyDraft = (): SuggestionDraft => ({ title: "", description: "" });

function draftKey(regNumber: string) {
  return `jucso-suggestion-draft-${regNumber}`;
}

function readDraft(regNumber: string): SuggestionDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(regNumber));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SuggestionDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
    };
  } catch {
    return null;
  }
}

/** Persist in-progress suggestion form fields per student. */
export function useSuggestionDraft(regNumber: string | undefined) {
  const [draft, setDraft] = useState<SuggestionDraft>(emptyDraft);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!regNumber) return;
    const existing = readDraft(regNumber);
    if (existing && (existing.title || existing.description)) {
      skipNextSave.current = true;
      setDraft(existing);
      setRestored(true);
    }
  }, [regNumber]);

  useEffect(() => {
    if (!regNumber) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const hasContent = draft.title || draft.description;
    if (!hasContent) {
      localStorage.removeItem(draftKey(regNumber));
      setSavedAt(null);
      return;
    }
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey(regNumber), JSON.stringify(draft));
      setSavedAt(Date.now());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draft, regNumber]);

  const clearDraft = () => {
    if (regNumber) localStorage.removeItem(draftKey(regNumber));
    setDraft(emptyDraft());
    setRestored(false);
    setSavedAt(null);
  };

  const dismissRestored = () => setRestored(false);

  return { draft, setDraft, restored, savedAt, clearDraft, dismissRestored };
}
