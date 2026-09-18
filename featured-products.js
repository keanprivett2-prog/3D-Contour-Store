import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const featuredProductsGrid =
    document.getElementById("featuredProductsGrid");

    async function loadFeaturedProducts() {

    if (!featuredProductsGrid) {
        return;
    }

    try {

        const productsQuery = query(
    collection(db, "products"),
    where("active", "==", true),
    where("featured", "==", true)
);
        const snapshot =
            await getDocs(productsQuery);

        console.log(
            "Featured products found:",
            snapshot.size
        );

        const products = snapshot.docs
    .slice(0, 4)
    .map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));

featuredProductsGrid.innerHTML = "";

products.forEach((product) => {

    const productCard =
        document.createElement("a");

    productCard.href =
        `product.html?id=${product.id}`;

    productCard.className =
        "featured-product-card";

    productCard.innerHTML = `
        ${
    product.imageUrl
        ? `
            <img
                src="${product.imageUrl}"
                alt="${product.name}"
                class="featured-product-image"
            >
        `
        : `
            <div class="featured-product-image-placeholder">
                Product Image
            </div>
        `
}

        <div class="featured-product-content">

            <span class="featured-product-category">
                ${product.category || ""}
            </span>

            <h3>
                ${product.name || "Product"}
            </h3>

            <p class="featured-product-price">
                R${Number(product.price || 0).toFixed(2)}
            </p>

        </div>
    `;

    featuredProductsGrid.appendChild(
        productCard
    );

});

    } catch (error) {

        console.error(
            "Unable to load featured products:",
            error
        );

    }

}


loadFeaturedProducts();