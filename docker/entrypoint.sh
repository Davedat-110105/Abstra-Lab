#!/bin/sh
set -eu

if [ -n "${POSTGRES_HOST:-}" ]; then
  echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT:-5432}..."
  until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-astra}" >/dev/null 2>&1; do
    sleep 1
  done
fi

python manage.py migrate --noinput

# Ensure staticfiles dir exists and is writable (volume may have root perms)
mkdir -p /app/abstra_lab/staticfiles 2>/dev/null || true

python manage.py collectstatic --noinput

if [ -n "${SEAWEEDFS_S3_ENDPOINT_URL:-}" ]; then
  echo "Ensuring SeaweedFS bucket exists..."
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if python manage.py ensure_seaweed_bucket; then
      break
    fi
    echo "SeaweedFS not ready yet (attempt ${attempt}/10)..."
    sleep 3
  done
fi

if [ "${IMPORT_LIBRARY:-0}" = "1" ]; then
  python manage.py import_library
fi

if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); username='${DJANGO_SUPERUSER_USERNAME}'; User.objects.filter(username=username).exists() or User.objects.create_superuser(username, '${DJANGO_SUPERUSER_EMAIL:-admin@example.com}', '${DJANGO_SUPERUSER_PASSWORD}')"
fi

exec gunicorn abstra_lab.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-60}"
