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

const customerOrderDetails =
    document.getElementById(
        "customerOrderDetails"
    );


// =====================================
// Get Order ID From URL
// =====================================

const urlParameters =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    urlParameters.get("id");

    // =====================================
// Authentication + Load Order
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "account.html"
            );

            return;
        }

        if (!orderId) {

            customerOrderDetails.innerHTML = `
                <p>
                    No order was selected.
                </p>
            `;

            return;
        }

        try {

            const orderDocument =
                await getDoc(
                    doc(
                        db,
                        "orders",
                        orderId
                    )
                );

            if (!orderDocument.exists()) {

                customerOrderDetails.innerHTML = `
                    <p>
                        Order not found.
                    </p>
                `;

                return;
            }

            const order =
                orderDocument.data();

            const orderNumber =
    order.orderNumber ||
    orderDocument.id;

const orderStatus =
    order.status ||
    "Pending";

const paymentStatus =
    order.paymentStatus ||
    "Pending";

const orderTotal =
    Number(
        order.total || 0
    );

let orderDate =
    "Date unavailable";

if (order.createdAt?.toDate) {

    orderDate =
        order.createdAt
            .toDate()
            .toLocaleDateString(
                "en-ZA",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

}

customerOrderDetails.innerHTML = `
    <div class="customer-order-summary">

        <div class="customer-order-summary-heading">

            <div>
                <p>Order Number</p>

                <h2>
                    ${orderNumber}
                </h2>
            </div>

            <span class="customer-order-status">
                ${orderStatus}
            </span>

        </div>

        <div class="customer-order-summary-grid">

            <div>
                <strong>Order Date</strong>
                <p>${orderDate}</p>
            </div>

            <div>
                <strong>Payment Status</strong>
                <p>${paymentStatus}</p>
            </div>

            <div>
                <strong>Payment Method</strong>
                <p>
                    ${
                        order.paymentMethod === "payfast"
                            ? "Payfast"
                            : order.paymentMethod || "Not available"
                    }
                </p>
            </div>

            <div>
                <strong>Delivery Method</strong>
                <p>
                    ${
                        order.deliveryMethod === "collection"
                            ? "Collection"
                            : order.deliveryMethod || "Not available"
                    }
                </p>
            </div>

        </div>

    </div>

    <div class="customer-order-products">

        <h2>
            Products
        </h2>

        ${
            Array.isArray(order.items)
                ? order.items
                    .map((item) => {

                        const price =
                            Number(
                                item.price || 0
                            );

                        const quantity =
                            Number(
                                item.quantity || 0
                            );

                        const lineTotal =
                            price * quantity;

                        return `
                            <div class="customer-order-product">

                                <div>
                                    <strong>
                                        ${item.name || "Product"}
                                    </strong>

                                    <p>
                                        Quantity: ${quantity}
                                    </p>
                                </div>

                                <div>
                                    <p>
                                        R${price.toFixed(2)} each
                                    </p>

                                    <strong>
                                        R${lineTotal.toFixed(2)}
                                    </strong>
                                </div>

                            </div>
                        `;

                    })
                    .join("")
                : `
                    <p>
                        No products found.
                    </p>
                `
        }

    </div>

    ${
        order.deliveryMethod !== "collection" &&
        order.deliveryAddress
            ? `
                <div class="customer-order-delivery">

                    <h2>
                        Delivery Address
                    </h2>

                    <p>
                        ${order.deliveryAddress.streetAddress || ""}
                    </p>

                    <p>
                        ${order.deliveryAddress.suburb || ""}
                    </p>

                    <p>
                        ${order.deliveryAddress.city || ""}
                    </p>

                    <p>
                        ${order.deliveryAddress.province || ""}
                    </p>

                    <p>
                        ${order.deliveryAddress.postalCode || ""}
                    </p>

                </div>
            `
            : `
                <div class="customer-order-delivery">

                    <h2>
                        Collection
                    </h2>

                    <p>
                        This order has been selected for collection.
                    </p>

                </div>
            `
    }

    <div class="customer-order-total">

        <span>
            Order Total
        </span>

        <strong>
            R${orderTotal.toFixed(2)}
        </strong>

    </div>
`;

        } catch (error) {

            console.error(
                "Unable to load customer order:",
                error
            );

            customerOrderDetails.innerHTML = `
                <p>
                    Unable to load this order.
                </p>
            `;

        }

    }
);