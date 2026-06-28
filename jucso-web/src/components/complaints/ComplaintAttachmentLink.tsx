interface ComplaintAttachmentLinkProps {
  url?: string;
  className?: string;
}

export function ComplaintAttachmentLink({ url, className = "" }: ComplaintAttachmentLinkProps) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs font-semibold text-jucso-teal hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      📎 View attachment
    </a>
  );
}
