from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.templatetags.static import static
from django.utils import timezone
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe
from django.views.decorators.http import require_POST
from xml.sax.saxutils import escape

import json

from telemetry.models import TelemetryFrame

from . import public_content as pub
from .forms import (
    AdminMemberEditForm,
    BlogPostForm,
    BuildMaterialForm,
    ClubEventForm,
    LibraryAssetForm,
    LibraryFolderForm,
)
from .member_accounts import (
    filter_members,
    mark_member_approved,
    mark_member_banned,
    member_stats,
    members_dashboard_url,
    members_redirect_params,
)
from .models import BlogPost, BuildMaterial, ClubEvent, LibraryAsset, LibraryFolder
from .storage import library_file_handle


PUBLIC_SITEMAP_ROUTES = [
    ('core:home', '1.0'),
    ('core:pioneer', '0.9'),
    ('core:projects', '0.8'),
    ('core:events', '0.8'),
    ('core:posts_list', '0.8'),
    ('core:about', '0.7'),
    ('core:join', '0.7'),
    ('core:sponsor', '0.8'),
    ('core:members', '0.5'),
    ('core:discord', '0.4'),
]


MEMBER_DASHBOARD_SECTIONS = {
    'overview': 'core/dashboard/sections/member_overview.html',
    'materials': 'core/dashboard/sections/member_materials.html',
    'posts': 'core/dashboard/sections/member_posts.html',
    'events': 'core/dashboard/sections/member_events.html',
    'account': 'core/dashboard/sections/member_account.html',
    'telemetry': 'core/dashboard/sections/member_telemetry.html',
    'workshop': 'core/dashboard/sections/member_workshop.html',
}

MEMBER_SIDEBAR_ITEMS = [
    {'id': 'overview', 'label': 'Overview'},
    {'id': 'materials', 'label': 'Materials'},
    {'id': 'posts', 'label': 'Posts'},
    {'id': 'events', 'label': 'Events'},
    {'id': 'account', 'label': 'Account'},
    {'id': 'telemetry', 'label': 'Telemetry'},
    {'id': 'workshop', 'label': 'Workshop'},
]

ADMIN_DASHBOARD_SECTIONS = {
    'overview': 'core/dashboard/sections/admin_overview.html',
    'members': 'core/dashboard/sections/admin_members.html',
    'events': 'core/dashboard/sections/admin_events.html',
    'posts': 'core/dashboard/sections/admin_posts.html',
    'materials': 'core/dashboard/sections/admin_materials.html',
    'library': 'core/dashboard/sections/admin_library.html',
    'telemetry': 'core/dashboard/sections/admin_telemetry.html',
    'tools': 'core/dashboard/sections/admin_tools.html',
}

ADMIN_SIDEBAR_ITEMS = [
    {'id': 'overview', 'label': 'Overview'},
    {'id': 'members', 'label': 'Members'},
    {'id': 'events', 'label': 'Events'},
    {'id': 'posts', 'label': 'Posts'},
    {'id': 'materials', 'label': 'Materials'},
    {'id': 'library', 'label': 'Library'},
    {'id': 'telemetry', 'label': 'Telemetry'},
    {'id': 'tools', 'label': 'Tools'},
]

ADMIN_TOOLS = [
    {
        'name': 'Django admin',
        'description': 'Full database access, models, and advanced settings.',
        'url': '/admin/',
    },
    {
        'name': 'Telemetry console',
        'description': 'Live ground-station frames and ingest history.',
        'url_name': 'telemetry:dashboard',
    },
    {
        'name': 'Sponsor page',
        'description': 'Public sponsorship package and partner tiers.',
        'url_name': 'core:sponsor',
    },
    {
        'name': 'Events page',
        'description': 'Workshops, build sessions, and club FAQs.',
        'url_name': 'core:events',
    },
]


def _dashboard_section(request, sections, default='overview'):
    section = request.GET.get('section', default)
    if section not in sections:
        section = default
    return section, sections[section]


def _dashboard_url(section, **extra):
    from urllib.parse import urlencode

    return reverse('core:dashboard') + '?' + urlencode({'section': section, **extra})


def _absolute_url(request, path):
    return request.build_absolute_uri(path)


def _meta_description(text, fallback='Astra Labs student rocketry update.'):
    text = ' '.join(strip_tags(text or fallback).split())
    if len(text) <= 155:
        return text
    return text[:154].rsplit(' ', 1)[0] + '…'


