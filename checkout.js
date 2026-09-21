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
// Shipping Settings
// =====================================

let shippingSettings = {

    collectionPrice: 0,

    lockerLockerPrice: 80,

    lockerAddressPrice: 110,

    freeDeliveryThreshold: 500

};


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
// Load Shipping Settings
// =====================================

async function loadShippingSettings() {

    try {

        const shippingReference =
            doc(
                db,
                "settings",
                "shipping"
            );


        const shippingSnapshot =
            await getDoc(
                shippingReference
            );


        if (
            shippingSnapshot.exists()
        ) {

            const data =
                shippingSnapshot.data();


            shippingSettings = {

                collectionPrice:
                    Number(
                        data.collectionPrice
                    ) || 0,

                lockerLockerPrice:
                    Number(
                        data.lockerLockerPrice
                    ) || 0,

                lockerAddressPrice:
                    Number(
                        data.lockerAddressPrice
                    ) || 0,

                freeDeliveryThreshold:
                    Number(
                        data.freeDeliveryThreshold
                    ) || 500

            };

        }


        // Re-render checkout using the
        // newly loaded settings.

        renderOrderSummary();


    } catch (error) {

        console.error(
            "Unable to load shipping settings:",
            error
        );

    }

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

    const selectedDeliveryMethod =
    document.querySelector(
        'input[name="deliveryMethod"]:checked'
    )?.value;


// =====================================
// Calculate Order Subtotal
// =====================================

let orderSubtotal = 0;


cart.forEach(function (item) {

    const price =
        Number(item.price) || 0;


    const itemTotal =
        item.type === "custom-print"

            ? Math.max(
                price * item.quantity,
                Number(item.minimumOrder) || 0
            )

            : price * item.quantity;


    orderSubtotal += itemTotal;

});



// =====================================
// Calculate Delivery Fee
// =====================================

let deliveryFee = 0;


if (
    selectedDeliveryMethod ===
    "collection"
) {

    deliveryFee =
        shippingSettings.collectionPrice;

}


else if (
    selectedDeliveryMethod ===
    "pudo-locker-locker"
) {

    deliveryFee =
        orderSubtotal > shippingSettings.freeDeliveryThreshold
            ? 0
            : shippingSettings.lockerLockerPrice;

}


else if (
    selectedDeliveryMethod ===
    "pudo-locker-address"
) {

    deliveryFee =
        orderSubtotal > shippingSettings.freeDeliveryThreshold
            ? 0
            : shippingSettings.lockerAddressPrice;

}

    checkoutOrderSummary.innerHTML = "";

    cart.forEach(function (item) {

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

        const orderItem =
            document.createElement("div");

        orderItem.className =
            "checkout-summary-item";

        orderItem.innerHTML = `

    <div>

        <strong>
            ${
                item.type === "custom-print"
                    ? "Custom 3D Print"
                    : item.name
            }
        </strong>


        ${
            item.type === "custom-print"
                ? `

                    <p>
                        <strong>File:</strong>
                        ${item.filename || "STL file"}
                    </p>

                    <p>
                        <strong>Material:</strong>
                        ${item.material || "PLA"}
                    </p>

                    <p>
                        R${price.toFixed(2)} per item
                    </p>

                `
                : ""
        }


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

    const deliverySection =
    document.createElement("div");

deliverySection.className =
    "checkout-summary-delivery";

let deliveryLabel =
    "Collection";


if (
    selectedDeliveryMethod ===
    "pudo-locker-locker"
) {

    deliveryLabel =
        "PUDO Locker → Locker";

}


else if (
    selectedDeliveryMethod ===
    "pudo-locker-address"
) {

    deliveryLabel =
        "PUDO Locker → Address";

}


deliverySection.innerHTML = `

    <span>

        ${deliveryLabel}

    </span>


    <strong>

        ${
            deliveryFee === 0 &&
            selectedDeliveryMethod !== "collection"

                ? "FREE"

                : `R${deliveryFee.toFixed(2)}`
        }

    </strong>

`;

checkoutOrderSummary.appendChild(
    deliverySection
);

totalPrice += deliveryFee;

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
// Delivery Method Visibility
// =====================================

function updateDeliveryAddressVisibility() {

    const selectedDeliveryMethod =
        document.querySelector(
            'input[name="deliveryMethod"]:checked'
        );


    if (!selectedDeliveryMethod) {

        return;

    }


    const deliveryMethod =
        selectedDeliveryMethod.value;


    const pudoLockerSection =
        document.getElementById(
            "pudoLockerSection"
        );


    // =====================================
    // Collection
    // =====================================

    if (deliveryMethod === "collection") {

        if (pudoLockerSection) {

            pudoLockerSection.hidden = true;

        }


        if (deliveryAddressSection) {

            deliveryAddressSection.hidden = true;

        }

    }


    // =====================================
    // PUDO Locker → Locker
    // =====================================

    else if (
        deliveryMethod === "pudo-locker-locker"
    ) {

        if (pudoLockerSection) {

            pudoLockerSection.hidden = false;

        }


        if (deliveryAddressSection) {

            deliveryAddressSection.hidden = true;

        }

    }


    // =====================================
    // PUDO Locker → Address
    // =====================================

    else if (
        deliveryMethod === "pudo-locker-address"
    ) {

        if (pudoLockerSection) {

            pudoLockerSection.hidden = true;

        }


        if (deliveryAddressSection) {

            deliveryAddressSection.hidden = false;

        }

    }


    // =====================================
    // Address Required Fields
    // =====================================

    const addressRequired =
        deliveryMethod ===
        "pudo-locker-address";


    const streetAddress =
        document.getElementById(
            "streetAddress"
        );

    const suburb =
        document.getElementById(
            "suburb"
        );

    const city =
        document.getElementById(
            "city"
        );

    const province =
        document.getElementById(
            "province"
        );

    const postalCode =
        document.getElementById(
            "postalCode"
        );


    if (streetAddress) {

        streetAddress.required =
            addressRequired;

    }


    if (suburb) {

        suburb.required =
            addressRequired;

    }


    if (city) {

        city.required =
            addressRequired;

    }


    if (province) {

        province.required =
            addressRequired;

    }


    if (postalCode) {

        postalCode.required =
            addressRequired;

    }

}


deliveryMethodOptions.forEach(
    function (option) {

        option.addEventListener(
            "change",
            function () {

                updateDeliveryAddressVisibility();

                renderOrderSummary();

            }
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

if (selectedDeliveryMethod === "pudo-locker-address") {

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

loadShippingSettings();

onAuthStateChanged(auth, (user) => {

    if (user) {
        loadCustomerCheckoutDetails();
    }

});