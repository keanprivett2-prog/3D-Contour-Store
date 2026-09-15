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
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================
// Page Elements
// =====================================

const logoutButton =
    document.getElementById("logoutButton");

const manageProductsButton =
    document.getElementById("manageProductsButton");

    const manageOrdersButton =
    document.getElementById("manageOrdersButton");

    const manageCustomRequestsButton =
    document.getElementById(
        "manageCustomRequestsButton"
    );


// =====================================
// Protect Admin Page
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
// Manage Products
// =====================================

manageProductsButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-products.html";

    }
);

// =====================================
// Manage Orders
// =====================================

manageOrdersButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-orders.html";

    }
);

// =====================================
// Manage Custom Requests
// =====================================

manageCustomRequestsButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "admin-custom-requests.html";

    }
);