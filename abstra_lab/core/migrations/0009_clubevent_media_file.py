from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_libraryasset_source_path'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubevent',
            name='image',
            field=models.FileField(
                blank=True,
                help_text='Optional image or video for the event listing and detail pages.',
                null=True,
                upload_to='events/%Y/%m/',
            ),
        ),
    ]