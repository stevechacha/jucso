import { useState } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { Complaint } from "@/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/FormFields";
import { useLanguage } from "@/context/LanguageContext";

function StarRow({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          className={`text-lg leading-none cursor-pointer disabled:cursor-default ${
            star <= value ? "text-jucso-gold" : "text-gray-300"
          }`}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface ComplaintSatisfactionPanelProps {
  complaint: Complaint;
  onRated?: (updated: Complaint) => void;
}

export function ComplaintSatisfactionPanel({ complaint, onRated }: ComplaintSatisfactionPanelProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  if (complaint.satisfactionRating) {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-100">
        <p className="text-xs font-semibold text-gray-600 mb-1">{t("yourRating")}</p>
        <StarRow value={complaint.satisfactionRating} />
        {complaint.satisfactionComment ? (
          <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{complaint.satisfactionComment}&rdquo;</p>
        ) : null}
      </div>
    );
  }

  if (!complaint.canRate || complaint.status !== "Resolved") return null;

  const submit = async () => {
    if (rating < 1) return;
    setLoading(true);
    setErr("");
    try {
      const updated = await jucsoApi.rateComplaint(complaint.id, { rating, comment: comment.trim() || undefined });
      setDone(true);
      onRated?.(updated);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : t("ratingFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-3 pt-3 border-t border-emerald-100 text-xs text-emerald-700 font-semibold">
        {t("ratingThanks")}
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold text-jucso-navy mb-2">{t("rateResolution")}</p>
      <StarRow value={rating} onChange={setRating} />
      <Textarea
        label={t("ratingCommentOptional")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="mt-2"
      />
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      <Button
        size="sm"
        variant="teal"
        className="mt-2"
        disabled={rating < 1 || loading}
        onClick={() => void submit()}
      >
        {loading ? t("submittingRating") : t("submitRating")}
      </Button>
    </div>
  );
}
