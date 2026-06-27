#!/usr/bin/env python3
"""Headless Chrome E2E checks for Astra Labs (Playwright + system Chrome)."""
from __future__ import annotations

import base64
import os
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ABSTRA_LAB = REPO_ROOT / 'abstra_lab'
sys.path.insert(0, str(ABSTRA_LAB))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'abstra_lab.settings')

import django

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from playwright.sync_api import Page, sync_playwright  # noqa: E402

from core.member_accounts import ensure_member_profile, mark_member_banned  # noqa: E402
from core.models import BlogPost, ClubEvent, LibraryAsset  # noqa: E402

BASE_URL = os.environ.get('E2E_BASE_URL', 'http://127.0.0.1:8001')
ADMIN_USER = os.environ.get('E2E_ADMIN_USER', 'admin')
ADMIN_PASSWORD = os.environ.get('E2E_ADMIN_PASSWORD', 'AstraAdmin2026')
MEMBER_USER = os.environ.get('E2E_MEMBER_USER', 'e2e-member')
MEMBER_PASSWORD = os.environ.get('E2E_MEMBER_PASSWORD', 'E2eMember2026!')
PENDING_USER = 'e2e-pending'
BAN_TARGET_USER = 'e2e-ban-target'
BANNED_LOGIN_USER = 'e2e-banned-login'
TEST_PASSWORD = 'E2eTestPass2026!'

PNG_BYTES = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
)


def write_fixture(name: str, content: bytes) -> Path:
    path = Path(tempfile.gettempdir()) / f'astra-e2e-{name}'
    path.write_bytes(content)
    return path


def ensure_accounts():
    User = get_user_model()

    admin, _ = User.objects.get_or_create(
        username=ADMIN_USER,
        defaults={'email': 'admin@example.com', 'is_staff': True, 'is_superuser': True, 'is_active': True},
    )
    admin.set_password(ADMIN_PASSWORD)
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.save()

    member, _ = User.objects.get_or_create(
        username=MEMBER_USER,
        defaults={'email': 'e2e-member@example.com', 'is_active': True},
    )
    member.set_password(MEMBER_PASSWORD)
    member.is_active = True
    member.is_staff = False
    member.is_superuser = False
    member.save()
    ensure_member_profile(member)

    pending, _ = User.objects.get_or_create(
        username=PENDING_USER,
        defaults={'email': 'e2e-pending@example.com', 'is_active': False},
    )
    pending.set_password(TEST_PASSWORD)
    pending.is_active = False
    pending.is_staff = False
    pending.is_superuser = False
    pending.save()
    ensure_member_profile(pending)

    ban_target, _ = User.objects.get_or_create(
        username=BAN_TARGET_USER,
        defaults={'email': 'e2e-ban@example.com', 'is_active': True},
    )
    ban_target.set_password(TEST_PASSWORD)
    ban_target.is_active = True
    ban_target.is_staff = False
    ban_target.is_superuser = False
    ban_target.save()
    ensure_member_profile(ban_target)

    banned_login, _ = User.objects.get_or_create(
        username=BANNED_LOGIN_USER,
        defaults={'email': 'e2e-banned@example.com', 'is_active': False},
    )
    banned_login.set_password(TEST_PASSWORD)
    banned_login.is_active = False
    banned_login.is_staff = False
    banned_login.is_superuser = False
    banned_login.save()
    ensure_member_profile(banned_login)
    mark_member_banned(banned_login)


