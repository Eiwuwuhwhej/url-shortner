FROM python:3.12-alpine
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY frontend/ frontend/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
