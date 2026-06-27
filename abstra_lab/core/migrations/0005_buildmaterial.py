from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


TYPE_MAP = {
    'Hardware': 'hardware',
    'Software': 'software',
    'Materials': 'materials',
    'Records': 'records',
}

SEED_MATERIALS = [
    {
        'type': 'Hardware',
        'name': 'Pioneer airframe',
        'summary': 'Fiberglass body tubes, couplers, fins, and recovery bay hardware.',
        'used_for': 'Launch Canada vehicle structure and integration',
        'access': 'Seneca shop',
    },
    {
        'type': 'Hardware',
        'name': 'Recovery system',
        'summary': 'Parachute, ejection hardware, and altimeter bay components.',
        'used_for': 'Safe descent and competition recovery compliance',
        'access': 'Seneca shop',
    },
    {
        'type': 'Hardware',
        'name': 'Avionics stack',
        'summary': 'STM32 flight computer, sensors, power distribution, and logging boards.',
        'used_for': 'Flight data capture and subsystem interfaces',
        'access': 'Electronics bench',
    },
    {
        'type': 'Hardware',
        'name': 'Telemetry radio link',
        'summary': 'Ground-station radio, antennas, and ingest path to the club console.',
        'used_for': 'Live frames during bench tests and field ops',
        'url_name': 'telemetry:dashboard',
        'access_label': 'Open console',
    },
    {
        'type': 'Hardware',
        'name': 'Picosatellite workshop kits',
        'summary': 'CanSat-style payload hardware for the 50-student rideshare workshop series.',
        'used_for': 'Payload program onboarding and Pioneer rideshare practice',
        'access': 'Workshop sessions',
    },
    {
        'type': 'Software',
        'name': 'SolidWorks',
        'summary': 'Mechanical CAD for airframe parts, fixtures, and integration layouts.',
        'used_for': 'Mechanical design and fabrication handoffs',
        'access': 'Seneca lab installs',
    },
    {
        'type': 'Software',
        'name': 'OpenRocket',
        'summary': 'Stability, apogee, and recovery simulations for Pioneer configurations.',
        'used_for': 'Aerodynamics and recovery sizing',
        'access': 'All subsystems',
    },
    {
        'type': 'Software',
        'name': 'KiCad',
        'summary': 'PCB schematics and board layouts for avionics and payload electronics.',
        'used_for': 'Electronics design and fabrication exports',
        'access': 'Electronics bench',
    },
    {
        'type': 'Software',
        'name': 'Fusion 360',
        'summary': '3D integration models for avionics bays and mechanical fit checks.',
        'used_for': 'Cross-subsystem mechanical clearance',
        'access': 'Electronics & mechanical',
    },
    {
        'type': 'Software',
        'name': 'STM32 firmware toolchain',
        'summary': 'Embedded code for flight logging, sensors, and recovery triggers.',
        'used_for': 'Avionics bring-up and bench validation',
        'access': 'GitHub / club repo',
    },
    {
        'type': 'Materials',
        'name': 'Composites & adhesives',
        'summary': 'Epoxy, fiberglass supplies, and finishing materials for airframe work.',
        'used_for': 'Airframe assembly and repair',
        'access': 'Shop inventory',
    },
    {
        'type': 'Materials',
        'name': 'Fasteners & rail hardware',
        'summary': 'Screws, rail buttons, and competition integration hardware.',
        'used_for': 'Vehicle assembly and launch-rail fitment',
        'access': 'Shop inventory',
    },
    {
        'type': 'Materials',
        'name': 'PCB blanks & components',
        'summary': 'Board stock, passives, connectors, and sensor parts for avionics spins.',
        'used_for': 'Electronics prototyping and flight boards',
        'access': 'Electronics bench',
    },
    {
        'type': 'Materials',
        'name': 'Harness wire & solder supplies',
        'summary': 'Wire, headers, solder, and bench consumables for integration.',
        'used_for': 'Avionics routing and payload wiring',
        'access': 'Electronics bench',
    },
    {
        'type': 'Records',
        'name': 'Pioneer vehicle gallery',
        'summary': 'Photos and subsystem context for the current vehicle build.',
        'used_for': 'See what is on the bench and in the field',
        'url_name': 'core:pioneer',
        'access_label': 'View Pioneer',
    },
    {
        'type': 'Records',
        'name': 'Build log',
        'summary': 'Ship notes, bench work, and integration handoffs from the crew.',
        'used_for': 'Track what changed and why',
        'url_name': 'core:dashboard',
        'access_label': 'View posts',
        'dashboard_section': 'posts',
    },
    {
        'type': 'Records',
        'name': 'Competition compliance pack',
        'summary': 'Launch Canada rules, safety codes, and formal competition documents.',
        'used_for': 'Range readiness and documentation checks',
        'access': 'Club Google Drive',
    },
]


def seed_build_materials(apps, schema_editor):
    BuildMaterial = apps.get_model('core', 'BuildMaterial')
    for index, item in enumerate(SEED_MATERIALS):
        BuildMaterial.objects.create(
            material_type=TYPE_MAP[item['type']],
            name=item['name'],
            summary=item['summary'],
            used_for=item['used_for'],
            access=item.get('access', ''),
            url_name=item.get('url_name', ''),
            dashboard_section=item.get('dashboard_section', ''),
            access_label=item.get('access_label', ''),
            published=True,
            sort_order=index * 10,
        )


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0004_clubevent_blogpost_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='BuildMaterial',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('material_type', models.CharField(choices=[('hardware', 'Hardware'), ('software', 'Software'), ('materials', 'Materials'), ('records', 'Records')], max_length=20)),
                ('name', models.CharField(max_length=200)),
                ('summary', models.CharField(max_length=300)),
                ('used_for', models.CharField(max_length=300)),
                ('access', models.CharField(blank=True, help_text='Shown when no link URL is set, e.g. "Seneca shop".', max_length=200)),
                ('url_name', models.CharField(blank=True, help_text='Optional named URL, e.g. core:pioneer or telemetry:dashboard.', max_length=100)),
                ('dashboard_section', models.CharField(blank=True, help_text='Optional dashboard section query for core:dashboard links.', max_length=50)),
                ('access_label', models.CharField(blank=True, help_text='Button label when a link URL is set.', max_length=50)),
                ('published', models.BooleanField(default=True)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='build_materials', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['sort_order', 'material_type', 'name'],
            },
        ),
        migrations.RunPython(seed_build_materials, migrations.RunPython.noop),
    ]