def _json_ld(data):
    return mark_safe(json.dumps(data, separators=(',', ':')))


def _member_user(request):
    user = request.user
    return user.is_authenticated and not (user.is_staff or user.is_superuser)


def _member_section_context(request, active_section):
    post_slug = request.GET.get('post', '').strip()
    event_slug = request.GET.get('event', '').strip()

    if active_section == 'posts':
        if post_slug:
            return {
                'section_template': 'core/dashboard/sections/member_post_detail.html',
                'post': get_object_or_404(BlogPost, slug=post_slug, published=True),
            }
        return {
            'section_template': 'core/dashboard/sections/member_posts.html',
            'member_posts': BlogPost.objects.filter(published=True).select_related('author'),
        }

    if active_section == 'events':
        if event_slug:
            return {
                'section_template': 'core/dashboard/sections/member_event_detail.html',
                'event': get_object_or_404(ClubEvent, slug=event_slug, published=True),
            }
        return {
            'section_template': 'core/dashboard/sections/member_events.html',
            'member_events': ClubEvent.objects.filter(published=True).select_related('author'),
        }

    return {'section_template': MEMBER_DASHBOARD_SECTIONS[active_section]}


def _dashboard_context():
    latest_frame = TelemetryFrame.objects.order_by('-received_at').first()
    return {
        'latest_frame': latest_frame,
        **member_stats(),
    }


def _member_feed_context():
    return {
        'recent_posts': BlogPost.objects.filter(published=True).select_related('author')[:5],
        'recent_events': ClubEvent.objects.filter(published=True).select_related('author')[:5],
    }


def _published_materials_queryset():
    return BuildMaterial.objects.filter(published=True)


def _library_assets_queryset(*, published_only=False, folder_id=''):
    assets = LibraryAsset.objects.select_related('author', 'folder')
    if published_only:
        assets = assets.filter(published=True)
    if folder_id:
        assets = assets.filter(folder_id=folder_id)
    return assets


def _library_folder_list():
    return LibraryFolder.objects.all()


def _library_folder_filter(request):
    raw = request.GET.get('folder', '').strip()
    if raw.isdigit():
        return int(raw)
    return ''


def section_page(request, *, title, lede, meta, sections, cta=None):
    return render(
        request,
        'core/section_page.html',
        {
            'title': title,
            'lede': lede,
            'meta': meta,
            'sections': sections,
            'cta': cta,
        },
    )


def home(request):
    if request.user.is_authenticated:
        return redirect('core:dashboard')
    return render(request, 'core/home.html')


def posts_list(request):
    if _member_user(request):
        return redirect(_dashboard_url('posts'))
    posts = BlogPost.objects.filter(published=True).select_related('author')
    return render(request, 'core/posts_list.html', {'posts': posts})


def post_detail(request, slug):
    if _member_user(request):
        return redirect(_dashboard_url('posts', post=slug))
    post = get_object_or_404(BlogPost, slug=slug, published=True)
    canonical_url = _absolute_url(request, reverse('core:post_detail', kwargs={'slug': post.slug}))
    image_url = (
        _absolute_url(request, post.featured_image.url)
        if post.featured_image
        else _absolute_url(request, static('images/hero-launch.jpg'))
    )
    description = _meta_description(post.excerpt or post.content)
    article = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': description,
        'url': canonical_url,
        'image': image_url,
        'datePublished': post.created_at.isoformat(),
        'dateModified': post.updated_at.isoformat(),
        'author': {
            '@type': 'Person',
            'name': post.author.get_full_name() or post.author.username,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Astra Labs',
            'logo': {
                '@type': 'ImageObject',
                'url': _absolute_url(request, static('images/hero-launch.jpg')),
            },
        },
    }
    return render(
        request,
        'core/post_detail.html',
        {
            'post': post,
            'seo_page': {
                'title': f'{post.title} | Astra Labs',
                'description': description,
                'canonical_url': canonical_url,
                'image_url': image_url,
                'og_type': 'article',
                'json_ld': _json_ld(article),
            },
        },
    )


def robots_txt(request):
    sitemap_url = _absolute_url(request, reverse('core:sitemap_xml'))
    body = f'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /accounts/\nDisallow: /dashboard/\nSitemap: {sitemap_url}\n'
    return HttpResponse(body, content_type='text/plain')


