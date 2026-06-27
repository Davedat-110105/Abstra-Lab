from django.db.models import Q
from django.utils import timezone

from .models import MemberProfile


def ensure_member_profile(user):
    profile, _ = MemberProfile.objects.get_or_create(user=user)
    return profile


def member_is_banned(user):
    try:
        return user.member_profile.is_banned
    except MemberProfile.DoesNotExist:
        return False


def member_status(user):
    if user.is_active:
        return 'active'
    if member_is_banned(user):
        return 'banned'
    return 'pending'


def mark_member_banned(user):
    profile = ensure_member_profile(user)
    profile.is_banned = True
    profile.banned_at = timezone.now()
    profile.save(update_fields=['is_banned', 'banned_at'])
    user.is_active = False
    user.save(update_fields=['is_active'])


def mark_member_approved(user):
    profile = ensure_member_profile(user)
    profile.is_banned = False
    profile.banned_at = None
    profile.save(update_fields=['is_banned', 'banned_at'])
    user.is_active = True
    user.save(update_fields=['is_active'])


def member_stats():
    from django.contrib.auth import get_user_model

    User = get_user_model()
    base = User.objects.filter(is_superuser=False)
    active = base.filter(is_active=True).count()
    banned = base.filter(is_active=False, member_profile__is_banned=True).count()
    pending = (
        base.filter(is_active=False)
        .filter(Q(member_profile__is_banned=False) | Q(member_profile__isnull=True))
        .count()
    )
    return {
        'member_count': active,
        'pending_count': pending,
        'banned_count': banned,
        'total_count': base.count(),
    }


def filter_members(queryset, *, query='', status=''):
    if query:
        queryset = queryset.filter(
            Q(username__icontains=query)
            | Q(email__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
        )

    if status == 'active':
        return queryset.filter(is_active=True)
    if status == 'pending':
        return queryset.filter(is_active=False).filter(
            Q(member_profile__is_banned=False) | Q(member_profile__isnull=True)
        )
    if status == 'banned':
        return queryset.filter(is_active=False, member_profile__is_banned=True)
    return queryset


def members_dashboard_url(*, query='', status=''):
    from urllib.parse import urlencode

    from django.urls import reverse

    params = {'section': 'members'}
    if query:
        params['q'] = query
    if status:
        params['status'] = status
    return reverse('core:dashboard') + '?' + urlencode(params)


def members_redirect_params(request):
    query = request.GET.get('q') or request.POST.get('q', '')
    status = request.GET.get('status') or request.POST.get('status', '')
    return query.strip(), status.strip()