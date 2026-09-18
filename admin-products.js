import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// =====================================
// Page Elements
// =====================================

const backToDashboardButton =
    document.getElementById("backToDashboardButton");

const logoutButton =
    document.getElementById("logoutButton");

const productName =
    document.getElementById("productName");

    const productDescription =
    document.getElementById("productDescription");

const productCategory =
    document.getElementById("productCategory");

const productPrice =
    document.getElementById("productPrice");

const productActive =
    document.getElementById("productActive");

    const productFeatured =
    document.getElementById("productFeatured");

const saveProductButton =
    document.getElementById("saveProductButton");

const productFormMessage =
    document.getElementById("productFormMessage");

const adminProductsList =
    document.getElementById("adminProductsList");

const adminProductCount =
    document.getElementById("adminProductCount");

    const productImageUpload =
    document.getElementById("productImageUpload");

const productImageInput =
    document.getElementById("productImageInput");

const productImagePreview =
    document.getElementById("productImagePreview");

const productImagePlaceholder =
    document.getElementById("productImagePlaceholder");

    let editingProductId = null;

    let currentProductImageUrl = "";

    const CLOUDINARY_CLOUD_NAME =
    "bbrvnzm6";

const CLOUDINARY_UPLOAD_PRESET =
    "3DContour";


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


            loadAdminProducts();


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
// Dashboard Button
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

        await signOut(auth);

        window.location.href =
            "admin-login.html";

    }
);

// =====================================
// Upload Product Image To Cloudinary
// =====================================

async function uploadProductImage(file) {

    const uploadUrl =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );

    const response =
        await fetch(
            uploadUrl,
            {
                method: "POST",
                body: formData
            }
        );

    if (!response.ok) {

        const errorData =
            await response.json();

        console.error(
            "Cloudinary upload failed:",
            errorData
        );

        throw new Error(
            "Unable to upload product image."
        );
    }

    const uploadResult =
        await response.json();

    return uploadResult.secure_url;
}


// =====================================
// Add Product
// =====================================

saveProductButton.addEventListener(
    "click",
    async function () {

        const name =
            productName.value.trim();

            const description =
    productDescription.value.trim();

        const category =
            productCategory.value;

        const price =
            Number(productPrice.value);

        const active =
            productActive.checked;

            const featured =
    productFeatured.checked;


        if (!name) {

            productFormMessage.textContent =
                "Please enter a product name.";

            return;
        }


        if (!category) {

            productFormMessage.textContent =
                "Please select a category.";

            return;
        }


        if (
            productPrice.value === "" ||
            Number.isNaN(price) ||
            price < 0
        ) {

            productFormMessage.textContent =
                "Please enter a valid price.";

            return;
        }


        saveProductButton.disabled = true;

        productFormMessage.textContent =
            "Saving product...";


       try {

    let imageUrl =
    currentProductImageUrl;

    const selectedImageFile =
        productImageInput.files[0];

    if (selectedImageFile) {

        productFormMessage.textContent =
            "Uploading product image...";

        imageUrl =
            await uploadProductImage(
                selectedImageFile
            );

    }

    if (editingProductId) {

    const productReference =
        doc(
            db,
            "products",
            editingProductId
        );

    await updateDoc(
    productReference,
    {
        name: name,
        description: description,
        category: category,
        price: price,
        active: active,
        featured: featured,
        imageUrl: imageUrl
    }
    
);

} else {

    console.log("Cloudinary image URL:", imageUrl);

    await addDoc(
    collection(db, "products"),
    {
        name: name,
        description: description,
        category: category,
        price: price,
        active: active,
        featured: featured,
        imageUrl: imageUrl
    }
);

}


            productName.value = "";
            productDescription.value = "";
            productCategory.value = "";
            productPrice.value = "";
            productActive.checked = true;
            productFeatured.checked = false;

            editingProductId = null;

            currentProductImageUrl = "";

productImageInput.value = "";

productImagePreview.src = "";
productImagePreview.hidden = true;

productImagePlaceholder.hidden = false;

saveProductButton.textContent =
    "Add Product";


            productFormMessage.textContent =
    "Product saved successfully.";


            await loadAdminProducts();


        } catch (error) {

            console.error(
                "Unable to add product:",
                error
            );

            productFormMessage.textContent =
                "Unable to add product.";

        } finally {

            saveProductButton.disabled = false;

        }

    }
);


// =====================================
// Load Products
// =====================================

