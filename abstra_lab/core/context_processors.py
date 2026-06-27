from django.conf import settings
from django.templatetags.static import static
from django.urls import reverse
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe

import json


DEFAULT_SEO_DESCRIPTION = (
    'Astra Labs is a Seneca Polytechnic student rocketry club building the '
    'Pioneer rocket for Launch Canada 2026.'
)

PUBLIC_PAGE_SEO = {
    'home': (
        'Astra Labs | Seneca Student Rocketry',
        DEFAULT_SEO_DESCRIPTION,
    ),
    'pioneer': (
        'Pioneer Rocket | Astra Labs',
        'Explore Pioneer, Astra Labs’ Launch Canada 2026 student rocket program at Seneca Polytechnic.',
    ),
    'work': (
        'Pioneer Rocket | Astra Labs',
        'Explore Pioneer, Astra Labs’ Launch Canada 2026 student rocket program at Seneca Polytechnic.',
    ),
    'projects': (
        'Projects | Astra Labs',
        'See Astra Labs projects, Launch Canada preparation, and student aerospace work at Seneca Polytechnic.',
    ),
    'events': (
        'Events | Astra Labs',
        'Find Astra Labs workshops, outreach events, build sessions, and Launch Canada preparation updates.',
    ),
    'posts_list': (
        'Build Log | Astra Labs',
        'Read Astra Labs build notes, bench work, tests, and Pioneer rocket project updates.',
    ),
    'about': (
        'About | Astra Labs',
        'Meet Astra Labs, the Seneca Polytechnic student rocketry team building Pioneer for Launch Canada 2026.',
    ),
    'members': (
        'Members | Astra Labs',
        'Learn how Astra Labs members work across mechanical, avionics, operations, documentation, and outreach.',
    ),
    'join': (
        'Join Astra Labs',
        'Join Astra Labs at Seneca Polytechnic and learn rocketry through real hardware, workshops, and team builds.',
    ),
    'sponsor': (
        'Sponsor Astra Labs',
        'Sponsor Astra Labs to support Seneca student rocketry, Pioneer fabrication, workshops, and Launch Canada readiness.',
    ),
    'discord': (
        'Discord | Astra Labs',
        'Connect with Astra Labs members for build sessions, handoffs, and day-to-day coordination.',
    ),
}


def _absolute_url(request, path):
    return request.build_absolute_uri(path)


def _json_ld(data):
    return mark_safe(json.dumps(data, separators=(',', ':')))


def _truncate(text, limit=155):
    text = ' '.join(strip_tags(text or '').split())
    if len(text) <= limit:
        return text
    return text[: limit - 1].rsplit(' ', 1)[0] + '…'


def site_nav(request):
    if request.user.is_authenticated:
        return {'brand_home_url': reverse('core:dashboard')}
    return {'brand_home_url': reverse('core:home')}


def seo_context(request):
    url_name = request.resolver_match.url_name if request.resolver_match else 'home'
    title, description = PUBLIC_PAGE_SEO.get(
        url_name,
        ('Astra Labs', DEFAULT_SEO_DESCRIPTION),
    )
    canonical_url = _absolute_url(request, request.path)
    image_url = _absolute_url(request, static('images/hero-launch.jpg'))
    noindex = (
        request.path.startswith('/admin/')
        or request.path.startswith('/accounts/')
        or request.path.startswith('/dashboard/')
    )

    organization = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Astra Labs',
        'url': _absolute_url(request, reverse('core:home')),
        'logo': image_url,
        'sameAs': [
            'https://www.linkedin.com/company/astra-labs-engineers/',
        ],
    }
    website = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Astra Labs',
        'url': _absolute_url(request, reverse('core:home')),
        'description': DEFAULT_SEO_DESCRIPTION,
    }

    return {
        'seo': {
            'title': title,
            'description': _truncate(description),
            'canonical_url': canonical_url,
            'image_url': image_url,
            'site_name': 'Astra Labs',
            'noindex': noindex,
            'organization_json_ld': _json_ld(organization),
            'website_json_ld': _json_ld(website),
        },
    }


def auth_flags(request):
    return {
        'google_oauth_enabled': getattr(settings, 'GOOGLE_OAUTH_ENABLED', False),
    }


def role_flags(request):
    if not request.user.is_authenticated:
        return {
            'user_role': None,
            'is_mission_ops': False,
            'is_telemetry': False,
            'is_student': False,
            'is_admin': False,
        }

    groups = set(request.user.groups.values_list('name', flat=True))
    return {
        'user_role': next(iter(groups), None),
        'is_mission_ops': 'mission_ops' in groups,
        'is_telemetry': 'telemetry' in groups,
        'is_student': 'student' in groups,
        'is_admin': request.user.is_staff or request.user.is_superuser,
    }
