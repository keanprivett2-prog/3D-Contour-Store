// =====================================
// 3D Contour - Maintenance Mode
// =====================================

// Allow the store to work normally while
// developing locally in VS Code.
const localHosts = [
    "127.0.0.1",
    "localhost"
];

const isLocalDevelopment =
    localHosts.includes(window.location.hostname);

// If this is the live website, send visitors
// back to the Coming Soon landing page.
if (!isLocalDevelopment) {

    window.location.replace("/");

}