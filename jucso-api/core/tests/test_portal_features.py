from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase, APIClient

from core.models import (
    ComplaintCategory,
    Event,
    Ministry,
    NewsItem,
    NewsTag,
    NotificationCategory,
    PortalAnnouncement,
    PortalNotification,
    Suggestion,
    SuggestionStatus,
    User,
    UserRole,
)

UserModel = User


class PortalFeatureTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username="juc-features-1",
            reg_number="JUC/2026/200",
            email="valid200@jucso.ac.tz",
            password="StudentPass123!",
            role=UserRole.STUDENT,
            email_verified=True,
        )
        self.admin = User.objects.create_user(
            username="admin-features",
            reg_number="ADM/FEAT",
            email="admin-feat@jucso.ac.tz",
            password="AdminPass123!",
            role=UserRole.ADMIN,
            email_verified=True,
        )
        self.minister = User.objects.create_user(
            username="min-features",
            reg_number="MIN/ACAD/FEAT",
            email="minister-feat@jucso.ac.tz",
            password="MinisterPass123!",
            role=UserRole.MINISTER,
            ministry="Academics",
            email_verified=True,
        )
        Ministry.objects.get_or_create(name="Academics", defaults={"slug": "academics"})

    def test_news_detail_returns_body(self):
        item = NewsItem.objects.create(
            title="Orientation Week",
            excerpt="Short summary",
            body="Full orientation details for all students.",
            tag=NewsTag.ANNOUNCEMENT,
            published_at=timezone.localdate(),
        )
        response = self.client.get(f"/api/news/N{item.pk:02d}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["body"], "Full orientation details for all students.")

    def test_news_detail_falls_back_to_excerpt(self):
        item = NewsItem.objects.create(
            title="Notice",
            excerpt="Only excerpt here",
            tag=NewsTag.NOTICE,
            published_at=timezone.localdate(),
        )
        response = self.client.get(f"/api/news/N{item.pk:02d}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["body"], "Only excerpt here")

    def test_active_announcement_returns_highest_priority(self):
        PortalAnnouncement.objects.create(message="Info notice", priority="info", is_active=True)
        PortalAnnouncement.objects.create(message="Urgent closure", priority="urgent", is_active=True)
        response = self.client.get("/api/announcement/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Urgent closure")

    def test_admin_can_create_announcement(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/admin/announcements/",
            {"message": "Exam week starts Monday", "priority": "warning"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(PortalAnnouncement.objects.filter(message="Exam week starts Monday").exists())

    def test_notifications_list_for_authenticated_user(self):
        PortalNotification.objects.create(
            user=self.student,
            title="Complaint updated",
            message="Your complaint is in progress.",
            category=NotificationCategory.COMPLAINT,
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["unread_count"], 1)
        self.assertEqual(len(response.data["results"]), 1)

    def test_mark_notifications_read(self):
        note = PortalNotification.objects.create(
            user=self.student,
            title="Test",
            message="Hello",
            category=NotificationCategory.SYSTEM,
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post("/api/notifications/mark-read/", {"ids": [note.pk]}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["unread_count"], 0)
        note.refresh_from_db()
        self.assertTrue(note.is_read)

    def test_events_ics_download(self):
        Event.objects.create(
            title="JUCSO Gala",
            description="Annual student gala night",
            location="Main Hall",
            event_date=timezone.localdate() + timedelta(days=14),
            capacity=200,
        )
        response = self.client.get("/api/events/calendar.ics")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/calendar", response["Content-Type"])
        self.assertIn("JUCSO Gala", response.content.decode())

    def test_complaint_submit_creates_student_notification(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            "/api/complaints/",
            {"category": ComplaintCategory.ACADEMIC, "description": "Lab computers broken"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        note = PortalNotification.objects.filter(user=self.student, category=NotificationCategory.COMPLAINT).first()
        self.assertIsNotNone(note)
        self.assertIn(response.data["id"], note.message)

    def test_minister_can_decline_suggestion(self):
        suggestion = Suggestion.objects.create(
            student=self.student,
            title="Canteen menu",
            description="Add more vegetarian options",
            status=SuggestionStatus.RECEIVED,
        )
        self.client.force_authenticate(user=self.minister)
        response = self.client.patch(
            f"/api/suggestions/{suggestion.pk}/",
            {"status": "Declined", "response": "Budget constraints this semester."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        suggestion.refresh_from_db()
        self.assertEqual(suggestion.status, SuggestionStatus.DECLINED)
        note = PortalNotification.objects.filter(user=self.student, category=NotificationCategory.SUGGESTION).first()
        self.assertIsNotNone(note)

    def test_declined_suggestion_is_not_overdue(self):
        suggestion = Suggestion.objects.create(
            student=self.student,
            title="Old idea",
            description="Not feasible",
            status=SuggestionStatus.DECLINED,
            due_at=timezone.now() - timedelta(days=3),
        )
        self.assertFalse(suggestion.is_overdue)

    def test_student_can_rate_resolved_complaint(self):
        from core.models import Complaint, ComplaintCategory, Ministry

        ministry = Ministry.objects.get(name="Academics")
        complaint = Complaint.objects.create(
            tracking_id="JUC-RATE1",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Resolved issue",
            ministry=ministry,
            status="Resolved",
            response="Fixed.",
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f"/api/complaints/{complaint.tracking_id}/rate/",
            {"rating": 4, "comment": "Quick fix, thanks"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        complaint.refresh_from_db()
        self.assertEqual(complaint.satisfaction_rating, 4)
        self.assertEqual(complaint.satisfaction_comment, "Quick fix, thanks")
        self.assertFalse(response.data["can_rate"])

    def test_cannot_rate_unresolved_complaint(self):
        from core.models import Complaint, ComplaintCategory, Ministry

        ministry = Ministry.objects.get(name="Academics")
        complaint = Complaint.objects.create(
            tracking_id="JUC-RATE2",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Still open",
            ministry=ministry,
            status="Pending",
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f"/api/complaints/{complaint.tracking_id}/rate/",
            {"rating": 3},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_transparency_includes_satisfaction_stats(self):
        from core.models import Complaint, ComplaintCategory, Ministry

        ministry = Ministry.objects.get(name="Academics")
        Complaint.objects.create(
            tracking_id="JUC-RATE3",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Done",
            ministry=ministry,
            status="Resolved",
            satisfaction_rating=5,
        )
        response = self.client.get("/api/stats/transparency/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["rated_complaints"], 1)
        self.assertEqual(response.data["satisfaction_avg"], 5.0)

    def test_admin_can_list_club_members(self):
        from core.models import Club, ClubMembership

        club = Club.objects.create(
            name="Chess Club",
            description="Strategy games",
            leader="Mr. Msomi",
            category="Recreation",
        )
        ClubMembership.objects.create(club=club, student=self.student)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/admin/clubs/{club.pk}/members/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["attendees"][0]["reg_number"], self.student.reg_number)

    def test_admin_can_list_event_registrants(self):
        from core.models import Event, EventRegistration

        event = Event.objects.create(
            title="Career Fair",
            description="Meet employers",
            location="Student Centre",
            event_date=timezone.localdate() + timedelta(days=7),
            capacity=100,
        )
        EventRegistration.objects.create(event=event, student=self.student)
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/admin/events/{event.pk}/registrants/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["attendees"][0]["name"], self.student.display_name)

    def test_student_cannot_list_club_members(self):
        from core.models import Club

        club = Club.objects.create(
            name="Private Club",
            description="Test",
            leader="Leader",
            category="Academic",
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.get(f"/api/admin/clubs/{club.pk}/members/")
        self.assertEqual(response.status_code, 403)

    def test_send_event_reminders_command(self):
        from unittest.mock import patch

        from core.models import Event, EventRegistration

        event = Event.objects.create(
            title="Tomorrow Gala",
            description="Gala night",
            location="Main Hall",
            event_date=timezone.localdate() + timedelta(days=1),
            capacity=100,
        )
        EventRegistration.objects.create(event=event, student=self.student)
        from django.core.management import call_command

        with patch("core.management.commands.send_event_reminders.notify_event_reminder") as mock_notify:
            call_command("send_event_reminders")
        self.student.refresh_from_db()
        registration = EventRegistration.objects.get(event=event, student=self.student)
        self.assertIsNotNone(registration.reminder_sent_at)
        mock_notify.assert_called_once()

    def test_minister_can_escalate_complaint(self):
        from core.models import Complaint, ComplaintCategory, Ministry, PortalNotification

        ministry = Ministry.objects.get(name="Academics")
        complaint = Complaint.objects.create(
            tracking_id="JUC-ESC1",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Unresolved issue",
            ministry=ministry,
            status="Pending",
        )
        executive = User.objects.create_user(
            username="exec-esc",
            reg_number="EXEC/ESC",
            email="exec-esc@jucso.ac.tz",
            password="ExecPass123!",
            role=UserRole.EXECUTIVE,
            email_verified=True,
        )
        self.client.force_authenticate(user=self.minister)
        response = self.client.post(f"/api/complaints/{complaint.tracking_id}/escalate/")
        self.assertEqual(response.status_code, 200)
        complaint.refresh_from_db()
        self.assertTrue(complaint.is_escalated)
        self.assertTrue(response.data["is_escalated"])
        self.assertTrue(
            PortalNotification.objects.filter(user=executive, category=NotificationCategory.COMPLAINT).exists()
        )

    def test_cannot_escalate_resolved_complaint(self):
        from core.models import Complaint, ComplaintCategory, Ministry

        ministry = Ministry.objects.get(name="Academics")
        complaint = Complaint.objects.create(
            tracking_id="JUC-ESC2",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Done",
            ministry=ministry,
            status="Resolved",
        )
        self.client.force_authenticate(user=self.minister)
        response = self.client.post(f"/api/complaints/{complaint.tracking_id}/escalate/")
        self.assertEqual(response.status_code, 400)