def login(page: Page, username: str, password: str):
    page.goto(f'{BASE_URL}/accounts/login/', wait_until='networkidle')
    page.fill('input[name="login"]', username)
    page.fill('input[name="password"]', password)
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard/**', timeout=15000)


def attempt_login(page: Page, username: str, password: str):
    page.goto(f'{BASE_URL}/accounts/login/', wait_until='networkidle')
    page.fill('input[name="login"]', username)
    page.fill('input[name="password"]', password)
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')


def run_checks():
    ensure_accounts()
    failures: list[str] = []
    passed = 0

    def check(name: str, condition: bool, detail: str = ''):
        nonlocal passed
        if condition:
            print(f'  PASS  {name}')
            passed += 1
        else:
            msg = f'  FAIL  {name}'
            if detail:
                msg += f' — {detail}'
            print(msg)
            failures.append(name)

    doc_path = write_fixture('wiring.txt', b'E2E harness routing reference')
    video_path = write_fixture('recap.mp4', b'\x00\x00\x00\x20ftypmp41' + b'\x00' * 128)
    image_path = write_fixture('thumb.png', PNG_BYTES)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='chrome', headless=True)

        print(f'\nE2E browser tests @ {BASE_URL}\n')
        print('— Public & navigation —')

        anon = browser.new_context()
        page = anon.new_page()
        page.goto(f'{BASE_URL}/', wait_until='networkidle')
        check('Homepage loads', page.locator('text=Astra Labs').count() > 0)
        check('Homepage has Pioneer nav', page.locator('a[href="/pioneer/"]').count() > 0)
        page.goto(f'{BASE_URL}/events/', wait_until='networkidle')
        check('Public events page loads', page.locator('h1').count() > 0)
        page.goto(f'{BASE_URL}/accounts/login/', wait_until='networkidle')
        check('Login page loads', page.locator('button[type="submit"]').count() > 0)

        print('— Blocked logins —')
        blocked = browser.new_context()
        blocked_page = blocked.new_page()
        attempt_login(blocked_page, PENDING_USER, TEST_PASSWORD)
        check('Pending user blocked from dashboard', '/dashboard/' not in blocked_page.url)
        check('Pending user sees approval message', 'pending admin approval' in blocked_page.content().lower())

        attempt_login(blocked_page, BANNED_LOGIN_USER, TEST_PASSWORD)
        check('Banned user blocked from dashboard', '/dashboard/' not in blocked_page.url)
        check('Banned user sees ban message', 'has been banned' in blocked_page.content().lower())
        blocked.close()

        print('— Admin uploads —')
        admin_ctx = browser.new_context()
        admin = admin_ctx.new_page()
        login(admin, ADMIN_USER, ADMIN_PASSWORD)
        check('Admin lands on dashboard', '/dashboard/' in admin.url)
        check('Admin dashboard label', 'Admin dashboard' in admin.content())

        admin.goto(f'{BASE_URL}/', wait_until='networkidle')
        check('Logo routes admin to dashboard', admin.url.rstrip('/') == f'{BASE_URL}/dashboard'.rstrip('/'))

        admin.goto(f'{BASE_URL}/dashboard/library/new/', wait_until='networkidle')
        admin.fill('input[name="title"]', 'E2E wiring diagram')
        admin.select_option('select[name="kind"]', 'document')
        admin.fill('input[name="new_folder"]', 'E2E CAD')
        admin.locator('input[type="file"][name="upload"]').set_input_files(str(doc_path))
        admin.locator('input[name="published"]').check()
        admin.click('button[type="submit"]')
        admin.wait_for_url('**/dashboard/**section=library**', timeout=15000)
        check('Library upload redirects to library', 'section=library' in admin.url)
        check('Library upload visible in admin', 'E2E wiring diagram' in admin.content())
        admin.goto(f'{BASE_URL}/dashboard/events/new/', wait_until='networkidle')
        admin.fill('input[name="title"]', 'E2E launch recap')
        admin.fill('input[name="date_label"]', 'Jun 2026')
        admin.fill('input[name="summary"]', 'Browser-uploaded field video.')
        admin.fill('textarea[name="description"]', 'End-to-end video upload check.')
        admin.fill('input[name="location"]', 'Launch site')
        admin.locator('input[type="file"][name="image"]').set_input_files(str(video_path))
        admin.locator('input[name="published"]').check()
        admin.click('button[type="submit"]')
        admin.wait_for_url('**/dashboard/**section=events**', timeout=15000)
        check('Event video upload redirects', 'section=events' in admin.url)
        check('Event video visible in admin list', 'E2E launch recap' in admin.content())
        admin.goto(f'{BASE_URL}/dashboard/posts/new/', wait_until='networkidle')
        admin.fill('input[name="title"]', 'E2E bench note')
        admin.fill('input[name="excerpt"]', 'Automated browser post.')
        admin.locator('input[type="file"][name="featured_image"]').set_input_files(str(image_path))
        admin.fill('textarea[name="content"]', 'Ship note created by Playwright E2E.')
        admin.locator('input[name="published"]').check()
        admin.click('button[type="submit"]')
        admin.wait_for_url('**/dashboard/**section=posts**', timeout=15000)
        check('Blog post upload redirects', 'section=posts' in admin.url)
        check('Blog post visible in admin list', 'E2E bench note' in admin.content())
        print('— Member approval, ban, unban —')
        admin.goto(f'{BASE_URL}/dashboard/?section=members&status=pending', wait_until='networkidle')
        check('Pending filter shows pending user', PENDING_USER in admin.content())
        admin.locator(f'tr:has-text("{PENDING_USER}") button:has-text("Approve")').click()
        admin.wait_for_load_state('networkidle')
        check('Approve removes user from pending filter', PENDING_USER not in admin.content() or 'Active' in admin.content())
        approved_ctx = browser.new_context()
        approved_page = approved_ctx.new_page()
        login(approved_page, PENDING_USER, TEST_PASSWORD)
        check('Approved user can sign in', '/dashboard/' in approved_page.url)
        approved_ctx.close()

        admin.goto(f'{BASE_URL}/dashboard/?section=members&q={BAN_TARGET_USER}', wait_until='networkidle')
        check('Ban target visible in member search', BAN_TARGET_USER in admin.content())
        admin.locator(f'tr:has-text("{BAN_TARGET_USER}") button:has-text("Ban")').click()
        admin.wait_for_load_state('networkidle')
        admin.goto(f'{BASE_URL}/dashboard/?section=members&status=banned', wait_until='networkidle')
        check('Banned filter shows banned user', BAN_TARGET_USER in admin.content())
        check('Banned badge shown', 'Banned' in admin.content())

        admin.locator(f'tr:has-text("{BAN_TARGET_USER}") button:has-text("Unban")').click()
        admin.wait_for_load_state('networkidle')
        print('— Member dashboard —')
        member_ctx = browser.new_context()
        member = member_ctx.new_page()
        login(member, MEMBER_USER, MEMBER_PASSWORD)
        check('Member lands on dashboard', '/dashboard/' in member.url)
        check('Member sidebar has Materials', member.locator('a.dashboard-nav__link:has-text("Materials")').count() > 0)
        check('Member sidebar hides Library', member.locator('a.dashboard-nav__link:has-text("Library")').count() == 0)
        check('Member overview hides Quick links', 'Quick links' not in member.content())
        member.goto(f'{BASE_URL}/dashboard/?section=events', wait_until='networkidle')
        check('Member events section loads', 'events' in member.content().lower())
        member.goto(f'{BASE_URL}/posts/', wait_until='networkidle')
        check('Member posts redirect to dashboard', 'section=posts' in member.url)

        admin.goto(f'{BASE_URL}/events/', wait_until='networkidle')
        check('Public events shows uploaded video event', 'E2E launch recap' in admin.content())
        check('Public events renders video tag', '<video' in admin.content())

        member_ctx.close()
        admin_ctx.close()
        anon.close()
        browser.close()

    print('— Database verification —')
    User = get_user_model()
    check(
        'Library upload saved in DB',
        LibraryAsset.objects.filter(title='E2E wiring diagram').exists(),
    )
    event = ClubEvent.objects.filter(title='E2E launch recap').first()
    check('Event video saved in DB', event is not None and event.is_event_video)
    check('Blog post saved in DB', BlogPost.objects.filter(title='E2E bench note').exists())

    pending_user = User.objects.get(username=PENDING_USER)
    check('Approve activates pending user in DB', pending_user.is_active)

    ban_target = User.objects.get(username=BAN_TARGET_USER)
    check('Unban reactivates user in DB', ban_target.is_active)
    check('Unban clears banned flag in DB', not ban_target.member_profile.is_banned)

    banned_login = User.objects.get(username=BANNED_LOGIN_USER)
    check('Banned login user still banned in DB', banned_login.member_profile.is_banned)

    print()
    if failures:
        print(f'E2E FAILED ({len(failures)} failures, {passed} passed)')
        for name in failures:
            print(f'  - {name}')
        return 1
    print(f'E2E PASSED ({passed} checks)')
    return 0


if __name__ == '__main__':
    raise SystemExit(run_checks())