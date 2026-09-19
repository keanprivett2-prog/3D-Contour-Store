// =====================================
// 3D Contour - Customer Account
// =====================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =====================================
// Page Elements
// =====================================

const logoutButton =
    document.getElementById(
        "customerLogoutButton"
    );

    const customerOrdersList =
    document.getElementById(
        "customerOrdersList"
    );

    const welcomeName =
    document.getElementById(
        "customerWelcomeName"
    );

    const accountName =
    document.getElementById(
        "customerAccountName"
    );

const accountEmail =
    document.getElementById(
        "customerAccountEmail"
    );

    const accountPhone =
    document.getElementById(
        "customerAccountPhone"
    );

    const deliveryAddress =
    document.getElementById(
        "customerDeliveryAddress"
    );

const editDeliveryDetailsButton =
    document.getElementById(
        "editDeliveryDetailsButton"
    );

    const deliveryForm =
    document.getElementById(
        "customerDeliveryForm"
    );

const deliveryStreetAddress =
    document.getElementById(
        "deliveryStreetAddress"
    );

const deliverySuburb =
    document.getElementById(
        "deliverySuburb"
    );

const deliveryCity =
    document.getElementById(
        "deliveryCity"
    );

const deliveryProvince =
    document.getElementById(
        "deliveryProvince"
    );

const deliveryPostalCode =
    document.getElementById(
        "deliveryPostalCode"
    );

const cancelDeliveryDetailsButton =
    document.getElementById(
        "cancelDeliveryDetailsButton"
    );

const deliveryDetailsMessage =
    document.getElementById(
        "deliveryDetailsMessage"
    );

    const editDetailsButton =
    document.getElementById(
        "editCustomerDetailsButton"
    );

    const editDetailsForm =
    document.getElementById(
        "customerEditDetailsForm"
    );

const editFirstName =
    document.getElementById(
        "editCustomerFirstName"
    );

const editLastName =
    document.getElementById(
        "editCustomerLastName"
    );

const editPhone =
    document.getElementById(
        "editCustomerPhone"
    );

const cancelEditDetailsButton =
    document.getElementById(
        "cancelEditDetailsButton"
    );

const customerDetailsMessage =
    document.getElementById(
        "customerDetailsMessage"
    );


// =====================================
// Protect Customer Account Page
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

        await loadCustomerOrders(user);

        console.log(
            "Customer signed in:",
            user.uid
        );

        const fullName =
    user.displayName || "Customer";

const firstName =
    fullName.split(" ")[0];

welcomeName.textContent =
    firstName;

    accountName.textContent =
    fullName;

accountEmail.textContent =
    user.email || "Not available";
    
    // =====================================
// Load Customer Profile
// =====================================

const customerDoc =
    await getDoc(
        doc(
            db,
            "customers",
            user.uid
        )
    );

if (customerDoc.exists()) {

    const customerData =
        customerDoc.data();

    accountPhone.textContent =
        customerData.phone ||
        "Not added yet";

        editFirstName.value =
    customerData.firstName || "";

editLastName.value =
    customerData.lastName || "";

editPhone.value =
    customerData.phone || "";

    const savedAddress =
    customerData.deliveryAddress;

if (savedAddress) {

    deliveryAddress.textContent =
        `${savedAddress.streetAddress}, ` +
        `${savedAddress.suburb}, ` +
        `${savedAddress.city}, ` +
        `${savedAddress.province}, ` +
        `${savedAddress.postalCode}`;

} else {

    deliveryAddress.textContent =
        "Not added yet";

}

deliveryStreetAddress.value =
    savedAddress.streetAddress || "";

deliverySuburb.value =
    savedAddress.suburb || "";

deliveryCity.value =
    savedAddress.city || "";

deliveryProvince.value =
    savedAddress.province || "";

deliveryPostalCode.value =
    savedAddress.postalCode || "";

editDeliveryDetailsButton.textContent =
    "Edit Delivery Details";

} else {

    accountPhone.textContent =
        "Not added yet";

}

    }
    
);

// =====================================
// Load Customer Orders
// =====================================

