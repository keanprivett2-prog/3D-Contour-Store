const contactForm =
    document.getElementById("contactForm");

const WORKER_URL =
    "https://3d-contour-payfast.keanprivett2.workers.dev/contact";


contactForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const submitButton =
            contactForm.querySelector(
                ".contact-submit-button"
            );

        const name =
            document
                .getElementById("contactName")
                .value
                .trim();

        const email =
            document
                .getElementById("contactEmail")
                .value
                .trim();

        const subject =
            document
                .getElementById("contactSubject")
                .value
                .trim();

        const message =
            document
                .getElementById("contactMessage")
                .value
                .trim();

                const formMessage =
    document.getElementById(
        "contactFormMessage"
    );

formMessage.textContent = "";
formMessage.className =
    "contact-form-message";


        submitButton.disabled = true;
        submitButton.textContent =
            "Sending...";


        try {

            const response =
                await fetch(
                    WORKER_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            subject,
                            message
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to send message."
                );

            }


            

formMessage.textContent =
    "Thank you! Your message has been sent successfully. We'll get back to you as soon as possible.";

formMessage.className =
    "contact-form-message success";

contactForm.reset();


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            

formMessage.textContent =
    "Sorry, we couldn't send your message. Please try again.";

formMessage.className =
    "contact-form-message error";

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Send Message";

        }

    }
);