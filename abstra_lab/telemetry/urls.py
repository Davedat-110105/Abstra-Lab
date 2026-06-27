from django.urls import path

from . import views

app_name = 'telemetry'

urlpatterns = [
    path('telemetry/', views.dashboard, name='dashboard'),
    path('api/telemetry/frames/', views.ingest_frame, name='ingest_frame'),
    path('api/telemetry/latest/', views.latest_frames, name='latest_frames'),
]