def sitemap_xml(request):
    now = timezone.now().date().isoformat()
    entries = [
        (
            _absolute_url(request, reverse(route_name)),
            now,
            priority,
        )
        for route_name, priority in PUBLIC_SITEMAP_ROUTES
    ]
    for post in BlogPost.objects.filter(published=True).only('slug', 'updated_at'):
        entries.append((
            _absolute_url(request, reverse('core:post_detail', kwargs={'slug': post.slug})),
            post.updated_at.date().isoformat(),
            '0.6',
        ))

    urlset = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod, priority in entries:
        urlset.append(
            f'<url><loc>{escape(loc)}</loc><lastmod>{lastmod}</lastmod><priority>{priority}</priority></url>'
        )
    urlset.append('</urlset>')
    return HttpResponse('\n'.join(urlset), content_type='application/xml')


def pending_approval(request):
    return render(request, 'registration/pending.html')


@login_required
def dashboard(request):
    context = _dashboard_context()
    if request.user.is_staff or request.user.is_superuser:
        User = get_user_model()
        active_section, section_template = _dashboard_section(request, ADMIN_DASHBOARD_SECTIONS)
        member_query = request.GET.get('q', '').strip()
        member_status_filter = request.GET.get('status', '').strip()
        all_members = filter_members(
            User.objects.filter(is_superuser=False).select_related('member_profile').order_by('-date_joined'),
            query=member_query,
            status=member_status_filter,
        )
        library_folder_filter = _library_folder_filter(request) if active_section == 'library' else ''
        context.update({
            'all_members': all_members,
            'member_search_q': member_query,
            'member_status_filter': member_status_filter,
            'banned_count': context['banned_count'],
            'club_events': ClubEvent.objects.select_related('author').order_by('-starts_at', '-created_at'),
            'blog_posts': BlogPost.objects.select_related('author').order_by('-created_at'),
            'build_materials': BuildMaterial.objects.select_related('author'),
            'library_assets': _library_assets_queryset(folder_id=library_folder_filter),
            'library_folder_list': _library_folder_list(),
            'library_folder_filter': library_folder_filter,
            'library_asset_count': LibraryAsset.objects.count(),
            'library_folder_count': LibraryFolder.objects.count(),
            'recent_library_assets': _library_assets_queryset().select_related('folder')[:6],
            'material_count': BuildMaterial.objects.filter(published=True).count(),
            'telemetry_frames': TelemetryFrame.objects.order_by('-received_at')[:25],
            'admin_tools': ADMIN_TOOLS,
            'topbar_meta_items': [
                f'{context["member_count"]} active',
                f'{context["pending_count"]} pending',
                f'{context["banned_count"]} banned',
                f'{context["total_count"]} total',
            ],
            'active_section': active_section,
            'section_template': section_template,
            'sidebar_title': 'Admin',
            'sidebar_items': ADMIN_SIDEBAR_ITEMS,
            'sidebar_footer': 'Launch Canada 2026',
        })
        return render(request, 'core/dashboard_admin.html', context)

    groups = list(request.user.groups.values_list('name', flat=True))
    active_section, _ = _dashboard_section(request, MEMBER_DASHBOARD_SECTIONS)
    section_context = _member_section_context(request, active_section)
    display_name = request.user.first_name or request.user.username
    role_label = ', '.join(groups) if groups else 'Member'
    context.update({
        'member_groups': groups,
        'workshop': pub.WORKSHOP_PUBLIC,
        'member_materials': _published_materials_queryset(),
        **_member_feed_context(),
        'topbar_title': f'Hi, {display_name}',
        'topbar_meta_items': [f'@{request.user.username}', role_label],
        'active_section': active_section,
        'sidebar_title': 'Member',
        'sidebar_items': MEMBER_SIDEBAR_ITEMS,
        'sidebar_footer': '@' + request.user.username,
        **section_context,
    })
    return render(request, 'core/dashboard_member.html', context)


def _staff_required(user):
    return user.is_staff or user.is_superuser


@login_required
@user_passes_test(_staff_required)
def blog_create(request):
    form = BlogPostForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        post = form.save(commit=False)
        post.author = request.user
        post.save()
        messages.success(request, f'{"Published" if post.published else "Saved"} "{post.title}".')
        return redirect(_dashboard_url('posts'))

    return render(request, 'core/blog_form.html', {'form': form, 'editing': False})


