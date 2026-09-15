import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================
// Page Elements
// =====================================

const backToOrdersButton =
    document.getElementById("backToOrdersButton");

const logoutButton =
    document.getElementById("logoutButton");

const adminOrderDetails =
    document.getElementById("adminOrderDetails");

const orderDetailsSubtitle =
    document.getElementById("orderDetailsSubtitle");

    const printInvoiceButton =
    document.getElementById(
        "printInvoiceButton"
    );

    const imageLightbox =
    document.getElementById("imageLightbox");

const imageLightboxImage =
    document.getElementById("imageLightboxImage");

const imageLightboxClose =
    document.getElementById("imageLightboxClose");


// =====================================
// Order ID From URL
// =====================================

const urlParameters =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    urlParameters.get("id");

    let currentOrder = null;


// =====================================
// Admin Protection
// =====================================

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "admin-login.html";

            return;
        }

        try {

            const userReference =
                doc(
                    db,
                    "users",
                    user.uid
                );

            const userSnapshot =
                await getDoc(userReference);

            if (!userSnapshot.exists()) {

                await signOut(auth);

                window.location.href =
                    "admin-login.html";

                return;
            }

            const userData =
                userSnapshot.data();

            if (
                userData.role !== "admin" ||
                userData.active !== true
            ) {

                await signOut(auth);

                window.location.href =
                    "admin-login.html";

                return;
            }

            loadOrderDetails();

        } catch (error) {

            console.error(
                "Unable to verify admin:",
                error
            );

            await signOut(auth);

            window.location.href =
                "admin-login.html";
        }
    }
);


// =====================================
// Back To Orders
// =====================================

backToOrdersButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-orders.html";
    }
);


// =====================================
// Logout
// =====================================

logoutButton.addEventListener(
    "click",
    async function () {

        await signOut(auth);

        window.location.href =
            "admin-login.html";
    }
);

// =====================================
// Load Order Details
// =====================================

async function loadOrderDetails() {

    if (!orderId) {

        adminOrderDetails.innerHTML = `
            <p>
                No order ID was provided.
            </p>
        `;

        orderDetailsSubtitle.textContent =
            "Unable to load order.";

        return;
    }

    try {

        const orderReference =
            doc(
                db,
                "orders",
                orderId
            );

        const orderSnapshot =
            await getDoc(
                orderReference
            );

        if (!orderSnapshot.exists()) {

            adminOrderDetails.innerHTML = `
                <p>
                    Order could not be found.
                </p>
            `;

            orderDetailsSubtitle.textContent =
                "Order not found.";

            return;
        }

        const order =
            orderSnapshot.data();

            currentOrder = order;

        console.log(
            "Loaded order:",
            order
        );

        orderDetailsSubtitle.textContent =
    `Order ${order.orderNumber || orderId}`;

            const orderDate =
    order.createdAt
        ? order.createdAt.toDate().toLocaleString("en-ZA")
        : "Unknown date";

const deliveryAddress =
    order.deliveryAddress;

const itemsHtml =
    Array.isArray(order.items)
        ? order.items.map(
            function (item) {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 0;

                const itemTotal =
                    price * quantity;

                return `
    <div class="admin-order-detail-item">

        <div class="admin-order-detail-product">

            ${
                item.imageUrl
                    ? `
                        <img
                            src="${item.imageUrl}"
                            alt="${item.name || "Product"}"
                            class="admin-order-detail-image"
                        >
                    `
                    : `
                        <div class="admin-order-detail-image-placeholder">
                            No Image
                        </div>
                    `
            }

            <div>

                <strong>
                    ${item.name || "Unnamed Product"}
                </strong>

                <p>
                    Quantity: ${quantity}
                </p>

                <p>
                    R${price.toFixed(2)} each
                </p>

            </div>

        </div>

        <strong>
            R${itemTotal.toFixed(2)}
        </strong>

    </div>
`;
            }
        ).join("")
        : "<p>No items found.</p>";

adminOrderDetails.innerHTML = `

    <div class="admin-order-detail-section">

        <h3>
            Customer
        </h3>

        <p>
            <strong>Name:</strong>
            ${order.customer?.name || "Not provided"}
        </p>

        <p>
            <strong>Email:</strong>
            ${order.customer?.email || "Not provided"}
        </p>

        <p>
            <strong>Phone:</strong>
            ${order.customer?.phone || "Not provided"}
        </p>

    </div>


    <div class="admin-order-detail-section">

        <h3>
            Order Information
        </h3>

        <p>
            <strong>Order Number:</strong>
            ${orderId}
        </p>

        <p>
            <strong>Date:</strong>
            ${orderDate}
        </p>

        <div class="admin-order-status-control">

    <label for="orderStatusSelect">
        <strong>Status:</strong>
    </label>

    <select id="orderStatusSelect">

        <option
            value="Pending"
            ${order.status === "Pending" ? "selected" : ""}
        >
            Pending
        </option>

        <option
            value="Processing"
            ${order.status === "Processing" ? "selected" : ""}
        >
            Processing
        </option>

        <option
            value="Ready for Collection"
            ${order.status === "Ready for Collection" ? "selected" : ""}
        >
            Ready for Collection
        </option>

        <option
            value="Completed"
            ${order.status === "Completed" ? "selected" : ""}
        >
            Completed
        </option>

        <option
            value="Cancelled"
            ${order.status === "Cancelled" ? "selected" : ""}
        >
            Cancelled
        </option>

    </select>

</div>
        <p>
            <strong>Delivery Method:</strong>
            ${order.deliveryMethod || "Unknown"}
        </p>

    </div>


    ${
        order.deliveryMethod === "delivery" &&
        deliveryAddress
            ? `
                <div class="admin-order-detail-section">

                    <h3>
                        Delivery Address
                    </h3>

                    <p>
                        ${deliveryAddress.streetAddress || ""}
                    </p>

                    <p>
                        ${deliveryAddress.suburb || ""}
                    </p>

                    <p>
                        ${deliveryAddress.city || ""}
                    </p>

                    <p>
                        ${deliveryAddress.province || ""}
                    </p>

                    <p>
                        ${deliveryAddress.postalCode || ""}
                    </p>

                </div>
            `
            : ""
    }

    <div class="admin-order-detail-section">

    <h3>
        Admin Notes
    </h3>

    <textarea
        id="adminOrderNotes"
        class="admin-order-notes"
        placeholder="Add private notes about this order..."
    >${order.adminNotes || ""}</textarea>

    <button
        type="button"
        id="saveAdminNotesButton"
        class="admin-order-notes-button"
    >
        Save Notes
    </button>

    <span
        id="adminOrderNotesMessage"
        class="order-status-save-message"
    ></span>

</div>


    <div class="admin-order-detail-section">

        <h3>
            Products
        </h3>

        <div class="admin-order-detail-items">
            ${itemsHtml}
        </div>

    </div>


    <div class="admin-order-detail-total">

        <span>
            Order Total
        </span>

        <strong>
            R${Number(order.total || 0).toFixed(2)}
        </strong>

    </div>

`;

    } catch (error) {

        console.error(
            "Unable to load order:",
            error
        );

        adminOrderDetails.innerHTML = `
            <p>
                Unable to load order details.
            </p>
        `;
    }
}

