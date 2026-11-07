/**
 * Dr. Salih's Dentpark Dental Clinic - Frontend Script
 * Premium UX, Mobile Navigation, Responsive Interactions & Secure Booking
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. MOBILE NAVIGATION & DRAWER SYSTEM
    // -------------------------------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.getElementById('navbar');

    // Create or select backdrop overlay for mobile menu
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop && navMenu) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-nav-backdrop';
        document.body.appendChild(backdrop);
    }

    const openMenu = () => {
        if (!hamburger || !navMenu) return;
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    if (hamburger) {
        hamburger.setAttribute('aria-label', 'Toggle mobile menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (navMenu && navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
    }

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close mobile menu when any navigation link or CTA inside it is clicked
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-cta a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // -------------------------------------------------------------------------
    // 2. STICKY NAVBAR & ACTIVE NAV STATE
    // -------------------------------------------------------------------------
    const handleScrollNavbar = () => {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScrollNavbar, { passive: true });
    handleScrollNavbar();

    // Active link highlighting for single-page sections (index.html)
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const updateActiveNavLink = () => {
        if (!sections.length) return;
        let scrollPos = window.scrollY + 220;
        let currentSectionId = '';

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href === `#${currentSectionId}` || href.endsWith(`#${currentSectionId}`))) {
                    link.classList.add('active');
                } else if (href && href.startsWith('#')) {
                    link.classList.remove('active');
                }
            });
        }
    };

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveNavLink, { passive: true });
        updateActiveNavLink();
    }

    // -------------------------------------------------------------------------
    // 3. HIGH PERFORMANCE SCROLL REVEAL ANIMATIONS
    // -------------------------------------------------------------------------
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(reveal => revealObserver.observe(reveal));
    } else {
        // Fallback for older browsers
        const revealOnScroll = () => {
            const windowHeight = window.innerHeight;
            reveals.forEach(reveal => {
                const elementTop = reveal.getBoundingClientRect().top;
                if (elementTop < windowHeight - 60) {
                    reveal.classList.add('active');
                }
            });
        };
        window.addEventListener('scroll', revealOnScroll, { passive: true });
        revealOnScroll();
    }

    // -------------------------------------------------------------------------
    // 3B. DYNAMIC HERO SLIDESHOW CONTROLLER
    // -------------------------------------------------------------------------
    const heroSlides = document.querySelectorAll('.showcase-slide, .hero-slide');
    const heroDots = document.querySelectorAll('.showcase-dot, .hero-dot');
    const heroPrevBtn = document.getElementById('heroPrevBtn');
    const heroNextBtn = document.getElementById('heroNextBtn');
    const heroPauseBtn = document.getElementById('heroPauseBtn');
    const heroShowcase = document.getElementById('heroShowcase') || document.getElementById('heroSlider') || document.getElementById('home');
    const currentNumEl = document.querySelector('#showcaseCounter .current-num');

    if (heroSlides.length > 0) {
        let currentSlide = 0;
        let slideInterval = null;
        const slideDelay = 4500; // 4.5 seconds
        let isUserPaused = false;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const updateSlideView = (index) => {
            currentSlide = (index + heroSlides.length) % heroSlides.length;

            heroSlides.forEach((slide, i) => {
                if (i === currentSlide) {
                    slide.classList.add('active');
                    slide.setAttribute('aria-hidden', 'false');
                } else {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            heroDots.forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });

            if (currentNumEl) {
                currentNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
            }
        };

        const nextSlide = () => {
            updateSlideView(currentSlide + 1);
        };

        const prevSlide = () => {
            updateSlideView(currentSlide - 1);
        };

        const startAutoSlide = () => {
            if (isUserPaused || prefersReducedMotion) return;
            stopAutoSlide();
            slideInterval = setInterval(nextSlide, slideDelay);
        };

        const stopAutoSlide = () => {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        };

        const resetTimer = () => {
            stopAutoSlide();
            startAutoSlide();
        };

        // Arrow button click listeners
        if (heroNextBtn) {
            heroNextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                nextSlide();
                resetTimer();
            });
        }

        if (heroPrevBtn) {
            heroPrevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
                resetTimer();
            });
        }

        // Indicator dots click listeners
        heroDots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                updateSlideView(idx);
                resetTimer();
            });
        });

        // Pause / Play button toggle for Accessibility
        if (heroPauseBtn) {
            heroPauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isUserPaused = !isUserPaused;
                if (isUserPaused) {
                    stopAutoSlide();
                    heroPauseBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
                    heroPauseBtn.setAttribute('aria-label', 'Play slideshow');
                } else {
                    startAutoSlide();
                    heroPauseBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
                    heroPauseBtn.setAttribute('aria-label', 'Pause slideshow');
                }
            });
        }

        // Pause on mouse hover & focus
        if (heroShowcase) {
            heroShowcase.addEventListener('mouseenter', stopAutoSlide);
            heroShowcase.addEventListener('mouseleave', () => {
                if (!isUserPaused) startAutoSlide();
            });
            heroShowcase.addEventListener('focusin', stopAutoSlide);
            heroShowcase.addEventListener('focusout', () => {
                if (!isUserPaused) startAutoSlide();
            });

            // Keyboard navigation (Arrow keys when hero showcase has focus)
            heroShowcase.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    nextSlide();
                    resetTimer();
                } else if (e.key === 'ArrowLeft') {
                    prevSlide();
                    resetTimer();
                }
            });

            // Touch Swipe Support for Mobile & Tablets
            let touchStartX = 0;
            let touchEndX = 0;
            const swipeThreshold = 35;

            heroShowcase.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoSlide();
            }, { passive: true });

            heroShowcase.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const deltaX = touchEndX - touchStartX;
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX < 0) {
                        nextSlide(); // Swiped left -> next
                    } else {
                        prevSlide(); // Swiped right -> prev
                    }
                }
                if (!isUserPaused) startAutoSlide();
            }, { passive: true });
        }

        // Initialize Slideshow
        updateSlideView(0);
        if (!prefersReducedMotion) {
            startAutoSlide();
        }
    }

    // -------------------------------------------------------------------------
    // 4. APPOINTMENT BOOKING FORM (PRESERVES API & INTEGRATIONS)
    // -------------------------------------------------------------------------
    const bookingForm = document.getElementById('bookingForm');
    const formMsg = document.querySelector('.form-msg') || document.getElementById('formMsg');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Book Your Visit';

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
            }

            if (formMsg) {
                formMsg.className = 'form-msg d-none';
                formMsg.innerText = '';
            }

            // Collect form fields cleanly
            const nameEl = document.getElementById('name');
            const phoneEl = document.getElementById('phone');
            const serviceEl = document.getElementById('service');
            const dateEl = document.getElementById('date');
            const timeEl = document.getElementById('time');
            const messageEl = document.getElementById('message');
            const emailEl = document.getElementById('email');

            const formData = {
                name: nameEl ? nameEl.value.trim() : '',
                phone: phoneEl ? phoneEl.value.trim() : '',
                service: serviceEl ? serviceEl.value : '',
                date: dateEl ? dateEl.value : '',
                time: timeEl ? timeEl.value : '',
                message: messageEl ? messageEl.value.trim() : '',
                email: emailEl ? emailEl.value.trim() : ''
            };

            // Basic Client-side Validation
            if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
                if (formMsg) {
                    formMsg.className = 'form-msg error';
                    formMsg.innerText = 'Please fill in all required fields (Name, Phone, Service, Date, Time).';
                    formMsg.classList.remove('d-none');
                }
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
                return;
            }

            try {
                // Submit to real Express backend API
                const response = await fetch('/api/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    if (formMsg) {
                        formMsg.className = 'form-msg success';
                        formMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (data.message || 'Appointment requested successfully!') + ' Redirecting to WhatsApp for instant confirmation...';
                        formMsg.classList.remove('d-none');
                    }

                    // Direct Clinic WhatsApp confirmation
                    const waNumber = "918129024493";
                    const serviceFormatted = formData.service.charAt(0).toUpperCase() + formData.service.slice(1);
                    const waMessage = `Hello Dr. Salih's Dentpark Clinic, I would like to confirm my appointment:

*Patient:* ${formData.name}
*Phone:* ${formData.phone}
*Service:* ${serviceFormatted}
*Date:* ${formData.date}
*Time:* ${formData.time}${formData.message ? `\n*Notes:* ${formData.message}` : ''}

Please confirm my booking. Thank you!`;

                    const encodedMessage = encodeURIComponent(waMessage);
                    const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

                    setTimeout(() => {
                        try {
                            const newTab = window.open(waUrl, '_blank');
                            if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                                window.location.href = waUrl;
                            }
                        } catch (err) {
                            window.location.href = waUrl;
                        }

                        bookingForm.reset();
                        if (formMsg) {
                            formMsg.innerText = 'Your appointment request has been recorded. We will contact you shortly.';
                        }
                    }, 1200);

                } else {
                    throw new Error(data.message || 'Error scheduling appointment. Please try again.');
                }
            } catch (error) {
                console.error('Booking submission error:', error);
                if (formMsg) {
                    formMsg.className = 'form-msg error';
                    formMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + (error.message || 'Connection error. Please call us directly.');
                    formMsg.classList.remove('d-none');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // 5. SMOOTH ANCHOR SCROLLING WITH OFFSET FOR FIXED HEADER
    // -------------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            let targetElement = null;
            try {
                targetElement = document.querySelector(targetId);
            } catch (err) {
                return;
            }
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 75;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
