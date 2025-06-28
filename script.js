document.addEventListener("DOMContentLoaded", async () => {
    const jerseyContainer = document.getElementById("jersey-container");
    const cartContainer = document.getElementById("cart-container");
    const cart = [];

    // Show loading indicator
    function showLoading(message = "Loading...") {
        jerseyContainer.innerHTML = `<div class="loading-indicator">${message}</div>`;
    }

    // Fetch football leagues from TheSportsDB
    async function fetchLeagues() {
        showLoading("Loading leagues...");
        try {
            const response = await fetch("https://www.thesportsdb.com/api/v1/json/3/all_leagues.php");
            const data = await response.json();
            // Filter for soccer/football leagues only
            const footballLeagues = data.leagues.filter(l => l.strSport === "Soccer");
            displayLeagues(footballLeagues);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load leagues. Try again later.</p>";
            console.error("Error fetching leagues:", error);
        }
    }

    function displayLeagues(leagues) {
        jerseyContainer.innerHTML = "<h2>Select a League</h2>";
        leagues.forEach(league => {
            const leagueCard = document.createElement("div");
            leagueCard.classList.add("jersey-card", "league-card");
            leagueCard.innerHTML = `
                <h3>${league.strLeague}</h3>
                <button class="view-teams-btn" data-league="${league.strLeague}">View Teams</button>
            `;
            jerseyContainer.appendChild(leagueCard);
        });
    }

    // Event delegation for league buttons
    jerseyContainer.addEventListener("click", async (event) => {
        if (event.target.classList.contains("view-teams-btn")) {
            const leagueName = event.target.getAttribute("data-league");
            await fetchTeams(leagueName);
        }
    });

    // Fetch teams in a league
    async function fetchTeams(leagueName) {
        showLoading("Loading teams...");
        try {
            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueName)}`);
            const data = await response.json();
            displayTeams(data.teams, leagueName);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load teams. Try again later.</p>";
            console.error("Error fetching teams:", error);
        }
    }

    function displayTeams(teams, leagueName) {
        jerseyContainer.innerHTML = `<h2>${leagueName} Teams</h2>`;
        teams.forEach(team => {
            const teamCard = document.createElement("div");
            teamCard.classList.add("jersey-card", "team-card");
            teamCard.innerHTML = `
                <h3>${team.strTeam}</h3>
                <img src="${team.strTeamBadge}" alt="${team.strTeam} badge" style="width:80px;">
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

    // Fetch team details (jersey)
    async function fetchJersey(teamName) {
        showLoading("Loading jersey...");
        try {
            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
            const data = await response.json();
            displayJersey(data.teams[0]);
        } catch (error) {
            jerseyContainer.innerHTML = "<p>Failed to load jersey. Try again later.</p>";
            console.error("Error fetching jersey:", error);
        }
    }

    function displayJersey(team) {
        jerseyContainer.innerHTML = `
            <h2>${team.strTeam} Jersey</h2>
            <img src="${team.strTeamJersey || team.strTeamBadge}" alt="${team.strTeam} jersey" style="width:200px;">
            <p>${team.strDescriptionEN ? team.strDescriptionEN.substring(0, 200) + '...' : ''}</p>
            <button class="add-to-cart-btn" data-team="${team.strTeam}" data-img="${team.strTeamJersey || team.strTeamBadge}">Add to Cart</button>
            <button class="back-btn">Back to Teams</button>
        `;
    }

    // Event delegation for add to cart and back buttons
    jerseyContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart-btn")) {
            const team = event.target.getAttribute("data-team");
            const img = event.target.getAttribute("data-img");
            cart.push({ team, img });
            renderCart();
            alert(`Added ${team} jersey to cart!`);
        } else if (event.target.classList.contains("back-btn")) {
            // Go back to teams (assume last league selected)
            const lastLeague = document.querySelector("h2").textContent.replace(" Teams", "");
            fetchTeams(lastLeague);
        }
    });

    function renderCart() {
        cartContainer.innerHTML = '<h2>Cart</h2>';
        if (cart.length === 0) {
            cartContainer.innerHTML += '<p>Your cart is empty.</p>';
            return;
        }
        cart.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("jersey-item");
            cartItem.innerHTML = `
                <img src="${item.img}" alt="${item.team} jersey" style="width:50px;">
                <span>${item.team} Jersey</span>
            `;
            cartContainer.appendChild(cartItem);
        });
    }

    // Initial fetch
    fetchLeagues();
});