async function loadAdminProducts() {

    try {

        adminProductsList.innerHTML =
            "Loading products...";


        const productsSnapshot =
            await getDocs(
                collection(db, "products")
            );


        adminProductsList.innerHTML = "";


        let productCount = 0;


        productsSnapshot.forEach(
            function (documentSnapshot) {

                const product =
                    documentSnapshot.data();


                const productRow =
                    document.createElement("div");


                productRow.className =
                    "admin-product-row";


                productRow.innerHTML = `

    <div class="admin-product-info">

        ${
            product.imageUrl
                ? `
                    <img
                        src="${product.imageUrl}"
                        alt="${product.name}"
                        class="admin-product-thumbnail"
                    >
                `
                : `
                    <div class="admin-product-thumbnail-placeholder">
                        No Image
                    </div>
                `
        }

        <div>
            <h4>
                ${product.name}
            </h4>

            <p>
                ${product.category}
            </p>
        </div>

    </div>


    <div>

        <strong>
            R${Number(product.price).toFixed(2)}
        </strong>

    </div>


    <div>

        <span>
            ${
                product.active === true
                    ? "Active"
                    : "Inactive"
            }
        </span>

    </div>


    <div class="admin-product-actions">

        <button
            class="toggle-product-button"
            data-id="${documentSnapshot.id}"
            data-active="${product.active}"
        >
            ${
                product.active === true
                    ? "Deactivate"
                    : "Activate"
            }
        </button>

        <button
            class="edit-product-button"
            data-id="${documentSnapshot.id}"
        >
            Edit
        </button>

        <button
            class="delete-product-button"
            data-id="${documentSnapshot.id}"
        >
            Delete
        </button>

    </div>

`;


                adminProductsList.appendChild(
                    productRow
                );


                productCount++;

            }
        );


        adminProductCount.textContent =
            productCount === 1
                ? "1 product"
                : `${productCount} products`;


    } catch (error) {

        console.error(
            "Unable to load admin products:",
            error
        );


        adminProductsList.innerHTML =
            "Unable to load products.";

    }

}

// =====================================
// Activate / Deactivate Product
// =====================================

adminProductsList.addEventListener(
    "click",
    async function (event) {

        const toggleButton =
            event.target.closest(".toggle-product-button");

        if (!toggleButton) {
            return;
        }

        const productId =
            toggleButton.dataset.id;

        const currentActive =
            toggleButton.dataset.active === "true";

        toggleButton.disabled = true;

        try {

            const productReference =
                doc(
                    db,
                    "products",
                    productId
                );

            await updateDoc(
                productReference,
                {
                    active: !currentActive
                }
            );

            await loadAdminProducts();

        } catch (error) {

            console.error(
                "Unable to update product:",
                error
            );

            alert(
                "Unable to update product."
            );

            toggleButton.disabled = false;
        }

    }
);

// =====================================
// Delete Product
// =====================================

adminProductsList.addEventListener(
    "click",
    async function (event) {

        const deleteButton =
            event.target.closest(".delete-product-button");

        if (!deleteButton) {
            return;
        }

        const productId =
            deleteButton.dataset.id;

        const confirmed =
            confirm(
                "Are you sure you want to permanently delete this product?"
            );

        if (!confirmed) {
            return;
        }

        deleteButton.disabled = true;

        try {

            const productReference =
                doc(
                    db,
                    "products",
                    productId
                );

            await deleteDoc(
                productReference
            );

            await loadAdminProducts();

        } catch (error) {

            console.error(
                "Unable to delete product:",
                error
            );

            alert(
                "Unable to delete product."
            );

            deleteButton.disabled = false;
        }

    }
);

// =====================================
// Edit Product
// =====================================

adminProductsList.addEventListener(
    "click",
    async function (event) {

        const editButton =
            event.target.closest(".edit-product-button");

        if (!editButton) {
            return;
        }

        const productId =
            editButton.dataset.id;

        try {

            const productReference =
                doc(
                    db,
                    "products",
                    productId
                );

            const productSnapshot =
                await getDoc(productReference);

            if (!productSnapshot.exists()) {
                alert("Product could not be found.");
                return;
            }

            const product =
    productSnapshot.data();

currentProductImageUrl =
    product.imageUrl || "";

if (currentProductImageUrl) {

    productImagePreview.src =
        currentProductImageUrl;

    productImagePreview.hidden =
        false;

    productImagePlaceholder.hidden =
        true;

} else {

    productImagePreview.src =
        "";

    productImagePreview.hidden =
        true;

    productImagePlaceholder.hidden =
        false;
}

productName.value =
    product.name || "";

    productDescription.value =
    product.description || "";

            productCategory.value =
                product.category || "";

            productPrice.value =
                product.price ?? "";

            productActive.checked =
                product.active === true;

                productFeatured.checked =
    product.featured === true;

            editingProductId =
                productId;

            saveProductButton.textContent =
                "Update Product";

            productFormMessage.textContent =
                "Editing product.";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(
                "Unable to load product for editing:",
                error
            );

            alert(
                "Unable to edit product."
            );
        }

    }
);

// =====================================
// Product Image Picker
// =====================================

if (
    productImageUpload &&
    productImageInput
) {

    productImageUpload.addEventListener(
        "click",
        function () {

            productImageInput.click();

        }
    );

}


if (productImageInput) {

    productImageInput.addEventListener(
        "change",
        function () {

            const file =
                productImageInput.files[0];

            if (!file) {
                return;
            }

            const imageUrl =
                URL.createObjectURL(file);

            productImagePreview.src =
                imageUrl;

            productImagePreview.hidden =
                false;

            productImagePlaceholder.hidden =
                true;

        }
    );

}