from django.db import migrations, models
import django.db.models.deletion


def migrate_folder_names(apps, schema_editor):
    LibraryAsset = apps.get_model('core', 'LibraryAsset')
    LibraryFolder = apps.get_model('core', 'LibraryFolder')
    sort = 0
    for name in LibraryAsset.objects.exclude(folder_old='').values_list('folder_old', flat=True).distinct():
        folder, _ = LibraryFolder.objects.get_or_create(
            name=name,
            defaults={'sort_order': sort},
        )
        sort += 10
        LibraryAsset.objects.filter(folder_old=name).update(folder=folder)


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_libraryasset_buildmaterial_purchase'),
    ]

    operations = [
        migrations.CreateModel(
            name='LibraryFolder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.RenameField(
            model_name='libraryasset',
            old_name='folder',
            new_name='folder_old',
        ),
        migrations.AddField(
            model_name='libraryasset',
            name='folder',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assets', to='core.libraryfolder'),
        ),
        migrations.RunPython(migrate_folder_names, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='libraryasset',
            name='folder_old',
        ),
        migrations.AlterModelOptions(
            name='libraryasset',
            options={'ordering': ['folder__sort_order', 'folder__name', '-created_at', 'title']},
        ),
    ]