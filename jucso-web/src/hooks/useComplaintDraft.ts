import { useEffect, useRef, useState } from "react";

export interface ComplaintDraft {
  category: string;
  description: string;
  urgent: boolean;
}

const emptyDraft = (): ComplaintDraft => ({ category: "", description: "", urgent: false });

function draftKey(regNumber: string) {
  return `jucso-complaint-draft-${regNumber}`;
}

function readDraft(regNumber: string): ComplaintDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(regNumber));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ComplaintDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      category: typeof parsed.category === "string" ? parsed.category : "",
      description: typeof parsed.description === "string" ? parsed.description : "",
      urgent: Boolean(parsed.urgent),
    };
  } catch {
    return null;
  }
}

/** Persist in-progress complaint form fields per student. */
export function useComplaintDraft(regNumber: string | undefined) {
  const [draft, setDraft] = useState<ComplaintDraft>(emptyDraft);
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!regNumber) return;
    const existing = readDraft(regNumber);
    if (existing && (existing.category || existing.description || existing.urgent)) {
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
    const hasContent = draft.category || draft.description || draft.urgent;
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
