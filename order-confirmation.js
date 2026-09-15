// =====================================
// Page Elements
// =====================================

const orderNumber =
    document.getElementById("orderNumber");

const currentYear =
    document.getElementById("currentYear");

const cartButton =
    document.getElementById("cartButton");


// =====================================
// Current Year
// =====================================

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();
}


// =====================================
// Order Number
// =====================================

const urlParameters =
    new URLSearchParams(
        window.location.search
    );

const customerOrderNumber =
    urlParameters.get("order");
if (orderNumber) {

    if (customerOrderNumber) {

        orderNumber.textContent =
            customerOrderNumber;

    } else {

        orderNumber.textContent =
            "Unavailable";
    }
}


// =====================================
// Cart Button
// =====================================

if (cartButton) {

    cartButton.textContent =
        "Cart (0)";

    cartButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "cart.html";
        }
    );
}