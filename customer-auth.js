// =====================================
// 3D Contour - Customer Authentication
// =====================================

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =====================================
// Page Elements
// =====================================

const loginForm =
    document.getElementById("customerLoginForm");

const registerForm =
    document.getElementById("customerRegisterForm");

const registerPrompt =
    document.querySelector(".customer-register-prompt");

const showRegisterButton =
    document.getElementById("showRegisterButton");

const backToLoginButton =
    document.getElementById("backToLoginButton");

    const forgotPasswordButton =
    document.getElementById(
        "forgotPasswordButton"
    );

const authHeading =
    document.querySelector(".customer-auth-heading h1");

const authDescription =
    document.querySelector(".customer-auth-heading p");

    // =====================================
// Redirect Signed-In Customers
// =====================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            window.location.replace(
                "customer-account.html"
            );

        }

    }
);


// =====================================
// Show Registration Form
// =====================================

showRegisterButton.addEventListener(
    "click",
    () => {

        loginForm.hidden = true;
        registerPrompt.hidden = true;
        registerForm.hidden = false;

        authHeading.textContent =
            "Create Your Account";

        authDescription.textContent =
            "Create an account to manage your orders, custom requests and account details.";

    }
);


// =====================================
// Return To Login
// =====================================

backToLoginButton.addEventListener(
    "click",
    () => {

        registerForm.hidden = true;
        loginForm.hidden = false;
        registerPrompt.hidden = false;

        authHeading.textContent =
            "Welcome Back";

        authDescription.textContent =
            "Sign in to manage your orders, custom requests and account details.";

    }
);

// =====================================
// Create Customer Account
// =====================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const firstName =
            document
                .getElementById("customerFirstName")
                .value
                .trim();

        const lastName =
            document
                .getElementById("customerLastName")
                .value
                .trim();

        const email =
            document
                .getElementById("customerRegisterEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("customerRegisterPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("customerConfirmPassword")
                .value;

        const message =
            document.getElementById(
                "customerRegisterMessage"
            );

        const registerButton =
            document.getElementById(
                "customerRegisterButton"
            );


        // =====================================
        // Check Passwords Match
        // =====================================

        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;

        }


        // =====================================
        // Create Firebase Account
        // =====================================

        try {

            registerButton.disabled = true;

            message.textContent =
                "Creating your account...";

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            // =====================================
            // Save Customer Name
            // =====================================

            await updateProfile(
                userCredential.user,
                {
                    displayName:
                        `${firstName} ${lastName}`
                }
            );

            // =====================================
// Create Customer Firestore Profile
// =====================================

await setDoc(
    doc(
        db,
        "customers",
        userCredential.user.uid
    ),
    {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }
);


            message.textContent =
                "Account created successfully!";

            console.log(
                "Customer account created:",
                userCredential.user.uid
            );

        } catch (error) {

            console.error(
                "Unable to create customer account:",
                error
            );

            message.textContent =
                "Unable to create your account. Please check your details and try again.";

        } finally {

            registerButton.disabled = false;

        }

    }
);

// =====================================
// Customer Sign In
// =====================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            document
                .getElementById("customerLoginEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("customerLoginPassword")
                .value;

        const message =
            document.getElementById(
                "customerLoginMessage"
            );

        const loginButton =
            document.getElementById(
                "customerLoginButton"
            );

        try {

            loginButton.disabled = true;

            message.textContent =
                "Signing you in...";

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            console.log(
                "Customer signed in:",
                userCredential.user.uid
            );

            message.textContent =
                "Signed in successfully!";

                window.location.href =
    "customer-account.html";

        } catch (error) {

            console.error(
                "Unable to sign in:",
                error
            );

            message.textContent =
                "Incorrect email address or password.";

        } finally {

            loginButton.disabled = false;

        }

    }
);

// =====================================
// Forgot Password
// =====================================

forgotPasswordButton.addEventListener(
    "click",
    async () => {

        const email =
            document
                .getElementById(
                    "customerLoginEmail"
                )
                .value
                .trim();

        const message =
            document.getElementById(
                "customerLoginMessage"
            );

        if (!email) {

            message.textContent =
                "Enter your email address first, then click Forgot Password.";

            return;
        }

        try {

            forgotPasswordButton.disabled =
                true;

            message.textContent =
                "Sending password reset email...";

            await sendPasswordResetEmail(
                auth,
                email
            );

            message.textContent =
                "Password reset email sent. Please check your inbox.";

        } catch (error) {

            console.error(
                "Unable to send password reset email:",
                error
            );

            message.textContent =
                "Unable to send the password reset email. Please check your email address and try again.";

        } finally {

            forgotPasswordButton.disabled =
                false;

        }

    }
);