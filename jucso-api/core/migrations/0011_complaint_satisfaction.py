from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0010_suggestion_declined_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="complaint",
            name="rated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="satisfaction_comment",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="satisfaction_rating",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
    ]
