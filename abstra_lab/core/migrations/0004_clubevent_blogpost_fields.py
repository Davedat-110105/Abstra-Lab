import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils.text import slugify


def seed_club_events(apps, schema_editor):
    ClubEvent = apps.get_model('core', 'ClubEvent')
    defaults = [
        ('Oct 2025', 'Newham Clubs Fest', 'Recruited 30+ new members in a single afternoon — most had never touched a rocket.'),
        ('2025', 'SSF appreciation', 'Recognized support from the Seneca Student Federation clubs team.'),
        ('Weekly', 'Build sessions', 'Hands-on work nights for mechanical, electronics, and operations streams.'),
    ]
    for date_label, title, description in defaults:
        slug = slugify(title)[:50] or 'event'
        ClubEvent.objects.get_or_create(
            slug=slug,
            defaults={
                'title': title,
                'date_label': date_label,
                'description': description,
                'published': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_backfill_member_profiles'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='excerpt',
            field=models.CharField(blank=True, help_text='Short summary shown in lists and previews.', max_length=300),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='featured_image',
            field=models.ImageField(blank=True, null=True, upload_to='posts/%Y/%m/'),
        ),
        migrations.CreateModel(
            name='ClubEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('date_label', models.CharField(help_text='Display date, e.g. "Oct 2025" or "Weekly".', max_length=80)),
                ('summary', models.CharField(blank=True, max_length=300)),
                ('description', models.TextField()),
                ('location', models.CharField(blank=True, max_length=200)),
                ('starts_at', models.DateTimeField(blank=True, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='events/%Y/%m/')),
                ('published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='club_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-starts_at', '-created_at'],
            },
        ),
        migrations.RunPython(seed_club_events, migrations.RunPython.noop),
    ]
