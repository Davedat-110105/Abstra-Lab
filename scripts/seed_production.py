#!/usr/bin/env python3
"""Seed astralab.space with first post, Seneca fair event video, and build materials."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO_ROOT = Path(__file__).resolve().parent.parent
BASE_URL = os.environ.get('SEED_BASE_URL', 'https://astralab.space')
ADMIN_USER = os.environ.get('SEED_ADMIN_USER', 'admin')
ADMIN_PASSWORD = os.environ.get('SEED_ADMIN_PASSWORD', 'AstraAdmin2026')

POST_IMAGE = REPO_ROOT / 'abstra_lab/static/images/posts/welcome-astra-labs.jpg'
# Smallest usable fair-field clip (~1.8 MB); Oct 2025 DJI fair reels are 277–435 MB.
EVENT_VIDEO = REPO_ROOT / 'references/Photos/DJI_001/DJI_20250815113333_0053_D.MP4'

POST = {
    'title': 'Welcome to Astra Labs',
    'excerpt': 'Pioneer is underway — student-built rocketry for Launch Canada 2026.',
    'content': (
        'Astra Labs is a student rocketry club at Seneca Polytechnic building Pioneer '
        'for the Launch Canada 2026 Challenge.\n\n'
        'We are proving that college students — without formal aerospace backgrounds — '
        'can compete at the same level as established universities. Pioneer targets 2.8 km '
        'apogee and a suborbital rideshare simulation hosting fifty student-designed '
        'picosatellites.\n\n'
        'This build log is where we publish ship notes, bench work, tests, and handoffs. '
        'Follow along as mechanical, electronics, and operations streams converge on a '
        'launch-ready vehicle.'
    ),
}

EVENT = {
    'title': 'Newham Clubs Fest',
    'date_label': 'Oct 2025',
    'summary': 'Seneca clubs fair outreach — recruited 30+ new members in one afternoon.',
    'description': (
        'Astra Labs staffed the Newham campus clubs fair to introduce Seneca students to '
        'high-power rocketry and the Pioneer program. Most visitors had never touched a '
        'rocket — we walked them through airframe basics, avionics bench demos, and how '
        'workshop payloads feed into Launch Canada 2026.\n\n'
        'Field video from the fair floor.'
    ),
    'location': 'Newham Campus, Seneca Polytechnic',
}

MATERIALS = [
    {
        'material_type': 'hardware',
        'name': 'Pioneer airframe',
        'summary': 'Fiberglass body tubes, couplers, fins, and recovery bay hardware.',
        'used_for': 'Launch Canada vehicle structure and integration',
        'access': 'Seneca shop',
        'sort_order': '0',
    },
    {
        'material_type': 'hardware',
        'name': 'Avionics stack',
        'summary': 'STM32 flight computer, sensors, power distribution, and logging boards.',
        'used_for': 'Flight data capture and subsystem interfaces',
        'access': 'Electronics bench',
        'sort_order': '10',
    },
    {
        'material_type': 'software',
        'name': 'OpenRocket',
        'summary': 'Stability, apogee, and recovery simulations for Pioneer configurations.',
        'used_for': 'Aerodynamics and recovery sizing',
        'access': 'All subsystems',
        'sort_order': '20',
    },
    {
        'material_type': 'software',
        'name': 'KiCad',
        'summary': 'PCB schematics and board layouts for avionics and payload electronics.',
        'used_for': 'Electronics design and fabrication exports',
        'access': 'Electronics bench',
        'sort_order': '30',
    },
    {
        'material_type': 'materials',
        'name': 'Composites & adhesives',
        'summary': 'Epoxy, fiberglass supplies, and finishing materials for airframe work.',
        'used_for': 'Airframe assembly and repair',
        'access': 'Shop inventory',
        'sort_order': '40',
    },
    {
        'material_type': 'tools',
        'name': 'M3 socket head screws',
        'summary': 'Stainless M3 SHCS for avionics bay and rail hardware.',
        'used_for': 'Vehicle assembly and competition rail fitment',
        'purchase_url': 'https://www.mcmaster.com/',
        'access': '',
        'sort_order': '50',
    },
]


def login(page):
    page.goto(f'{BASE_URL}/accounts/login/', wait_until='networkidle')
    page.fill('input[name="login"]', ADMIN_USER)
    page.fill('input[name="password"]', ADMIN_PASSWORD)
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    if '/dashboard/' not in page.url:
        raise RuntimeError(f'Login failed — still at {page.url}')
    print('OK login → dashboard')


def create_post(page):
    page.goto(f'{BASE_URL}/dashboard/posts/new/', wait_until='networkidle')
    if POST['title'] in page.content() and 'Write a build log entry' not in page.content():
        print('SKIP post already exists')
        return
    page.fill('input[name="title"]', POST['title'])
    page.fill('input[name="excerpt"]', POST['excerpt'])
    page.fill('textarea[name="content"]', POST['content'])
    if POST_IMAGE.exists():
        page.locator('input[type="file"][name="featured_image"]').set_input_files(str(POST_IMAGE))
    page.locator('input[name="published"]').check()
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard/**section=posts**', timeout=30000)
    print('OK created blog post')


def upsert_fair_event(page):
    page.goto(f'{BASE_URL}/dashboard/?section=events', wait_until='networkidle')
    row = page.locator(f'tr:has-text("{EVENT["title"]}")')
    if row.count():
        edit = row.locator('a:has-text("Edit")').first
        edit.click()
        page.wait_for_load_state('networkidle')
        print('OK editing existing Newham Clubs Fest event')
    else:
        page.goto(f'{BASE_URL}/dashboard/events/new/', wait_until='networkidle')
        print('OK creating new fair event')

    page.fill('input[name="title"]', EVENT['title'])
    page.fill('input[name="date_label"]', EVENT['date_label'])
    page.fill('input[name="summary"]', EVENT['summary'])
    page.fill('textarea[name="description"]', EVENT['description'])
    page.fill('input[name="location"]', EVENT['location'])
    if EVENT_VIDEO.exists():
        page.locator('input[type="file"][name="image"]').set_input_files(str(EVENT_VIDEO))
    page.locator('input[name="published"]').check()
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard/**section=events**', timeout=120000)
    print('OK saved event with video')


def add_materials(page):
    page.goto(f'{BASE_URL}/dashboard/?section=materials', wait_until='networkidle')
    existing = page.content()
    added = 0
    for item in MATERIALS:
        if item['name'] in existing:
            print(f'SKIP material exists: {item["name"]}')
            continue
        page.goto(f'{BASE_URL}/dashboard/materials/new/', wait_until='networkidle')
        page.select_option('select[name="material_type"]', item['material_type'])
        page.fill('input[name="name"]', item['name'])
        page.fill('input[name="summary"]', item['summary'])
        page.fill('input[name="used_for"]', item['used_for'])
        if item.get('purchase_url'):
            page.fill('input[name="purchase_url"]', item['purchase_url'])
        if item.get('access'):
            page.fill('input[name="access"]', item['access'])
        page.fill('input[name="sort_order"]', item['sort_order'])
        page.locator('input[name="published"]').check()
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard/**section=materials**', timeout=30000)
        added += 1
        print(f'OK added material: {item["name"]}')
    print(f'Materials: {added} new, {len(MATERIALS) - added} skipped')


def verify_public(page):
    page.goto(f'{BASE_URL}/posts/', wait_until='networkidle')
    assert POST['title'] in page.content(), 'Post not on public posts page'
    page.goto(f'{BASE_URL}/events/', wait_until='networkidle')
    assert EVENT['title'] in page.content(), 'Event not on public events page'
    assert '<video' in page.content(), 'Event video not rendered'
    print('OK public posts and events verified')


def main():
    missing = [p for p in (POST_IMAGE, EVENT_VIDEO) if not p.exists()]
    if missing:
        print('Missing assets:', ', '.join(str(p) for p in missing), file=sys.stderr)
        sys.exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            login(page)
            create_post(page)
            upsert_fair_event(page)
            add_materials(page)
            verify_public(page)
        finally:
            browser.close()


if __name__ == '__main__':
    main()