import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_suggestion_sla_and_cron_log"),
    ]

    operations = [
        migrations.AddField(
            model_name="newsitem",
            name="body",
            field=models.TextField(blank=True),
        ),
        migrations.CreateModel(
            name="PortalAnnouncement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.TextField()),
                ("link_label", models.CharField(blank=True, max_length=100)),
                ("link_url", models.URLField(blank=True)),
                (
                    "priority",
                    models.CharField(
                        choices=[("info", "Info"), ("warning", "Warning"), ("urgent", "Urgent")],
                        default="info",
                        max_length=20,
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("starts_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-starts_at"],
            },
        ),
        migrations.CreateModel(
            name="PortalNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("message", models.TextField()),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("complaint", "Complaint"),
                            ("suggestion", "Suggestion"),
                            ("event", "Event"),
                            ("system", "System"),
                        ],
                        default="system",
                        max_length=20,
                    ),
                ),
                ("link", models.CharField(blank=True, max_length=300)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="portal_notifications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
