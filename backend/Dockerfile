# Backend (Flask) image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1

# System deps for MySQL + building wheels
RUN apt-get update && apt-get install -y --no-install-recommends     gcc build-essential default-libmysqlclient-dev pkg-config     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Requirements first (better layer cache)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip     && pip install --no-cache-dir -r requirements.txt     && pip install --no-cache-dir gunicorn pymysql

# Copy the backend app
COPY . /app

# Gunicorn config
COPY gunicorn.conf.py /app/gunicorn.conf.py

# Expose Flask/Gunicorn port
EXPOSE 5000

# Run via gunicorn using the existing run:app
CMD ["gunicorn", "-c", "gunicorn.conf.py", "run:app"]