@login_required
@user_passes_test(_staff_required)
def blog_edit(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)
    form = BlogPostForm(request.POST or None, request.FILES or None, instance=post)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Updated "{post.title}".')
        return redirect(_dashboard_url('posts'))

    return render(request, 'core/blog_form.html', {'form': form, 'editing': True, 'post': post})


@require_POST
@login_required
@user_passes_test(_staff_required)
def blog_delete(request, slug):
    post = get_object_or_404(BlogPost, slug=slug)
    title = post.title
    if post.featured_image:
        post.featured_image.delete(save=False)
    post.delete()
    messages.success(request, f'Deleted "{title}".')
    return redirect(_dashboard_url('posts'))


@login_required
@user_passes_test(_staff_required)
def material_create(request):
    form = BuildMaterialForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        material = form.save(commit=False)
        material.author = request.user
        material.save()
        messages.success(request, f'{"Published" if material.published else "Saved"} "{material.name}".')
        return redirect(_dashboard_url('materials'))

    return render(request, 'core/material_form.html', {'form': form, 'editing': False})


@login_required
@user_passes_test(_staff_required)
def material_edit(request, material_id):
    material = get_object_or_404(BuildMaterial, pk=material_id)
    form = BuildMaterialForm(request.POST or None, instance=material)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Updated "{material.name}".')
        return redirect(_dashboard_url('materials'))

    return render(request, 'core/material_form.html', {'form': form, 'editing': True, 'material': material})


@require_POST
@login_required
@user_passes_test(_staff_required)
def material_delete(request, material_id):
    material = get_object_or_404(BuildMaterial, pk=material_id)
    name = material.name
    material.delete()
    messages.success(request, f'Deleted "{name}".')
    return redirect(_dashboard_url('materials'))


@login_required
@user_passes_test(_staff_required)
def library_folder_create(request):
    form = LibraryFolderForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        folder = form.save()
        messages.success(request, f'Created folder "{folder.name}".')
        return redirect(_dashboard_url('library', folder=folder.pk))

    return render(request, 'core/library_folder_form.html', {'form': form})


@login_required
@user_passes_test(_staff_required)
def library_create(request):
    form = LibraryAssetForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        asset = form.save(commit=False)
        asset.author = request.user
        asset.save()
        messages.success(request, f'{"Published" if asset.published else "Saved"} "{asset.title}".')
        return redirect(_dashboard_url('library'))

    return render(request, 'core/library_form.html', {'form': form, 'editing': False})


@login_required
@user_passes_test(_staff_required)
def library_edit(request, asset_id):
    asset = get_object_or_404(LibraryAsset, pk=asset_id)
    form = LibraryAssetForm(request.POST or None, request.FILES or None, instance=asset)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Updated "{asset.title}".')
        return redirect(_dashboard_url('library'))

    return render(request, 'core/library_form.html', {'form': form, 'editing': True, 'asset': asset})


@require_POST
@login_required
@user_passes_test(_staff_required)
def library_delete(request, asset_id):
    asset = get_object_or_404(LibraryAsset, pk=asset_id)
    title = asset.title
    if asset.image:
        asset.image.delete(save=False)
    if asset.reference_file:
        asset.reference_file.delete(save=False)
    asset.delete()
    messages.success(request, f'Deleted "{title}".')
    return redirect(_dashboard_url('library'))


@login_required
def library_download(request, asset_id):
    asset = get_object_or_404(LibraryAsset, pk=asset_id)
    if not asset.published and not _staff_required(request.user):
        raise Http404
    if asset.image:
        return redirect(asset.image.url)
    handle = library_file_handle(asset)
    if not handle:
        raise Http404
    return FileResponse(
        handle,
        as_attachment=not asset.is_image,
        filename=asset.filename,
    )


@login_required
@user_passes_test(_staff_required)
def event_create(request):
    form = ClubEventForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        event = form.save(commit=False)
        event.author = request.user
        event.save()
        messages.success(request, f'{"Published" if event.published else "Saved"} "{event.title}".')
        return redirect(_dashboard_url('events'))

    return render(request, 'core/event_form.html', {'form': form, 'editing': False})


