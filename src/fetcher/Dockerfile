FROM python:3.10-slim

WORKDIR /app

RUN useradd -m appuser

COPY pyproject.toml poetry.lock* ./
COPY . .

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

RUN chown -R appuser:appuser /app
USER appuser

CMD ["python", "main.py"]
