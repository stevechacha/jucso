from django.contrib.auth import get_user_model

from core.models import NotificationCategory, PortalNotification, UserRole

User = get_user_model()


def notify_user(
    user,
    *,
    title: str,
    message: str,
    category: str = NotificationCategory.SYSTEM,
    link: str = "",
) -> PortalNotification | None:
    if not user or not user.is_active:
        return None
    return PortalNotification.objects.create(
        user=user,
        title=title,
        message=message,
        category=category,
        link=link,
    )


def notify_ministry_leaders(*, ministry_name: str, title: str, message: str, category: str, link: str = "") -> int:
    ministers = User.objects.filter(role=UserRole.MINISTER, ministry=ministry_name, is_active=True)
    count = 0
    for minister in ministers:
        if notify_user(minister, title=title, message=message, category=category, link=link):
            count += 1
    return count


def notify_admins(*, title: str, message: str, category: str = NotificationCategory.SYSTEM, link: str = "") -> int:
    admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)
    count = 0
    for admin in admins:
        if notify_user(admin, title=title, message=message, category=category, link=link):
            count += 1
    return count


def notify_executives(*, title: str, message: str, category: str = NotificationCategory.SYSTEM, link: str = "") -> int:
    executives = User.objects.filter(role=UserRole.EXECUTIVE, is_active=True)
    count = 0
    for executive in executives:
        if notify_user(executive, title=title, message=message, category=category, link=link):
            count += 1
    return count
