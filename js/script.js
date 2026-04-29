document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Dynamics
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .feature-card, .premium-table tr, .footer-col, h1, h2, h3, .hero-content, form, [style*="background: var(--color-gray-50)"], .brand-logo-card, .industry-card');
    revealElements.forEach(el => {
        // Only add 'reveal' if it doesn't already have a reveal class
        if (!el.classList.contains('reveal-left') && !el.classList.contains('reveal-right') && !el.classList.contains('reveal-scale')) {
            el.classList.add('reveal');
        }
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 4. Set active nav link based on current page
    const currentLocation = location.href;
    const menuItem = document.querySelectorAll('.nav-link');
    menuItem.forEach(item => {
        if (item.href === currentLocation) item.classList.add("active");
    });

    // 5. Page Transitions
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.includes('products.html')) { 
                e.preventDefault();
                document.body.style.transition = 'opacity 0.3s ease';
                document.body.style.opacity = '0';
                setTimeout(() => window.location.href = href, 300);
            }
        });
    });

    // 6. Brands & Industries Interaction
    initBrandInteractions();
    initIndustryInteractions();

    // 7. Statistics Counter (Existing)
    initCounters();
});

function initBrandInteractions() {
    const brandCards = document.querySelectorAll('[data-brand]');
    brandCards.forEach(card => {
        card.classList.add('brand-logo-card');
        
        card.addEventListener('click', (e) => {
            const brand = card.getAttribute('data-brand');
            const url = `products.html?brand=${brand}`;
            const brandName = card.querySelector('img').getAttribute('alt');
            showBrandModal(brandName, url);
        });
    });
}

function showBrandModal(name, url) {
    let modal = document.getElementById('globalModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'globalModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="grid-template-columns: 1fr; padding: 3rem; text-align: center;">
                <button class="modal-close">&times;</button>
                <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--color-primary);">${name}</h2>
                <p style="font-size: 1.2rem; color: var(--color-steel); margin-bottom: 2.5rem;">Explore our comprehensive range of high-performance ${name} products and engineering solutions.</p>
                <div style="display: flex; gap: 1.5rem; justify-content: center;">
                    <a href="${url || 'products.html'}" class="btn btn-primary" style="padding: 1rem 2.5rem;">View Products</a>
                    <button class="btn btn-outline modal-close-btn" style="padding: 1rem 2.5rem;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('active'));
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });
    } else {
        modal.querySelector('h2').textContent = name;
        modal.querySelector('a').href = url || 'products.html';
    }
    
    setTimeout(() => modal.classList.add('active'), 10);
}

function initIndustryInteractions() {
    const industryCards = document.querySelectorAll('section:nth-of-type(2) .container > div > div');
    industryCards.forEach(card => {
        const infoDiv = card.querySelector('div[style*="padding"]');
        if (infoDiv) {
            card.classList.add('industry-card');
            infoDiv.classList.add('industry-info');
        }
    });
}

function initCounters() {
    const statsSection = document.getElementById('stats-section');
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;

    if (statsSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                });
            }
        }, { threshold: 0.5 });
        observer.observe(statsSection);
    }
}