// =====================================
// Product Image Lightbox
// =====================================

adminOrderDetails.addEventListener(
    "click",
    function (event) {

        const productImage =
            event.target.closest(
                ".admin-order-detail-image"
            );

        if (!productImage) {
            return;
        }

        imageLightboxImage.src =
            productImage.src;

        imageLightbox.hidden =
            false;
    }
);


// =====================================
// Close Image Lightbox
// =====================================

imageLightboxClose.addEventListener(
    "click",
    function () {

        imageLightbox.hidden =
            true;

        imageLightboxImage.src =
            "";
    }
);


imageLightbox.addEventListener(
    "click",
    function (event) {

        if (event.target === imageLightbox) {

            imageLightbox.hidden =
                true;

            imageLightboxImage.src =
                "";
        }
    }
);

// =====================================
// Update Order Status
// =====================================

adminOrderDetails.addEventListener(
    "change",
    async function (event) {

        if (
            event.target.id !==
            "orderStatusSelect"
        ) {
            return;
        }

        const orderStatusSelect =
            event.target;

        const newStatus =
            orderStatusSelect.value;

        orderStatusSelect.disabled =
            true;

        try {

            const orderReference =
                doc(
                    db,
                    "orders",
                    orderId
                );

            await updateDoc(
                orderReference,
                {
                    status: newStatus
                }
            );

            console.log(
                "Order status updated:",
                newStatus
            );

            const statusMessage =
    document.createElement("span");

statusMessage.className =
    "order-status-save-message";

statusMessage.textContent =
    "Status updated successfully ✓";

orderStatusSelect.insertAdjacentElement(
    "afterend",
    statusMessage
);

setTimeout(
    function () {

        statusMessage.remove();

    },
    2500
);

        } catch (error) {

            console.error(
                "Unable to update order status:",
                error
            );

            alert(
                "Unable to update the order status."
            );

        } finally {

            orderStatusSelect.disabled =
                false;
        }
    }
);

// =====================================
// Save Admin Notes
// =====================================

adminOrderDetails.addEventListener(
    "click",
    async function (event) {

        if (
            event.target.id !==
            "saveAdminNotesButton"
        ) {
            return;
        }

        const adminOrderNotes =
            document.getElementById(
                "adminOrderNotes"
            );

        const adminOrderNotesMessage =
            document.getElementById(
                "adminOrderNotesMessage"
            );

        const saveAdminNotesButton =
            event.target;

        saveAdminNotesButton.disabled =
            true;

        adminOrderNotesMessage.textContent =
            "Saving...";

        try {

            const orderReference =
                doc(
                    db,
                    "orders",
                    orderId
                );

            await updateDoc(
                orderReference,
                {
                    adminNotes:
                        adminOrderNotes.value.trim()
                }
            );

            adminOrderNotesMessage.textContent =
                "Notes saved successfully ✓";

        } catch (error) {

            console.error(
                "Unable to save admin notes:",
                error
            );

            adminOrderNotesMessage.textContent =
                "Unable to save notes.";

        } finally {

            saveAdminNotesButton.disabled =
                false;
        }
    }
);

