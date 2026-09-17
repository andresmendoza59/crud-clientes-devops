FROM python:3.13-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir \
        -r backend/requirements.txt

RUN useradd --create-home --uid 10001 appuser

COPY --chown=appuser:appuser backend/src ./backend/src

RUN mkdir -p ./frontend

COPY --chown=appuser:appuser frontend/index.html ./frontend/index.html
COPY --chown=appuser:appuser frontend/styles.css ./frontend/styles.css
COPY --chown=appuser:appuser frontend/app.js ./frontend/app.js

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"]

CMD ["python", "-m", "uvicorn", "clientes.api:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "backend/src"]