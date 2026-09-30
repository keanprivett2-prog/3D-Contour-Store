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


const productionLeadTime =
    document.getElementById(
        "productionLeadTime"
    );


const collectionLeadTime =
    document.getElementById(
        "collectionLeadTime"
    );


const pudoLockerLockerLeadTime =
    document.getElementById(
        "pudoLockerLockerLeadTime"
    );


const pudoLockerAddressLeadTime =
    document.getElementById(
        "pudoLockerAddressLeadTime"
    );


const saveLeadTimesButton =
    document.getElementById(
        "saveLeadTimesButton"
    );


const leadTimesStatus =
    document.getElementById(
        "leadTimesStatus"
    );


// =====================================
// Admin Authentication
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


            if (
                !userSnapshot.exists()
            ) {

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


            await loadLeadTimeSettings();


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
// Load Lead Time Settings
// =====================================

async function loadLeadTimeSettings() {

    try {

        const settingsReference =
            doc(
                db,
                "storeSettings",
                "leadTimes"
            );


        const settingsSnapshot =
            await getDoc(
                settingsReference
            );


        if (
            !settingsSnapshot.exists()
        ) {

            console.log(
                "No lead time settings found. Using defaults."
            );

            return;

        }


        const settings =
            settingsSnapshot.data();


        if (
            settings.productionLeadTime !==
            undefined
        ) {

            productionLeadTime.value =
                settings.productionLeadTime;

        }


        if (
            settings.collectionLeadTime !==
            undefined
        ) {

            collectionLeadTime.value =
                settings.collectionLeadTime;

        }


        if (
            settings.pudoLockerLockerLeadTime !==
            undefined
        ) {

            pudoLockerLockerLeadTime.value =
                settings.pudoLockerLockerLeadTime;

        }


        if (
            settings.pudoLockerAddressLeadTime !==
            undefined
        ) {

            pudoLockerAddressLeadTime.value =
                settings.pudoLockerAddressLeadTime;

        }


        if (
            settings.excludeWeekends !==
            undefined
        ) {

            const radioButton =
                document.querySelector(
                    `input[name="excludeWeekends"][value="${
                        settings.excludeWeekends
                            ? "yes"
                            : "no"
                    }"]`
                );


            if (radioButton) {

                radioButton.checked =
                    true;

            }

        }


    } catch (error) {

        console.error(
            "Unable to load lead time settings:",
            error
        );

    }

}


// =====================================
// Save Lead Time Settings
// =====================================

saveLeadTimesButton.addEventListener(
    "click",
    async function () {

        try {

            saveLeadTimesButton.disabled =
                true;


            leadTimesStatus.textContent =
                "Saving settings...";


            const excludeWeekendsOption =
                document.querySelector(
                    'input[name="excludeWeekends"]:checked'
                );


            const settings = {

                productionLeadTime:
                    Number(
                        productionLeadTime.value
                    ) || 0,

                collectionLeadTime:
                    Number(
                        collectionLeadTime.value
                    ) || 0,

                pudoLockerLockerLeadTime:
                    Number(
                        pudoLockerLockerLeadTime.value
                    ) || 0,

                pudoLockerAddressLeadTime:
                    Number(
                        pudoLockerAddressLeadTime.value
                    ) || 0,

                excludeWeekends:
                    excludeWeekendsOption
                        ? excludeWeekendsOption.value ===
                          "yes"
                        : true

            };


            const settingsReference =
                doc(
                    db,
                    "storeSettings",
                    "leadTimes"
                );


            await setDoc(
                settingsReference,
                settings
            );


            leadTimesStatus.textContent =
                "Lead time settings saved successfully.";


            leadTimesStatus.style.color =
                "#2e7d32";


        } catch (error) {

            console.error(
                "Unable to save lead time settings:",
                error
            );


            leadTimesStatus.textContent =
                "Unable to save settings. Please try again.";


            leadTimesStatus.style.color =
                "#b3261e";


        } finally {

            saveLeadTimesButton.disabled =
                false;

        }

    }
);


// =====================================
// Back to Dashboard
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

        try {

            await signOut(auth);

            window.location.href =
                "admin-login.html";

        } catch (error) {

            console.error(
                "Unable to logout:",
                error
            );

        }

    }
);