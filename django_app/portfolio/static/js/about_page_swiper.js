// static/js/about_page_swiper.js
document.addEventListener('DOMContentLoaded', function() {
    // Upewnij się, że GSAP, Draggable i ScrollToPlugin (dla goToSection) są załadowane
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined' || typeof ScrollToPlugin === 'undefined') {
        console.error('GSAP, Draggable, or ScrollToPlugin is not loaded for about_page_swiper.js!');
        return;
    }
    // Zarejestruj pluginy
    gsap.registerPlugin(Draggable, ScrollToPlugin);

    const sectionsContainer = document.getElementById('about-sections-container'); // Maska
    const swiper = document.getElementById('about-sections-swiper');         // Kontener sekcji
    const sectionNavContainer = document.getElementById('about-section-navigation'); // Kontener na kropki
    let sections = [];      // Tablica sekcji, wypełniana dynamicznie
    let numSections = 0;    // Liczba sekcji
    let currentSectionIndex = 0; // Bieżący indeks strony/sekcji
    let draggableAbout;     // Instancja Draggable dla sekcji about

    // Sprawdź podstawowe kontenery
    if (!sectionsContainer || !swiper) {
        console.error("About page swiper container or swiper element not found.");
        return;
    }

    // --- Funkcja Debounce ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Inicjalizacja lub Aktualizacja ---
    // Ta funkcja będzie wywoływana na starcie i przy resize
    function initializeOrUpdate() {
        // console.log("Running initializeOrUpdate...");

        // Pobierz sekcje ponownie na wypadek dynamicznych zmian (choć tu raczej statyczne)
        sections = Array.from(swiper.querySelectorAll('.fullscreen-section-about'));
        numSections = sections.length;

        // Jeśli nie ma sekcji, wyjdź i ukryj nawigację
        if (numSections === 0) {
            console.log("No sections found. Aborting initialization.");
            if (sectionNavContainer) sectionNavContainer.style.display = 'none';
            // Zniszcz draggable jeśli istnieje
             if (draggableAbout && draggableAbout.length > 0 && draggableAbout[0]) {
                 draggableAbout[0].kill();
                 draggableAbout = null;
             }
            return;
        }

        // Utwórz/zaktualizuj Draggable
        createPageDraggable();

        // Utwórz/zaktualizuj nawigację kropkową
        createSectionNav();

        // Ustaw/dostosuj pozycję do obecnego indeksu bez długiej animacji
        // Wywołaj to po krótkim opóźnieniu, aby mieć pewność, że wymiary są gotowe
        setTimeout(() => {
            adjustPositionOnResize();
            updateSectionNav(); // Upewnij się, że kropki są aktualne
        }, 50); // Krótkie opóźnienie
    }


    // --- Nawigacja Kropkowa ---
    function createSectionNav() {
        if (!sectionNavContainer) return;
        sectionNavContainer.innerHTML = '';
        sectionNavContainer.style.display = numSections > 1 ? 'flex' : 'none';

        for (let i = 0; i < numSections; i++) {
            const dot = document.createElement('button');
            dot.dataset.index = i;
            dot.setAttribute('aria-label', `Przejdź do sekcji ${i + 1}`);
            dot.addEventListener('click', () => goToSection(i));
            sectionNavContainer.appendChild(dot);
        }
         // Ustaw aktywną kropkę od razu
        updateSectionNav();
    }

    function updateSectionNav() {
         if (!sectionNavContainer) return;
        const dots = sectionNavContainer.querySelectorAll('button');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSectionIndex);
        });
    }

    // --- Przejście do Sekcji (np. po kliknięciu kropki) ---
    function goToSection(index, duration = 0.7) {
        if (draggableAbout && draggableAbout[0] && (draggableAbout[0].isDragging || draggableAbout[0].isThrowing)) {
            return;
        }

        const targetIndex = Math.max(0, Math.min(index, numSections - 1));
        const containerWidth = sectionsContainer.getBoundingClientRect().width;
        const currentX = gsap.getProperty(swiper, "x");
        const targetX = Math.round(-targetIndex * containerWidth);

        // Sprawdź, czy animacja jest naprawdę potrzebna
        if (Math.abs(currentX - targetX) < 5 && currentSectionIndex === targetIndex) {
             if (draggableAbout && draggableAbout[0]) draggableAbout[0].enable(); // Upewnij się, że jest włączony
             updateSectionNav();
            return;
        }

        // console.log(`goToSection: index=${targetIndex}, targetX=${targetX}`);
        currentSectionIndex = targetIndex; // Ustaw nowy indeks przed animacją
        updateSectionNav(); // Zaktualizuj kropki od razu

        if (draggableAbout && draggableAbout[0]) {
            draggableAbout[0].disable(); // Wyłącz draggable na czas animacji
        }

        gsap.to(swiper, {
            duration: duration,
            x: targetX,
            ease: "power2.inOut",
            overwrite: 'auto',
            onComplete: () => {
                // console.log(`goToSection complete. Final X: ${gsap.getProperty(swiper, "x").toFixed(0)}`);
                if (draggableAbout && draggableAbout[0]) {
                    draggableAbout[0].update(); // Zaktualizuj pozycję Draggable
                    draggableAbout[0].enable();  // Włącz Draggable z powrotem
                }
                // Ponowna aktualizacja kropek na wszelki wypadek
                updateSectionNav();
            }
        });
    }

    // --- Tworzenie/Aktualizacja Instancji Draggable ---
    function createPageDraggable() {
        const containerWidth = sectionsContainer.getBoundingClientRect().width;
        const totalContentWidth = numSections * containerWidth;
        let minX = (totalContentWidth > containerWidth && numSections > 1) ? containerWidth - totalContentWidth : 0;
        const maxX = 0;
        minX = Math.round(minX); // Zaokrąglij

        // Zawsze zabijaj starą instancję, jeśli istnieje
        if (draggableAbout && draggableAbout.length > 0 && draggableAbout[0]) {
            // console.log("Killing existing About Draggable instance");
            draggableAbout[0].kill();
            draggableAbout = null;
        }

        // Twórz tylko, jeśli jest co przewijać
        if (numSections > 1) {
            draggableAbout = Draggable.create(swiper, {
                type: "x",
                edgeResistance: 0.5,
                bounds: { minX: minX, maxX: maxX },
                inertia: true,
                dragClickables: true,
                lockAxis: true,
                 onPress: function(e) {
                    // Zapobiegaj konfliktom z wewnętrznym draggable
                    if (e.target.closest('#timeline-scroll-container')) {
                         // console.log("Press inside timeline - allow default or stop parent?");
                         // Można by tu zatrzymać propagację, jeśli wewnętrzny drag jest problemem
                         // e.stopPropagation();
                    }
                 },
                onDragEnd: function() {
                    const velocityX = this.getDirection("x") === "left" ? -this.velocityX : this.velocityX;
                    const currentX = this.x;
                    const threshold = 500; // Próg prędkości - dostosuj!
                    let targetIndexOnDragEnd = currentSectionIndex; // Zacznij od obecnego
                    const containerWidthForEnd = sectionsContainer.getBoundingClientRect().width; // Pobierz aktualną szerokość

                    if (Math.abs(velocityX) > threshold && containerWidthForEnd > 0) {
                        if (velocityX < -threshold) { // Rzut w lewo -> następna strona
                            targetIndexOnDragEnd = Math.min(currentSectionIndex + 1, numSections - 1);
                        } else if (velocityX > threshold) { // Rzut w prawo -> poprzednia strona
                            targetIndexOnDragEnd = Math.max(0, currentSectionIndex - 1);
                        }
                         // Przejdź do sekcji tylko jeśli indeks się zmienił po rzucie
                        if (targetIndexOnDragEnd !== currentSectionIndex) {
                            goToSection(targetIndexOnDragEnd, 0.5);
                        } else {
                            // Jeśli rzut był silny, ale nie zmieniliśmy strony (bo byliśmy na końcu),
                            // wróć do obecnej strony za pomocą goToSection
                            goToSection(currentSectionIndex, 0.3);
                        }
                    } else if (containerWidthForEnd > 0) {
                        // Słaby rzut lub tylko przeciągnięcie - wróć do najbliższej strony
                        let closestIndex = Math.round(Math.abs(currentX) / containerWidthForEnd);
                        closestIndex = Math.max(0, Math.min(closestIndex, numSections - 1));
                        goToSection(closestIndex, 0.4); // Animacja powrotna nieco szybsza
                    }
                }
            });
        } else {
            // Jeśli jest tylko jedna sekcja, upewnij się, że jest na pozycji 0
            gsap.set(swiper, {x: 0});
        }
    }

    // --- Funkcja do dostosowania pozycji po resize ---
    function adjustPositionOnResize() {
        if (numSections > 0) {
            const containerWidth = sectionsContainer.getBoundingClientRect().width;
            const newTargetX = Math.round(-currentSectionIndex * containerWidth);
            // console.log(`Adjusting position on resize. Index: ${currentSectionIndex}, New TargetX: ${newTargetX}`);
            gsap.set(swiper, { x: newTargetX }); // Ustaw pozycję natychmiast
            // Zaktualizuj Draggable, jeśli istnieje
            if (draggableAbout && draggableAbout[0]) {
                 draggableAbout[0].update(true); // Zaktualizuj granice i pozycję
            }
        }
    }


    // --- Inicjalizacja ---
    initializeOrUpdate(); // Wywołaj raz na starcie

    // --- Aktualizacja przy zmianie rozmiaru okna ---
    window.addEventListener("resize", debounce(initializeOrUpdate, 250)); // Wywołaj pełną re-inicjalizację

}); // Koniec DOMContentLoaded