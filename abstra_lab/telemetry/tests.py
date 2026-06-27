import json

from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model

from .models import TelemetryFrame


class TelemetryIngestTests(TestCase):
    def test_rejects_missing_token(self):
        response = self.client.post(
            reverse('telemetry:ingest_frame'),
            data=json.dumps({'altitude_m': 42}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(TelemetryFrame.objects.count(), 0)

    @override_settings(TELEMETRY_INGEST_TOKEN='test-token')
    def test_ingests_valid_frame_with_bearer_token(self):
        response = self.client.post(
            reverse('telemetry:ingest_frame'),
            data=json.dumps({
                'ground_station': 'seneca-gs-1',
                'sequence_number': 12,
                'altitude_m': 128.5,
                'velocity_mps': 23.75,
                'battery_v': 11.84,
                'rssi_dbm': -71,
            }),
            content_type='application/json',
            headers={'Authorization': 'Bearer test-token'},
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(TelemetryFrame.objects.count(), 1)

        frame = TelemetryFrame.objects.get()
        self.assertEqual(frame.ground_station, 'seneca-gs-1')
        self.assertEqual(frame.sequence_number, 12)
        self.assertEqual(frame.altitude_m, 128.5)
        self.assertEqual(frame.raw['battery_v'], 11.84)

    @override_settings(TELEMETRY_INGEST_TOKEN='test-token')
    def test_rejects_invalid_json(self):
        response = self.client.post(
            reverse('telemetry:ingest_frame'),
            data='{not json',
            content_type='application/json',
            headers={'X-Telemetry-Token': 'test-token'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['error'], 'invalid_json')

    def test_telemetry_redirects_anonymous_user_to_login(self):
        response = self.client.get(reverse('telemetry:dashboard'))

        self.assertEqual(response.status_code, 302)
        self.assertTrue(response['Location'].startswith('/accounts/login') or response['Location'].startswith('/login/'))

    def test_latest_frames_requires_login(self):
        response = self.client.get(reverse('telemetry:latest_frames'))

        self.assertEqual(response.status_code, 403)

    def test_latest_frames_returns_data_for_logged_in_user(self):
        User = get_user_model()
        user = User.objects.create_user(username='operator', password='password-12345')
        TelemetryFrame.objects.create(
            ground_station='seneca-gs-1',
            sequence_number=5,
            altitude_m=42.5,
            battery_v=11.9,
        )

        self.client.login(username='operator', password='password-12345')
        response = self.client.get(reverse('telemetry:latest_frames'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['frames'][0]['ground_station'], 'seneca-gs-1')
