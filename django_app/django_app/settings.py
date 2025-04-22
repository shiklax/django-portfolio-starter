import os
from pathlib import Path # Lepsze niż os.path dla nowoczesnego Pythona

# Użyj Pathlib dla BASE_DIR - bardziej czytelne i uniwersalne
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'dev-key' # Pamiętaj, aby zmienić to na bezpieczny klucz w produkcji!
DEBUG = True
ALLOWED_HOSTS = ['*'] # W produkcji zawęź to do konkretnych domen!

INSTALLED_APPS = [
    # --- WAŻNE: Dodaj te aplikacje Django ---
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    # --- Koniec ważnych aplikacji ---
    'django.contrib.staticfiles',
    # Tutaj dodaj swoją aplikację portfolio, jeśli ją masz (np. 'portfolio.apps.PortfolioConfig' lub 'portfolio')
    'portfolio', # Zakładając, że masz aplikację 'portfolio' w 'django_app/portfolio'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware', # Dodaj dla bezpieczeństwa
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware', # Potrzebne dla sesji/admina
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware', # Ważne dla formularzy
    'django.contrib.auth.middleware.AuthenticationMiddleware', # Potrzebne dla użytkowników/admina
    'django.contrib.messages.middleware.MessageMiddleware', # Potrzebne dla wiadomości
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # Dodaj dla bezpieczeństwa
]

ROOT_URLCONF = 'django_app.urls' # Upewnij się, że plik django_app/django_app/urls.py istnieje

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    # Ścieżka jest OK, jeśli BASE_DIR wskazuje na katalog zawierający 'portfolio'
    'DIRS': [BASE_DIR / 'portfolio' / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {
        'context_processors': [ # Dodaj standardowe context processors
            'django.template.context_processors.debug',
            'django.template.context_processors.request',
            'django.contrib.auth.context_processors.auth',
            'django.contrib.messages.context_processors.messages',
        ],
    },
}]

WSGI_APPLICATION = 'django_app.wsgi.application'

# --- DODAJ TĘ SEKCJĘ ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3', # Plik bazy danych w katalogu BASE_DIR
    }
}
# --- KONIEC SEKCJI DATABASES ---

# Ustawienia dla Auth (jeśli używasz django.contrib.auth)
# AUTH_PASSWORD_VALIDATORS = [ ... ] # Możesz dodać później

# Ustawienia języka i strefy czasowej
LANGUAGE_CODE = 'pl' # lub 'en-us'
TIME_ZONE = 'Europe/Warsaw' # lub 'UTC'
USE_I18N = True
USE_TZ = True


# Ustawienia plików statycznych - wygląda OK
STATIC_URL = '/static/'
# STATICFILES_DIRS mówi Django, gdzie szukać plików statycznych POZA aplikacjami
STATICFILES_DIRS = [BASE_DIR / 'portfolio' / 'static']
# STATIC_ROOT to miejsce, gdzie `collectstatic` skopiuje WSZYSTKIE pliki statyczne do wdrożenia
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Upewnij się, że WhiteNoise jest skonfigurowany do serwowania plików z STATIC_ROOT
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# Domyślne pole klucza głównego (dla nowszych wersji Django)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'