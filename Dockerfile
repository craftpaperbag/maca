FROM python:3.12-slim

WORKDIR /app
COPY index.html style.css script.js /app/
EXPOSE 8000

CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]
