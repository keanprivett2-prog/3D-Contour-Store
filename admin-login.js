// =====================================
// Firebase
// =====================================

import {
    auth,
    db
} from "./firebase.js";


import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================
// Page Elements
// =====================================

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginButton =
    document.getElementById("adminLoginButton");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");


// =====================================
// Admin Login
// =====================================

adminLoginButton.addEventListener(
    "click",
    async function () {

        const email =
            adminEmail.value.trim();

        const password =
            adminPassword.value;


        if (!email || !password) {

            adminLoginMessage.textContent =
                "Please enter your email address and password.";

            return;

        }


        adminLoginButton.disabled = true;

        adminLoginMessage.textContent =
            "Signing in...";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


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

                adminLoginMessage.textContent =
                    "This account does not have admin access.";

                return;

            }


            const userData =
                userSnapshot.data();


            if (
                userData.role !== "admin" ||
                userData.active !== true
            ) {

                await signOut(auth);

                adminLoginMessage.textContent =
                    "This account does not have admin access.";

                return;

            }


            window.location.href =
                "admin.html";


        } catch (error) {

            console.error(
                "Admin login failed:",
                error
            );


            adminLoginMessage.textContent =
                "Unable to sign in. Check your email and password.";

        } finally {

            adminLoginButton.disabled = false;

        }

    }
);