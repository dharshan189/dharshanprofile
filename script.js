document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content'); // Using existing class as selector
    const contentWrapper = document.querySelector('.content-wrapper');

    // Function to handle navigation click
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Add click event listeners to nav items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            scrollToSection(targetId);
        });
    });

    // Expose navigateTo function globally for buttons (like "Contact Me" in Hero)
    window.navigateTo = (targetId) => {
        scrollToSection(targetId);
    };

    /* 
    // Scroll Spy DISABLED based on user request ("layout elements should not change while scrolling")
    const observerOptions = {
        root: contentWrapper,
        threshold: 0.3,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all nav items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to the corresponding nav item
                const id = entry.target.id;
                const activeNav = document.querySelector(`.nav-item[data-target="${id}"]`);
                if (activeNav) {
                    activeNav.classList.add('active');
                }
                
                // Optional: Add fade-in animation
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
    */

    // --- FORM HANDLING ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default page reload/redirect

            const formData = new FormData(contactForm);
            const statusMessage = document.createElement('div');
            statusMessage.className = 'form-message';

            // Remove existing message if any
            const existingMessage = contactForm.querySelector('.form-message');
            if (existingMessage) existingMessage.remove();

            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    statusMessage.innerText = "Thanks for your message! I'll get back to you soon.";
                    statusMessage.style.color = "#4ade80"; // Success Green
                    statusMessage.style.background = "rgba(74, 222, 128, 0.1)";
                    statusMessage.style.border = "1px solid rgba(74, 222, 128, 0.2)";

                    contactForm.reset(); // Clear the form fields
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        statusMessage.innerText = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        statusMessage.innerText = "Oops! There was a problem submitting your form.";
                    }
                    statusMessage.style.color = "#ef4444"; // Error Red
                    statusMessage.style.background = "rgba(239, 68, 68, 0.1)";
                    statusMessage.style.border = "1px solid rgba(239, 68, 68, 0.2)";
                    console.error('Formspree Error:', data);
                }
            } catch (error) {
                statusMessage.innerText = "Oops! There was a problem submitting your form.";
                statusMessage.style.color = "#ef4444";
                statusMessage.style.background = "rgba(239, 68, 68, 0.1)";
                statusMessage.style.border = "1px solid rgba(239, 68, 68, 0.2)";
            } finally {
                contactForm.appendChild(statusMessage);
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;

                // Clear message after 5 seconds
                setTimeout(() => {
                    statusMessage.remove();
                }, 5000);
            }
        });
    }
});
