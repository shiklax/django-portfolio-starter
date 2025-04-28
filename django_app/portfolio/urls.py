# django_app/portfolio/urls.py
from django.urls import path
from . import views # Upewnij się, że importujesz moduł views

app_name = 'portfolio' # Dobra praktyka

urlpatterns = [
    # Zmieniono 'views.home' na 'views.home_view', aby pasowało do views.py
    path('', views.home_view, name='home'),
    path('portfolio/', views.portfolio_list_view, name='portfolio_list'), # Nadajmy nazwę 'portfolio_list'
    # NOWY URL dla strony "O mnie"
    path('about/', views.about_page_view, name='about_page'), # Nadajmy nazwę 'about_page'
]