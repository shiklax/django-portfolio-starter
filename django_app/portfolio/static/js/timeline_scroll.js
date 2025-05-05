document.addEventListener('DOMContentLoaded', function() {
    const scrollContainer = document.getElementById('timeline-scroll-container');
    const scrollLeftButton = document.getElementById('scroll-left-btn');
    const scrollRightButton = document.getElementById('scroll-right-btn');
    const cards = Array.from(scrollContainer.querySelectorAll('.timeline-card')); // Pobierz karty jako tablicę
    const itemsPerPage = 3; // Ile elementów na "stronę"

    if (!scrollContainer || !scrollLeftButton || !scrollRightButton || cards.length === 0) {
        console.error("Timeline elements missing or not found.");
        return;
    }

    // Funkcja Debounce (bez zmian)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Funkcja aktualizująca stan przycisków - z poprawionym maxScroll
    const updateButtonStates = () => {
        if (!scrollContainer) return;
        const tolerance = 5; // Tolerancja dla porównań
        const currentScroll = Math.round(scrollContainer.scrollLeft); // Zaokrąglijmy dla pewności

        // Oblicz pozycję, do której można maksymalnie przewinąć w prawo
        // To jest pozycja startowa pierwszego elementu na ostatniej stronie
        const lastPossibleFirstItemIndex = Math.max(0, cards.length - itemsPerPage);
        const maxScrollTarget = cards[lastPossibleFirstItemIndex]?.offsetLeft ?? 0; // Użyj offsetLeft lub 0 jeśli nie ma karty

        scrollLeftButton.disabled = currentScroll <= tolerance; // Wyłączony na początku
        scrollRightButton.disabled = currentScroll >= maxScrollTarget - tolerance; // Wyłączony, gdy jesteśmy na ostatniej stronie
    };

    // Funkcja znajdująca indeks pierwszej WIDOCZNEJ karty (lub najbliższej lewej krawędzi)
    function findFirstVisibleCardIndex() {
        const currentScroll = scrollContainer.scrollLeft;
        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
            const cardStart = card.offsetLeft;
            // Znajdź kartę, której początek jest najbliższy obecnej pozycji scrolla
            const distance = Math.abs(cardStart - currentScroll);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        // Zwraca indeks karty, która jest aktualnie wyrównana (lub prawie wyrównana) do lewej krawędzi
        return closestIndex;
    }

    // Przewijanie do określonego indeksu karty
    function scrollToCard(index) {
        // Upewnij się, że indeks jest w granicach
        const targetIndex = Math.max(0, Math.min(index, cards.length - 1));

        if (cards[targetIndex]) {
            const targetScrollLeft = cards[targetIndex].offsetLeft;
            scrollContainer.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
            // Aktualizuj przyciski po animacji (czas może wymagać dostosowania)
            setTimeout(updateButtonStates, 400);
        }
    }

    // Obsługa kliknięcia "Prawo"
    scrollRightButton.addEventListener('click', () => {
        const currentIndex = findFirstVisibleCardIndex();
        // Przesuń o 'itemsPerPage', ale nie dalej niż do początku ostatniej strony
        const lastPossibleFirstItemIndex = Math.max(0, cards.length - itemsPerPage);
        const targetIndex = Math.min(lastPossibleFirstItemIndex, currentIndex + itemsPerPage);

        // Przewiń tylko jeśli cel jest inny niż obecny
        if (targetIndex > currentIndex) {
            scrollToCard(targetIndex);
        } else {
             // Jeśli już jesteśmy na ostatniej stronie, upewnijmy się, że jest dobrze wyrównana
             scrollToCard(targetIndex);
        }
    });

    // Obsługa kliknięcia "Lewo"
    scrollLeftButton.addEventListener('click', () => {
        const currentIndex = findFirstVisibleCardIndex();
        // Przesuń o 'itemsPerPage' w lewo, ale nie poniżej 0
        const targetIndex = Math.max(0, currentIndex - itemsPerPage);

        // Przewiń tylko jeśli cel jest inny niż obecny
        if (targetIndex < currentIndex) {
            scrollToCard(targetIndex);
        } else {
             // Jeśli już jesteśmy na pierwszej stronie, upewnijmy się, że jest dobrze wyrównana
             scrollToCard(0);
        }
    });

    // --- Nasłuchiwanie na zdarzenie scroll i resize (bez zmian, używa debounce) ---
    scrollContainer.addEventListener('scroll', debounce(updateButtonStates, 150));
    window.addEventListener('resize', debounce(updateButtonStates, 150));

    // --- Ustawienie początkowego stanu przycisków (bez zmian) ---
    setTimeout(updateButtonStates, 150); // Uruchom raz po załadowaniu

});	