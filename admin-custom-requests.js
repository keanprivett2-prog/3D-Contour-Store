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

const dashboardButton =
    document.getElementById(
        "dashboardButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const customRequestAdminGrid =
    document.getElementById(
        "customRequestAdminGrid"
    );

const customRequestSearch =
    document.getElementById(
        "customRequestSearch"
    );

const customRequestStatusFilter =
    document.getElementById(
        "customRequestStatusFilter"
    );

    let allCustomRequests = [];


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
                await getDoc(
                    userReference
                );

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

            loadCustomRequests();

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
// Load Custom Requests
// =====================================

async function loadCustomRequests() {

    try {

        customRequestAdminGrid.innerHTML =
            "<p>Loading custom requests...</p>";

        const requestsQuery =
            query(
                collection(
                    db,
                    "customRequests"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

        const requestsSnapshot =
            await getDocs(
                requestsQuery
            );

        customRequestAdminGrid.innerHTML =
            "";

            allCustomRequests = [];

        if (requestsSnapshot.empty) {

            customRequestAdminGrid.innerHTML =
                "<p>No custom requests found.</p>";

            return;
        }

        requestsSnapshot.forEach(
            function (documentSnapshot) {

                const request =
                    documentSnapshot.data();

                const requestId =
                    documentSnapshot.id;

                    allCustomRequests.push({
    id: requestId,
    ...request
});

                const requestDate =
                    request.createdAt
                        ? request.createdAt
                            .toDate()
                            .toLocaleString(
                                "en-ZA"
                            )
                        : "Unknown date";

                const requestCard =
                    document.createElement(
                        "div"
                    );

                requestCard.className =
                    "admin-card";

                requestCard.dataset.requestId =
                    requestId;

                requestCard.innerHTML = `

    <div class="custom-request-card-image">

        <img
            src="${request.imageUrl || ""}"
            alt="Custom request inspiration"
        >

    </div>

    <div class="custom-request-card-content">

        <div class="custom-request-card-top">

            <div>

                <h3>
                    ${request.name || "Unknown Customer"}
                </h3>

                <p>
                    ${request.productType || "Not specified"}
                </p>

            </div>

            <span
    class="custom-request-status-badge
    custom-request-status-${(request.status || "New")
        .toLowerCase()
        .replaceAll(" ", "-")}"
>
    ${request.status || "New"}
</span>

        </div>

        <p>
            <strong>Email:</strong>
            ${request.email || "Not supplied"}
        </p>

        <p>
            <strong>Phone:</strong>
            ${request.phone || "Not supplied"}
        </p>

        <p>
            <strong>Size:</strong>
            ${request.size || "Not specified"}
        </p>

        <p>
            <strong>Quantity:</strong>
            ${request.quantity || 1}
        </p>

        <p>
            <strong>Quote:</strong>
            ${
                request.quoteAmount !== undefined
                    ? `R${Number(request.quoteAmount).toFixed(2)}`
                    : "Not quoted"
            }
        </p>

        <p>
            <strong>Submitted:</strong>
            ${requestDate}
        </p>

        <button
            class="view-custom-request-button"
        >
            View Request
        </button>

    </div>

`;

                customRequestAdminGrid.appendChild(
                    requestCard
                );
            }
        );

    } catch (error) {

        console.error(
            "Unable to load custom requests:",
            error
        );

        customRequestAdminGrid.innerHTML =
            "<p>Unable to load custom requests.</p>";
    }
}

// =====================================
// Open Custom Request Details
// =====================================

customRequestAdminGrid.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".view-custom-request-button"
            );

        if (!button) {
            return;
        }

        const requestCard =
            button.closest(
                ".admin-card"
            );

        if (!requestCard) {
            return;
        }

        const requestId =
            requestCard.dataset.requestId;

        window.location.href =
            `admin-custom-request-details.html?id=${requestId}`;
    }
);

// =====================================
// Filter Custom Requests
// =====================================

function applyCustomRequestFilters() {

    const searchValue =
        customRequestSearch.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        customRequestStatusFilter.value;

    const requestCards =
        document.querySelectorAll(
            ".custom-request-admin-grid .admin-card"
        );

    requestCards.forEach(
        function (requestCard) {

            const requestId =
                requestCard.dataset.requestId;

            const matchingRequest =
                allCustomRequests.find(
                    function (request) {

                        return (
                            request.id === requestId
                        );
                    }
                );

            if (!matchingRequest) {
                return;
            }

            const requestStatus =
                matchingRequest.status || "New";

            const matchesStatus =
                selectedStatus === "all" ||
                requestStatus === selectedStatus;

            const searchableText = `
                ${matchingRequest.name || ""}
                ${matchingRequest.email || ""}
                ${matchingRequest.phone || ""}
                ${matchingRequest.productType || ""}
                ${matchingRequest.instructions || ""}
            `.toLowerCase();

            const matchesSearch =
                searchableText.includes(
                    searchValue
                );

            if (
                matchesStatus &&
                matchesSearch
            ) {

                requestCard.style.display =
                    "";

            } else {

                requestCard.style.display =
                    "none";
            }
        }
    );
}

// =====================================
// Search Custom Requests
// =====================================

customRequestSearch.addEventListener(
    "input",
    function () {

        applyCustomRequestFilters();
    }
);


// =====================================
// Status Filter
// =====================================

customRequestStatusFilter.addEventListener(
    "change",
    function () {

        applyCustomRequestFilters();
    }
);