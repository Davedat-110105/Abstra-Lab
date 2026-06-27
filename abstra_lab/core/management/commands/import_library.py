from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import LibraryAsset, LibraryFolder


IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
VIDEO_EXTENSIONS = {'.mp4', '.mov', '.webm'}
DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx'}
SKIP_EXTENSIONS = {'.lrf', '.ds_store'}


def kind_for_suffix(suffix):
    lowered = suffix.lower()
    if lowered in IMAGE_EXTENSIONS:
        return LibraryAsset.AssetKind.IMAGE
    if lowered in VIDEO_EXTENSIONS:
        return LibraryAsset.AssetKind.VIDEO
    if lowered in DOCUMENT_EXTENSIONS:
        return LibraryAsset.AssetKind.DOCUMENT
    return LibraryAsset.AssetKind.OTHER


def title_from_filename(filename):
    stem = Path(filename).stem.replace('_', ' ').replace('-', ' ')
    return stem[:200] or filename[:200]


def folder_for_reference(rel_path):
    parts = Path(rel_path).parts
    if not parts:
        return 'References'
    if parts[0] == 'Photos':
        return 'Field Photos'
    if parts[0] == 'Workshops':
        return 'Workshops'
    if parts[0] == 'Launch Canada Hotel':
        return 'Launch Canada Hotel'
    if parts[0] == 'Launch canada':
        if len(parts) > 2 and parts[1] == 'Examples':
            return f'LC Examples ({parts[2]})'
        return 'Launch Canada'
    if parts[0] == 'Team-doc' and len(parts) > 1:
        return parts[1].strip()
    return parts[0]


def folder_for_static(rel_path):
    parts = Path(rel_path).parts
    if parts and parts[0] == 'field':
        return 'Site Field Photos'
    if parts and parts[0] == 'posts':
        return 'Site Posts'
    if parts and parts[0] == 'events':
        return 'Site Events'
    return 'Site Gallery'


class Command(BaseCommand):
    help = 'Catalog reference and image files into the library database (no file copies).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing library assets before importing.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            for asset in LibraryAsset.objects.all():
                if asset.image:
                    asset.image.delete(save=False)
                if asset.reference_file:
                    asset.reference_file.delete(save=False)
            LibraryAsset.objects.all().delete()
            self.stdout.write('Cleared existing library assets.')

        created = 0
        skipped = 0
        folder_sort = 0

        def ensure_folder(name):
            nonlocal folder_sort
            folder, was_created = LibraryFolder.objects.get_or_create(
                name=name,
                defaults={'sort_order': folder_sort},
            )
            if was_created:
                folder_sort += 10
            return folder

        def catalog_file(source_path, folder_name, repo_relative):
            nonlocal created, skipped
            suffix = source_path.suffix.lower()
            if suffix in SKIP_EXTENSIONS:
                skipped += 1
                return

            title = title_from_filename(source_path.name)
            folder = ensure_folder(folder_name)
            if LibraryAsset.objects.filter(title=title, folder=folder).exists():
                skipped += 1
                return

            kind = kind_for_suffix(suffix)
            LibraryAsset.objects.create(
                title=title,
                kind=kind,
                folder=folder,
                description=f'Catalogued from {repo_relative}',
                source_path=repo_relative,
                published=True,
            )
            created += 1

        reference_root = settings.REFERENCE_ROOT
        for path in sorted(reference_root.rglob('*')):
            if not path.is_file():
                continue
            try:
                path.relative_to(reference_root / 'uploads')
                continue
            except ValueError:
                pass
            rel = path.relative_to(settings.REPO_ROOT)
            catalog_file(path, folder_for_reference(str(rel).removeprefix('references/')), rel.as_posix())

        static_images = settings.BASE_DIR / 'static' / 'images'
        if static_images.exists():
            for path in sorted(static_images.rglob('*')):
                if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                    rel = path.relative_to(settings.REPO_ROOT)
                    catalog_file(path, folder_for_static(str(rel).removeprefix('abstra_lab/static/images/')), rel.as_posix())

        media_root = settings.MEDIA_ROOT
        for sub in ('posts', 'events'):
            media_dir = media_root / sub
            if not media_dir.exists():
                continue
            for path in sorted(media_dir.rglob('*')):
                if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                    rel = path.relative_to(settings.REPO_ROOT)
                    folder_name = 'Site Posts' if sub == 'posts' else 'Site Events'
                    catalog_file(path, folder_name, rel.as_posix())

        self.stdout.write(self.style.SUCCESS(f'Catalogued {created} files ({skipped} skipped).'))
        self.stdout.write(f'Folders: {LibraryFolder.objects.count()} · Assets: {LibraryAsset.objects.count()}')