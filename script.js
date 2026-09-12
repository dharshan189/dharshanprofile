/* ==========================================================================
   DHARSHAN S - MOTION ENGINE
   - Universal Dual-Scroll & Navigation Engine
   - 60FPS Magnetic Lerp Custom Cursor
   - 3D Card Tilt & Dynamic Radial Spotlight Tracker
   - 3D Magnetic Hero Avatar Physics
   - Scroll-Driven Staggered Item Reveals
   - Magnetic Button Physics & AJAX Formspree Handler
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    /* --------------------------------------------------------------------------
       1. UNIVERSAL DUAL-SCROLL & NAVIGATION ENGINE
       Supports desktop container scrolling (#content-wrapper) & mobile (window)
       -------------------------------------------------------------------------- */
    const contentWrapper = document.getElementById('content-wrapper');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content');

    function isMobileLayout() {
        return window.innerWidth <= 900;
    }

    function updateActiveNav(targetId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        if (isMobileLayout()) {
            const navHeight = 64;
            const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - navHeight,
                behavior: 'smooth'
            });
        } else if (contentWrapper) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }

        updateActiveNav(targetId);
    }

    // Expose navigateTo globally for all buttons & links
    window.navigateTo = function(targetId) {
        scrollToSection(targetId);
    };

    // Nav items click listener
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            scrollToSection(target);
        });
    });

    // ScrollSpy with IntersectionObserver
    const observerRoot = isMobileLayout() ? null : contentWrapper;
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                updateActiveNav(activeId);
            }
        });
    }, {
        root: observerRoot,
        threshold: 0.25,
        rootMargin: "-10% 0px -50% 0px"
    });

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });


    /* --------------------------------------------------------------------------
       2. 3D CARD TILT & DYNAMIC RADIAL SPOTLIGHT TRACKER
       -------------------------------------------------------------------------- */
    const spotlightCards = document.querySelectorAll('[data-spotlight]');

    spotlightCards.forEach(card => {
        let bounds;

        function onMouseEnter() {
            bounds = card.getBoundingClientRect();
            card.style.setProperty('--spotlight-opacity', '1');
        }

        function onMouseMove(e) {
            if (!bounds) bounds = card.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;

            card.style.setProperty('--spotlight-x', `${mouseX}px`);
            card.style.setProperty('--spotlight-y', `${mouseY}px`);

            // Subtle 3D tilt calculation for project & stat cards
            if (card.classList.contains('project-card') || card.classList.contains('stat-card')) {
                const centerX = bounds.width / 2;
                const centerY = bounds.height / 2;
                const deltaX = (e.clientX - (bounds.left + centerX)) / centerX;
                const deltaY = (e.clientY - (bounds.top + centerY)) / centerY;

                const tiltX = -deltaY * 5;
                const tiltY = deltaX * 5;

                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
            }
        }

        function onMouseLeave() {
            card.style.setProperty('--spotlight-opacity', '0');
            if (card.classList.contains('project-card') || card.classList.contains('stat-card')) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            }
            bounds = null;
        }

        card.addEventListener('mouseenter', onMouseEnter);
        card.addEventListener('mousemove', onMouseMove);
        card.addEventListener('mouseleave', onMouseLeave);
    });


    /* --------------------------------------------------------------------------
       4. HERO 3D MAGNETIC PORTRAIT PHYSICS
       -------------------------------------------------------------------------- */
    const magnetContainer = document.getElementById('hero-magnet');

    if (magnetContainer && !isTouchDevice) {
        const triggerDistance = 220;
        let isAttracted = false;

        window.addEventListener('mousemove', (e) => {
            const rect = magnetContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distThresholdX = rect.width / 2 + triggerDistance;
            const distThresholdY = rect.height / 2 + triggerDistance;

            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            if (Math.abs(deltaX) < distThresholdX && Math.abs(deltaY) < distThresholdY) {
                if (!isAttracted) {
                    magnetContainer.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
                    isAttracted = true;
                }

                const moveX = deltaX * 0.18;
                const moveY = deltaY * 0.18;
                const rotX = -deltaY * 0.04;
                const rotY = deltaX * 0.04;

                magnetContainer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            } else {
                if (isAttracted) {
                    magnetContainer.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    magnetContainer.style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)';
                    isAttracted = false;
                }
            }
        });
    }


    /* --------------------------------------------------------------------------
       5. MAGNETIC BUTTON PULL MICRO-INTERACTIONS
       -------------------------------------------------------------------------- */
    const magneticButtons = document.querySelectorAll('.magnetic-item');

    if (!isTouchDevice) {
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const btnCenterX = rect.left + rect.width / 2;
                const btnCenterY = rect.top + rect.height / 2;

                const deltaX = (e.clientX - btnCenterX) * 0.22;
                const deltaY = (e.clientY - btnCenterY) * 0.22;

                btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate3d(0px, 0px, 0)';
            });
        });
    }


    /* --------------------------------------------------------------------------
       7. CONTACT FORM AJAX SUBMISSION (Formspree)
       -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Sending... <i class="fas fa-circle-notch fa-spin" style="margin-left: 6px;"></i>';
            submitBtn.disabled = true;

            const existingMsg = contactForm.querySelector('.form-status-msg');
            if (existingMsg) existingMsg.remove();

            const statusMsg = document.createElement('div');
            statusMsg.className = 'form-status-msg';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    statusMsg.innerText = "Thank you! Your message has been sent successfully. I will get back to you soon.";
                    statusMsg.style.background = 'rgba(74, 222, 128, 0.15)';
                    statusMsg.style.border = '1px solid rgba(74, 222, 128, 0.35)';
                    statusMsg.style.color = '#4ade80';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    const errMsg = (data && data.errors) ? data.errors.map(err => err.message).join(', ') : 'Oops! There was a problem submitting your form.';
                    statusMsg.innerText = errMsg;
                    statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
                    statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.35)';
                    statusMsg.style.color = '#ef4444';
                }
            } catch (err) {
                statusMsg.innerText = "Oops! Network error. Please try again later or contact directly on WhatsApp.";
                statusMsg.style.background = 'rgba(239, 68, 68, 0.15)';
                statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.35)';
                statusMsg.style.color = '#ef4444';
            } finally {
                contactForm.appendChild(statusMsg);
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;

                setTimeout(() => {
                    if (statusMsg && statusMsg.parentNode) {
                        statusMsg.remove();
                    }
                }, 6000);
            }
        });
    }


    /* --------------------------------------------------------------------------
       8. SCROLL REVEAL OBSERVER — staggered fade-slide-up
       -------------------------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            root: observerRoot,
            threshold: 0.05,
            rootMargin: '50px 0px 0px 0px'
        });
        revealEls.forEach(el => {
            revealObserver.observe(el);
            // Check if element is already within view on initial load
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }

    /* --------------------------------------------------------------------------
       9. SMOOTH SECTION ENTRANCE
       -------------------------------------------------------------------------- */
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
            }
        });
    }, { 
        root: observerRoot,
        threshold: 0.05 
    });
    sections.forEach(s => sectionObserver.observe(s));


});