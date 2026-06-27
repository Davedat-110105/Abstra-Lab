from django.db import models
from django.utils import timezone


class FlightSession(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'planned', 'Planned'
        ACTIVE = 'active', 'Active'
        COMPLETE = 'complete', 'Complete'
        ABORTED = 'aborted', 'Aborted'

    name = models.CharField(max_length=120)
    vehicle = models.CharField(max_length=120, default='Pioneer')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PLANNED)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.vehicle})'


class TelemetryFrame(models.Model):
    flight_session = models.ForeignKey(
        FlightSession,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='frames',
    )
    received_at = models.DateTimeField(default=timezone.now)
    ground_station = models.CharField(max_length=120, blank=True)
    packet_kind = models.CharField(max_length=64, default='telemetry')
    sequence_number = models.PositiveIntegerField(null=True, blank=True)
    rocket_time_ms = models.BigIntegerField(null=True, blank=True)

    altitude_m = models.FloatField(null=True, blank=True)
    velocity_mps = models.FloatField(null=True, blank=True)
    acceleration_mps2 = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    battery_v = models.FloatField(null=True, blank=True)
    temperature_c = models.FloatField(null=True, blank=True)
    pressure_pa = models.FloatField(null=True, blank=True)
    rssi_dbm = models.FloatField(null=True, blank=True)

    raw = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['-received_at']),
            models.Index(fields=['ground_station', '-received_at']),
        ]
        ordering = ['-received_at']

    def __str__(self):
        station = self.ground_station or 'unknown station'
        return f'Frame {self.pk} from {station}'
