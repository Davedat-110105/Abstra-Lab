"""
URL configuration for abstra_lab project.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView
from django.views.static import serve

from core import views as core_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/pending/', core_views.pending_approval, name='pending_approval'),
    path('accounts/inactive/', RedirectView.as_view(url='/accounts/pending/', permanent=False)),
    path('accounts/', include('allauth.urls')),
    path('login/', RedirectView.as_view(url='/accounts/login/', permanent=False)),
    path('signup/', RedirectView.as_view(url='/accounts/signup/', permanent=False)),
    path('', include('core.urls')),
    path('', include('telemetry.urls')),
]

# Serve media files in production too (uploaded event photos, videos, etc.)
# django.conf.urls.static.static() only works when DEBUG=True, so we add the
# pattern directly here for production use.
urlpatterns += [
    re_path(
        r'^{}(?P<path>.*)$'.format(settings.MEDIA_URL.lstrip('/')),
        serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]