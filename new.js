document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("jersey-container");

  fetch("https://fakestoreapi.com/products/category/men's clothing")
    .then((res) => res.json())
    .then((products) => {
      products.forEach((item) => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>$${item.price.toFixed(2)}</p>
          <button>Add to Cart</button>
        `;

        card.querySelector("button").addEventListener("click", () => {
          alert(`Added "${item.title}" to cart!`);
        });

        container.appendChild(card);
      });
    })
    .catch((err) => {
      container.innerHTML = "<p>Failed to load jerseys. Try again later.</p>";
      console.error("Error fetching products:", err);
    });
});
