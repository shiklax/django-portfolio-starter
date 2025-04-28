from django.shortcuts import render

def home_view(request):
    """
    Widok renderujący stronę główną portfolio.
    """
    # W przyszłości możesz tutaj przekazać dane do szablonu w słowniku context
    context = {}
    return render(request, 'portfolio/home.html', context)

# NOWY widok dla strony listy portfolio
def portfolio_list_view(request):
    """
    Widok renderujący stronę z listą projektów portfolio.
    """
    context = {} # W przyszłości możesz tu przekazać listę projektów
    # Wskazujemy na nowy plik szablonu, który zaraz stworzymy
    return render(request, 'portfolio/portfolio_list.html', context)

# NOWY widok dla strony "O mnie"
def about_page_view(request):
    """
    Widok renderujący stronę "O mnie".
    """
    context = {} # W przyszłości możesz tu przekazać dane o sobie
    # Wskazujemy na nowy plik szablonu, który zaraz stworzymy
    return render(request, 'portfolio/about_page.html', context)