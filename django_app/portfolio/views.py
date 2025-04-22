from django.shortcuts import render

def home_view(request):
    """
    Widok renderujący stronę główną portfolio.
    """
    # W przyszłości możesz tutaj przekazać dane do szablonu w słowniku context
    context = {}
    return render(request, 'portfolio/home.html', context)

# Dodaj inne widoki dla 'portfolio' i 'about', gdy będziesz gotowy
# def portfolio_view(request):
#     return render(request, 'portfolio/portfolio.html', {})

# def about_view(request):
#     return render(request, 'portfolio/about.html', {})