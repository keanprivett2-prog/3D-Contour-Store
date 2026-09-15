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

const backToRequestsButton =
    document.getElementById(
        "backToRequestsButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const customRequestDetails =
    document.getElementById(
        "customRequestDetails"
    );


// =====================================
// Get Request ID From URL
// =====================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const requestId =
    urlParams.get("id");


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

            loadCustomRequestDetails();

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
// Back To Requests
// =====================================

backToRequestsButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-custom-requests.html";
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
// Load Custom Request Details
// =====================================

async function loadCustomRequestDetails() {

    try {

        if (!requestId) {

            customRequestDetails.innerHTML =
                "<p>No request ID was provided.</p>";

            return;
        }

        const requestReference =
            doc(
                db,
                "customRequests",
                requestId
            );

        const requestSnapshot =
            await getDoc(
                requestReference
            );

        if (!requestSnapshot.exists()) {

            customRequestDetails.innerHTML =
                "<p>Custom request not found.</p>";

            return;
        }

        const request =
            requestSnapshot.data();

        const requestDate =
            request.createdAt
                ? request.createdAt
                    .toDate()
                    .toLocaleString(
                        "en-ZA"
                    )
                : "Unknown date";

        customRequestDetails.innerHTML = `

            <div class="custom-request-details-grid">

                <div class="custom-request-image-panel">

    <img
        src="${request.imageUrl || ""}"
        alt="Customer inspiration"
        class="custom-request-image"
    >

    <button
        type="button"
        class="view-full-image-button"
        id="viewFullImageButton"
        data-image-url="${request.imageUrl || ""}"
    >
        View Full Image
    </button>

</div>


                <div class="custom-request-info-panel">

                    <h3>
                        ${request.name || "Unknown Customer"}
                    </h3>

                    <p>
                        <strong>Email:</strong>
                        ${request.email || "Not supplied"}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${request.phone || "Not supplied"}
                    </p>

                    <p>
                        <strong>Product Type:</strong>
                        ${request.productType || "Not specified"}
                    </p>

                    <p>
                        <strong>Approximate Size:</strong>
                        ${request.size || "Not specified"}
                    </p>

                    <p>
                        <strong>Quantity:</strong>
                        ${request.quantity || 1}
                    </p>

                    <div class="custom-request-status-section">

    <label for="requestStatus">
        <strong>Status:</strong>
    </label>

    <select id="requestStatus">

        <option value="New"
            ${request.status === "New" ? "selected" : ""}>
            New
        </option>

        <option value="Reviewing"
            ${request.status === "Reviewing" ? "selected" : ""}>
            Reviewing
        </option>

        <option value="Quoted"
            ${request.status === "Quoted" ? "selected" : ""}>
            Quoted
        </option>

        <option value="Approved"
            ${request.status === "Approved" ? "selected" : ""}>
            Approved
        </option>

        <option value="In Progress"
            ${request.status === "In Progress" ? "selected" : ""}>
            In Progress
        </option>

        <option value="Completed"
            ${request.status === "Completed" ? "selected" : ""}>
            Completed
        </option>

        <option value="Cancelled"
            ${request.status === "Cancelled" ? "selected" : ""}>
            Cancelled
        </option>

    </select>

    <button id="saveRequestStatusButton">
        Save Status
    </button>

</div>

                    <p>
                        <strong>Submitted:</strong>
                        ${requestDate}
                    </p>

                </div>

            </div>


            <div class="custom-request-instructions">

                <h3>
                    Customer Instructions
                </h3>

                <p>
                    ${request.instructions || "No instructions supplied."}
                </p>

            </div>

            <div class="custom-request-admin-notes">

    <h3>
        Admin Notes
    </h3>

    <textarea
        id="adminNotes"
        rows="6"
        placeholder="Add internal notes about this request..."
    >${request.adminNotes || ""}</textarea>

    <button id="saveAdminNotesButton">
        Save Notes
    </button>

</div>

<div class="custom-request-quote-section">

    <h3>
        Quote Amount
    </h3>

    <label for="quoteAmount">
        Amount (R)
    </label>

    <input
        type="number"
        id="quoteAmount"
        min="0"
        step="0.01"
        value="${request.quoteAmount || ""}"
        placeholder="Example: 250.00"
    >

    <button id="saveQuoteAmountButton">
        Save Quote
    </button>

</div>
        `;

    } catch (error) {

        console.error(
            "Unable to load custom request:",
            error
        );

        customRequestDetails.innerHTML =
            "<p>Unable to load custom request.</p>";
    }
}

// =====================================
// Save Request Status
// =====================================

customRequestDetails.addEventListener(
    "click",
    async function (event) {

        if (
            event.target.id !==
            "saveRequestStatusButton"
        ) {
            return;
        }

        const requestStatus =
            document.getElementById(
                "requestStatus"
            );

        if (!requestStatus) {
            return;
        }

        try {

            const requestReference =
                doc(
                    db,
                    "customRequests",
                    requestId
                );

            await updateDoc(
                requestReference,
                {
                    status:
                        requestStatus.value
                }
            );

            alert(
                "Request status updated successfully."
            );

        } catch (error) {

            console.error(
                "Unable to update request status:",
                error
            );

            alert(
                "Unable to update request status."
            );
        }
    }
);

// =====================================
// Save Admin Notes
// =====================================

customRequestDetails.addEventListener(
    "click",
    async function (event) {

        if (
            event.target.id !==
            "saveAdminNotesButton"
        ) {
            return;
        }

        const adminNotes =
            document.getElementById(
                "adminNotes"
            );

        if (!adminNotes) {
            return;
        }

        try {

            const requestReference =
                doc(
                    db,
                    "customRequests",
                    requestId
                );

            await updateDoc(
                requestReference,
                {
                    adminNotes:
                        adminNotes.value.trim()
                }
            );

            alert(
                "Admin notes saved successfully."
            );

        } catch (error) {

            console.error(
                "Unable to save admin notes:",
                error
            );

            alert(
                "Unable to save admin notes."
            );
        }
    }
);

// =====================================
// Save Quote Amount
// =====================================

customRequestDetails.addEventListener(
    "click",
    async function (event) {

        if (
            event.target.id !==
            "saveQuoteAmountButton"
        ) {
            return;
        }

        const quoteAmount =
            document.getElementById(
                "quoteAmount"
            );

        if (!quoteAmount) {
            return;
        }

        const amount =
            Number(
                quoteAmount.value
            );

        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            alert(
                "Please enter a valid quote amount."
            );

            return;
        }

        try {

            const requestReference =
                doc(
                    db,
                    "customRequests",
                    requestId
                );

            await updateDoc(
                requestReference,
                {
                    quoteAmount:
                        amount
                }
            );

            alert(
                "Quote amount saved successfully."
            );

        } catch (error) {

            console.error(
                "Unable to save quote amount:",
                error
            );

            alert(
                "Unable to save quote amount."
            );
        }
    }
);

// =====================================
// Full Image Viewer
// =====================================

customRequestDetails.addEventListener(
    "click",
    function (event) {

        if (
            event.target.id !==
            "viewFullImageButton"
        ) {
            return;
        }

        const imageUrl =
            event.target.dataset.imageUrl;

        if (!imageUrl) {
            return;
        }

        const lightbox =
            document.createElement(
                "div"
            );

        lightbox.className =
            "custom-request-lightbox";

        lightbox.innerHTML = `

            <div class="custom-request-lightbox-content">

                <button
                    type="button"
                    class="custom-request-lightbox-close"
                >
                    ×
                </button>

                <img
                    src="${imageUrl}"
                    alt="Full customer inspiration image"
                >

            </div>

        `;

        document.body.appendChild(
            lightbox
        );

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === lightbox ||
                    event.target.classList.contains(
                        "custom-request-lightbox-close"
                    )
                ) {
                    lightbox.remove();
                }
            }
        );
    }
);