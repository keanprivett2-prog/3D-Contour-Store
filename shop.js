// =====================================
// Firebase
// =====================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =====================================
// Page Elements
// =====================================

const productGrid =
    document.getElementById("productGrid");

const productCount =
    document.getElementById("productCount");

const currentYear =
    document.getElementById("currentYear");

const cartButton =
    document.getElementById("cartButton");

    

    let allProducts = [];

    const productSearch =
    document.getElementById("productSearch");

    const categoryFilter =
    document.getElementById("categoryFilter");


// =====================================
// Footer Year
// =====================================

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}


// =====================================
// Load Products From Firestore
// =====================================


async function loadProducts() {

    try {

        const productsQuery =
            query(
                collection(db, "products"),
                where("active", "==", true)
            );

        const productsSnapshot =
            await getDocs(productsQuery);

        allProducts = [];

        productsSnapshot.forEach(
            function (documentSnapshot) {

                const product =
                    documentSnapshot.data();

                allProducts.push({
                    id: documentSnapshot.id,
                    ...product
                });

            }
        );

        displayProducts(allProducts);

    } catch (error) {

        console.error(
            "Unable to load products:",
            error
        );

        productGrid.innerHTML = `
            <div class="empty-cart-message">
                Unable to load products.
            </div>
        `;

        productCount.textContent =
            "0 products";
    }

}

// =====================================
// Display Products
// =====================================

function displayProducts(products) {

    productGrid.innerHTML = "";

    products.forEach(function (product) {

        const productCard =
            document.createElement("article");

        productCard.className =
            "product-card";

        productCard.innerHTML = `
            ${
    product.imageUrl
        ? `
            <img
                src="${product.imageUrl}"
                alt="${product.name}"
                class="product-image"
            >
        `
        : `
            <div class="product-image-placeholder">
                Product Image
            </div>
        `
}

            <div class="product-card-content">

                <p class="product-category">
                    ${product.category}
                </p>

                <h3>
                    ${product.name}
                </h3>

                ${
    product.description
        ? `
            <p class="product-description">
                ${product.description}
            </p>
        `
        : ""
}

                <p class="product-price">
                    R${Number(product.price).toFixed(2)}
                </p>

                <button
    class="add-to-cart-button"
    data-id="${product.id}"
    data-product="${product.name}"
    data-price="${product.price}"
    data-image="${product.imageUrl || ""}"
>
    Add To Cart
</button>

            </div>
        `;

        productCard.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList.contains(
                "add-to-cart-button"
            )
        ) {
            return;
        }

        window.location.href =
            `product.html?id=${product.id}`;
    }
);

        productGrid.appendChild(productCard);

    });


    productCount.textContent =
        products.length === 1
            ? "1 product"
            : `${products.length} products`;

}


// =====================================
// Start
// =====================================



loadProducts();

// =====================================
// Shopping Cart
// =====================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// =====================================
// Save Cart
// =====================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// =====================================
// Get Total Cart Quantity
// =====================================

function getTotalCartQuantity() {

    return cart.reduce(function (total, item) {

        return total + item.quantity;

    }, 0);

}


// =====================================
// Update Cart Button
// =====================================

function updateCartButton() {

    if (!cartButton) {
        return;
    }

    cartButton.textContent =
        `Cart (${getTotalCartQuantity()})`;

}


updateCartButton();


// =====================================
// Open Cart Page
// =====================================

if (cartButton) {

    cartButton.addEventListener("click", function () {

        window.location.href = "cart.html";

    });

}


// =====================================
// Add Firebase Product To Cart
// =====================================

if (productGrid) {

    productGrid.addEventListener("click", function (event) {

        const button =
            event.target.closest(".add-to-cart-button");


        if (!button) {
            return;
        }


        const productId =
    button.dataset.id;

const productName =
    button.dataset.product;

const productPrice =
    Number(button.dataset.price);


        const existingProduct =
    cart.find(function (item) {

        return (
            item.id === productId ||
            (
                !item.id &&
                item.name === productName
            )
        );

    });


        if (existingProduct) {

            if (!existingProduct.id) {
    existingProduct.id = productId;
}

existingProduct.imageUrl =
    button.dataset.image || existingProduct.imageUrl || "";

existingProduct.price =
    productPrice;

            existingProduct.quantity += 1;

        } else {

            cart.push({
    id: productId,
    name: productName,
    price: productPrice,
    imageUrl: button.dataset.image || "",
    quantity: 1
});

        }


        saveCart();

        updateCartButton();


        button.textContent = "Added ✓";


        setTimeout(function () {

            button.textContent = "Add To Cart";

        }, 1000);

    });

}

// =====================================
// Filter Products
// =====================================

function filterProducts() {

    const searchValue =
        productSearch
            ? productSearch.value.trim().toLowerCase()
            : "";

    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";

    const filteredProducts =
        allProducts.filter(function (product) {

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCategory =
                selectedCategory === "" ||
                selectedCategory === "all" ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;

        });

    displayProducts(filteredProducts);
}

// =====================================
// Search Products
// =====================================

if (productSearch) {

    productSearch.addEventListener(
        "input",
        function () {

            filterProducts();

        }
    );
}
// =====================================
// Category Filter
// =====================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        function () {

            filterProducts();
        }
    );
}