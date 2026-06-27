from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from django.conf import settings
from django.core.files.storage import FileSystemStorage

from core.models import BlogPost, BuildMaterial, ClubEvent, LibraryAsset, LibraryFolder
from core.storage import reference_storage


class SiteNavigationTests(TestCase):
    def test_homepage_renders_primary_navigation_and_footer_sections(self):
        response = self.client.get(reverse('core:home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Projects')
        self.assertContains(response, 'About')
        self.assertContains(response, 'Events')
        self.assertContains(response, 'Posts')
        self.assertContains(response, 'href="/posts/"')
        self.assertContains(response, 'Pioneer')
        self.assertContains(response, 'Build')
        self.assertContains(response, 'Club')
        self.assertContains(response, 'Members')
        self.assertContains(response, 'sx-header')
        self.assertContains(response, 'nav-drawer')
        self.assertContains(response, 'sx-footer')
        self.assertContains(response, 'href="/join/"')
        self.assertContains(response, 'href="/sponsor/"')
        self.assertContains(response, 'href="/discord/"')
        self.assertNotContains(response, 'href="/notion/"')

    def test_anonymous_nav_drawer_keeps_join_and_login_distinct(self):
        response = self.client.get(reverse('core:home'))
        html = response.content.decode()
        nav = html.split('<nav class="nav-drawer"', 1)[1].split('</nav>', 1)[0]

        self.assertIn('href="/join/"', nav)
        self.assertIn(reverse('account_login'), nav)
        self.assertNotIn(reverse('account_signup'), nav)

    def test_homepage_renders_current_landing_sections(self):
        response = self.client.get(reverse('core:home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Student-built high-power rocket')
        self.assertContains(response, 'Every interface earned on the bench')
        self.assertContains(response, 'From payload workshops to Launch Canada')
        self.assertContains(response, 'Sponsor the mission')
        self.assertContains(response, 'Payload workshops feed the Pioneer program')
        self.assertContains(response, 'Ship notes and bench updates')
        self.assertContains(response, 'href="/posts/"')

    def test_work_page_renders_integration_section_and_gallery(self):
        response = self.client.get(reverse('core:work'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Subsystems converge at the vehicle')
        self.assertContains(response, 'sx-split')
        self.assertContains(response, 'work-gallery__grid')
        self.assertContains(response, 'field/aerial-oct2025.jpg')

    def test_destinations_page_renders_roadmap_map(self):
        response = self.client.get(reverse('core:projects'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Projects')
        self.assertContains(response, 'sx-rows')
        self.assertContains(response, 'Range path')
        self.assertContains(response, 'Ground station')

    def test_experiences_page_renders_join_commands(self):
        response = self.client.get(reverse('core:events'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Events')
        self.assertContains(response, 'sx-link-row')
        self.assertContains(response, 'Join the club')

    def test_login_page_renders_centered_operator_panel(self):
        response = self.client.get(reverse('account_login'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Crew access')
        self.assertContains(response, 'nav-drawer')
        self.assertContains(response, 'Sign in')
        self.assertContains(response, 'Create account')


class DashboardTests(TestCase):
    def test_dashboard_redirects_anonymous_user(self):
        response = self.client.get(reverse('core:dashboard'))

        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response['Location'].startswith('/accounts/login')
            or response['Location'].startswith('/login/')
        )

    def test_member_dashboard_renders_for_active_user(self):
        User = get_user_model()
        User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Member dashboard')
        self.assertContains(response, 'dashboard-topbar')
        self.assertContains(response, 'dashboard-layout__sidebar')
        self.assertContains(response, 'dashboard-sidebar__logout-btn')
        self.assertContains(response, 'section=telemetry')
        self.assertContains(response, 'Latest posts')
        self.assertContains(response, 'Upcoming events')
        self.assertContains(response, 'dashboard-table')
        self.assertContains(response, 'section=materials')
        self.assertNotContains(response, 'Quick links')
        self.assertNotContains(response, 'section=library')
        self.assertNotContains(response, 'References &amp; images')

    def test_member_materials_section_lists_build_inventory(self):
        User = get_user_model()
        User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard') + '?section=materials')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Materials to buy')
        self.assertContains(response, 'Pioneer airframe')
        self.assertContains(response, 'KiCad')
        self.assertContains(response, 'STM32 firmware toolchain')
        self.assertNotContains(response, 'Where to go next')

    def test_member_overview_shows_recent_posts_and_events(self):
        User = get_user_model()
        author = User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        BlogPost.objects.create(
            title='Bench harness complete',
            excerpt='Continuity verified across all channels.',
            content='Full routing notes for the avionics bay.',
            author=author,
            published=True,
        )
        ClubEvent.objects.create(
            title='Spring integration night',
            date_label='Mar 2026',
            summary='Hands-on Pioneer integration session.',
            description='Mechanical and avionics crews align on vehicle integration.',
            location='Seneca shop',
            published=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Bench harness complete')
        self.assertContains(response, 'Spring integration night')
        self.assertContains(response, 'section=posts')
        self.assertContains(response, 'section=events')

    def test_member_views_posts_inside_dashboard(self):
        User = get_user_model()
        author = User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        post = BlogPost.objects.create(
            title='Ship note',
            content='We shipped the dashboard update.',
            author=author,
            published=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')

        list_response = self.client.get(reverse('core:posts_list'))
        self.assertRedirects(list_response, reverse('core:dashboard') + '?section=posts')

        detail_response = self.client.get(reverse('core:post_detail', args=[post.slug]))
        self.assertRedirects(
            detail_response,
            reverse('core:dashboard') + f'?section=posts&post={post.slug}',
        )

        dashboard_response = self.client.get(reverse('core:dashboard') + f'?section=posts&post={post.slug}')
        self.assertEqual(dashboard_response.status_code, 200)
        self.assertContains(dashboard_response, 'Ship note')
        self.assertContains(dashboard_response, 'We shipped the dashboard update.')
        self.assertContains(dashboard_response, 'dashboard-layout__sidebar')

    def test_member_views_events_inside_dashboard(self):
        User = get_user_model()
        User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        event = ClubEvent.objects.create(
            title='Integration night',
            date_label='Apr 2026',
            summary='Vehicle integration session.',
            description='Full vehicle integration walkthrough for Pioneer.',
            location='Seneca shop',
            published=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')

        list_response = self.client.get(reverse('core:events'))
        self.assertRedirects(list_response, reverse('core:dashboard') + '?section=events')

        dashboard_response = self.client.get(reverse('core:dashboard') + f'?section=events&event={event.slug}')
        self.assertEqual(dashboard_response.status_code, 200)
        self.assertContains(dashboard_response, 'Integration night')
        self.assertContains(dashboard_response, 'Full vehicle integration walkthrough')
        self.assertContains(dashboard_response, 'dashboard-layout__sidebar')

    def test_admin_dashboard_renders_for_staff(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Admin dashboard')
        self.assertContains(response, 'dashboard-topbar')
        self.assertNotContains(response, 'Club operations at a glance')
        self.assertContains(response, 'dashboard-layout__sidebar')
        self.assertContains(response, 'Posts')
        self.assertContains(response, 'Materials')
        self.assertContains(response, 'Library')
        self.assertContains(response, 'Events')
        self.assertContains(response, 'dashboard-sidebar__logout-btn')

        members_view = self.client.get(reverse('core:dashboard') + '?section=members')
        self.assertEqual(members_view.status_code, 200)
        self.assertContains(members_view, 'Account roster')
        self.assertContains(members_view, 'dashboard-table')
    def test_login_redirects_staff_to_admin_dashboard(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        response = self.client.post(
            reverse('account_login'),
            {'login': 'staffadmin', 'password': 'complex-pass-12345'},
        )
        self.assertRedirects(response, reverse('core:dashboard'), fetch_redirect_response=False)
        follow = self.client.get(reverse('core:dashboard'))
        self.assertContains(follow, 'Admin dashboard')

    def test_logo_links_to_dashboard_when_authenticated(self):
        User = get_user_model()
        User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard'))
        self.assertContains(response, f'href="{reverse("core:dashboard")}"')

    def test_home_redirects_authenticated_users_to_dashboard(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.get(reverse('core:home'))
        self.assertRedirects(response, reverse('core:dashboard'))

    def test_admin_can_edit_member_credentials(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        member = User.objects.create_user(
            username='editme',
            email='old@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(
            reverse('core:member_edit', args=[member.id]),
            {
                'username': 'updated_user',
                'email': 'new@example.com',
                'first_name': 'Updated',
                'last_name': 'Member',
                'password': 'new-pass-12345',
            },
        )

        self.assertEqual(response.status_code, 302)
        member.refresh_from_db()
        self.assertEqual(member.username, 'updated_user')
        self.assertEqual(member.email, 'new@example.com')
        self.assertTrue(member.check_password('new-pass-12345'))

    def test_admin_can_ban_active_member(self):
        from core.models import MemberProfile

        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        member = User.objects.create_user(
            username='banme',
            email='ban@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(reverse('core:ban_member', args=[member.id]))

        self.assertEqual(response.status_code, 302)
        member.refresh_from_db()
        self.assertFalse(member.is_active)
        self.assertTrue(MemberProfile.objects.get(user=member).is_banned)

    def test_banned_member_shows_banned_status_not_pending(self):
        from core.member_accounts import mark_member_banned

        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        member = User.objects.create_user(
            username='banned-user',
            email='banned@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        mark_member_banned(member)
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard') + '?section=members&status=banned')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Banned')
        self.assertContains(response, 'Unban')
        self.assertNotContains(response, 'dashboard-badge--pending">Pending</span>')

    def test_admin_can_unban_member(self):
        from core.member_accounts import mark_member_banned
        from core.models import MemberProfile

        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        member = User.objects.create_user(
            username='unbanme',
            email='unban@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        mark_member_banned(member)
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(reverse('core:unban_member', args=[member.id]))

        self.assertEqual(response.status_code, 302)
        member.refresh_from_db()
        self.assertTrue(member.is_active)
        self.assertFalse(MemberProfile.objects.get(user=member).is_banned)

    def test_admin_members_search_and_filter(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        User.objects.create_user(
            username='alpha-member',
            email='alpha@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        User.objects.create_user(
            username='beta-pending',
            email='beta@example.com',
            password='complex-pass-12345',
            is_active=False,
        )
        self.client.login(username='staffadmin', password='complex-pass-12345')

        search_response = self.client.get(reverse('core:dashboard') + '?section=members&q=alpha')
        self.assertContains(search_response, 'alpha-member')
        self.assertNotContains(search_response, 'beta-pending')

        pending_response = self.client.get(reverse('core:dashboard') + '?section=members&status=pending')
        self.assertContains(pending_response, 'beta-pending')
        self.assertNotContains(pending_response, 'alpha-member')

    def test_admin_can_create_event(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(
            reverse('core:event_create'),
            {
                'title': 'Spring build night',
                'date_label': 'Mar 2026',
                'summary': 'Shop session for Pioneer integration.',
                'description': 'Hands-on build night for mechanical and avionics crews.',
                'location': 'Seneca shop',
                'published': 'on',
            },
        )

        self.assertEqual(response.status_code, 302)
        from core.models import ClubEvent

        event = ClubEvent.objects.get(title='Spring build night')
        self.assertTrue(event.published)
        self.assertEqual(event.location, 'Seneca shop')

    def test_admin_can_upload_event_video(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(
            reverse('core:event_create'),
            {
                'title': 'Launch day recap',
                'date_label': 'Oct 2025',
                'summary': 'Field footage from the launch site.',
                'description': 'Full recap video from the crew.',
                'location': 'Launch site',
                'image': SimpleUploadedFile(
                    'launch-recap.mp4',
                    b'fake-video-bytes',
                    content_type='video/mp4',
                ),
                'published': 'on',
            },
        )

        self.assertEqual(response.status_code, 302)
        event = ClubEvent.objects.get(title='Launch day recap')
        self.assertTrue(event.is_event_video)
        self.assertFalse(event.is_event_image)

        public_page = self.client.get(reverse('core:events'))
        self.assertContains(public_page, '<video')
        self.assertContains(public_page, 'Launch day recap')

    def test_admin_can_create_post_with_excerpt(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(
            reverse('core:blog_create'),
            {
                'title': 'Avionics bench update',
                'excerpt': 'New telemetry harness routed and logged.',
                'content': 'We completed the harness routing and verified continuity.',
                'published': 'on',
            },
        )

        self.assertEqual(response.status_code, 302)
        post = BlogPost.objects.get(title='Avionics bench update')
        self.assertEqual(post.excerpt, 'New telemetry harness routed and logged.')

    def test_admin_can_manage_materials(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(
            reverse('core:material_create'),
            {
                'material_type': 'hardware',
                'name': 'M3 socket head screws',
                'summary': 'Stainless fasteners for avionics bay mounting.',
                'used_for': 'Flight computer tray assembly',
                'purchase_url': 'https://vendor.example/m3-screws',
                'access': '',
                'sort_order': '5',
                'published': 'on',
            },
        )

        self.assertEqual(response.status_code, 302)
        material = BuildMaterial.objects.get(name='M3 socket head screws')
        self.assertTrue(material.published)
        self.assertEqual(material.purchase_url, 'https://vendor.example/m3-screws')

        section = self.client.get(reverse('core:dashboard') + '?section=materials')
        self.assertContains(section, 'M3 socket head screws')
        self.assertContains(section, 'Materials to buy')

    def test_admin_can_upload_library_document(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        self.client.login(username='staffadmin', password='complex-pass-12345')
        folder = LibraryFolder.objects.create(name='CAD', sort_order=10)
        response = self.client.post(
            reverse('core:library_create'),
            {
                'title': 'Pioneer wiring diagram',
                'kind': 'document',
                'folder': str(folder.pk),
                'description': 'Harness routing reference for avionics bay.',
                'upload': SimpleUploadedFile('wiring.txt', b'pin A to B', content_type='text/plain'),
                'published': 'on',
            },
        )

        self.assertEqual(response.status_code, 302)
        asset = LibraryAsset.objects.get(title='Pioneer wiring diagram')
        self.assertTrue(asset.reference_file)
        self.assertEqual(asset.folder.name, 'CAD')

        admin_section = self.client.get(reverse('core:dashboard') + '?section=library')
        self.assertContains(admin_section, 'Pioneer wiring diagram')
        self.assertContains(admin_section, 'Upload file')

    def test_member_dashboard_hides_library_section(self):
        User = get_user_model()
        author = User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        ops_folder = LibraryFolder.objects.create(name='Ops', sort_order=10)
        LibraryAsset.objects.create(
            title='Launch checklist',
            kind='document',
            folder=ops_folder,
            reference_file=SimpleUploadedFile('checklist.txt', b'step 1', content_type='text/plain'),
            author=author,
            published=True,
        )
        User.objects.create_user(
            username='member1',
            email='member1@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        self.client.login(username='member1', password='complex-pass-12345')
        response = self.client.get(reverse('core:dashboard') + '?section=library')

        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Launch checklist')
        self.assertNotContains(response, 'Asset library')

    def test_admin_can_delete_post(self):
        User = get_user_model()
        admin = User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        post = BlogPost.objects.create(
            title='Retired bench note',
            content='This entry should be removed.',
            author=admin,
            published=True,
        )
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(reverse('core:blog_delete', args=[post.slug]))

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('core:dashboard') + '?section=posts')
        self.assertFalse(BlogPost.objects.filter(slug=post.slug).exists())

    def test_admin_can_approve_pending_member(self):
        User = get_user_model()
        User.objects.create_superuser('staffadmin', 'staff@example.com', 'complex-pass-12345')
        pending = User.objects.create_user(
            username='newmember',
            email='new@example.com',
            password='complex-pass-12345',
            is_active=False,
        )
        self.client.login(username='staffadmin', password='complex-pass-12345')
        response = self.client.post(reverse('core:approve_member', args=[pending.id]))

        self.assertEqual(response.status_code, 302)
        pending.refresh_from_db()
        self.assertTrue(pending.is_active)


class PublicPostsTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.author = User.objects.create_user(
            username='crewwriter',
            email='crew@example.com',
            password='complex-pass-12345',
        )
        self.published = BlogPost.objects.create(
            title='Harness routed',
            excerpt='Continuity checks passed on the avionics bay.',
            content='We routed the harness and logged continuity across all channels.',
            author=self.author,
            published=True,
        )
        BlogPost.objects.create(
            title='Draft bench note',
            content='Still editing this entry.',
            author=self.author,
            published=False,
        )

    def test_posts_list_shows_only_published_posts(self):
        response = self.client.get(reverse('core:posts_list'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Harness routed')
        self.assertContains(response, 'Build log')
        self.assertNotContains(response, 'Draft bench note')

    def test_post_detail_shows_published_post(self):
        response = self.client.get(reverse('core:post_detail', args=[self.published.slug]))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Harness routed')
        self.assertContains(response, 'Continuity checks passed')
        self.assertContains(response, 'All posts')

    def test_post_detail_hides_unpublished_post(self):
        draft = BlogPost.objects.get(title='Draft bench note')
        response = self.client.get(reverse('core:post_detail', args=[draft.slug]))

        self.assertEqual(response.status_code, 404)


class MemberAuthTests(TestCase):
    def test_signup_page_renders(self):
        response = self.client.get(reverse('account_signup'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Create your member account')
        self.assertContains(response, 'Submit for approval')

    def test_signup_creates_inactive_user_pending_approval(self):
        response = self.client.post(
            reverse('account_signup'),
            {
                'first_name': 'Ada',
                'last_name': 'Lovelace',
                'email': 'ada@example.com',
                'username': 'adalab',
                'password1': 'complex-pass-12345',
                'password2': 'complex-pass-12345',
            },
        )

        self.assertEqual(response.status_code, 302)
        self.assertIn(response['Location'], ['/accounts/pending/', '/accounts/inactive/'])
        user = get_user_model().objects.get(username='adalab')
        self.assertFalse(user.is_active)
        self.assertEqual(user.first_name, 'Ada')

    def test_banned_user_sees_banned_login_message(self):
        from core.member_accounts import mark_member_banned

        User = get_user_model()
        member = User.objects.create_user(
            username='banned-login',
            email='banned-login@example.com',
            password='complex-pass-12345',
            is_active=True,
        )
        mark_member_banned(member)
        response = self.client.post(
            reverse('account_login'),
            {'login': 'banned-login', 'password': 'complex-pass-12345'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'has been banned')

    def test_inactive_user_cannot_sign_in(self):
        User = get_user_model()
        User.objects.create_user(
            username='pending-user',
            email='pending@example.com',
            password='complex-pass-12345',
            is_active=False,
        )
        response = self.client.post(
            reverse('account_login'),
            {'login': 'pending-user', 'password': 'complex-pass-12345'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'pending admin approval')


class DjangoDocsTests(TestCase):
    def test_members_page_is_rendered_in_django(self):
        response = self.client.get(reverse('core:members'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Members join a workstream, then learn by doing.')
        self.assertNotContains(response, 'Django Ready')

    def test_footer_pages_are_rendered_in_django(self):
        pages = [
            ('core:join', 'The fastest path in is a small, real task.'),
            ('core:sponsor', 'Help Seneca students fly real hardware.'),
            ('core:sponsor', 'sponsorship-package-astra-labs.pdf'),
            ('core:sponsor', 'Bronze'),
            ('core:discord', 'Discord is live; the website is the durable record.'),
            ('core:pioneer', 'Pioneer is the current build.'),
        ]

        for route, expected_text in pages:
            with self.subTest(route=route):
                response = self.client.get(reverse(route))

                self.assertEqual(response.status_code, 200)
                self.assertContains(response, expected_text)

    def test_events_page_renders_database_events(self):
        from core.models import ClubEvent

        ClubEvent.objects.create(
            title='Launch day practice',
            date_label='Jun 2026',
            description='Field rehearsal for recovery and ground-station checks.',
            published=True,
        )
        response = self.client.get(reverse('core:events'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Launch day practice')
        self.assertContains(response, 'Jun 2026')

    def test_django_pages_include_legacy_docs_content(self):
        checks = [
            ('core:about', 'Technical disciplines'),
            ('core:work', 'York University'),
            ('core:events', 'Do I need prior rocketry experience?'),
            ('core:projects', 'Launch Canada'),
        ]

        for route, expected_text in checks:
            with self.subTest(route=route):
                response = self.client.get(reverse(route))

                self.assertEqual(response.status_code, 200)
                self.assertContains(response, expected_text)

    def test_public_pages_include_core_seo_tags(self):
        response = self.client.get(reverse('core:sponsor'), HTTP_HOST='testserver')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '<link rel="canonical" href="http://testserver/sponsor/">')
        self.assertContains(response, 'property="og:title" content="Sponsor Astra Labs"')
        self.assertContains(response, 'name="twitter:card" content="summary_large_image"')
        self.assertContains(response, 'application/ld+json')

    def test_robots_and_sitemap_render_public_urls(self):
        robots = self.client.get(reverse('core:robots_txt'), HTTP_HOST='testserver')
        sitemap = self.client.get(reverse('core:sitemap_xml'), HTTP_HOST='testserver')

        self.assertEqual(robots.status_code, 200)
        self.assertEqual(robots['Content-Type'], 'text/plain')
        self.assertIn(b'Disallow: /admin/', robots.content)
        self.assertIn(b'Sitemap: http://testserver/sitemap.xml', robots.content)
        self.assertEqual(sitemap.status_code, 200)
        self.assertEqual(sitemap['Content-Type'], 'application/xml')
        self.assertIn(b'<loc>http://testserver/sponsor/</loc>', sitemap.content)
        self.assertIn(b'<loc>http://testserver/pioneer/</loc>', sitemap.content)

    def test_blog_post_has_article_seo(self):
        user = get_user_model().objects.create_user(username='writer', password='complex-pass-12345')
        post = BlogPost.objects.create(
            title='Pioneer bench update',
            slug='pioneer-bench-update',
            excerpt='A short update from the Pioneer rocket bench.',
            content='Longer build note.',
            author=user,
            published=True,
        )
        response = self.client.get(reverse('core:post_detail', kwargs={'slug': post.slug}), HTTP_HOST='testserver')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'property="og:type" content="article"')
        self.assertContains(response, 'Pioneer bench update | Astra Labs')
        self.assertContains(response, '"@type":"BlogPosting"')


class StorageBackendTests(TestCase):
    def test_local_storage_when_seaweedfs_not_configured(self):
        self.assertFalse(settings.USE_SEAWEEDFS)
        self.assertIsInstance(reference_storage, FileSystemStorage)
