# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Assume we need a dummy API URL for build time, Fly handles it at runtime
RUN VITE_API_URL=/api/v1 npm run build

# Stage 2: Build Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for psycopg2 and GeoAlchemy2 (PostGIS support)
RUN apt-get update && apt-get install -y \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
# Add psycopg2-binary explicitly if not in requirements for Supabase Postgres
RUN pip install --no-cache-dir psycopg2-binary uvicorn

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend to the expected location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 8000

# Run FastAPI
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