@login_required
@user_passes_test(_staff_required)
def event_edit(request, event_id):
    event = get_object_or_404(ClubEvent, pk=event_id)
    form = ClubEventForm(request.POST or None, request.FILES or None, instance=event)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Updated "{event.title}".')
        return redirect(_dashboard_url('events'))

    return render(request, 'core/event_form.html', {'form': form, 'editing': True, 'event': event})


@require_POST
@login_required
@user_passes_test(_staff_required)
def event_delete(request, event_id):
    event = get_object_or_404(ClubEvent, pk=event_id)
    title = event.title
    if event.image:
        event.image.delete(save=False)
    event.delete()
    messages.success(request, f'Deleted "{title}".')
    return redirect(_dashboard_url('events'))


def _get_manageable_member(user_id):
    User = get_user_model()
    return get_object_or_404(User, pk=user_id, is_superuser=False)


@login_required
@user_passes_test(_staff_required)
def member_edit(request, user_id):
    member = _get_manageable_member(user_id)
    form = AdminMemberEditForm(request.POST or None, instance=member)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Updated {member.username}.')
        query, status = members_redirect_params(request)
        return redirect(members_dashboard_url(query=query, status=status))

    return render(
        request,
        'core/member_edit.html',
        {
            'form': form,
            'member': member,
        },
    )


@require_POST
@login_required
@user_passes_test(_staff_required)
def approve_member(request, user_id):
    member = _get_manageable_member(user_id)
    if member.is_active:
        messages.info(request, f'{member.username} is already active.')
    else:
        mark_member_approved(member)
        messages.success(request, f'Approved {member.get_full_name() or member.username}.')
    query, status = members_redirect_params(request)
    return redirect(members_dashboard_url(query=query, status=status))


@require_POST
@login_required
@user_passes_test(_staff_required)
def ban_member(request, user_id):
    member = _get_manageable_member(user_id)
    query, status = members_redirect_params(request)
    if member.pk == request.user.pk:
        messages.error(request, 'You cannot ban your own account.')
        return redirect(members_dashboard_url(query=query, status=status))
    if not member.is_active:
        messages.info(request, f'{member.username} is already inactive.')
    else:
        mark_member_banned(member)
        messages.success(request, f'Banned {member.get_full_name() or member.username}. They can no longer sign in.')
    return redirect(members_dashboard_url(query=query, status=status))


@require_POST
@login_required
@user_passes_test(_staff_required)
def unban_member(request, user_id):
    member = _get_manageable_member(user_id)
    query, status = members_redirect_params(request)
    if member.is_active:
        messages.info(request, f'{member.username} is already active.')
    else:
        mark_member_approved(member)
        messages.success(request, f'Unbanned {member.get_full_name() or member.username}. They can sign in again.')
    return redirect(members_dashboard_url(query=query, status=status))


def about(request):
    return render(
        request,
        'core/about.html',
        {
            'leadership': pub.LEADERSHIP,
            'values': pub.ENGINEERING_VALUES,
            'disciplines': pub.DISCIPLINES,
            'programs': pub.PROGRAMS,
            'faculty': pub.FACULTY_SUPPORT,
            'partners': pub.ORG_PARTNERS,
        },
    )


def work(request):
    return render(
        request,
        'core/work.html',
        {
            'collaborations': pub.COLLABORATIONS,
            'gallery': pub.FIELD_GALLERY,
        },
    )


def members(request):
    return section_page(
        request,
        title='Members',
        lede=(
            'The crew behind Astra Labs — builders, organizers, documentation leads, '
            'and new students learning SolidWorks, KiCad, and OpenRocket on real hardware.'
        ),
        meta=['Seneca students', 'Open intake', 'Project teams'],
        sections=[
            {
                'label': 'Crew structure',
                'heading': 'Members join a workstream, then learn by doing.',
                'items': [
                    (
                        'MECH',
                        'Mechanical & airframe',
                        'CAD in SolidWorks, OpenRocket simulations, fabrication, recovery hardware, and integration.',
                    ),
                    (
                        'ELEC',
                        'Avionics & telemetry',
                        'KiCad PCBs, STM32 firmware, sensors, wiring, and ground-station capture.',
                    ),
                    (
                        'OPS',
                        'Operations & documentation',
                        'Sponsorship, procurement, launch logistics, events, and the build log.',
                    ),
                ],
            },
            {
                'label': 'Membership notes',
                'heading': 'Consistent contribution matters more than prior experience.',
                'items': [
                    (
                        'Access',
                        'Seneca students only',
                        'Any program can join. Technical experience helps but is not required.',
                    ),
                    (
                        'Time',
                        'About 5 hours per week',
                        'Members show up regularly enough for teammates to depend on handoffs.',
                    ),
                    (
                        'Reference',
                        'Six-month minimum',
                        'Reference letters require sustained, visible contribution to the program.',
                    ),
                ],
            },
        ],
    )


