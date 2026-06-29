import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def push_configured() -> bool:
    return bool(getattr(settings, "VAPID_PUBLIC_KEY", "") and getattr(settings, "VAPID_PRIVATE_KEY", ""))


def send_push_to_user(user, *, title: str, body: str, link: str = "") -> int:
    if not push_configured():
        return 0

    from core.models import PushSubscription

    subs = PushSubscription.objects.filter(user=user)
    if not subs.exists():
        return 0

    try:
        from pywebpush import WebPushException, webpush
    except ImportError:
        return 0

    payload = json.dumps({"title": title, "body": body, "link": link})
    sent = 0
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIM_EMAIL}"},
            )
            sent += 1
        except WebPushException as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            if status_code in (404, 410):
                sub.delete()
            else:
                logger.warning("Push failed for %s: %s", user.reg_number, exc)
    return sent
