from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.cron_log import log_cron_run
from core.models import EventRegistration
from core.notifications import notify_event_reminder


class Command(BaseCommand):
    help = "Send email/SMS reminders to students registered for events happening soon."

    def handle(self, *args, **options):
        days_ahead = getattr(settings, "EVENT_REMINDER_DAYS", 1)
        target_date = timezone.localdate() + timedelta(days=days_ahead)
        now = timezone.now()

        registrations = (
            EventRegistration.objects.filter(
                event__is_active=True,
                event__event_date=target_date,
                reminder_sent_at__isnull=True,
            )
            .select_related("event", "student")
            .order_by("event_id", "student__reg_number")
        )

        count = 0
        for registration in registrations:
            notify_event_reminder(registration)
            registration.reminder_sent_at = now
            registration.save(update_fields=["reminder_sent_at"])
            count += 1

        detail = f"Sent {count} event reminder(s) for events on {target_date:%Y-%m-%d}."
        log_cron_run(job_name="send_event_reminders", detail=detail, success=True)
        self.stdout.write(self.style.SUCCESS(detail))
