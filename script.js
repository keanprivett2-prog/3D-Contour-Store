// =====================================
// 3D Contour Store
// Main JavaScript
// =====================================


// =====================================
// Product Prices
// =====================================




// =====================================
// Current Year
// =====================================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// =====================================
// Load Cart
// =====================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


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
// Cart Button
// =====================================

const cartButton = document.getElementById("cartButton");



function getTotalCartQuantity() {

    return cart.reduce(function (total, item) {
        return total + item.quantity;
    }, 0);

}


function updateCartButton() {

    if (!cartButton) {
        return;
    }

    const totalItems = getTotalCartQuantity();

    cartButton.textContent =
        `Cart (${totalItems})`;

}


updateCartButton();


if (cartButton) {

    cartButton.addEventListener("click", function () {

        window.location.href = "cart.html";

    });

}


// =====================================
// Add To Cart
// =====================================

const addToCartButtons =
    document.querySelectorAll(".add-to-cart-button");


addToCartButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const productName =
            button.dataset.product;

        const existingProduct =
            cart.find(function (item) {

                return item.name === productName;

            });


        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({
                name: productName,
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

});


// =====================================
// Account Button
// =====================================

const accountButton =
    document.getElementById("accountButton");


if (accountButton) {

    accountButton.addEventListener("click", function () {

        alert(
            "Customer login and registration will be added soon."
        );

    });

}


// =====================================
// Product Search + Category Filter
// =====================================

const productSearch =
    document.getElementById("productSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const productCards =
    document.querySelectorAll(".product-card");

const productCount =
    document.getElementById("productCount");


function filterProducts() {

    if (!productCards.length) {
        return;
    }


    const searchValue =
        productSearch
            ? productSearch.value.toLowerCase().trim()
            : "";


    const categoryValue =
        categoryFilter
            ? categoryFilter.value
            : "all";


    let visibleProducts = 0;


    productCards.forEach(function (card) {

        const productName =
            card.dataset.name.toLowerCase();

        const productCategory =
            card.dataset.category;


        const matchesSearch =
            productName.includes(searchValue);


        const matchesCategory =
            categoryValue === "all" ||
            productCategory === categoryValue;


        if (matchesSearch && matchesCategory) {

            card.style.display = "block";

            visibleProducts++;

        } else {

            card.style.display = "none";

        }

    });


    if (productCount) {

        productCount.textContent =
            visibleProducts === 1
                ? "1 product"
                : `${visibleProducts} products`;

    }

}


if (productSearch) {

    productSearch.addEventListener(
        "input",
        filterProducts
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


// =====================================
// Cart Page
// =====================================

const cartItemsContainer =
    document.getElementById("cartItems");

const cartItemCount =
    document.getElementById("cartItemCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");


// =====================================
// Render Cart
// =====================================

function renderCart() {

    if (!cartItemsContainer) {
        return;
    }


    cartItemsContainer.innerHTML = "";


    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <h3>Your cart is empty</h3>

                <p>
                    Add some products from the shop to get started.
                </p>
            </div>
        `;


        if (cartItemCount) {
            cartItemCount.textContent = "0";
        }


        if (cartTotal) {
            cartTotal.textContent = "R0.00";
        }


        if (checkoutButton) {
            checkoutButton.disabled = true;
        }


        updateCartButton();

        return;
    }


    let totalPrice = 0;


    cart.forEach(function (item, index) {

        const price =
    Number(item.price) || 0;


        const itemTotal =
    item.type === "custom-print"
        ? Math.max(
            price * item.quantity,
            Number(item.minimumOrder) || 0
        )
        : price * item.quantity;


        totalPrice += itemTotal;


        const cartItem =
            document.createElement("div");


        cartItem.classList.add("cart-item");


        cartItem.innerHTML = `

    <div class="cart-item-product">

        ${
            item.imageUrl
                ? `
                    <a
                        href="product.html?id=${item.id}"
                        class="cart-item-image-link"
                    >

                        <img
                            src="${item.imageUrl}"
                            alt="${item.name}"
                            class="cart-item-image"
                        >

                    </a>
                `
                : `
                    <div class="cart-item-image-placeholder">
                        No Image
                    </div>
                `
        }

        <div class="cart-item-info">

            <h3>
                ${
                    item.type === "custom-print"
                        ? "Custom 3D Print"
                        : `
                            <a
                                href="product.html?id=${item.id}"
                                class="cart-item-name-link"
                            >
                                ${item.name}
                            </a>
                        `
                }
            </h3>


            ${
                item.type === "custom-print"
                    ? `
                        <div class="custom-print-cart-details">

                            <p>
                                <strong>File:</strong>
                                ${item.filename || "STL file"}
                            </p>

                            <p>
                                <strong>Material:</strong>
                                ${item.material || "PLA"}
                            </p>

                        </div>
                    `
                    : ""
            }


            <p>
                R${price.toFixed(2)} each
            </p>


            <strong>
                R${itemTotal.toFixed(2)}
            </strong>

        </div>

    </div>


    <div class="cart-item-controls">

        <button
            class="decrease-quantity"
            data-index="${index}"
        >
            −
        </button>

        <span>
            ${item.quantity}
        </span>

        <button
            class="increase-quantity"
            data-index="${index}"
        >
            +
        </button>

        <button
            class="remove-cart-item"
            data-index="${index}"
        >
            Remove
        </button>

    </div>

`;

        cartItemsContainer.appendChild(cartItem);

    });


    if (cartItemCount) {

        cartItemCount.textContent =
            getTotalCartQuantity();

    }


    if (cartTotal) {

        cartTotal.textContent =
            `R${totalPrice.toFixed(2)}`;

    }


    if (checkoutButton) {

        checkoutButton.disabled = false;

    }


    updateCartButton();

    attachCartControlEvents();

}


// =====================================
// Cart Controls
// =====================================

function attachCartControlEvents() {

    const increaseButtons =
        document.querySelectorAll(
            ".increase-quantity"
        );


    const decreaseButtons =
        document.querySelectorAll(
            ".decrease-quantity"
        );


    const removeButtons =
        document.querySelectorAll(
            ".remove-cart-item"
        );


    increaseButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const index =
                Number(button.dataset.index);


            cart[index].quantity += 1;


            saveCart();

            renderCart();

        });

    });


    decreaseButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const index =
                Number(button.dataset.index);


            cart[index].quantity -= 1;


            if (cart[index].quantity <= 0) {

                cart.splice(index, 1);

            }


            saveCart();

            renderCart();

        });

    });


    removeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const index =
                Number(button.dataset.index);


            cart.splice(index, 1);


            saveCart();

            renderCart();

        });

    });

}


// =====================================
// Checkout Button
// =====================================

if (checkoutButton) {

    checkoutButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "checkout.html";
    }
);
}


// =====================================
// Start Cart Page
// =====================================

renderCart();