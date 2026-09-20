// =====================================
// Checkout Page
// =====================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =====================================
// Page Elements
// =====================================

const checkoutOrderSummary =
    document.getElementById("checkoutOrderSummary");

const currentYear =
    document.getElementById("currentYear");

const cartButton =
    document.getElementById("cartButton");

    const checkoutForm =
    document.getElementById("checkoutForm");

const placeOrderButton =
    document.getElementById("placeOrderButton");

    const deliveryAddressSection =
    document.getElementById(
        "deliveryAddressSection"
    );

const deliveryMethodOptions =
    document.querySelectorAll(
        'input[name="deliveryMethod"]'
    );


// =====================================
// Load Cart
// =====================================

let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


// =====================================
// Current Year
// =====================================

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}


// =====================================
// Cart Button
// =====================================

function getTotalCartQuantity() {

    return cart.reduce(
        function (total, item) {
            return total + item.quantity;
        },
        0
    );
}


function updateCartButton() {

    if (!cartButton) {
        return;
    }

    cartButton.textContent =
        `Cart (${getTotalCartQuantity()})`;
}


if (cartButton) {

    cartButton.addEventListener(
        "click",
        function () {
            window.location.href =
                "cart.html";
        }
    );
}


// =====================================
// Render Order Summary
// =====================================

function renderOrderSummary() {

    if (!checkoutOrderSummary) {
        return;
    }

    if (cart.length === 0) {

        checkoutOrderSummary.innerHTML = `
            <p>
                Your cart is empty.
            </p>
        `;

        return;
    }

    let totalPrice = 0;

    checkoutOrderSummary.innerHTML = "";

    cart.forEach(function (item) {

        const price =
            Number(item.price) || 0;

        const itemTotal =
            price * item.quantity;

        totalPrice += itemTotal;

        const orderItem =
            document.createElement("div");

        orderItem.className =
            "checkout-summary-item";

        orderItem.innerHTML = `

            <div>
                <strong>
                    ${item.name}
                </strong>

                <p>
                    Qty: ${item.quantity}
                </p>
            </div>

            <strong>
                R${itemTotal.toFixed(2)}
            </strong>
        `;

        checkoutOrderSummary.appendChild(
            orderItem
        );
    });

    const totalSection =
        document.createElement("div");

    totalSection.className =
        "checkout-summary-total";

    totalSection.innerHTML = `

        <span>
            Total
        </span>

        <strong>
            R${totalPrice.toFixed(2)}
        </strong>
    `;

    checkoutOrderSummary.appendChild(
        totalSection
    );
}

// =====================================
// Delivery Method
// =====================================

function updateDeliveryAddressVisibility() {

    const selectedDeliveryMethod =
        document.querySelector(
            'input[name="deliveryMethod"]:checked'
        );

    if (!selectedDeliveryMethod) {
        return;
    }

    if (
    selectedDeliveryMethod.value === "delivery"
) {

    deliveryAddressSection.hidden =
        false;

    document.getElementById("streetAddress").required =
        true;

    document.getElementById("suburb").required =
        true;

    document.getElementById("city").required =
        true;

    document.getElementById("province").required =
        true;

    document.getElementById("postalCode").required =
        true;

} else {

    deliveryAddressSection.hidden =
        true;

    document.getElementById("streetAddress").required =
        false;

    document.getElementById("suburb").required =
        false;

    document.getElementById("city").required =
        false;

    document.getElementById("province").required =
        false;

    document.getElementById("postalCode").required =
        false;
}
}


deliveryMethodOptions.forEach(
    function (option) {

        option.addEventListener(
            "change",
            updateDeliveryAddressVisibility
        );
    }
);

// =====================================
// Checkout Form Validation
// =====================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;
            }

            if (!checkoutForm.checkValidity()) {

                checkoutForm.reportValidity();

                return;
            }

            const customerName =
    document.getElementById("customerName").value.trim();

const customerEmail =
    document.getElementById("customerEmail").value.trim();

const customerPhone =
    document.getElementById("customerPhone").value.trim();

const selectedDeliveryMethod =
    document.querySelector(
        'input[name="deliveryMethod"]:checked'
    ).value;

    const selectedPaymentMethod =
    document.querySelector(
        'input[name="paymentMethod"]:checked'
    ).value;

