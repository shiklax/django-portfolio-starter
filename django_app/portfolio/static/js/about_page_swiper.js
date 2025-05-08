// static/js/about_page_swiper.js
document.addEventListener('DOMContentLoaded', function() {
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
        console.error('GSAP or Draggable is not loaded for about_page_swiper.js!');
        return;
    }
    if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
    }
    gsap.registerPlugin(Draggable);

    const sectionsContainer = document.getElementById('about-sections-container');
    const swiper = document.getElementById('about-sections-swiper');
    const sectionNavContainer = document.getElementById('about-section-navigation');
    
    let sections = [];
    let numSections = 0;
    let currentSectionIndex = 0;
    let draggableAbout;
    let isResizing = false;

    if (!sectionsContainer || !swiper) {
        console.error("About page swiper container or swiper element not found. Aborting script.");
        return;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function forceReflow(element) {
        if (element) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = element.offsetHeight; 
        }
    }

    function setSectionWidths() {
        forceReflow(sectionsContainer);
        const containerWidth = sectionsContainer.getBoundingClientRect().width;

        if (containerWidth > 0 && sections.length > 0) {
            // console.log(`[SWIPER] Setting section widths. ContainerWidth: ${containerWidth.toFixed(2)}px`);
            sections.forEach((section, index) => {
                gsap.set(section, { width: containerWidth }); 
                // console.log(`[SWIPER] Section ${index} width set to ${containerWidth.toFixed(2)}px. Actual: ${section.getBoundingClientRect().width.toFixed(2)}px`);
            });
        } else if (sections.length > 0) { // Tylko jeśli są sekcje, a szerokość kontenera to 0
            console.warn("[SWIPER] setSectionWidths: containerWidth is 0. Section widths not reliably set.");
        }
    }

    function initializeOrUpdateSwiper() {
        // console.log(`[SWIPER] Running initializeOrUpdateSwiper. Current index: ${currentSectionIndex}`);
        isResizing = true;

        forceReflow(sectionsContainer);
        forceReflow(swiper);

        sections = Array.from(swiper.querySelectorAll('.fullscreen-section-about'));
        numSections = sections.length;

        if (numSections === 0) {
            // console.log("[SWIPER] No sections found. Cleaning up.");
            if (sectionNavContainer) sectionNavContainer.style.display = 'none';
            if (draggableAbout) {
                draggableAbout.kill();
                draggableAbout = null;
            }
            gsap.set(swiper, { x: 0 });
            isResizing = false;
            return;
        }

        // 0. USTAW SZEROKOŚCI POSZCZEGÓLNYCH SEKCJI
        setSectionWidths();

        // 1. NATYCHMIASTOWE DOSTOSOWANIE POZYCJI SWIPERA
        adjustSwiperPositionImmediately();

        // 2. UTWORZENIE LUB AKTUALIZACJA INSTANCJI DRAGGABLE
        createOrUpdatePageDraggable();

        // 3. UTWORZENIE LUB AKTUALIZACJA NAWIGACJI KROPKOWEJ
        createSectionNav();
        updateSectionNavDots();

        setTimeout(() => {
            isResizing = false;
            if (draggableAbout) {
                // console.log("[SWIPER] Final Draggable update after short delay.");
                draggableAbout.update(true);
            }
            // console.log("[SWIPER] initializeOrUpdateSwiper finished.");
        }, 100); // Zwiększone opóźnienie na wszelki wypadek
    }

    function adjustSwiperPositionImmediately() {
        forceReflow(sectionsContainer);
        const containerWidth = sectionsContainer.getBoundingClientRect().width;

        if (numSections > 0 && containerWidth > 0) {
            const newTargetX = Math.round(-currentSectionIndex * containerWidth);
            // console.log(`[SWIPER] adjustSwiperPositionImmediately: Index=${currentSectionIndex}, ContainerW=${containerWidth.toFixed(2)}, TargetX=${newTargetX}`);
            gsap.set(swiper, { x: newTargetX });
        } else if (numSections === 0) {
            gsap.set(swiper, { x: 0 });
        } else if (containerWidth === 0 && numSections > 0) {
            // console.warn("[SWIPER] adjustSwiperPositionImmediately: containerWidth is 0. Swiper position may be incorrect.");
            gsap.set(swiper, { x: 0 }); 
        }
    }

    function createOrUpdatePageDraggable() {
        forceReflow(sectionsContainer);
        const containerWidth = sectionsContainer.getBoundingClientRect().width;

        if (containerWidth === 0 && numSections > 0) {
            // console.warn("[SWIPER] Draggable setup: containerWidth is 0. Killing draggable if exists and returning.");
            if (draggableAbout) { draggableAbout.kill(); draggableAbout = null; }
            return;
        }
        
        // Szerokość każdej sekcji powinna być już ustawiona przez setSectionWidths()
        const totalContentWidth = numSections * containerWidth;
        
        let minX = (numSections > 1) ? Math.round(containerWidth - totalContentWidth) : 0;
        // Zaokrąglij minX do najbliższej liczby całkowitej, aby uniknąć problemów z subpikselami
        minX = Math.round(minX); 
        const maxX = 0;

        // console.log(`[SWIPER] Draggable setup: containerW=${containerWidth.toFixed(2)}, totalContentW=${totalContentWidth.toFixed(2)}, minX=${minX}, maxX=${maxX}`);

        if (draggableAbout) {
            // console.log("[SWIPER] Updating existing Draggable instance bounds.");
            draggableAbout.vars.bounds = { minX: minX, maxX: maxX };
            draggableAbout.update(true);
        } else if (numSections > 1) {
            // console.log("[SWIPER] Creating new Draggable instance.");
            draggableAbout = Draggable.create(swiper, {
                type: "x",
                edgeResistance: 0.65,
                bounds: { minX: minX, maxX: maxX },
                inertia: true,
                dragClickables: true,
                lockAxis: true,
                onPress: function(event) {
                    if (isResizing) {
                        return false;
                    }
                    if (event.target.closest('#timeline-scroll-container')) {
                        // Timeline scroll handler powinien zatrzymać propagację
                    }
                },
                onDragStart: function() {
                     if (isResizing) return false;
                },
                onDragEnd: function() {
                    if (isResizing) return;

                    const velocityX = this.getDirection("x") === "left" ? -this.velocityX : this.velocityX;
                    const threshold = 400;
                    let targetIndexOnDragEnd = currentSectionIndex;

                    forceReflow(sectionsContainer);
                    const currentContainerWidthOnDragEnd = sectionsContainer.getBoundingClientRect().width;

                    if (currentContainerWidthOnDragEnd <= 0) {
                        // console.warn("[SWIPER] DragEnd: Container width is 0. Snapping to current index.");
                        goToSection(currentSectionIndex, 0.3);
                        return;
                    }

                    if (Math.abs(velocityX) > threshold) {
                        if (velocityX < 0) {
                            targetIndexOnDragEnd = Math.min(currentSectionIndex + 1, numSections - 1);
                        } else {
                            targetIndexOnDragEnd = Math.max(0, currentSectionIndex - 1);
                        }
                        // console.log(`[SWIPER] DragEnd with inertia: snapping to index ${targetIndexOnDragEnd}`);
                        goToSection(targetIndexOnDragEnd, 0.5);
                    } else {
                        let closestIndex = Math.round(Math.abs(this.x) / currentContainerWidthOnDragEnd);
                        closestIndex = Math.max(0, Math.min(closestIndex, numSections - 1));
                        // console.log(`[SWIPER] DragEnd snap: snapping to closest index ${closestIndex}`);
                        goToSection(closestIndex, 0.4);
                    }
                }
            })[0];
        } else {
            gsap.set(swiper, {x: 0});
            if (draggableAbout) {
                // console.log("[SWIPER] Less than 2 sections, killing Draggable.");
                draggableAbout.kill();
                draggableAbout = null;
            }
        }
    }

    function goToSection(index, duration = 0.7) {
        if (duration > 0 && draggableAbout && (draggableAbout.isDragging || draggableAbout.isThrowing)) {
            return;
        }
        
        const targetIndex = Math.max(0, Math.min(index, numSections - 1));

        forceReflow(sectionsContainer);
        const containerWidth = sectionsContainer.getBoundingClientRect().width;

        if (containerWidth === 0 && numSections > 0) {
            // console.warn(`[SWIPER] goToSection: containerWidth is 0. Setting index ${targetIndex}.`);
            currentSectionIndex = targetIndex;
            updateSectionNavDots();
            const sectionWidthGuess = (swiper.scrollWidth / numSections) || 0;
            gsap.set(swiper, { x: -targetIndex * sectionWidthGuess });
            return;
        }
        
        const currentX = gsap.getProperty(swiper, "x");
        const targetX = Math.round(-targetIndex * containerWidth);

        // console.log(`[SWIPER] goToSection: index=${targetIndex}, currentX=${currentX.toFixed(0)}, targetX=${targetX}, containerW=${containerWidth.toFixed(2)}, duration=${duration}`);

        if (Math.abs(currentX - targetX) < 1 && currentSectionIndex === targetIndex && duration > 0) {
            if (draggableAbout) draggableAbout.enable();
            updateSectionNavDots();
            return;
        }

        currentSectionIndex = targetIndex;
        updateSectionNavDots();

        if (draggableAbout) {
            draggableAbout.disable();
        }

        const animationVars = {
            x: targetX,
            onComplete: () => {
                if (draggableAbout) {
                    draggableAbout.update(true);
                    draggableAbout.enable();
                }
            }
        };

        if (duration === 0) {
            gsap.set(swiper, animationVars);
        } else {
            animationVars.duration = duration;
            animationVars.ease = "power2.inOut";
            animationVars.overwrite = 'auto';
            gsap.to(swiper, animationVars);
        }
    }

    function createSectionNav() {
        if (!sectionNavContainer) return;
        sectionNavContainer.innerHTML = '';
        sectionNavContainer.style.display = numSections > 1 ? 'flex' : 'none';

        for (let i = 0; i < numSections; i++) {
            const dot = document.createElement('button');
            dot.dataset.index = i;
            dot.setAttribute('aria-label', `Przejdź do sekcji ${i + 1}`);
            dot.className = "w-3 h-3 rounded-full bg-gray-500 hover:bg-gray-300 transition-colors duration-200"; 
            dot.addEventListener('click', () => goToSection(i));
            sectionNavContainer.appendChild(dot);
        }
    }

    function updateSectionNavDots() {
        if (!sectionNavContainer) return;
        const dots = sectionNavContainer.querySelectorAll('button');
        dots.forEach((dot, index) => {
            if (index === currentSectionIndex) {
                dot.classList.remove('bg-gray-500');
                dot.classList.add('bg-emerald-400', 'scale-125');
            } else {
                dot.classList.remove('bg-emerald-400', 'scale-125');
                dot.classList.add('bg-gray-500');
            }
        });
    }
    
    requestAnimationFrame(() => {
        // console.log("[SWIPER] Initializing swiper after first rAF.");
        initializeOrUpdateSwiper();
    });

    const debouncedResizeHandler = debounce(() => {
        // console.log("[SWIPER] Resize event triggered (debounced).");
        requestAnimationFrame(() => {
            // console.log("[SWIPER] Executing initializeOrUpdateSwiper after rAF (post-resize).");
            initializeOrUpdateSwiper();
        });
    }, 250); 

    window.addEventListener("resize", debouncedResizeHandler);
});