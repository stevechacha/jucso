from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import (
    Club,
    Complaint,
    ComplaintCategory,
    ComplaintStatus,
    ContactMessage,
    Document,
    Event,
    Ministry,
    NewsItem,
)

User = get_user_model()


class RemainingFeaturesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.academics = Ministry.objects.create(name="Academics", slug="academics")
        self.health = Ministry.objects.create(name="Health & Welfare", slug="health")
        self.student = User.objects.create_user(
            username="student-remaining",
            reg_number="JUC/2026/020",
            email="remaining.student@jucso.ac.tz",
            password="SecurePass123!",
            first_name="Remaining",
            last_name="Student",
            role="student",
            email_verified=True,
        )
        self.minister = User.objects.create_user(
            username="minister-remaining",
            reg_number="MIN/ACAD/020",
            email="remaining.minister@jucso.ac.tz",
            password="SecurePass123!",
            first_name="Remaining",
            last_name="Minister",
            role="minister",
            ministry="Academics",
        )
        self.admin = User.objects.create_user(
            username="admin-remaining",
            reg_number="ADMIN/020",
            email="remaining.admin@jucso.ac.tz",
            password="SecurePass123!",
            first_name="Remaining",
            last_name="Admin",
            role="admin",
        )
        self.complaint = Complaint.objects.create(
            tracking_id="JUC-R020",
            student=self.student,
            category=ComplaintCategory.ACADEMIC,
            description="Need help.",
            ministry=self.academics,
        )

    def test_health_complaint_is_confidential_on_create(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            "/api/complaints/",
            {
                "category": ComplaintCategory.HEALTH,
                "description": "Medical concern.",
                "urgent": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_confidential"])

    def test_minister_can_forward_complaint(self):
        self.client.force_authenticate(user=self.minister)
        response = self.client.patch(
            f"/api/complaints/{self.complaint.tracking_id}/",
            {"ministry": "Health & Welfare"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.complaint.refresh_from_db()
        self.assertEqual(self.complaint.ministry_id, self.health.pk)
        self.assertEqual(self.complaint.status, ComplaintStatus.PENDING)

    def test_admin_can_list_contact_messages(self):
        ContactMessage.objects.create(
            name="Jane Doe",
            email="jane@example.com",
            subject="Hello",
            message="Need info.",
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/admin/contact-messages/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"] if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["subject"], "Hello")

    def test_admin_can_delete_contact_message(self):
        message = ContactMessage.objects.create(
            name="Jane Doe",
            email="jane@example.com",
            subject="Hello",
            message="Need info.",
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f"/api/admin/contact-messages/{message.pk}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ContactMessage.objects.filter(pk=message.pk).exists())

    def test_admin_can_delete_news_and_document(self):
        news = NewsItem.objects.create(
            title="Test",
            excerpt="Summary",
            tag="Announcement",
            published_at="2026-06-01",
            is_published=True,
        )
        document = Document.objects.create(
            name="Handbook",
            file_type="PDF",
            file_size="1 MB",
            published_at="2026-06-01",
            is_published=True,
        )
        self.client.force_authenticate(user=self.admin)

        news_response = self.client.delete(f"/api/admin/news/{news.pk}/")
        self.assertEqual(news_response.status_code, status.HTTP_204_NO_CONTENT)
        news.refresh_from_db()
        self.assertFalse(news.is_published)

        doc_response = self.client.delete(f"/api/admin/documents/{document.pk}/")
        self.assertEqual(doc_response.status_code, status.HTTP_204_NO_CONTENT)
        document.refresh_from_db()
        self.assertFalse(document.is_published)

    def test_admin_can_update_document_name(self):
        document = Document.objects.create(
            name="Old Title",
            file_type="PDF",
            file_size="1 MB",
            published_at="2026-06-01",
            is_published=True,
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/documents/{document.pk}/",
            {"name": "Updated Title"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        document.refresh_from_db()
        self.assertEqual(document.name, "Updated Title")

    def test_admin_can_create_club_and_event(self):
        self.client.force_authenticate(user=self.admin)

        club_response = self.client.post(
            "/api/admin/clubs/",
            {
                "name": "Debate Club",
                "description": "Weekly debates",
                "leader": "Alex Kim",
                "category": "Academic",
            },
            format="json",
        )
        self.assertEqual(club_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Club.objects.filter(name="Debate Club").exists())

        event_response = self.client.post(
            "/api/admin/events/",
            {
                "title": "Orientation",
                "description": "Welcome event",
                "location": "Main Hall",
                "event_date": "2026-09-01",
                "capacity": 100,
            },
            format="json",
        )
        self.assertEqual(event_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Event.objects.filter(title="Orientation").exists())

    def test_admin_can_update_news(self):
        news = NewsItem.objects.create(
            title="Old title",
            excerpt="Old summary",
            tag="Announcement",
            published_at="2026-06-01",
            is_published=True,
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/news/{news.pk}/",
            {"title": "New title", "excerpt": "Updated summary"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        news.refresh_from_db()
        self.assertEqual(news.title, "New title")
        self.assertEqual(news.excerpt, "Updated summary")

    def test_admin_can_export_backup(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/admin/backup/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("exported_at", response.data)
        self.assertIn("complaints", response.data)
        self.assertIn("users", response.data)
        self.assertGreaterEqual(response.data["counts"]["users"], 3)

    def test_minister_can_list_ministries(self):
        self.client.force_authenticate(user=self.minister)
        response = self.client.get("/api/admin/ministries/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"] if isinstance(response.data, dict) else response.data
        names = {item["name"] for item in results}
        self.assertIn("Academics", names)
        self.assertIn("Health & Welfare", names)

    def test_student_joins_event_waitlist_when_full(self):
        from core.models import EventWaitlist

        event = Event.objects.create(
            title="Waitlist Gala",
            description="Limited seats",
            location="Hall",
            event_date="2026-08-01",
            capacity=1,
            registered_count=1,
        )
        other = User.objects.create_user(
            username="other-wait",
            reg_number="JUC/2026/021",
            email="other.wait@jucso.ac.tz",
            password="SecurePass123!",
            role="student",
            email_verified=True,
        )
        event.registrations.create(student=other)
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f"/api/events/{event.pk}/register/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_waitlisted"])
        self.assertTrue(EventWaitlist.objects.filter(event=event, student=self.student).exists())

    def test_waitlist_promoted_when_spot_opens(self):
        from core.models import EventRegistration, EventWaitlist, PortalNotification

        event = Event.objects.create(
            title="Promote Test",
            description="One seat",
            location="Hall",
            event_date="2026-08-02",
            capacity=1,
            registered_count=1,
        )
        holder = User.objects.create_user(
            username="holder-wait",
            reg_number="JUC/2026/022",
            email="holder.wait@jucso.ac.tz",
            password="SecurePass123!",
            role="student",
            email_verified=True,
        )
        EventRegistration.objects.create(event=event, student=holder)
        EventWaitlist.objects.create(event=event, student=self.student)

        self.client.force_authenticate(user=holder)
        response = self.client.post(f"/api/events/{event.pk}/register/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertTrue(EventRegistration.objects.filter(event=event, student=self.student).exists())
        self.assertFalse(EventWaitlist.objects.filter(event=event, student=self.student).exists())
        self.assertTrue(PortalNotification.objects.filter(user=self.student).exists())

    def test_admin_mark_all_contact_messages_read(self):
        ContactMessage.objects.create(name="A", email="a@test.com", subject="One", message="Hi", is_read=False)
        ContactMessage.objects.create(name="B", email="b@test.com", subject="Two", message="Hey", is_read=False)
        self.client.force_authenticate(user=self.admin)
        response = self.client.post("/api/admin/contact-messages/mark-all-read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["updated"], 2)
        self.assertEqual(ContactMessage.objects.filter(is_read=False).count(), 0)

    def test_admin_bulk_delete_contact_messages(self):
        m1 = ContactMessage.objects.create(name="A", email="a@test.com", subject="One", message="Hi")
        m2 = ContactMessage.objects.create(name="B", email="b@test.com", subject="Two", message="Hey")
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/admin/contact-messages/bulk-delete/",
            {"ids": [m1.pk, m2.pk]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted"], 2)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_student_can_vote_in_open_election(self):
        from core.models import Election, ElectionCandidate

        election = Election.objects.create(
            title="Guild President 2026",
            description="Choose your leader",
            starts_at=timezone.now() - timedelta(hours=1),
            ends_at=timezone.now() + timedelta(days=1),
        )
        c1 = ElectionCandidate.objects.create(election=election, name="Alice", position="President")
        ElectionCandidate.objects.create(election=election, name="Bob", position="President")

        self.client.force_authenticate(user=self.student)
        list_response = self.client.get("/api/elections/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        results = list_response.data["results"] if isinstance(list_response.data, dict) else list_response.data
        self.assertEqual(len(results), 1)

        vote_response = self.client.post(
            f"/api/elections/{election.pk}/vote/",
            {"candidate_id": f"CAND-{c1.pk:03d}"},
            format="json",
        )
        self.assertEqual(vote_response.status_code, status.HTTP_200_OK)
        self.assertTrue(vote_response.data["has_voted"])

        again = self.client.post(
            f"/api/elections/{election.pk}/vote/",
            {"candidate_id": f"CAND-{c1.pk:03d}"},
            format="json",
        )
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_audit_log_records_user_update(self):
        from core.models import PortalAuditLog

        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/users/{self.student.reg_number}/",
            {"role": "student", "is_active": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PortalAuditLog.objects.filter(action="User updated").exists())
        audit_response = self.client.get("/api/admin/audit-log/")
        self.assertEqual(audit_response.status_code, status.HTTP_200_OK)

    def test_admin_can_list_and_create_elections(self):
        from core.models import Election

        self.client.force_authenticate(user=self.admin)
        list_response = self.client.get("/api/admin/elections/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            "/api/admin/elections/",
            {
                "title": "Guild VP 2026",
                "description": "Vote for vice president",
                "starts_at": (timezone.now() + timedelta(hours=1)).isoformat(),
                "ends_at": (timezone.now() + timedelta(days=2)).isoformat(),
                "candidates": [
                    {"name": "Carol", "position": "VP"},
                    {"name": "Dan", "position": "VP"},
                ],
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Election.objects.count(), 1)

    def test_push_subscribe_stores_subscription(self):
        from core.models import PushSubscription

        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            "/api/push/subscribe/",
            {
                "endpoint": "https://push.example.com/subscriber/abc",
                "keys": {"p256dh": "test-p256dh", "auth": "test-auth"},
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PushSubscription.objects.filter(user=self.student).exists())