def projects(request):
    return render(request, 'core/destinations.html', {'destinations': pub.PROJECT_DESTINATIONS})


def events(request):
    if _member_user(request):
        return redirect(_dashboard_url('events'))
    club_events = ClubEvent.objects.filter(published=True).order_by('-starts_at', '-created_at')
    return render(
        request,
        'core/events.html',
        {
            'club_events': club_events,
            'workshop': pub.WORKSHOP_PUBLIC,
            'faqs': [
                (
                    'Do I need prior rocketry experience?',
                    'No. We welcome all skill levels and teach tooling on the job.',
                ),
                (
                    'What programs can join?',
                    'Any Seneca student regardless of major.',
                ),
                (
                    'Do I need to be a Seneca student?',
                    'Yes — membership is limited to current Seneca Polytechnic students.',
                ),
                (
                    'What is the time commitment?',
                    'About 5 hours per week. Six-month minimum for a reference letter.',
                ),
                (
                    'When can I join?',
                    'Anytime. New members are accepted continuously through the year.',
                ),
            ],
        },
    )


def join(request):
    return section_page(
        request,
        title='Join the Crew',
        lede='Show up to a work session, pick a stream, and learn on real club hardware.',
        meta=['Open intake', 'No experience required', 'Seneca students'],
        sections=[
            {
                'label': 'How it works',
                'heading': 'The fastest path in is a small, real task.',
                'items': [
                    (
                        '01',
                        'Find the next session',
                        'Use the club signup link or ask a member where the next build or planning session is.',
                    ),
                    (
                        '02',
                        'Choose a workstream',
                        'Mechanical, electronics, operations, documentation, sponsorship, or outreach.',
                    ),
                    (
                        '03',
                        'Document the handoff',
                        'Leave notes, photos, or test results the next member can use.',
                    ),
                ],
            },
            {
                'label': 'Good first tasks',
                'heading': 'You do not need to start with the hardest subsystem.',
                'items': [
                    (
                        'Shop',
                        'Inventory & prep',
                        'Label parts, organize fasteners, photograph assemblies, update the build record.',
                    ),
                    (
                        'Design',
                        'CAD & review',
                        'Model fixtures, trace dimensions, or prepare review notes in OpenRocket.',
                    ),
                    (
                        'Ops',
                        'Sponsorship & events',
                        'Club booths, partner outreach, sponsor packages, and post-event notes.',
                    ),
                ],
            },
        ],
        cta={'label': 'Open Seneca club signup', 'href': pub.CLUB_SIGNUP_URL},
    )


def sponsor(request):
    return render(
        request,
        'core/sponsor.html',
        {
            'package': pub.SPONSOR_PACKAGE,
            'goals': pub.SPONSOR_GOALS,
            'tiers': pub.SPONSOR_TIERS,
            'funding': pub.SPONSOR_FUNDING_AREAS,
            'partner_value': pub.SPONSOR_PARTNER_VALUE,
            'sponsor_gallery': pub.SPONSOR_GALLERY,
            'email': pub.SPONSOR_PACKAGE['contact_email'],
        },
    )


def discord(request):
    return section_page(
        request,
        title='Discord',
        lede='Day-to-day coordination — work sessions, quick questions, and handoffs.',
        meta=['Member coordination', 'Build updates', 'Fast questions'],
        sections=[
            {
                'label': 'Use it for',
                'heading': 'Discord is live; the website is the durable record.',
                'items': [
                    ('Sessions', 'Where to be', 'Meeting locations, build timing, and short-notice changes.'),
                    ('Questions', 'Get help early', 'Tooling help, file handoffs, and review requests.'),
                    ('Handoffs', 'Move work into the log', 'Record important decisions in the build log after the conversation wraps up.'),
                ],
            },
        ],
    )
