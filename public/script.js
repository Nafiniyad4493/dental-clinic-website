// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Sticky Navbar & Active Link Update on Scroll
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section, header');

window.addEventListener('scroll', () => {
    // Nav bar style change
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active link update
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Scroll Reveal Animations
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    reveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// Form Submission logic pointing to real Node.js Backend
const bookingForm = document.getElementById('bookingForm');
const formMsg = document.querySelector('.form-msg');

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable button to prevent double submit
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = {
            name: document.getElementById('name') ? document.getElementById('name').value : '',
            phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
            service: document.getElementById('service') ? document.getElementById('service').value : '',
            date: document.getElementById('date') ? document.getElementById('date').value : '',
            time: document.getElementById('time') ? document.getElementById('time').value : '',
            message: document.getElementById('message') ? document.getElementById('message').value : ''
        };

        // Real API call
        fetch('/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (formMsg) {
                    formMsg.innerText = data.message + ' Redirecting to WhatsApp...';
                    formMsg.classList.remove('d-none');
                    formMsg.style.color = '#2ecc71'; // Success color
                }

                // Prepare WhatsApp Message
                const waNumber = "<MY_NUMBER>";
                const waMessage = `Hello Doctor, I would like to book an appointment.

Name: ${formData.name}
Phone: ${formData.phone}
Service: ${formData.service}
Date: ${formData.date}
Time: ${formData.time}
Message: ${formData.message}

Please confirm my booking.`;

                const encodedMessage = encodeURIComponent(waMessage);
                const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

                // Redirect user after showing success
                setTimeout(() => {
                    try {
                        const newWindow = window.open(waUrl, '_blank');
                        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                            // Popup blocked, fallback to direct redirect
                            window.location.href = waUrl;
                        }
                        bookingForm.reset();
                        if (formMsg) {
                            formMsg.innerText = 'Booking submitted successfully.';
                            setTimeout(() => { formMsg.classList.add('d-none'); }, 3000);
                        }
                    } catch (e) {
                        // Fallback
                        console.error('WhatsApp redirect failed:', e);
                        bookingForm.reset();
                        if (formMsg) {
                            formMsg.innerText = 'Booking submitted successfully.';
                            setTimeout(() => { formMsg.classList.add('d-none'); }, 5000);
                        }
                    }
                }, 1500);

            } else {
                throw new Error(data.message || 'Error submitting booking');
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            if (formMsg) {
                formMsg.innerText = error.message;
                formMsg.classList.remove('d-none');
                formMsg.style.color = '#e74c3c'; // Error color
            }
        })
        .finally(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    });
}
