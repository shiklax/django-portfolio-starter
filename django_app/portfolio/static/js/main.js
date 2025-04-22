// Czekaj na załadowanie całej struktury DOM, zanim zaczniesz manipulować elementami
document.addEventListener('DOMContentLoaded', function() {

    const resolutionDisplay = document.getElementById('resolution-display');
    const timeDisplay = document.getElementById('time-display');

    // --- Funkcja aktualizująca rozdzielczość ---
    function updateResolution() {
        if (resolutionDisplay) {
            const width = window.innerWidth;
            const height = window.innerHeight;
            resolutionDisplay.textContent = `${width}x${height}`;
        }
    }

    // --- Funkcja aktualizująca czas ---
    function updateTime() {
        if (timeDisplay) {
            const now = new Date();
            // Użyj toLocaleTimeString dla formatowania zgodnego z lokalizacją użytkownika,
            // ale możemy też sformatować ręcznie dla pewności formatu HH:MM:SS
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    // --- Inicjalizacja i nasłuchiwanie ---

    // Aktualizuj rozdzielczość od razu i przy zmianie rozmiaru okna
    updateResolution();
    window.addEventListener('resize', updateResolution);

    // Aktualizuj czas od razu i co sekundę
    updateTime();
    setInterval(updateTime, 1000); // Aktualizuj co 1000ms = 1 sekunda

});