let deliveryAddress = null;

if (selectedDeliveryMethod === "delivery") {

    deliveryAddress = {
        streetAddress:
            document.getElementById("streetAddress").value.trim(),

        suburb:
            document.getElementById("suburb").value.trim(),

        city:
            document.getElementById("city").value.trim(),

        province:
            document.getElementById("province").value,

        postalCode:
            document.getElementById("postalCode").value.trim()
    };
}

    try {

        const currentUser =
    auth.currentUser;

let customerIdToken = null;

if (currentUser) {

    customerIdToken =
        await currentUser.getIdToken();

}

    const payfastResponse =
    await fetch(
        "https://3d-contour-payfast.keanprivett2.workers.dev/",
        {
            method: "POST",

            headers: {
    "Content-Type":
        "application/json",

    ...(customerIdToken
        ? {
            "Authorization":
                `Bearer ${customerIdToken}`
        }
        : {})
},

            body: JSON.stringify({
                returnUrl:
    window.location.origin +
    "/order-confirmation.html",

                cancelUrl:
                    window.location.origin +
                    "/checkout.html",

                notifyUrl:
    "https://3d-contour-payfast.keanprivett2.workers.dev/notify",

                customerName:
                    customerName,

                customerEmail:
                    customerEmail,

                customerPhone:
    customerPhone,

deliveryMethod:
    selectedDeliveryMethod,

deliveryAddress:
    deliveryAddress,

items:
    cart
            })
        }
    );

const payfastData =
    await payfastResponse.json();

console.log(
    "Payfast Worker response:",
    payfastData
);

if (
    payfastData.success &&
    payfastData.paymentData
) {

    const payfastForm =
        document.createElement("form");

    payfastForm.method = "POST";

    payfastForm.action =
        "https://sandbox.payfast.co.za/eng/process";

    Object.entries(
        payfastData.paymentData
    ).forEach(
        function ([key, value]) {

            const input =
                document.createElement("input");

            input.type = "hidden";
            input.name = key;
            input.value = value;

            payfastForm.appendChild(
                input
            );
        }
    );

    document.body.appendChild(
        payfastForm
    );

    payfastForm.submit();

} else {

    throw new Error(
        "Unable to prepare Payfast payment."
    );
}
    

} catch (error) {

    console.error(
        "Unable to create order:",
        error
    );
}

        }
    );
}

// =====================================
// Load Signed-In Customer Details
// =====================================

async function loadCustomerCheckoutDetails() {

    const currentUser =
        auth.currentUser;

    if (!currentUser) {
        return;
    }

    try {

        const customerReference =
            doc(
                db,
                "customers",
                currentUser.uid
            );

        const customerSnapshot =
            await getDoc(
                customerReference
            );

        if (!customerSnapshot.exists()) {
            return;
        }

        const customer =
            customerSnapshot.data();

        

        const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

if (customerName) {

    customerName.value =
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

}

if (customerEmail) {

    customerEmail.value =
        customer.email || "";

}

if (customerPhone) {

    customerPhone.value =
        customer.phone || "";

}

const deliveryAddress =
    customer.deliveryAddress || {};

const streetAddress =
    document.getElementById("streetAddress");

const suburb =
    document.getElementById("suburb");

const city =
    document.getElementById("city");

const province =
    document.getElementById("province");

const postalCode =
    document.getElementById("postalCode");

if (streetAddress) {
    streetAddress.value =
        deliveryAddress.streetAddress || "";
}

if (suburb) {
    suburb.value =
        deliveryAddress.suburb || "";
}

if (city) {
    city.value =
        deliveryAddress.city || "";
}

if (province) {
    province.value =
        deliveryAddress.province || "";
}

if (postalCode) {
    postalCode.value =
        deliveryAddress.postalCode || "";
}

    } catch (error) {

        console.error(
            "Unable to load customer checkout details:",
            error
        );

    }

}


// =====================================
// Start
// =====================================

updateCartButton();

renderOrderSummary();

updateDeliveryAddressVisibility();

onAuthStateChanged(auth, (user) => {

    if (user) {
        loadCustomerCheckoutDetails();
    }

});