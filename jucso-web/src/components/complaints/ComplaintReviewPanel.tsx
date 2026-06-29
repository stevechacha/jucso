import type { Complaint, ComplaintStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/FormFields";
import { ComplaintActivityTimeline } from "@/components/complaints/ComplaintActivityTimeline";
import { ComplaintAttachmentLink } from "@/components/complaints/ComplaintAttachmentLink";
import { ConfidentialBadge } from "@/components/complaints/ConfidentialBadge";
import { EscalatedBadge } from "@/components/complaints/EscalatedBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { useLanguage } from "@/context/LanguageContext";

interface ComplaintReviewPanelProps {
  complaint?: Complaint;
  responseText: string;
  onResponseChange: (value: string) => void;
  onRespond: (status: ComplaintStatus) => void;
  responding?: boolean;
}

export function ComplaintReviewPanel({
  complaint,
  responseText,
  onResponseChange,
  onRespond,
  responding = false,
}: ComplaintReviewPanelProps) {
  const { t } = useLanguage();

  if (!complaint) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-card">
        {t("execSelectComplaint")}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="font-display font-bold text-jucso-navy text-sm">
          {t("execComplaintTitle", { id: complaint.id })}
        </h3>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {complaint.isConfidential && <ConfidentialBadge />}
          {complaint.isEscalated && <EscalatedBadge />}
          <StatusPill status={complaint.status} />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-1">
        {t("execFromStudent")}{" "}
        <span className="font-semibold text-gray-700">{complaint.studentName}</span> ({complaint.studentReg})
      </p>
      <p className="text-xs text-gray-400 mb-3">
        {t("execFiled")} {complaint.date} · {complaint.ministry}
      </p>
      {complaint.isOverdue ? (
        <p className="text-xs font-semibold text-red-600 mb-2">{t("overdue")} — {complaint.dueAt}</p>
      ) : complaint.dueAt ? (
        <p className="text-xs text-gray-500 mb-2">{t("slaDue", { date: complaint.dueAt })}</p>
      ) : null}
      <div className="bg-jucso-slate rounded-lg p-3 mb-4">
        <div className="font-semibold text-jucso-navy text-xs mb-1">{complaint.category}</div>
        <p className="text-gray-600 text-xs leading-relaxed">{complaint.description}</p>
      </div>
      <ComplaintAttachmentLink url={complaint.supportingDocumentUrl} className="mb-4" />
      {complaint.response && (
        <div className="bg-emerald-50 rounded-lg p-3 mb-4">
          <p className="text-emerald-700 text-xs">
            <strong>{t("execPreviousResponse")}</strong> {complaint.response}
          </p>
        </div>
      )}
      {complaint.activity?.length ? <ComplaintActivityTimeline activity={complaint.activity} compact /> : null}
      {complaint.status !== "Resolved" && (
        <>
          <Textarea
            label={t("execWriteResponse")}
            value={responseText}
            onChange={(e) => onResponseChange(e.target.value)}
            rows={3}
            placeholder={t("execResponsePlaceholder")}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="teal"
              disabled={responding}
              onClick={() => onRespond("In Progress")}
            >
              {t("execMarkInProgress")}
            </Button>
            <Button
              size="sm"
              variant="navy"
              disabled={responding}
              onClick={() => onRespond("Resolved")}
            >
              {t("execMarkResolved")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