async function loadCustomerOrders(user) {

    try {

        const ordersQuery =
            query(
                collection(
                    db,
                    "orders"
                ),
                where(
                    "customerUid",
                    "==",
                    user.uid
                )
            );

        const ordersSnapshot =
            await getDocs(
                ordersQuery
            );

        if (ordersSnapshot.empty) {

            customerOrdersList.innerHTML = `
                <p class="customer-orders-empty">
                    You don't have any orders yet.
                </p>
            `;

            return;
        }

        const customerOrders = [];

        ordersSnapshot.forEach(
            (orderDocument) => {

                customerOrders.push({
                    id: orderDocument.id,
                    ...orderDocument.data()
                });

            }
        );

        customerOrders.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toDate
                        ? a.createdAt.toDate()
                        : new Date(0);

                const dateB =
                    b.createdAt?.toDate
                        ? b.createdAt.toDate()
                        : new Date(0);

                return dateB - dateA;

            }
        );

        customerOrdersList.innerHTML =
    customerOrders
        .map((order) => {

            const orderNumber =
                order.orderNumber ||
                order.id;

            const total =
                Number(
                    order.total || 0
                );

            const orderStatus =
                order.status ||
                "Pending";

            const paymentStatus =
                order.paymentStatus ||
                "Pending";

            let orderDate =
                "Date unavailable";

            if (
                order.createdAt?.toDate
            ) {

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

            return `
                <a
    href="customer-order.html?id=${order.id}"
    class="customer-order-card"
>

                    <div class="customer-order-heading">

                        <div>
                            <strong>
                                ${orderNumber}
                            </strong>

                            <p>
                                ${orderDate}
                            </p>
                        </div>

                        <span class="customer-order-status">
                            ${orderStatus}
                        </span>

                    </div>

                    <div class="customer-order-details">

                        <p>
                            <strong>Total:</strong>
                            R${total.toFixed(2)}
                        </p>

                        <p>
                            <strong>Payment:</strong>
                            ${paymentStatus}
                        </p>

                        <span class="customer-order-view-link">
    View Order Details →
</span>

                    </div>

                </a>

                    `;

        })
        .join("");

    } catch (error) {

        console.error(
            "Unable to load customer orders:",
            error
        );

        customerOrdersList.innerHTML = `
            <p class="customer-orders-empty">
                Unable to load your orders.
            </p>
        `;

    }

}

// =====================================
// Open Delivery Details Form
// =====================================

editDeliveryDetailsButton.addEventListener(
    "click",
    () => {

        deliveryForm.hidden = false;
        editDeliveryDetailsButton.hidden = true;

    }
);

// =====================================
// Close Delivery Details Form
// =====================================

cancelDeliveryDetailsButton.addEventListener(
    "click",
    () => {

        deliveryForm.hidden = true;
        editDeliveryDetailsButton.hidden = false;

        deliveryDetailsMessage.textContent =
            "";

    }
);

// =====================================
// Open Account Details Form
// =====================================

editDetailsButton.addEventListener(
    "click",
    () => {

        editDetailsForm.hidden = false;
        editDetailsButton.hidden = true;

    }
);

// =====================================
// Close Account Details Form
// =====================================

cancelEditDetailsButton.addEventListener(
    "click",
    () => {

        editDetailsForm.hidden = true;
        editDetailsButton.hidden = false;

        customerDetailsMessage.textContent =
            "";

    }
);

// =====================================
// Save Delivery Details
// =====================================

deliveryForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const user =
            auth.currentUser;

        if (!user) {
            return;
        }

        const streetAddress =
    deliveryStreetAddress.value.trim();

const suburb =
    deliverySuburb.value.trim();

const city =
    deliveryCity.value.trim();

const province =
    deliveryProvince.value;

const postalCode =
    deliveryPostalCode.value.trim();

    try {

    deliveryDetailsMessage.textContent =
        "Saving delivery details...";

    await updateDoc(
        doc(
            db,
            "customers",
            user.uid
        ),
        {
            deliveryAddress: {
                streetAddress: streetAddress,
                suburb: suburb,
                city: city,
                province: province,
                postalCode: postalCode
            },
            updatedAt: serverTimestamp()
        }
    );

    deliveryAddress.textContent =
    `${streetAddress}, ` +
    `${suburb}, ` +
    `${city}, ` +
    `${province}, ` +
    `${postalCode}`;

editDeliveryDetailsButton.textContent =
    "Edit Delivery Details";

deliveryDetailsMessage.textContent =
    "Delivery details updated successfully.";

deliveryForm.hidden = true;
editDeliveryDetailsButton.hidden = false;

} catch (error) {

    console.error(
        "Unable to save delivery details:",
        error
    );

    deliveryDetailsMessage.textContent =
        "Unable to save your delivery details.";

}

    }
);

// =====================================
// Save Account Details
// =====================================

editDetailsForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const user =
            auth.currentUser;

        if (!user) {
            return;
        }

        const firstName =
    editFirstName.value.trim();

const lastName =
    editLastName.value.trim();

const phone =
    editPhone.value.trim();

    try {

    customerDetailsMessage.textContent =
        "Saving changes...";

    await updateDoc(
        doc(
            db,
            "customers",
            user.uid
        ),
        {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            updatedAt: serverTimestamp()
        }
    );

    const fullName =
    `${firstName} ${lastName}`.trim();

    await updateProfile(
    user,
    {
        displayName: fullName
    }
);

accountName.textContent =
    fullName;

accountPhone.textContent =
    phone || "Not added yet";

welcomeName.textContent =
    firstName || "Customer";

customerDetailsMessage.textContent =
    "Account details updated successfully.";

editDetailsForm.hidden = true;
editDetailsButton.hidden = false;

} catch (error) {

    console.error(
        "Unable to update customer details:",
        error
    );

    customerDetailsMessage.textContent =
        "Unable to save your changes.";

}

    }
);

// =====================================
// Customer Sign Out
// =====================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.replace(
                "account.html"
            );

        } catch (error) {

            console.error(
                "Unable to sign out:",
                error
            );

        }

    }
);