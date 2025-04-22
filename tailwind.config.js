/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './django_app/portfolio/templates/**/*.html', // Wskazuje na wszystkie pliki .html w templates i podkatalogach
    // Możesz dodać inne ścieżki, jeśli używasz klas Tailwind np. w plikach Python lub JS
    // './django_app/portfolio/views.py',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}