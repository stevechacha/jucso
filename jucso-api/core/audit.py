from django.contrib.auth import get_user_model

from core.models import PortalAuditLog

User = get_user_model()


def log_audit(
    *,
    actor: User | None,
    action: str,
    target_type: str = "",
    target_id: str = "",
    detail: str = "",
) -> PortalAuditLog:
    return PortalAuditLog.objects.create(
        actor=actor,
        actor_name=getattr(actor, "display_name", "") if actor else "System",
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
    )
