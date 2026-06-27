from django.contrib import admin

from .models import FlightSession, TelemetryFrame


@admin.register(FlightSession)
class FlightSessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'vehicle', 'status', 'started_at', 'ended_at', 'updated_at')
    list_filter = ('status', 'vehicle')
    search_fields = ('name', 'vehicle', 'notes')


@admin.register(TelemetryFrame)
class TelemetryFrameAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'received_at',
        'ground_station',
        'packet_kind',
        'sequence_number',
        'altitude_m',
        'battery_v',
        'rssi_dbm',
    )
    list_filter = ('packet_kind', 'ground_station')
    readonly_fields = ('created_at',)
    search_fields = ('ground_station', 'packet_kind')
    date_hierarchy = 'received_at'
