from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0011_complaint_satisfaction"),
    ]

    operations = [
        migrations.AddField(
            model_name="complaint",
            name="escalated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="is_escalated",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="eventregistration",
            name="reminder_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
