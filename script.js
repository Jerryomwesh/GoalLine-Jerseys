document.addEventListener("DOMContentLoaded", async () => {
    const jerseyContainer = document.getElementById("jersey-container");
    const cartContainer = document.getElementById("cart-container");
    const searchInput = document.getElementById("search");
    const cart = [];

    let allLeagues = [];
    let currentTeams = [];
    let currentView = "leagues"; // or "teams"
    let lastLeagueName = "";

    // Show loading indicator
    function showLoading(message = "Loading...") {
        jerseyContainer.innerHTML = `<div class="loading-indicator">${message}</div>`;
    }

    // Helper to prepend CORS proxy to TheSportsDB API URLs
    function corsProxy(url) {
        return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }

    // Fetch football leagues from TheSportsDB
    async function fetchLeagues() {
        showLoading("Loading leagues...");
        try {
            const response = await fetch(corsProxy("https://www.thesportsdb.com/api/v1/json/3/all_leagues.php"));
            const data = await response.json();
            // Filter for soccer/football leagues only
            allLeagues = data.leagues.filter(l => l.strSport === "Soccer");
            currentView = "leagues";
            await displayLeagues(allLeagues);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load leagues. Try again later.</p>";
            console.error("Error fetching leagues:", error);
        }
    }

    async function displayLeagues(leagues) {
        jerseyContainer.innerHTML = "<h2>Select a League</h2>";
        // Filter out leagues without a valid idLeague or with missing name
        const validLeagues = leagues.filter(l => l.idLeague && l.strLeague);
        // Find if 'No League' exists
        const noLeague = leagues.find(l => l.strLeague && l.strLeague.trim().toLowerCase() === "no league");
        // Fetch league details for logos
        const leagueCards = await Promise.all(validLeagues.map(async (league) => {
            let logoUrl = '';
            try {
                const res = await fetch(corsProxy(`https://www.thesportsdb.com/api/v1/json/3/lookupleague.php?id=${league.idLeague}`));
                const data = await res.json();
                if (data.leagues && data.leagues[0] && data.leagues[0].strBadge) {
                    logoUrl = data.leagues[0].strBadge;
                }
            } catch (e) { /* fallback to empty */ }
            if (!logoUrl) return null;
            return `
                <div class="jersey-card league-card">
                    <img src="${logoUrl}" alt="${league.strLeague} logo" style="width:60px; height:60px; object-fit:contain; margin-bottom:8px;">
                    <h3>${league.strLeague}</h3>
                    <button class="view-teams-btn" data-league="${league.strLeague}">View Teams</button>
                </div>
            `;
        }));
        const filteredCards = leagueCards.filter(Boolean);
        // Add creative placeholder for 'No League' at the top if it exists
        if (noLeague) {
            filteredCards.unshift(`
                <div class="jersey-card league-card no-league-card">
                    <div style="font-size:48px; margin-bottom:8px;">🏆</div>
                    <h3>No League</h3>
                    <p style="font-size:14px; color:#888;">This is a special league for champions of fun!<br>Pick a real league to get started.</p>
                </div>
            `);
        }
        if (filteredCards.length === 0) {
            jerseyContainer.innerHTML += '<p class="no-results">No leagues found with logos. Please try again later.</p>';
        } else {
            jerseyContainer.innerHTML += filteredCards.join('');
        }
    }

    // Event delegation for league buttons
    jerseyContainer.addEventListener("click", async (event) => {
        if (event.target.classList.contains("view-teams-btn")) {
            const leagueName = event.target.getAttribute("data-league");
            lastLeagueName = leagueName;
            await fetchTeams(leagueName);
        }
    });

    // Fetch teams in a league
    async function fetchTeams(leagueName) {
        showLoading("Loading teams...");
        try {
            const response = await fetch(corsProxy(`https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueName)}`));
            const data = await response.json();
            currentTeams = data.teams || [];
            currentView = "teams";
            displayTeams(currentTeams, leagueName);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load teams. Try again later.</p>";
            console.error("Error fetching teams:", error);
        }
    }

    function displayTeams(teams, leagueName) {
        jerseyContainer.innerHTML = `<h2>${leagueName} Teams</h2>`;
        if (!teams || teams.length === 0) {
            jerseyContainer.innerHTML += '<p class="no-results">No teams found.</p>';
            return;
        }
        teams.forEach(team => {
            const teamCard = document.createElement("div");
            teamCard.classList.add("jersey-card", "team-card");
            teamCard.innerHTML = `
                <h3>${team.strTeam}</h3>
                <img src="${team.strTeamBadge}" alt="Badge of ${team.strTeam} football club" style="width:80px;">
                <button class="view-jersey-btn" data-team="${team.strTeam}">View Jersey</button>
            `;
            jerseyContainer.appendChild(teamCard);
        });
    }

    // Event delegation for team buttons
    jerseyContainer.addEventListener("click", async (event) => {
        if (event.target.classList.contains("view-jersey-btn")) {
            const teamName = event.target.getAttribute("data-team");
            await fetchJersey(teamName);
        }
    });

    // Fetch team details (jersey grid)
    async function fetchJersey(teamName) {
        showLoading("Loading jerseys...");
        try {
            const response = await fetch(corsProxy(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`));
            const data = await response.json();
            displayJerseyGrid(data.teams[0]);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load jerseys. Try again later.</p>";
            console.error("Error fetching jersey grid:", error);
        }
    }

    // Display a grid of available jerseys for a team
    function displayJerseyGrid(team) {
        const jerseys = [
            {
                type: "Home Jersey",
                img: team.strTeamJersey || team.strTeamBadge,
                price: 69.99
            },
            {
                type: "Away Jersey",
                img: team.strTeamJersey2 || team.strTeamBadge,
                price: 74.99
            },
            {
                type: "Third Jersey",
                img: team.strTeamJersey3 || team.strTeamBadge,
                price: 79.99
            }
        ];
        jerseyContainer.innerHTML = `<h2>${team.strTeam} Jerseys</h2>`;
        jerseyContainer.innerHTML += `<div class="jersey-grid">${jerseys.map(j => `
            <div class="jersey-card jersey-type-card">
                <h3>${j.type}</h3>
                <img src="${j.img}" alt="${team.strTeam} ${j.type}" style="width:140px; height:140px; object-fit:contain;">
                <p class="jersey-price">$${j.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-team="${team.strTeam}" data-type="${j.type}" data-img="${j.img}" data-price="${j.price}">Add to Cart</button>
            </div>
        `).join('')}</div>`;
        jerseyContainer.innerHTML += `<button class="back-btn">Back to Teams</button>`;
    }

    // Event delegation for add to cart and back buttons
    jerseyContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart-btn")) {
            const team = event.target.getAttribute("data-team");
            const type = event.target.getAttribute("data-type");
            const img = event.target.getAttribute("data-img");
            const price = parseFloat(event.target.getAttribute("data-price"));
            // Prevent duplicate jerseys in cart (by team+type)
            const alreadyInCart = cart.some(item => item.team === team && item.type === type);
            if (alreadyInCart) {
                alert(`${team} ${type} is already in your cart!`);
                return;
            }
            cart.push({ team, type, img, price });
            renderCart();
            alert(`Added ${team} ${type} to cart!`);
        } else if (event.target.classList.contains("back-btn")) {
            // Go back to teams (assume last league selected)
            if (lastLeagueName) {
                fetchTeams(lastLeagueName);
            } else {
                fetchLeagues();
            }
        }
    });

    // Update cart rendering to show jersey type and price
    function renderCart() {
        // Add or remove 'empty' class based on cart state
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

    // Event listener for removing items from cart
    cartContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-from-cart-btn")) {
            const index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            renderCart();
        }
    });

    // Event listener for checkout button
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

    // Search functionality
    searchInput.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        if (currentView === "leagues") {
            const filteredLeagues = allLeagues.filter(l => l.strLeague.toLowerCase().includes(query));
            displayLeagues(filteredLeagues);
        } else if (currentView === "teams") {
            const filteredTeams = currentTeams.filter(t => t.strTeam.toLowerCase().includes(query));
            displayTeams(filteredTeams, lastLeagueName);
        }
    });

    // Initial fetch
    fetchLeagues();
    renderCart(); // Ensure cart is rendered and styled on page load
});
