import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const customRequestForm =
    document.getElementById(
        "customRequestForm"
    );

const customRequestMessage =
    document.getElementById(
        "customRequestMessage"
    );

    const requestName =
    document.getElementById(
        "requestName"
    );

const requestEmail =
    document.getElementById(
        "requestEmail"
    );

const requestPhone =
    document.getElementById(
        "requestPhone"
    );

const requestProductType =
    document.getElementById(
        "requestProductType"
    );

const requestSize =
    document.getElementById(
        "requestSize"
    );

const requestQuantity =
    document.getElementById(
        "requestQuantity"
    );

const requestImage =
    document.getElementById(
        "requestImage"
    );

const requestInstructions =
    document.getElementById(
        "requestInstructions"
    );

    async function uploadRequestImage(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        "3DContour"
    );

    formData.append(
        "folder",
        "3d-contour/custom-requests"
    );

    const response =
        await fetch(
            "https://api.cloudinary.com/v1_1/bbrvnzm6/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

    if (!response.ok) {
        throw new Error(
            "Image upload failed."
        );
    }

    const data =
        await response.json();

    return data.secure_url;
}

if (customRequestForm) {

    customRequestForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            customRequestMessage.textContent =
                "Sending your request...";

            try {

                const selectedFile =
                    requestImage.files[0];

                if (!selectedFile) {
                    throw new Error(
                        "Please upload an inspiration image."
                    );
                }

                const imageUrl =
                    await uploadRequestImage(
                        selectedFile
                    );

                await addDoc(
                    collection(
                        db,
                        "customRequests"
                    ),
                    {
                        name:
                            requestName.value.trim(),

                        email:
                            requestEmail.value.trim(),

                        phone:
                            requestPhone.value.trim(),

                        productType:
                            requestProductType.value,

                        size:
                            requestSize.value.trim(),

                        quantity:
                            Number(
                                requestQuantity.value
                            ) || 1,

                        instructions:
                            requestInstructions.value.trim(),

                        imageUrl:
                            imageUrl,

                        status:
                            "New",

                        createdAt:
                            serverTimestamp()
                    }
                );

                customRequestMessage.textContent =
                    "Your custom request has been sent successfully.";

                customRequestForm.reset();

            } catch (error) {

                console.error(
                    "Custom request error:",
                    error
                );

                customRequestMessage.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";
            }
        }
    );
}