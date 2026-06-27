from django.conf import settings
from django.core.files.storage import FileSystemStorage, storages
from django.utils.functional import LazyObject


class _ReferenceStorage(LazyObject):
    def _setup(self):
        if getattr(settings, 'USE_SEAWEEDFS', False):
            self._wrapped = storages['library']
            return
        self._wrapped = FileSystemStorage(
            location=settings.REFERENCE_UPLOAD_ROOT,
            base_url=None,
        )


reference_storage = _ReferenceStorage()


def library_file_handle(asset):
    """Open an uploaded or catalogued library file for streaming."""
    if asset.reference_file:
        return asset.reference_file.open('rb')
    if asset.source_path:
        path = settings.REPO_ROOT / asset.source_path
        if path.is_file():
            return path.open('rb')
    return None