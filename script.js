document.addEventListener("DOMContentLoaded", async () => {
    const jerseyContainer = document.getElementById("jersey-container");
    const cartContainer = document.getElementById("cart-container");
    const cart = []; // Cart array to store selected items

    const BASE_URL = "competitions.json";

    async function fetchCompetitions() {
        try {
            console.log("Fetching competitions from:", BASE_URL);
            const response = await fetch(BASE_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Competitions data:", data);
            displayCompetitions(data);
        } catch (error) {
            console.error("Error fetching competitions:", error);
        }
    }

    function displayCompetitions(competitions) {
        jerseyContainer.innerHTML = "";

        competitions.forEach(competition => {
            const competitionCard = document.createElement("div");
            competitionCard.classList.add("jersey-card");
            competitionCard.innerHTML = `
                <h3>${competition.name}</h3>
                <p>Area: ${competition.area.name}</p>
                <button class="view-teams-btn" data-competition='${JSON.stringify(competition)}'>View Teams</button>
            `;
            jerseyContainer.appendChild(competitionCard);
        });

        // Use event delegation for buttons
        jerseyContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("view-teams-btn")) {
                const competition = JSON.parse(event.target.getAttribute("data-competition"));
                displayTeams(competition.teams);
            }
        });
    }

    function displayTeams(teams) {
        jerseyContainer.innerHTML = "";

        teams.forEach(team => {
            const teamCard = document.createElement("div");
            teamCard.classList.add("jersey-card");
            teamCard.innerHTML = `
                <h3>${team.name}</h3>
                <button class="view-jerseys-btn" data-team='${JSON.stringify(team)}'>View Jerseys</button>
            `;
            jerseyContainer.appendChild(teamCard);
        });

        // Use event delegation for buttons
        jerseyContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("view-jerseys-btn")) {
                const team = JSON.parse(event.target.getAttribute("data-team"));
                displayJerseys(team.jerseys);
            }
        });
    }

    function displayJerseys(jerseys) {
        jerseyContainer.innerHTML = "";

        jerseys.forEach(jersey => {
            const jerseyCard = document.createElement("div");
            jerseyCard.classList.add("jersey-item");
            jerseyCard.innerHTML = `
                <img src="${jersey.image}" alt="${jersey.type}">
                <h4>${jersey.type} Jersey</h4>
                <p>Price: $${jersey.price}</p>
                <button class="add-to-cart-btn" data-jersey='${JSON.stringify(jersey)}'>Add to Cart</button>
            `;
            jerseyContainer.appendChild(jerseyCard);
        });

        // Use event delegation for buttons
        jerseyContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("add-to-cart-btn")) {
                const jersey = JSON.parse(event.target.getAttribute("data-jersey"));
                addToCart(jersey);
            }
        });
    }

    function addToCart(jersey) {
        cart.push(jersey);
        alert(`${jersey.type} jersey added to cart!`);
        displayCart();
    }

    function displayCart() {
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        let totalPrice = 0;

        cart.forEach((item, index) => {
            totalPrice += item.price;
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <p>${item.type} Jersey - $${item.price}</p>
                <button class="remove-from-cart-btn" data-index="${index}">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        });

        const totalPriceElement = document.createElement("p");
        totalPriceElement.innerHTML = `<strong>Total Price: $${totalPrice}</strong>`;
        cartContainer.appendChild(totalPriceElement);

        const checkoutButton = document.createElement("button");
        checkoutButton.textContent = "Proceed to Checkout";
        checkoutButton.classList.add("checkout-btn");
        checkoutButton.addEventListener("click", displayCheckoutForm);
        cartContainer.appendChild(checkoutButton);

        // Use event delegation for buttons
        cartContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-from-cart-btn")) {
                const index = event.target.getAttribute("data-index");
                cart.splice(index, 1);
                displayCart();
            }
        });
    }

    function displayCheckoutForm() {
        jerseyContainer.innerHTML = `
            <h2>Checkout</h2>
            <form id="checkout-form">
                <label for="name">Name:</label>
                <input type="text" id="name" required>
                <label for="address">Address:</label>
                <input type="text" id="address" required>
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                <button type="submit">Place Order</button>
            </form>
        `;

        const checkoutForm = document.getElementById("checkout-form");
        checkoutForm.addEventListener("submit", (event) => {
            event.preventDefault();
            alert("Order placed successfully! Thank you for shopping.");
            cart.length = 0;
            displayCart();
            fetchCompetitions(); // Return to main selection screen
        });
    }

    fetchCompetitions();
});
