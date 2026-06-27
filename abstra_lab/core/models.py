from pathlib import Path

from django.conf import settings
from django.db import models
from django.urls import NoReverseMatch, reverse
from django.utils.text import slugify

from .storage import reference_storage

EVENT_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
EVENT_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm', '.m4v'}


class MemberProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='member_profile',
    )
    is_banned = models.BooleanField(default=False)
    banned_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'Profile for {self.user.get_username()}'


class ClubEvent(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    date_label = models.CharField(
        max_length=80,
        help_text='Display date, e.g. "Oct 2025" or "Weekly".',
    )
    summary = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    image = models.FileField(
        upload_to='events/%Y/%m/',
        blank=True,
        null=True,
        help_text='Optional image or video for the event listing and detail pages.',
    )
    published = models.BooleanField(default=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='club_events',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-starts_at', '-created_at']

    @property
    def has_media(self):
        return bool(self.image)

    @property
    def is_event_video(self):
        if not self.image:
            return False
        return Path(self.image.name).suffix.lower() in EVENT_VIDEO_EXTENSIONS

    @property
    def is_event_image(self):
        return self.has_media and not self.is_event_video

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:50] or 'event'
            slug = base
            counter = 1
            while ClubEvent.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    excerpt = models.CharField(
        max_length=300,
        blank=True,
        help_text='Short summary shown in lists and previews.',
    )
    content = models.TextField()
    featured_image = models.ImageField(upload_to='posts/%Y/%m/', blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:50] or 'post'
            slug = base
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class BuildMaterial(models.Model):
    class MaterialType(models.TextChoices):
        HARDWARE = 'hardware', 'Hardware'
        SOFTWARE = 'software', 'Software'
        MATERIALS = 'materials', 'Materials'
        TOOLS = 'tools', 'Tools'

    material_type = models.CharField(max_length=20, choices=MaterialType.choices)
    name = models.CharField(max_length=200)
    summary = models.CharField(max_length=300)
    used_for = models.CharField(
        max_length=300,
        help_text='What a member needs this for when building.',
    )
    purchase_url = models.URLField(
        blank=True,
        help_text='Optional buy link — vendor page, Seneca store, or parts list.',
    )
    access = models.CharField(
        max_length=200,
        blank=True,
        help_text='Fallback note when no buy link is set, e.g. "Ask mechanical lead".',
    )
    url_name = models.CharField(
        max_length=100,
        blank=True,
        help_text='Optional named URL, e.g. core:pioneer or telemetry:dashboard.',
    )
    dashboard_section = models.CharField(
        max_length=50,
        blank=True,
        help_text='Optional dashboard section query for core:dashboard links.',
    )
    access_label = models.CharField(
        max_length=50,
        blank=True,
        help_text='Button label when a link URL is set.',
    )
    published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='build_materials',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'material_type', 'name']

    def __str__(self):
        return self.name

    @property
    def access_url(self):
        if not self.url_name:
            return ''
        try:
            url = reverse(self.url_name)
        except NoReverseMatch:
            return ''
        if self.dashboard_section:
            return f'{url}?section={self.dashboard_section}'
        return url

    @property
    def member_link_url(self):
        if self.purchase_url:
            return self.purchase_url
        return self.access_url


class LibraryFolder(models.Model):
    name = models.CharField(max_length=100, unique=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class LibraryAsset(models.Model):
    class AssetKind(models.TextChoices):
        IMAGE = 'image', 'Image'
        DOCUMENT = 'document', 'Document'
        VIDEO = 'video', 'Video'
        OTHER = 'other', 'Other'

    title = models.CharField(max_length=200)
    kind = models.CharField(max_length=20, choices=AssetKind.choices, default=AssetKind.DOCUMENT)
    folder = models.ForeignKey(
        LibraryFolder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets',
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='images/%Y/%m/', blank=True, null=True)
    reference_file = models.FileField(
        storage=reference_storage,
        upload_to='%Y/%m/',
        blank=True,
        null=True,
    )
    source_path = models.CharField(
        max_length=500,
        blank=True,
        help_text='Repo-relative path for catalogued files (no copy on import).',
    )
    published = models.BooleanField(default=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='library_assets',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['folder__sort_order', 'folder__name', '-created_at', 'title']

    def __str__(self):
        return self.title

    @property
    def is_catalogued(self):
        return bool(self.source_path)

    @property
    def catalog_path(self):
        if not self.source_path:
            return None
        return settings.REPO_ROOT / self.source_path

    @property
    def filename(self):
        if self.image:
            return self.image.name.rsplit('/', 1)[-1]
        if self.reference_file:
            return self.reference_file.name.rsplit('/', 1)[-1]
        if self.source_path:
            return self.source_path.rsplit('/', 1)[-1]
        return ''

    @property
    def has_file(self):
        return bool(self.image or self.reference_file or self.source_path)

    @property
    def is_image(self):
        if self.image:
            return True
        if self.kind == self.AssetKind.IMAGE:
            return True
        if self.source_path:
            return Path(self.source_path).suffix.lower() in {
                '.jpg', '.jpeg', '.png', '.gif', '.webp',
            }
        return False

    @property
    def preview_url(self):
        if self.image:
            return self.image.url
        if not self.source_path or not self.is_image:
            return ''
        static_prefix = 'abstra_lab/static/'
        media_prefix = 'abstra_lab/media/'
        if self.source_path.startswith(static_prefix):
            return f'{settings.STATIC_URL}{self.source_path[len(static_prefix):]}'
        if self.source_path.startswith(media_prefix):
            return f'{settings.MEDIA_URL}{self.source_path[len(media_prefix):]}'
        try:
            return reverse('core:library_download', args=[self.pk])
        except NoReverseMatch:
            return ''

    def download_url_name(self):
        return 'core:library_download'