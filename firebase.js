// =====================================
// Firebase Configuration
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// =====================================
// Firebase Project Settings
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyC4L-a0csrICRWaTGiZuRCbFiHRAfuW3SQ",
  authDomain: "d-contour-store.firebaseapp.com",
  projectId: "d-contour-store",
  storageBucket: "d-contour-store.firebasestorage.app",
  messagingSenderId: "347183649329",
  appId: "1:347183649329:web:f7ca98ebe6f4f2cd153b10"
};


// =====================================
// Initialize Firebase
// =====================================

const app = initializeApp(firebaseConfig);


// =====================================
// Firebase Services
// =====================================

const db = getFirestore(app);

const auth = getAuth(app);


// =====================================
// Exports
// =====================================

export {
    app,
    db,
    auth
};