# ---- Backend Dockerfile ----
# Uses Python 3.11 slim base image for a lightweight production container.

FROM python:3.11-slim

# Set working directory
WORKDIR /backend

# Install system-level dependencies needed for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages first (for Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full application source
COPY . .

# Ensure uploads and chroma_db directories exist
RUN mkdir -p uploads chroma_db

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
