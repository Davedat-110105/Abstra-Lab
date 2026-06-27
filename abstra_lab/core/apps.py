from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        from django.db.models.signals import post_migrate

        post_migrate.connect(ensure_default_site, sender=self)


def ensure_default_site(sender, **kwargs):
    from django.contrib.sites.models import Site

    Site.objects.update_or_create(
        pk=1,
        defaults={'domain': '127.0.0.1:8001', 'name': 'Astra Labs'},
    )