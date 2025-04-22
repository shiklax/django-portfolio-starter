# django_app/portfolio/urls.py
from django.urls import path
from . import views # Upewnij się, że importujesz moduł views

app_name = 'portfolio' # Dobra praktyka

urlpatterns = [
    # Zmieniono 'views.home' na 'views.home_view', aby pasowało do views.py
    path('', views.home_view, name='home'),
]