import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================================
// Page Elements
// =====================================================

const productDetailsContainer =
    document.getElementById("productDetailsContainer");

const currentYear =
    document.getElementById("currentYear");

    const cartButton =
    document.getElementById("cartButton");

    function updateCartButton() {

    if (!cartButton) {
        return;
    }

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    const totalQuantity =
        cart.reduce(
            function (total, item) {
                return total + item.quantity;
            },
            0
        );

    cartButton.textContent =
        `Cart (${totalQuantity})`;
}


// =====================================================
// Current Year
// =====================================================

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}


// =====================================================
// Get Product ID From URL
// =====================================================

const urlParameters =
    new URLSearchParams(window.location.search);

const productId =
    urlParameters.get("id");


// =====================================================
// Load Product
// =====================================================

async function loadProduct() {

    if (!productId) {

        productDetailsContainer.innerHTML = `
            <div class="empty-cart-message">
                Product not found.
            </div>
        `;

        
        return;
    }

    try {

        const productReference =
            doc(
                db,
                "products",
                productId
            );

        const productSnapshot =
            await getDoc(productReference);

        if (!productSnapshot.exists()) {

            productDetailsContainer.innerHTML = `
                <div class="empty-cart-message">
                    Product not found.
                </div>
            `;

            return;
        }

        const product =
            productSnapshot.data();

        productDetailsContainer.innerHTML = `

            <div class="product-details-image">

                ${
                    product.imageUrl
                        ? `
                            <img
                                src="${product.imageUrl}"
                                alt="${product.name}"
                            >
                        `
                        : `
                            <div class="product-image-placeholder">
                                Product Image
                            </div>
                        `
                }

            </div>

            <div class="product-details-content">

                <p class="product-category">
                    ${product.category}
                </p>

                <h1>
                    ${product.name}
                </h1>

                ${
                    product.description
                        ? `
                            <p class="product-details-description">
                                ${product.description}
                            </p>
                        `
                        : ""
                }

                <p class="product-details-price">
    R${Number(product.price).toFixed(2)}
</p>

<div class="product-quantity-selector">

    <label for="productQuantity">
        Quantity
    </label>

    <div class="quantity-control">

    <button
        type="button"
        id="decreaseQuantity"
        class="quantity-button"
    >
        −
    </button>

    <input
        type="number"
        id="productQuantity"
        min="1"
        value="1"
    >

    <button
        type="button"
        id="increaseQuantity"
        class="quantity-button"
    >
        +
    </button>

</div>

</div>

<button
    id="productAddToCartButton"
    class="add-to-cart-button"
>
    Add To Cart
</button>

            </div>
        `;

        const decreaseQuantityButton =
    document.getElementById(
        "decreaseQuantity"
    );

const increaseQuantityButton =
    document.getElementById(
        "increaseQuantity"
    );

const quantityInput =
    document.getElementById(
        "productQuantity"
    );

if (decreaseQuantityButton) {

    decreaseQuantityButton.addEventListener(
        "click",
        function () {

            const currentQuantity =
                Number(quantityInput.value) || 1;

            quantityInput.value =
                Math.max(
                    1,
                    currentQuantity - 1
                );
        }
    );
}

if (increaseQuantityButton) {

    increaseQuantityButton.addEventListener(
        "click",
        function () {

            const currentQuantity =
                Number(quantityInput.value) || 1;

            quantityInput.value =
                currentQuantity + 1;
        }
    );
}

        const addToCartButton =
    document.getElementById(
        "productAddToCartButton"
    );

if (addToCartButton) {

    addToCartButton.addEventListener(
        "click",
        function () {

            const quantityInput =
                document.getElementById(
                    "productQuantity"
                );

            const selectedQuantity =
                Math.max(
                    1,
                    Number(quantityInput.value) || 1
                );

            const cart =
                JSON.parse(
                    localStorage.getItem("cart")
                ) || [];

            const existingProduct =
                cart.find(function (item) {
                    return item.id === productId;
                });

            if (existingProduct) {

                existingProduct.imageUrl =
    product.imageUrl || existingProduct.imageUrl || "";

existingProduct.price =
    Number(product.price);

                existingProduct.quantity +=
                    selectedQuantity;

            } else {

                cart.push({
    id: productId,
    name: product.name,
    price: Number(product.price),
    imageUrl: product.imageUrl || "",
    quantity: selectedQuantity
});
            }

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

            updateCartButton();

            addToCartButton.textContent =
                "Added To Cart ✓";

            setTimeout(function () {

                addToCartButton.textContent =
                    "Add To Cart";

            }, 1200);
        }
    );
}

    } catch (error) {

        console.error(
            "Unable to load product:",
            error
        );

        productDetailsContainer.innerHTML = `
            <div class="empty-cart-message">
                Unable to load product.
            </div>
        `;
    }
}


// =====================================================
// Start
// =====================================================

if (cartButton) {
    cartButton.addEventListener(
        "click",
        function () {
            window.location.href =
                "cart.html";
        }
    );
}

updateCartButton();

loadProduct();