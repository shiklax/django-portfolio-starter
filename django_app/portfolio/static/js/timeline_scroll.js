// static/js/timeline_scroll.js
document.addEventListener('DOMContentLoaded', function() {
    // Upewnij się, że GSAP i Draggable są załadowane
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
        console.error('GSAP or Draggable is not loaded for timeline_scroll.js!');
        return;
    }
    // Zarejestruj Draggable (dobra praktyka)
    gsap.registerPlugin(Draggable);

    const scrollContainer = document.getElementById('timeline-scroll-container'); // Zewnętrzny kontener (maska)
    const innerContent = document.getElementById('timeline-inner-content');   // Wewnętrzny kontener, który będziemy przeciągać

    // Sprawdź, czy elementy istnieją, zanim spróbujemy z nimi pracować
    if (!scrollContainer || !innerContent) {
        // console.log("Timeline container or inner content not found on this page."); // Zmień na log, jeśli to spodziewane na innych stronach
        return; // Po prostu zakończ, jeśli nie ma tych elementów na danej stronie
    }

    const cards = Array.from(innerContent.querySelectorAll('.timeline-card')); // Pobierz karty dla potencjalnego użycia w snap

    // Jeśli nie ma kart, nie inicjuj draggable
    if (cards.length === 0) {
         console.log("No timeline cards found inside inner content.");
         return;
    }

    let draggableTimeline; // Zmienna do przechowywania instancji Draggable

    // --- Funkcja Debounce ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function createTimelineDraggable() {
        // Oblicz granice przeciągania
        const containerWidth = scrollContainer.offsetWidth;
        const contentWidth = innerContent.scrollWidth;
        let minX = 0;
        // Tylko jeśli treść jest szersza niż kontener, pozwól na przeciąganie w lewo
        if (contentWidth > containerWidth) {
            minX = containerWidth - contentWidth;
        }
        const maxX = 0; // Zawsze 0 jako maksymalna pozycja (początek)

        // console.log(`Timeline Draggable bounds: minX=${minX}, maxX=${maxX}`);

        // Zniszcz starą instancję przed utworzeniem nowej (ważne przy resize)
        if (draggableTimeline && draggableTimeline.length > 0) {
            // console.log("Killing existing Timeline Draggable instance");
            draggableTimeline[0].kill();
            draggableTimeline = null;
        }

        // console.log("Creating new Timeline Draggable instance");
        draggableTimeline = Draggable.create(innerContent, {
            type: "x",
            edgeResistance: 0.65,
            bounds: { minX: minX, maxX: maxX },
            inertia: true,
            dragClickables: true,
            lockAxis: true,

            // --- ZATRZYMANIE PROPAGACJI ---
            onPress: function(e) {
                // Zatrzymaj zdarzenie, aby nie uruchomiło przeciągania rodzica (sekcji)
                if (e.stopPropagation) {
                    e.stopPropagation();
                } else { // Fallback dla IE
                    e.cancelBubble = true;
                }
                // console.log("Timeline onPress - propagation stopped.");
            },
            // --- KONIEC ZMIANY ---

            // Opcjonalnie snap dla kart timeline'u
            // snap: {
            //     x: function(endValue) {
            //         let cardWidth = cards.length > 0 ? cards[0].offsetWidth + 48 : containerWidth; // 48px to space-x-12 / 2 ? Musi być dokładne
            //         let snappedX = Math.round(endValue / cardWidth) * cardWidth;
            //         snappedX = Math.max(minX, Math.min(maxX, snappedX));
            //         return snappedX;
            //     }
            // },
            onDragStart: function() {
                // Możesz dodać klasy, np. gdy przeciąganie się zaczyna
                // scrollContainer.classList.add('is-dragging-timeline');
            },
            onDragEnd: function() {
                // scrollContainer.classList.remove('is-dragging-timeline');
                // console.log("Timeline Drag End, final X:", this.x.toFixed(2));
            }
        });

         // Upewnij się, że pozycja jest poprawna po utworzeniu
         if (draggableTimeline && draggableTimeline.length > 0) {
            gsap.set(innerContent, {x: 0}); // Zawsze resetuj do 0 przy tworzeniu/resize
            draggableTimeline[0].update(true); // Zastosuj granice od razu
         }
    }

    // Inicjalizacja Draggable dla timeline'u
    createTimelineDraggable();

    // Ponownie utwórz Draggable przy zmianie rozmiaru okna
    window.addEventListener("resize", debounce(createTimelineDraggable, 250));

    // Ustawienie początkowe - już jest w createTimelineDraggable przez gsap.set(innerContent, {x: 0});
    // setTimeout(() => {
    //     // gsap.set(innerContent, {x: 0}); // Jest już w createTimelineDraggable
    // }, 50);

});