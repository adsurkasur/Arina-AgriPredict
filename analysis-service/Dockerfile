# Dockerfile for AgriPredict Analysis Service
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies with security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    gcc \
    g++ \
    curl \
    libgomp1 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create non-root user with specific UID/GID for security
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser -u 1001 appuser

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (install globally, not with --user)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Create app-specific temp directory before switching user
RUN mkdir -p /app/tmp && chown appuser:appuser /app/tmp

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 7860

# Health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import requests; r=requests.get('http://localhost:7860/health', timeout=5); exit(0 if r.status_code == 200 else 1)" || exit 1

# Set Python to run in unbuffered mode for better logging
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Start the application
CMD ["python", "main.py"]
