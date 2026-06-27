import json
import secrets

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .models import FlightSession, TelemetryFrame


NUMERIC_FIELDS = {
    'altitude_m',
    'velocity_mps',
    'acceleration_mps2',
    'latitude',
    'longitude',
    'battery_v',
    'temperature_c',
    'pressure_pa',
    'rssi_dbm',
}


def _extract_token(request):
    bearer = request.headers.get('Authorization', '')
    if bearer.startswith('Bearer '):
        return bearer.removeprefix('Bearer ').strip()
    return request.headers.get('X-Telemetry-Token', '').strip()


def _ingest_authorized(request):
    expected = settings.TELEMETRY_INGEST_TOKEN
    supplied = _extract_token(request)
    return bool(expected and supplied and secrets.compare_digest(expected, supplied))


def _float_or_none(value):
    if value in ('', None):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _int_or_none(value):
    if value in ('', None):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _received_at(payload):
    raw_value = payload.get('received_at') or payload.get('timestamp')
    if not raw_value:
        return timezone.now()
    parsed = parse_datetime(str(raw_value))
    if parsed is None:
        return timezone.now()
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone.get_current_timezone())
    return parsed


def _flight_session(payload):
    session_id = payload.get('flight_session_id')
    if not session_id:
        return None
    try:
        return FlightSession.objects.get(pk=int(session_id))
    except (FlightSession.DoesNotExist, TypeError, ValueError):
        return None


def _frame_payload(frame):
    return {
        'id': frame.id,
        'received_at': frame.received_at.isoformat(),
        'ground_station': frame.ground_station,
        'packet_kind': frame.packet_kind,
        'sequence_number': frame.sequence_number,
        'rocket_time_ms': frame.rocket_time_ms,
        'altitude_m': frame.altitude_m,
        'velocity_mps': frame.velocity_mps,
        'acceleration_mps2': frame.acceleration_mps2,
        'latitude': frame.latitude,
        'longitude': frame.longitude,
        'battery_v': frame.battery_v,
        'temperature_c': frame.temperature_c,
        'pressure_pa': frame.pressure_pa,
        'rssi_dbm': frame.rssi_dbm,
    }


@login_required
def dashboard(request):
    frames = TelemetryFrame.objects.select_related('flight_session')[:25]
    return render(request, 'telemetry/dashboard.html', {'frames': frames})


@csrf_exempt
@require_POST
def ingest_frame(request):
    if not _ingest_authorized(request):
        return JsonResponse({'ok': False, 'error': 'unauthorized'}, status=401)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'error': 'invalid_json'}, status=400)

    if not isinstance(payload, dict):
        return JsonResponse({'ok': False, 'error': 'payload_must_be_object'}, status=400)

    values = {field: _float_or_none(payload.get(field)) for field in NUMERIC_FIELDS}
    frame = TelemetryFrame.objects.create(
        flight_session=_flight_session(payload),
        received_at=_received_at(payload),
        ground_station=str(payload.get('ground_station') or payload.get('station') or '')[:120],
        packet_kind=str(payload.get('packet_kind') or payload.get('type') or 'telemetry')[:64],
        sequence_number=_int_or_none(payload.get('sequence_number') or payload.get('seq')),
        rocket_time_ms=_int_or_none(payload.get('rocket_time_ms') or payload.get('time_ms')),
        raw=payload,
        **values,
    )

    return JsonResponse({'ok': True, 'frame': _frame_payload(frame)}, status=201)


@require_GET
def latest_frames(request):
    if not request.user.is_authenticated:
        return HttpResponseForbidden('Forbidden')

    limit = min(_int_or_none(request.GET.get('limit')) or 25, 100)
    frames = TelemetryFrame.objects.all()[:limit]
    return JsonResponse({'ok': True, 'frames': [_frame_payload(frame) for frame in frames]})
