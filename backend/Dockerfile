# Stage 1: Base build stage
FROM python:3.13-slim AS builder

# Create the app directory
RUN mkdir /app

# Set the working directory
WORKDIR /app

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Upgrade pip and install dependencies
RUN pip install --upgrade pip

# Copy the requirements file first (better caching)
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production stage
FROM python:3.13-slim

# Set the working directory
WORKDIR /app

# Create necessary directories with proper permissions
RUN mkdir -p /app/static /app/media && \
    chmod 777 /app/static /app/media && \
    useradd -m -r appuser && \
    chown -R appuser:appuser /app

# Copy the Python dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application code
COPY --chown=appuser:appuser . .

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8000

# Make sure migrations are created first, then applied, then collect static files
CMD ["sh", "-c", "python manage.py makemigrations app --noinput && \
                  python manage.py migrate --noinput && \
                  python manage.py collectstatic --noinput && \
                  gunicorn --bind 0.0.0.0:8000 --workers 3 --reload backend.wsgi:application"]