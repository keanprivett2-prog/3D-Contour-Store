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
    setDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================
// Page Elements
// =====================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const backToDashboardButton =
    document.getElementById(
        "backToDashboardButton"
    );


const backToDashboardButtonBottom =
    document.getElementById(
        "backToDashboardButtonBottom"
    );


const saveShippingSettingsButton =
    document.getElementById(
        "saveShippingSettingsButton"
    );


const collectionPriceInput =
    document.getElementById(
        "collectionPrice"
    );


const lockerLockerPriceInput =
    document.getElementById(
        "lockerLockerPrice"
    );


const lockerAddressPriceInput =
    document.getElementById(
        "lockerAddressPrice"
    );


const freeDeliveryThresholdInput =
    document.getElementById(
        "freeDeliveryThreshold"
    );


const shippingSettingsStatus =
    document.getElementById(
        "shippingSettingsStatus"
    );


// =====================================
// Firestore Reference
// =====================================

const shippingSettingsReference =
    doc(
        db,
        "settings",
        "shipping"
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


            // Admin verified.
            // Load shipping settings.

            await loadShippingSettings();


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
// Load Shipping Settings
// =====================================

async function loadShippingSettings() {

    try {

        const shippingSnapshot =
            await getDoc(
                shippingSettingsReference
            );


        if (
            shippingSnapshot.exists()
        ) {

            const shippingData =
                shippingSnapshot.data();


            collectionPriceInput.value =
                shippingData.collectionPrice
                ?? 0;


            lockerLockerPriceInput.value =
                shippingData.lockerLockerPrice
                ?? 80;


            lockerAddressPriceInput.value =
                shippingData.lockerAddressPrice
                ?? 110;


            freeDeliveryThresholdInput.value =
                shippingData.freeDeliveryThreshold
                ?? 500;

        }


    } catch (error) {

        console.error(
            "Unable to load shipping settings:",
            error
        );


        showStatus(
            "Unable to load shipping settings.",
            "error"
        );

    }

}


// =====================================
// Save Shipping Settings
// =====================================

saveShippingSettingsButton.addEventListener(
    "click",
    async function () {

        const collectionPrice =
            Number(
                collectionPriceInput.value
            );


        const lockerLockerPrice =
            Number(
                lockerLockerPriceInput.value
            );


        const lockerAddressPrice =
            Number(
                lockerAddressPriceInput.value
            );


        const freeDeliveryThreshold =
            Number(
                freeDeliveryThresholdInput.value
            );


        // =====================================
        // Validation
        // =====================================

        if (
            !Number.isFinite(collectionPrice) ||
            collectionPrice < 0
        ) {

            showStatus(
                "Please enter a valid collection price.",
                "error"
            );

            return;

        }


        if (
            !Number.isFinite(lockerLockerPrice) ||
            lockerLockerPrice < 0
        ) {

            showStatus(
                "Please enter a valid Locker → Locker price.",
                "error"
            );

            return;

        }


        if (
            !Number.isFinite(lockerAddressPrice) ||
            lockerAddressPrice < 0
        ) {

            showStatus(
                "Please enter a valid Locker → Address price.",
                "error"
            );

            return;

        }


        if (
            !Number.isFinite(freeDeliveryThreshold) ||
            freeDeliveryThreshold < 0
        ) {

            showStatus(
                "Please enter a valid free-delivery threshold.",
                "error"
            );

            return;

        }


        // =====================================
        // Disable Button
        // =====================================

        saveShippingSettingsButton.disabled =
            true;


        saveShippingSettingsButton.textContent =
            "Saving...";


        try {

            await setDoc(
                shippingSettingsReference,
                {

                    collectionPrice:
                        collectionPrice,

                    lockerLockerPrice:
                        lockerLockerPrice,

                    lockerAddressPrice:
                        lockerAddressPrice,

                    freeDeliveryThreshold:
                        freeDeliveryThreshold,

                    updatedAt:
                        new Date()

                }
            );


            showStatus(
                "Shipping settings saved successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Unable to save shipping settings:",
                error
            );


            showStatus(
                "Unable to save shipping settings.",
                "error"
            );

        }


        finally {

            saveShippingSettingsButton.disabled =
                false;


            saveShippingSettingsButton.textContent =
                "Save Shipping Settings";

        }

    }
);


// =====================================
// Status Message
// =====================================

function showStatus(
    message,
    type
) {

    shippingSettingsStatus.textContent =
        message;


    shippingSettingsStatus.hidden =
        false;


    shippingSettingsStatus.dataset.type =
        type;

}


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
// Back To Dashboard
// =====================================

function goToDashboard() {

    window.location.href =
        "admin.html";

}


backToDashboardButton.addEventListener(
    "click",
    goToDashboard
);


backToDashboardButtonBottom.addEventListener(
    "click",
    goToDashboard
);