FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run migrations and start the server using a start script
# In a real production scenario with horizontal scaling, migrations should be run separately,
# but for a simple single-instance PaaS deployment, this is acceptable.
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
