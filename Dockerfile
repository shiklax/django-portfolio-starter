FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Instalacja Node.js i narzędzi
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    # Czyszczenie cache apt
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

WORKDIR /app

# Instalacja zależności Python - kopiujemy tylko requirements.txt najpierw
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalacja zależności Node.js - kopiujemy package*.json najpierw
# Gwiazdka (*) skopiuje package.json i package-lock.json (jeśli istnieje)
COPY package*.json ./
RUN npm install

# Kopiowanie reszty aplikacji (w tym kodu Django, tailwind.config.js, itp.)
COPY . .

# Budowanie CSS za pomocą skryptu z package.json
# RUN npm run build:css

# Uruchomienie aplikacji Django
# Upewnij się, że ścieżka do manage.py jest poprawna
CMD ["sh", "-c", "python django_app/manage.py migrate && python django_app/manage.py runserver 0.0.0.0:8000"]