import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================
// Page Elements
// =====================================

const backToDashboardButton =
    document.getElementById("backToDashboardButton");

const logoutButton =
    document.getElementById("logoutButton");

const adminOrdersList =
    document.getElementById("adminOrdersList");

const adminOrderCount =
    document.getElementById("adminOrderCount");

    const statTotalOrders =
    document.getElementById(
        "statTotalOrders"
    );

const statPendingOrders =
    document.getElementById(
        "statPendingOrders"
    );

const statProcessingOrders =
    document.getElementById(
        "statProcessingOrders"
    );

const statCompletedOrders =
    document.getElementById(
        "statCompletedOrders"
    );

const statCancelledOrders =
    document.getElementById(
        "statCancelledOrders"
    );

const statTotalRevenue =
    document.getElementById(
        "statTotalRevenue"
    );

    const adminOrderFilters =
    document.querySelectorAll(
        ".admin-order-filter"
    );

    const adminOrderSearch =
    document.getElementById(
        "adminOrderSearch"
    );

    let allOrders = [];


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

            loadAdminOrders();

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
// Dashboard Button
// =====================================

backToDashboardButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin.html";
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
// Load Orders
// =====================================

async function loadAdminOrders() {

    try {

        adminOrdersList.innerHTML =
            "Loading orders...";

        const ordersQuery =
    query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
    );

const ordersSnapshot =
    await getDocs(
        ordersQuery
    );

    allOrders = [];

        adminOrdersList.innerHTML = "";

        let orderCount = 0;

        ordersSnapshot.forEach(
    function (documentSnapshot) {

        const order =
            documentSnapshot.data();

        const orderId =
            documentSnapshot.id;

            allOrders.push({
    id: orderId,
    ...order
});

        const orderDate =
            order.createdAt
                ? order.createdAt.toDate().toLocaleString("en-ZA")
                : "Unknown date";

        const orderRow =
            document.createElement("div");

        orderRow.className =
            "admin-order-row";

            orderRow.dataset.orderId =
    orderId;

        orderRow.innerHTML = `

            <div class="admin-order-info">

                <h4>
                    ${order.customer?.name || "Unknown Customer"}
                </h4>

                <p>
    Order: ${order.orderNumber || orderId}
</p>

                <p>
                    ${orderDate}
                </p>

            </div>

            <div class="admin-order-meta">

                <p>
                    ${order.deliveryMethod || "Unknown"}
                </p>

                <strong>
                    R${Number(order.total || 0).toFixed(2)}
                </strong>

                <span
    class="admin-order-status
    admin-order-status-${(order.status || "Pending")
        .toLowerCase()
        .replaceAll(" ", "-")}"
>
    ${order.status || "Pending"}
</span>

            </div>

        `;

        adminOrdersList.appendChild(
            orderRow
        );

        orderCount++;
    }
);

        adminOrderCount.textContent =
            orderCount === 1
                ? "1 order"
                : `${orderCount} orders`;

                updateOrderStatistics();

        if (orderCount === 0) {

            adminOrdersList.innerHTML =
                "<p>No orders found.</p>";
        }

    } catch (error) {

        console.error(
            "Unable to load orders:",
            error
        );

        adminOrdersList.innerHTML =
            "<p>Unable to load orders.</p>";
    }
}

// =====================================
// Open Order Details
// =====================================

adminOrdersList.addEventListener(
    "click",
    function (event) {

        const orderRow =
            event.target.closest(
                ".admin-order-row"
            );

        if (!orderRow) {
            return;
        }

        const orderId =
            orderRow.dataset.orderId;

        window.location.href =
            `admin-order-details.html?id=${orderId}`;
    }
);

// =====================================
// Filter And Search Orders
// =====================================

let selectedOrderStatus =
    "All";

function applyOrderFilters() {

    const searchValue =
        adminOrderSearch.value
            .trim()
            .toLowerCase();

    const orderRows =
        document.querySelectorAll(
            ".admin-order-row"
        );

        let visibleOrderCount = 0;

    orderRows.forEach(
        function (orderRow) {

            const orderId =
                orderRow.dataset.orderId;

            const matchingOrder =
                allOrders.find(
                    function (order) {

                        return (
                            order.id === orderId
                        );
                    }
                );

            if (!matchingOrder) {
                return;
            }

            const orderStatus =
                matchingOrder.status ||
                "Pending";

            const matchesStatus =
                selectedOrderStatus === "All" ||
                orderStatus === selectedOrderStatus;

            const searchableText = `
    ${matchingOrder.id || ""}
    ${matchingOrder.orderNumber || ""}
    ${matchingOrder.customer?.name || ""}
    ${matchingOrder.customer?.email || ""}
    ${matchingOrder.customer?.phone || ""}
`.toLowerCase();

            const matchesSearch =
                searchableText.includes(
                    searchValue
                );

            if (
    matchesStatus &&
    matchesSearch
) {
    orderRow.style.display = "";
    visibleOrderCount++;
} else {
    orderRow.style.display = "none";
}
        }
        );

    let noResultsMessage =
        document.getElementById(
            "noOrderResultsMessage"
        );

    if (
        visibleOrderCount === 0
    ) {

        if (!noResultsMessage) {

            noResultsMessage =
                document.createElement("p");

            noResultsMessage.id =
                "noOrderResultsMessage";

            noResultsMessage.className =
                "admin-order-no-results";

            noResultsMessage.textContent =
                "No matching orders found.";

            adminOrdersList.appendChild(
                noResultsMessage
            );
        }

    } else {

        if (noResultsMessage) {

            noResultsMessage.remove();
        }
    }
}


// =====================================
// Status Filter Buttons
// =====================================

adminOrderFilters.forEach(
    function (filterButton) {

        filterButton.addEventListener(
            "click",
            function () {

                selectedOrderStatus =
                    filterButton.dataset.status;

                adminOrderFilters.forEach(
                    function (button) {

                        button.classList.remove(
                            "active"
                        );
                    }
                );

                filterButton.classList.add(
                    "active"
                );

                applyOrderFilters();
            }
        );
    }
);


// =====================================
// Order Search
// =====================================

adminOrderSearch.addEventListener(
    "input",
    function () {

        applyOrderFilters();
    }
);

// =====================================
// Update Order Statistics
// =====================================

function updateOrderStatistics() {

    const totalOrders =
        allOrders.length;

    const pendingOrders =
        allOrders.filter(
            function (order) {

                return (
                    (order.status || "Pending") ===
                    "Pending"
                );
            }
        ).length;

    const processingOrders =
        allOrders.filter(
            function (order) {

                return (
                    order.status ===
                    "Processing"
                );
            }
        ).length;

    const completedOrders =
        allOrders.filter(
            function (order) {

                return (
                    order.status ===
                    "Completed"
                );
            }
        ).length;

    const cancelledOrders =
        allOrders.filter(
            function (order) {

                return (
                    order.status ===
                    "Cancelled"
                );
            }
        ).length;

    const totalRevenue =
        allOrders.reduce(
            function (total, order) {

                if (
                    order.status ===
                    "Cancelled"
                ) {
                    return total;
                }

                return (
                    total +
                    Number(order.total || 0)
                );
            },
            0
        );

    statTotalOrders.textContent =
        totalOrders;

    statPendingOrders.textContent =
        pendingOrders;

    statProcessingOrders.textContent =
        processingOrders;

    statCompletedOrders.textContent =
        completedOrders;

    statCancelledOrders.textContent =
        cancelledOrders;

    statTotalRevenue.textContent =
        `R${totalRevenue.toFixed(2)}`;
}