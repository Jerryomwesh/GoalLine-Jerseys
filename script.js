// Main script for GoalLine Jerseys
// Handles team display, jersey selection, and cart logic

document.addEventListener("DOMContentLoaded", async () => {
    const jerseyContainer = document.getElementById("jersey-container");
    const cartContainer = document.getElementById("cart-container");
    const searchInput = document.getElementById("search");
    const cart = [];

    let currentTeams = [];
    let lastLeagueName = "";

    // Show loading spinner with a custom message
    function showLoading(message = "Loading...") {
        jerseyContainer.innerHTML = `<div class="loading-indicator">${message}</div>`;
    }

    // Add CORS proxy to API URLs
    function corsProxy(url) {
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }

    // Fetch JSON safely and handle errors
    async function safeFetchJson(url) {
        const response = await fetch(url);
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Could not load data. Please try again later.');
        }
    }

    // Display teams for the selected league (EPL only)
    async function displayTeams(teams, leagueName) {
        jerseyContainer.innerHTML = '';
        if (!teams || teams.length === 0) {
            jerseyContainer.innerHTML += '<p class="no-results">No teams found.</p>';
            return;
        }
        // Get badge or initials for each team
        const teamDetails = await Promise.all(teams.map(async team => {
            try {
                const data = await safeFetchJson(corsProxy(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(team.strTeam)}`));
                return data.teams && data.teams[0] ? data.teams[0] : team;
            } catch {
                return team;
            }
        }));
        teamDetails.forEach(team => {
            const teamCard = document.createElement("div");
            teamCard.classList.add("jersey-card", "team-card");
            let badge = team.strTeamBadge;
            if (!badge || typeof badge !== 'string' || !badge.startsWith('http')) {
                // Show initials in a colored circle if no badge
                const initials = getTeamInitials(team.strTeam);
                const color = getTeamColor(team.strTeam);
                badge = `<div style="width:60px;height:60px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:1.5em;font-weight:bold;color:#fff;margin:0 auto 8px auto;">${initials}</div>`;
                teamCard.innerHTML = `
                    ${badge}
                    <h3>${team.strTeam}</h3>
                    <button class="view-jersey-btn" data-team="${team.strTeam}">View Jersey</button>
                `;
            } else {
                teamCard.innerHTML = `
                    <img src="${badge}" alt="${team.strTeam} logo" style="width:60px; height:60px; object-fit:contain; margin-bottom:8px;">
                    <h3>${team.strTeam}</h3>
                    <button class="view-jersey-btn" data-team="${team.strTeam}">View Jersey</button>
                `;
            }
            jerseyContainer.appendChild(teamCard);
        });
    }

    // Get up to 3 initials from the team name
    function getTeamInitials(name) {
        return name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    }

    // Pick a color for team initials
    function getTeamColor(name) {
        const colors = [
            '#e74c3c', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085', '#d35400', '#2c3e50', '#c0392b', '#7f8c8d'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    // Event: show jerseys for a team
    jerseyContainer.addEventListener("click", async (event) => {
        if (event.target.classList.contains("view-jersey-btn")) {
            const teamName = event.target.getAttribute("data-team");
            await fetchJersey(teamName);
        }
    });

    // Fetch and display jerseys for a team
    async function fetchJersey(teamName) {
        showLoading("Loading jerseys...");
        try {
            const data = await safeFetchJson(corsProxy(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`));
            displayJerseyGrid(data.teams[0]);
        } catch (error) {
            jerseyContainer.innerHTML = `<p>Failed to load jerseys. ${error.message || 'Try again later.'}</p>`;
        }
    }

    // Normalize team names for jersey image lookup
    function normalizeTeamName(name) {
        return name.trim().toLowerCase().replace(/\s+/g, '');
    }

    let jerseyImages = {};
    let normalizedJerseyImages = {};
    let jerseyImagesLoaded = false;
    let jerseyImagesLoadPromise = fetch('jerseyImages.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch jerseyImages.json');
            return response.json();
        })
        .then(data => {
            jerseyImages = data;
            Object.keys(jerseyImages).forEach(team => {
                normalizedJerseyImages[normalizeTeamName(team)] = jerseyImages[team];
            });
            jerseyImagesLoaded = true;
        })
        .catch(() => {
            jerseyImagesLoaded = false;
        });

    // Show home and away jerseys for a team
    async function displayJerseyGrid(team) {
        if (!jerseyImagesLoaded) {
            try {
                await jerseyImagesLoadPromise;
            } catch (e) {}
        }
        const normName = normalizeTeamName(team.strTeam);
        let jerseys;
        if (normalizedJerseyImages[normName]) {
            jerseys = [
                {
                    type: "Home Jersey",
                    img: normalizedJerseyImages[normName]["Home Jersey"] || '',
                    price: 69.99
                },
                {
                    type: "Away Jersey",
                    img: normalizedJerseyImages[normName]["Away Jersey"] || '',
                    price: 74.99
                }
            ];
        } else {
            jerseys = [
                {
                    type: "Home Jersey",
                    img: team.strTeamJersey || '',
                    price: 69.99
                },
                {
                    type: "Away Jersey",
                    img: team.strTeamJersey2 || '',
                    price: 74.99
                }
            ];
        }
        jerseyContainer.innerHTML = `<h2>${team.strTeam} Jerseys</h2>`;
        jerseyContainer.innerHTML += `<div class="jersey-grid">${jerseys.map(j => `
            <div class="jersey-card jersey-type-card">
                <h3>${j.type}</h3>
                ${j.img ? `<img src="${j.img}" alt="${team.strTeam} ${j.type}" style="width:140px; height:140px; object-fit:contain; background:#f7f7f7; border-radius:12px; box-shadow:0 2px 8px #0001; margin-bottom:10px;">` : `<div style='width:140px;height:140px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:12px;color:#bbb;font-size:2em;margin-bottom:10px;'>No Image</div>`}
                <p class="jersey-price">$${j.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-team="${team.strTeam}" data-type="${j.type}" data-img="${j.img}" data-price="${j.price}">Add to Cart</button>
            </div>
        `).join('')}</div>`;
        jerseyContainer.innerHTML += `
            <div style="text-align:center;margin-top:18px;">
                <button class="back-btn" style="padding:7px 18px;font-size:1em;border-radius:8px;background:#2980b9;color:#fff;border:none;box-shadow:0 2px 8px #0001;cursor:pointer;transition:background 0.2s;display:inline-flex;align-items:center;gap:8px;">
                    <span style="font-size:1.1em;">←</span> Back to Teams
                </button>
            </div>
        `;
    }

    // Add to cart and back button logic
    jerseyContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart-btn")) {
            const team = event.target.getAttribute("data-team");
            const type = event.target.getAttribute("data-type");
            const img = event.target.getAttribute("data-img");
            const price = parseFloat(event.target.getAttribute("data-price"));
            // Prevent duplicate jerseys in cart
            const alreadyInCart = cart.some(item => item.team === team && item.type === type);
            if (alreadyInCart) {
                alert(`${team} ${type} is already in your cart!`);
                return;
            }
            cart.push({ team, type, img, price });
            renderCart();
            alert(`Added ${team} ${type} to cart!`);
        } else if (event.target.classList.contains("back-btn")) {
            fetchEPLTeams();
        }
    });

    // Show cart items and total
    function renderCart() {
        if (cart.length === 0) {
            cartContainer.classList.add('empty');
        } else {
            cartContainer.classList.remove('empty');
        }
        cartContainer.innerHTML = `<h2>Cart <span class="cart-count-badge">${cart.length}</span></h2>`;
        if (cart.length === 0) {
            cartContainer.innerHTML += `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <div class="cart-empty-msg">Your cart is empty.<br><span class="cart-empty-sub">Start shopping to add jerseys!</span></div>
                </div>
            `;
            return;
        }
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const cartItem = document.createElement("div");
            cartItem.classList.add("jersey-item");
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.team} ${item.type} in cart" style="width:50px;">
                <span>${item.team} <strong>${item.type}</strong></span>
                <span class="jersey-price">$${item.price.toFixed(2)}</span>
                <button class="remove-from-cart-btn" data-index="${index}">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        });
        cartContainer.innerHTML += `<div class="cart-total"><strong>Total:</strong> $${total.toFixed(2)}</div>`;
        cartContainer.innerHTML += `<button class="checkout-btn">Checkout</button>`;
    }

    // Remove item from cart
    cartContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-from-cart-btn")) {
            const index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            renderCart();
        }
    });

    // Checkout button logic
    cartContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("checkout-btn")) {
            if (cart.length === 0) return;
            let summary = cart.map(item => `${item.team} ${item.type} - $${item.price.toFixed(2)}`).join('\n');
            let total = cart.reduce((sum, item) => sum + item.price, 0);
            alert(`Thank you for your purchase!\n\n${summary}\n\nTotal: $${total.toFixed(2)}`);
            cart.length = 0;
            renderCart();
        }
    });

    // Search teams as you type
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        const filteredTeams = currentTeams.filter(t => t.strTeam.toLowerCase().includes(query));
        displayTeams(filteredTeams, lastLeagueName);
    });

    // Fetch only English Premier League teams
    async function fetchEPLTeams() {
        showLoading("Loading Premier League teams...");
        try {
            const data = await safeFetchJson(corsProxy("https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English%20Premier%20League"));
            currentTeams = data.teams || [];
            displayTeams(currentTeams, "English Premier League");
        } catch (error) {
            jerseyContainer.innerHTML = `<p>Failed to load EPL teams. ${error.message || 'Try again later.'}</p>`;
        }
    }

    // Initial load: show EPL teams and cart
    fetchEPLTeams();
    renderCart();
});
