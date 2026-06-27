from django.conf import settings
from django.db import migrations


def create_member_profiles(apps, schema_editor):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    MemberProfile = apps.get_model('core', 'MemberProfile')
    for user in User.objects.all():
        MemberProfile.objects.get_or_create(user_id=user.id)


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_memberprofile'),
    ]

    operations = [
        migrations.RunPython(create_member_profiles, migrations.RunPython.noop),
    ]