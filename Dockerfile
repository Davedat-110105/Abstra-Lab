# syntax=docker/dockerfile:1

FROM python:3.12-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libjpeg62-turbo-dev \
        libpq-dev \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv /venv \
    && /venv/bin/pip install --no-cache-dir --upgrade pip \
    && /venv/bin/pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libjpeg62-turbo \
        libpq5 \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system astra \
    && useradd --system --gid astra --create-home --home-dir /app astra

COPY --from=builder /venv /venv
COPY abstra_lab/ /app/abstra_lab/
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chown -R astra:astra /app

WORKDIR /app/abstra_lab

USER astra

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]