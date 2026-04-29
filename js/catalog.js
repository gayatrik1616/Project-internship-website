document.addEventListener('DOMContentLoaded', () => {
    let allBearings = [];
    let filteredBearings = [];
    let currentPage = 1;
    const itemsPerPage = 50;

    // DOM Elements
    const tbody = document.getElementById('catalogTbody');
    const resultCount = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const brandRadios = document.querySelectorAll('input[name="brand"]');
    
    // Check for brand parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand');
    if (brandParam && brandRadios) {
        brandRadios.forEach(radio => {
            if (radio.value.toLowerCase() === brandParam.toLowerCase()) {
                radio.checked = true;
            }
        });
    }

    // Modal Elements
    const modal = document.getElementById('detailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Fetch Data from multiple sources
    const brandsToLoad = [
        { id: 'gamet', name: 'Gamet' },
        { id: 'dodge', name: 'Dodge' },
        { id: 'timken', name: 'Timken' },
        { id: 'rexnord', name: 'Rexnord' }
    ];

    const loadPromises = brandsToLoad.map(brand => 
        fetch(`./data/${brand.id}_bearings.json`)
            .then(response => {
                if (!response.ok) return [];
                return response.json();
            })
            .then(data => data.map(b => ({ ...b, brand: brand.name })))
            .catch(error => {
                console.error(`Error loading ${brand.name} data:`, error);
                return [];
            })
    );

    let searchTimeout;

    Promise.all(loadPromises).then(results => {
        allBearings = results.flat();
        applyFilters(); // Initial render
    });

    // Smart Search with Debounce
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                applyFilters();
            }, 150);
        });
    }

    if (brandRadios) {
        brandRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                currentPage = 1;
                showSkeletons();
                setTimeout(applyFilters, 300);
            });
        });
    }

    function showSkeletons() {
        if (!tbody) return;
        tbody.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const tr = document.createElement('tr');
            tr.className = 'skeleton-row';
            tr.innerHTML = '<td colspan="8"></td>';
            tbody.appendChild(tr);
        }
    }


    // Render Table Function
    function renderTable() {
        if (!tbody) return;
        
        // Pagination transition: Fade out old data
        tbody.style.opacity = '0';
        
        setTimeout(() => {
            tbody.innerHTML = '';
            
            const totalItems = filteredBearings.length;
            if(resultCount) resultCount.textContent = totalItems.toLocaleString();

            if (totalItems === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="8" style="text-align:center; padding:5rem; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.2;"><i class="fa-solid fa-box-open"></i></div>
                    No products found for this brand or search criteria.
                </td>`;
                tbody.appendChild(tr);
                tbody.style.opacity = '1';
                renderPagination(0);
                return;
            }

            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
            const pageData = filteredBearings.slice(startIndex, endIndex);

            const fragment = document.createDocumentFragment();

            pageData.forEach((bearing, index) => {
                const tr = document.createElement('tr');
                tr.className = 'table-row-animate';
                tr.style.animationDelay = `${index * 30}ms`; // Staggered reveal
                
                // Map JSON properties to columns
                const partNo = bearing.partNo || '-';
                const bore = bearing.bore || '-';
                const od = bearing.od || '-';
                const width = bearing.width || '-';
                const cLoad = bearing.cLoad || '-';
                const c0Load = bearing.c0Load || '-';
                const mass = bearing.weight || '-';

                const loadUnit = bearing.brand === 'Dodge' ? 'kN' : 'N';

                const email = "internationalteam@indiansales.in";
                const subject = encodeURIComponent(`Inquiry for ${bearing.brand} Bearing: ${partNo}`);
                const body = encodeURIComponent(
                    `Hello Indian Sales Team,\n\n` +
                    `I am interested in the following product:\n` +
                    `Part Number: ${partNo}\n` +
                    `Brand: ${bearing.brand}\n` +
                    `Specifications:\n` +
                    `- Bore (d): ${bore} mm\n` +
                    `- OD (D): ${od} mm\n` +
                    `- Width (B): ${width} mm\n\n` +
                    `Please provide a quote and lead time.\n\n` +
                    `Thank you.`
                );
                const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

                const actionCell = `<a href="javascript:void(0)" class="btn-quote part-number-click" data-index="${startIndex + index}">Details</a>`;




                tr.innerHTML = `
                    <td><strong class="part-number-click" data-index="${startIndex + index}" style="cursor:pointer;">${partNo}</strong></td>
                    <td>${bore} mm</td>
                    <td>${od} mm</td>
                    <td>${width} mm</td>
                    <td>${cLoad} ${loadUnit}</td>
                    <td>${c0Load} ${loadUnit}</td>
                    <td>${mass} kg</td>
                    <td>
                        ${actionCell}
                    </td>
                `;
                fragment.appendChild(tr);
            });

            tbody.appendChild(fragment);
            tbody.style.opacity = '1';
            renderPagination(totalPages);
        }, 10);
    }

    function animateCount(target) {
        if (!resultCount) return;
        const start = parseInt(resultCount.textContent.replace(/,/g, '')) || 0;
        const duration = 400;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (target - start) * progress);
            resultCount.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // Render Pagination
    function renderPagination(totalPages) {
        const paginations = document.querySelectorAll('.pagination-controls');
        
        paginations.forEach(container => {
            container.innerHTML = '';
            
            if (totalPages <= 1) return;

            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                    scrollToTop();
                }
            });

            const info = document.createElement('span');
            info.className = 'pagination-info';
            info.textContent = `Page ${currentPage} of ${totalPages}`;

            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                    scrollToTop();
                }
            });

            container.appendChild(prevBtn);
            container.appendChild(info);
            container.appendChild(nextBtn);
        });
    }

    function scrollToTop() {
        const target = document.querySelector('.results-panel');
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }

    // Filtering Logic
    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedBrand = document.querySelector('input[name="brand"]:checked').value;
        
        // Advanced Dimension Search (e.g., 20x40x12)
        const dimMatch = query.match(/(\d+\.?\d*)\s*[x\*]\s*(\d+\.?\d*)\s*(?:[x\*]\s*(\d+\.?\d*))?/);

        filteredBearings = allBearings.filter(b => {
            // Brand Check
            if (b.brand !== selectedBrand) return false;

            if (!query) return true;

            // 1. If it looks like dimensions, search by bore/od/width
            if (dimMatch) {
                const searchBore = dimMatch[1];
                const searchOd = dimMatch[2];
                const searchWidth = dimMatch[3];

                let match = true;
                if (searchBore && !String(b.bore).startsWith(searchBore)) match = false;
                if (match && searchOd && !String(b.od).startsWith(searchOd)) match = false;
                if (match && searchWidth && !String(b.width).startsWith(searchWidth)) match = false;
                
                if (match) return true;
            }

            // 2. Numeric search for specific values (Bore, OD, Width, Load Rating, or Mass)
            if (!isNaN(query)) {
                const num = parseFloat(query);
                if (b.bore === num || b.od === num || b.width === num || b.cLoad === num || b.weight === num) return true;
            }


            // 3. Default search across Part No and Type
            return String(b.partNo).toLowerCase().includes(query) || 
                   String(b.type).toLowerCase().includes(query);
        });

        animateCount(filteredBearings.length);
        renderTable();
    }


    // Event Listeners
    if(searchInput) searchInput.addEventListener('input', applyFilters);
    brandRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    });

    // Event Delegation for Table Clicks
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const partClick = e.target.closest('.part-number-click');

            if (partClick) {
                const index = partClick.getAttribute('data-index');
                const bearing = filteredBearings[index];
                if (bearing) openModal(bearing);
            }
        });
    }

    function openModal(bearing) {
        if(!modal) return;
        
        const loadUnit = bearing.brand === 'Dodge' ? 'kN' : 'N';

        document.getElementById('modalPartNo').textContent = bearing.partNo || 'Unknown Part';
        document.getElementById('modalBore').textContent = bearing.bore || '--';
        document.getElementById('modalOd').textContent = bearing.od || '--';
        document.getElementById('modalWidth').textContent = bearing.width || '--';
        document.getElementById('modalMass').textContent = bearing.weight || '--';
        
        document.getElementById('modalCLoad').textContent = bearing.cLoad || '--';
        document.getElementById('modalC0Load').textContent = bearing.c0Load || '--';
        document.getElementById('modalType').textContent = bearing.type || bearing.brand + ' Bearing';

        // Update units in modal
        const cLoadSpan = document.getElementById('modalCLoad');
        const c0LoadSpan = document.getElementById('modalC0Load');
        if (cLoadSpan && cLoadSpan.nextSibling) {
            cLoadSpan.nextSibling.textContent = ` ${loadUnit}`;
        }
        if (c0LoadSpan && c0LoadSpan.nextSibling) {
            c0LoadSpan.nextSibling.textContent = ` ${loadUnit}`;
        }

        // Update Request Quote button in modal
        const modalQuoteBtn = modal.querySelector('.btn-primary-modal');

        if (modalQuoteBtn) {
            const email = "internationalteam@indiansales.in";
            const subject = encodeURIComponent(`Inquiry for ${bearing.brand} Bearing: ${bearing.partNo}`);
            const body = encodeURIComponent(
                `Hello Indian Sales Team,\n\n` +
                `I am interested in the following product:\n` +
                `Part Number: ${bearing.partNo}\n` +
                `Brand: ${bearing.brand}\n` +
                `Specifications:\n` +
                `- Bore (d): ${bearing.bore} mm\n` +
                `- OD (D): ${bearing.od} mm\n` +
                `- Width (B): ${bearing.width} mm\n\n` +
                `Please provide a quote and lead time.\n\n` +
                `Thank you.`
            );
            modalQuoteBtn.href = `mailto:${email}?subject=${subject}&body=${body}`;
        }
        
        modal.classList.add('active');
    }


    function closeModal() {
        if(modal) modal.classList.remove('active');
    }


    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});

