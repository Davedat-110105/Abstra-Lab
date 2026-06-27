import core.storage
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def migrate_records_to_tools(apps, schema_editor):
    BuildMaterial = apps.get_model('core', 'BuildMaterial')
    BuildMaterial.objects.filter(material_type='records').update(material_type='tools')


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0005_buildmaterial'),
    ]

    operations = [
        migrations.AddField(
            model_name='buildmaterial',
            name='purchase_url',
            field=models.URLField(blank=True, help_text='Optional buy link — vendor page, Seneca store, or parts list.'),
        ),
        migrations.AlterField(
            model_name='buildmaterial',
            name='access',
            field=models.CharField(blank=True, help_text='Fallback note when no buy link is set, e.g. "Ask mechanical lead".', max_length=200),
        ),
        migrations.AlterField(
            model_name='buildmaterial',
            name='used_for',
            field=models.CharField(help_text='What a member needs this for when building.', max_length=300),
        ),
        migrations.AlterField(
            model_name='buildmaterial',
            name='material_type',
            field=models.CharField(choices=[('hardware', 'Hardware'), ('software', 'Software'), ('materials', 'Materials'), ('tools', 'Tools')], max_length=20),
        ),
        migrations.RunPython(migrate_records_to_tools, migrations.RunPython.noop),
        migrations.CreateModel(
            name='LibraryAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('kind', models.CharField(choices=[('image', 'Image'), ('document', 'Document'), ('video', 'Video'), ('other', 'Other')], default='document', max_length=20)),
                ('folder', models.CharField(blank=True, help_text='Optional folder label, e.g. CAD, Datasheets, Photos.', max_length=100)),
                ('description', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='images/%Y/%m/')),
                ('reference_file', models.FileField(blank=True, null=True, storage=core.storage.reference_storage, upload_to='%Y/%m/')),
                ('published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='library_assets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['folder', '-created_at', 'title'],
            },
        ),
    ]