from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_libraryfolder'),
    ]

    operations = [
        migrations.AddField(
            model_name='libraryasset',
            name='source_path',
            field=models.CharField(
                blank=True,
                help_text='Repo-relative path for catalogued files (no copy on import).',
                max_length=500,
            ),
        ),
    ]