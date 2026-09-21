// =====================================
// Page Elements
// =====================================

const orderNumber =
    document.getElementById(
        "orderNumber"
    );


const currentYear =
    document.getElementById(
        "currentYear"
    );


const cartButton =
    document.getElementById(
        "cartButton"
    );


const orderDetails =
    document.getElementById(
        "orderDetails"
    );


// =====================================
// Current Year
// =====================================

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


// =====================================
// Get URL Parameters
// =====================================

const urlParameters =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    urlParameters.get(
        "order"
    );


const confirmationToken =
    urlParameters.get(
        "token"
    );


// =====================================
// Clear Cart
// =====================================

if (orderId) {

    localStorage.removeItem(
        "cart"
    );

}


// =====================================
// Display Order Number
// =====================================

if (orderNumber) {

    orderNumber.textContent =
        "Loading...";

}


// =====================================
// Worker URL
// =====================================

const WORKER_URL =
    "https://3d-contour-payfast.keanprivett2.workers.dev";


// =====================================
// Load Order
// =====================================

async function loadOrder() {

    if (
        !orderId ||
        !confirmationToken
    ) {

        showOrderError();

        return;

    }


    try {

        const response =
            await fetch(
                `${WORKER_URL}/order-confirmation?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(confirmationToken)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.order
        ) {

            showOrderError();

            return;

        }


        const firestoreOrder =
            data.order;


        displayOrder(
            firestoreOrder
        );


    } catch (error) {

        console.error(
            "Unable to load order:",
            error
        );


        showOrderError();

    }

}


// =====================================
// Display Order
// =====================================

function displayOrder(
    firestoreOrder
) {

    if (!orderDetails) {

        return;

    }


    const fields =
        firestoreOrder.fields || {};


    const customerOrderNumber =
        fields.orderNumber
            ?.stringValue ||
        "Unavailable";


    const customerName =
        fields.customerName
            ?.stringValue ||
        "";


    const customerEmail =
        fields.customerEmail
            ?.stringValue ||
        "";


    const deliveryMethod =
        fields.deliveryMethod
            ?.stringValue ||
        "collection";


    const deliveryFee =
        Number(
            fields.deliveryFee?.doubleValue ??
            fields.deliveryFee?.integerValue ??
            0
        );


    const total =
        Number(
            fields.total?.doubleValue ??
            fields.total?.integerValue ??
            0
        );


    const items =
        parseFirestoreItems(
            fields.items
        );


    // =====================================
    // Order Number
    // =====================================

    if (orderNumber) {

        orderNumber.textContent =
            customerOrderNumber;

    }


    // =====================================
    // Delivery Label
    // =====================================

    let deliveryLabel =
        "Collection";


    if (
        deliveryMethod ===
        "pudo-locker-locker"
    ) {

        deliveryLabel =
            "PUDO Locker → Locker";

    }


    else if (
        deliveryMethod ===
        "pudo-locker-address"
    ) {

        deliveryLabel =
            "PUDO Locker → Address";

    }


    // =====================================
    // Items HTML
    // =====================================

    let itemsHTML = "";


    items.forEach(
        function (item) {

            const itemName =
                item.name ||
                "Product";


            const itemPrice =
                Number(
                    item.price || 0
                );


            const quantity =
                Number(
                    item.quantity || 0
                );


            const itemTotal =
                itemPrice *
                quantity;


            itemsHTML += `

                <div class="order-confirmation-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                itemName
                            )}
                        </strong>

                        <span>
                            Quantity: ${quantity}
                        </span>

                    </div>


                    <strong>

                        R${itemTotal.toFixed(2)}

                    </strong>

                </div>

            `;

        }
    );


    // =====================================
    // Delivery Address
    // =====================================

    let addressHTML = "";


    if (
        deliveryMethod ===
        "pudo-locker-address"
    ) {

        const streetAddress =
            fields.deliveryStreetAddress
                ?.stringValue ||
            "";


        const suburb =
            fields.deliverySuburb
                ?.stringValue ||
            "";


        const city =
            fields.deliveryCity
                ?.stringValue ||
            "";


        const province =
            fields.deliveryProvince
                ?.stringValue ||
            "";


        const postalCode =
            fields.deliveryPostalCode
                ?.stringValue ||
            "";


        addressHTML = `

            <div class="order-confirmation-info-block">

                <h3>
                    Delivery Address
                </h3>


                <p>

                    ${escapeHTML(
                        streetAddress
                    )}

                    <br>

                    ${escapeHTML(
                        suburb
                    )}

                    <br>

                    ${escapeHTML(
                        city
                    )}

                    <br>

                    ${escapeHTML(
                        province
                    )}

                    <br>

                    ${escapeHTML(
                        postalCode
                    )}

                </p>

            </div>

        `;

    }


    // =====================================
    // Order Details HTML
    // =====================================

    orderDetails.innerHTML = `

        <div class="order-confirmation-info-block">

            <h3>
                Order Items
            </h3>

            ${itemsHTML}

        </div>


        <div class="order-confirmation-info-block">

            <h3>
                Delivery
            </h3>


            <div class="order-confirmation-summary-row">

                <span>
                    Method
                </span>

                <strong>
                    ${deliveryLabel}
                </strong>

            </div>


            <div class="order-confirmation-summary-row">

                <span>
                    Delivery Fee
                </span>

                <strong>

                    ${
                        deliveryFee === 0
                            ? "FREE"
                            : `R${deliveryFee.toFixed(2)}`
                    }

                </strong>

            </div>

        </div>


        ${addressHTML}


        <div class="order-confirmation-info-block">

            <h3>
                Customer
            </h3>


            <div class="order-confirmation-summary-row">

                <span>
                    Name
                </span>

                <strong>
                    ${escapeHTML(
                        customerName
                    )}
                </strong>

            </div>


            <div class="order-confirmation-summary-row">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        customerEmail
                    )}
                </strong>

            </div>

        </div>


        <div class="order-confirmation-total">

            <span>
                Order Total
            </span>


            <strong>
                R${total.toFixed(2)}
            </strong>

        </div>

    `;

}


// =====================================
// Parse Firestore Items
// =====================================

function parseFirestoreItems(
    itemsField
) {

    if (
        !itemsField
    ) {

        return [];

    }


    const arrayValue =
        itemsField.arrayValue;


    if (
        !arrayValue ||
        !Array.isArray(
            arrayValue.values
        )
    ) {

        return [];

    }


    return arrayValue.values.map(
        function (itemValue) {

            const fields =
                itemValue.mapValue?.fields ||
                {};


            return {

                id:
                    fields.id?.stringValue ||
                    "",

                name:
                    fields.name?.stringValue ||
                    "Product",

                price:
                    Number(
                        fields.price?.doubleValue ??
                        fields.price?.integerValue ??
                        0
                    ),

                quantity:
                    Number(
                        fields.quantity?.integerValue ??
                        fields.quantity?.doubleValue ??
                        0
                    )

            };

        }
    );

}


// =====================================
// Escape HTML
// =====================================

function escapeHTML(
    value
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// Order Error
// =====================================

function showOrderError() {

    if (!orderDetails) {

        return;

    }


    if (orderNumber) {

        orderNumber.textContent =
            "Unavailable";

    }


    orderDetails.innerHTML = `

        <div class="order-confirmation-error">

            <h3>
                Order Details Unavailable
            </h3>


            <p>

                We received your order, but we
                couldn't load the order details
                right now.

            </p>


            <p>

                Please keep your order number
                for reference.

            </p>

        </div>

    `;

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


// =====================================
// Load Order
// =====================================

loadOrder();