// =====================================
// Print Invoice
// =====================================

printInvoiceButton.addEventListener(
    "click",
    function () {

        if (!currentOrder) {

            alert(
                "The order is still loading. Please try again."
            );

            return;
        }

        const invoiceWindow =
            window.open(
                "",
                "_blank"
            );

        if (!invoiceWindow) {

            alert(
                "Please allow pop-ups to print the invoice."
            );

            return;
        }

        const orderDate =
            currentOrder.createdAt
                ? currentOrder.createdAt
                    .toDate()
                    .toLocaleString("en-ZA")
                : "Unknown date";

        const itemsHtml =
            (currentOrder.items || [])
                .map(
                    function (item) {

                        const quantity =
                            Number(
                                item.quantity || 0
                            );

                        const price =
                            Number(
                                item.price || 0
                            );

                        const itemTotal =
                            quantity * price;

                        return `
                            <tr>
                                <td>
                                    ${item.name || "Unnamed Product"}
                                </td>

                                <td>
                                    ${quantity}
                                </td>

                                <td>
                                    R${price.toFixed(2)}
                                </td>

                                <td>
                                    R${itemTotal.toFixed(2)}
                                </td>
                            </tr>
                        `;
                    }
                )
                .join("");

        invoiceWindow.document.write(`
            <!DOCTYPE html>

            <html lang="en">

            <head>

                <meta charset="UTF-8">

                <title>
                    Invoice ${orderId}
                </title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 40px;
                        color: #222;
                    }

                    .invoice {
                        max-width: 900px;
                        margin: 0 auto;
                    }

                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 40px;
                    }

                    .invoice-header h1 {
                        margin: 0 0 8px;
                        font-size: 30px;
                    }

                    .invoice-header p {
                        margin: 4px 0;
                        color: #666;
                    }

                    .invoice-title {
                        text-align: right;
                    }

                    .invoice-title h2 {
                        margin: 0 0 8px;
                        font-size: 28px;
                    }

                    .invoice-section {
                        margin-bottom: 30px;
                    }

                    .invoice-section h3 {
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 8px;
                        margin-bottom: 15px;
                    }

                    .invoice-section p {
                        margin: 6px 0;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }

                    th,
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                        text-align: left;
                    }

                    th {
                        background: #f5f5f5;
                    }

                    .invoice-total {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 25px;
                        font-size: 22px;
                        font-weight: bold;
                    }

                    .invoice-footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #777;
                        font-size: 13px;
                    }

                    @media print {

                        body {
                            padding: 0;
                        }

                        .invoice {
                            max-width: none;
                        }
                    }

                </style>

            </head>

            <body>

                <div class="invoice">

                    <div class="invoice-header">

                        <div>

                            <h1>
                                3D Contour
                            </h1>

                            <p>
                                Order Invoice
                            </p>

                        </div>

                        <div class="invoice-title">

                            <h2>
                                INVOICE
                            </h2>

                            <p>
                                <strong>Order:</strong>
${currentOrder.orderNumber || orderId}
                            </p>

                            <p>
                                <strong>Date:</strong>
                                ${orderDate}
                            </p>

                        </div>

                    </div>

                    <div class="invoice-section">

                        <h3>
                            Customer
                        </h3>

                        <p>
                            <strong>Name:</strong>
                            ${currentOrder.customer?.name || ""}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${currentOrder.customer?.email || ""}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${currentOrder.customer?.phone || ""}
                        </p>

                    </div>

                    <div class="invoice-section">

                        <h3>
                            Order Information
                        </h3>

                        <p>
                            <strong>Delivery Method:</strong>
                            ${currentOrder.deliveryMethod || ""}
                        </p>

                        ${
                            currentOrder.deliveryAddress
                                ? `
                                    <p>
                                        <strong>Delivery Address:</strong><br>
                                        ${currentOrder.deliveryAddress}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="invoice-section">

                        <h3>
                            Products
                        </h3>

                        <table>

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>

                            </thead>

                            <tbody>
                                ${itemsHtml}
                            </tbody>

                        </table>

                        <div class="invoice-total">

                            Total:
                            &nbsp;
                            R${Number(
                                currentOrder.total || 0
                            ).toFixed(2)}

                        </div>

                    </div>

                    <div class="invoice-footer">

                        Thank you for your order from 3D Contour.

                    </div>

                </div>

                <script>

                    window.onload = function () {

                        window.print();

                    };

                <\/script>

            </body>

            </html>
        `);

        invoiceWindow.document.close();
    }
);