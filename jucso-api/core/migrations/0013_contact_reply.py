from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0012_event_reminders_and_escalation"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="contactmessage",
            name="admin_reply",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="replied_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="replied_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="contact_replies",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
