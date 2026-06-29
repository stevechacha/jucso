from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from core.models import Club, Complaint, ContactMessage, Document, Event, NewsItem, Suggestion
from core.serializers import (
    AdminContactMessageSerializer,
    ClubSerializer,
    ComplaintSerializer,
    DocumentSerializer,
    EventSerializer,
    NewsItemSerializer,
    SuggestionSerializer,
)

User = get_user_model()


def build_portal_backup() -> dict:
    complaints = Complaint.objects.select_related("student", "ministry").order_by("pk")
    suggestions = Suggestion.objects.select_related("student").order_by("pk")
    users = User.objects.order_by("reg_number")

    return {
        "exported_at": timezone.now().isoformat(),
        "version": 1,
        "counts": {
            "users": users.count(),
            "complaints": complaints.count(),
            "suggestions": suggestions.count(),
            "clubs": Club.objects.filter(is_active=True).count(),
            "events": Event.objects.filter(is_active=True).count(),
            "news": NewsItem.objects.filter(is_published=True).count(),
            "documents": Document.objects.filter(is_published=True).count(),
            "contact_messages": ContactMessage.objects.count(),
        },
        "users": [
            {
                "reg_number": user.reg_number,
                "name": user.display_name,
                "email": user.email,
                "role": user.role,
                "ministry": user.ministry,
                "is_active": user.is_active,
            }
            for user in users
        ],
        "complaints": ComplaintSerializer(complaints, many=True).data,
        "suggestions": SuggestionSerializer(suggestions, many=True).data,
        "clubs": ClubSerializer(Club.objects.filter(is_active=True).order_by("name"), many=True).data,
        "events": EventSerializer(Event.objects.filter(is_active=True).order_by("event_date"), many=True).data,
        "news": NewsItemSerializer(NewsItem.objects.filter(is_published=True).order_by("-published_at"), many=True).data,
        "documents": DocumentSerializer(
            Document.objects.filter(is_published=True).order_by("-published_at"), many=True
        ).data,
        "contact_messages": AdminContactMessageSerializer(
            ContactMessage.objects.order_by("-created_at"), many=True
        ).data,
    }


def _parse_portal_date(label: str):
    if not label:
        return None
    for fmt in ("%b %d, %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(label.strip(), fmt).date()
        except ValueError:
            continue
    return None


def restore_portal_backup(data: dict, *, dry_run: bool = True) -> dict:
    if not isinstance(data, dict):
        raise ValueError("Backup payload must be a JSON object.")
    if data.get("version") != 1:
        raise ValueError("Unsupported backup version.")

    summary = {
        "dry_run": dry_run,
        "clubs": {"created": 0, "updated": 0},
        "events": {"created": 0, "updated": 0},
        "news": {"created": 0, "updated": 0},
        "documents": {"created": 0, "updated": 0},
        "skipped": {
            "users": len(data.get("users", [])),
            "complaints": len(data.get("complaints", [])),
            "suggestions": len(data.get("suggestions", [])),
            "contact_messages": len(data.get("contact_messages", [])),
        },
    }

    def apply_restore() -> None:
        for row in data.get("clubs", []):
            name = (row.get("name") or "").strip()
            if not name:
                continue
            defaults = {
                "description": row.get("description") or "",
                "leader": row.get("leader") or "",
                "category": row.get("category") or "General",
                "is_active": True,
            }
            club, created = Club.objects.get_or_create(name=name, defaults=defaults)
            if created:
                summary["clubs"]["created"] += 1
            else:
                for field, value in defaults.items():
                    setattr(club, field, value)
                club.save()
                summary["clubs"]["updated"] += 1

        for row in data.get("events", []):
            title = (row.get("title") or "").strip()
            if not title:
                continue
            event_date = _parse_portal_date(row.get("date") or row.get("event_date") or "")
            if not event_date:
                continue
            defaults = {
                "description": row.get("description") or "",
                "location": row.get("location") or "",
                "capacity": int(row.get("capacity") or 100),
                "is_active": True,
            }
            event, created = Event.objects.get_or_create(
                title=title,
                event_date=event_date,
                defaults=defaults,
            )
            if created:
                summary["events"]["created"] += 1
            else:
                for field, value in defaults.items():
                    setattr(event, field, value)
                event.save()
                summary["events"]["updated"] += 1

        for row in data.get("news", []):
            title = (row.get("title") or "").strip()
            if not title:
                continue
            published_at = _parse_portal_date(row.get("date") or row.get("published_at") or "")
            if not published_at:
                published_at = timezone.localdate()
            defaults = {
                "excerpt": row.get("excerpt") or "",
                "body": row.get("body") or "",
                "tag": row.get("tag") or "Announcement",
                "is_published": True,
            }
            news, created = NewsItem.objects.get_or_create(
                title=title,
                published_at=published_at,
                defaults=defaults,
            )
            if created:
                summary["news"]["created"] += 1
            else:
                for field, value in defaults.items():
                    setattr(news, field, value)
                news.save()
                summary["news"]["updated"] += 1

        for row in data.get("documents", []):
            name = (row.get("name") or "").strip()
            if not name:
                continue
            published_at = _parse_portal_date(row.get("date") or row.get("published_at") or "")
            if not published_at:
                published_at = timezone.localdate()
            defaults = {
                "file_type": row.get("file_type") or "PDF",
                "file_size": row.get("file_size") or "",
                "storage_path": row.get("storage_path") or row.get("download_url") or "",
                "is_published": True,
            }
            document, created = Document.objects.get_or_create(
                name=name,
                published_at=published_at,
                defaults=defaults,
            )
            if created:
                summary["documents"]["created"] += 1
            else:
                for field, value in defaults.items():
                    setattr(document, field, value)
                document.save()
                summary["documents"]["updated"] += 1

    if dry_run:
        with transaction.atomic():
            apply_restore()
            transaction.set_rollback(True)
    else:
        with transaction.atomic():
            apply_restore()

    return summary
