from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_announcements_notifications_news_body"),
    ]

    operations = [
        migrations.AlterField(
            model_name="suggestion",
            name="status",
            field=models.CharField(
                choices=[
                    ("Received", "Received"),
                    ("Under Review", "Under Review"),
                    ("Implemented", "Implemented"),
                    ("Declined", "Declined"),
                ],
                default="Received",
                max_length=20,
            ),
        ),
    ]
