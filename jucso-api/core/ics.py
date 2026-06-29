from datetime import datetime, timedelta

from django.http import HttpResponse
from django.utils import timezone

from core.models import Event


def build_events_ics() -> str:
    now = timezone.now()
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//JUCSO Portal//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:JUCSO Events",
    ]

    for event in Event.objects.filter(is_active=True).order_by("event_date"):
        start = datetime.combine(event.event_date, datetime.min.time())
        end = start + timedelta(hours=2)
        uid = f"evt-{event.pk}@jucso.ac.tz"
        stamp = now.strftime("%Y%m%dT%H%M%SZ")
        start_s = start.strftime("%Y%m%dT%H%M%S")
        end_s = end.strftime("%Y%m%dT%H%M%S")
        summary = _escape_ics(event.title)
        location = _escape_ics(event.location)
        description = _escape_ics(event.description)

        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{stamp}",
                f"DTSTART:{start_s}",
                f"DTEND:{end_s}",
                f"SUMMARY:{summary}",
                f"LOCATION:{location}",
                f"DESCRIPTION:{description}",
                "END:VEVENT",
            ]
        )

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"


def _escape_ics(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")


def ics_response() -> HttpResponse:
    content = build_events_ics()
    response = HttpResponse(content, content_type="text/calendar; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="jucso-events.ics"'
    return response
