// =====================================
// 3D Contour
// Live Cake Topper Designer
// =====================================


// =====================================
// Elements
// =====================================

const topperText =
    document.getElementById("topperText");

const fontSelect =
    document.getElementById("fontSelect");

const fontSize =
    document.getElementById("fontSize");

const fontSizeValue =
    document.getElementById("fontSizeValue");

    const letterSpacing =
    document.getElementById(
        "letterSpacing"
    );


const letterSpacingValue =
    document.getElementById(
        "letterSpacingValue"
    );

const topperWidth =
    document.getElementById("topperWidth");

const topperWidthValue =
    document.getElementById("topperWidthValue");

const offsetSize =
    document.getElementById("offsetSize");

const offsetSizeValue =
    document.getElementById("offsetSizeValue");

const topperPreview =
    document.getElementById("topperPreview");

    const topperPreviewOffset =
    document.getElementById("topperPreviewOffset");

const previewWidth =
    document.getElementById("previewWidth");

const previewStick =
    document.getElementById("previewStick");

const previewOffset =
    document.getElementById("previewOffset");

    const connectionThickness =
    document.getElementById(
        "connectionThickness"
    );


const connectionThicknessValue =
    document.getElementById(
        "connectionThicknessValue"
    );


const previewConnection =
    document.getElementById(
        "previewConnection"
    );

    // =====================================
// Individual Letter Positions
// =====================================

let letterPositions = [];

let selectedLetterIndex = null;

let draggingLetter = false;

let dragStartX = 0;

let dragStartY = 0;

let letterStartX = 0;

let letterStartY = 0;


// =====================================
// Update Topper Text
// =====================================

function updateTopperText() {

    const text =
        topperText.value.trim() ||
        "Your Cake Topper";


    letterPositions =
        Array.from(text).map(
            () => ({
                x: 0,
                y: 0
            })
        );


    selectedLetterIndex =
        null;


    renderTopperLetters();

}

// =====================================
// Render Individual Letters
// =====================================

function renderTopperLetters() {

    topperPreview.innerHTML = "";

    topperPreviewOffset.innerHTML = "";


    const text =
        topperText.value.trim() ||
        "Your Cake Topper";


    Array.from(text).forEach(
        (character, index) => {


            const letter =
                document.createElement("span");


            letter.className =
                "topper-letter";


            letter.dataset.index =
                index;


            letter.textContent =
                character === " "
                    ? "\u00A0"
                    : character;


            letter.style.transform =
                `translate(
                    ${letterPositions[index]?.x || 0}px,
                    ${letterPositions[index]?.y || 0}px
                )`;


            topperPreview.appendChild(
                letter
            );


            // =================================
            // Offset Letter
            // =================================

            const offsetLetter =
                document.createElement("span");


            offsetLetter.className =
                "topper-offset-letter";


            offsetLetter.dataset.index =
                index;


            offsetLetter.textContent =
                character === " "
                    ? "\u00A0"
                    : character;


            offsetLetter.style.transform =
                `translate(
                    ${letterPositions[index]?.x || 0}px,
                    ${letterPositions[index]?.y || 0}px
                )`;


            topperPreviewOffset.appendChild(
                offsetLetter
            );


            // =================================
            // Drag Events
            // =================================

            letter.addEventListener(
                "pointerdown",
                startLetterDrag
            );


        }
    );


    applyPreviewStyles();

}

// =====================================
// Start Letter Drag
// =====================================

function startLetterDrag(event) {

    event.preventDefault();


    const letter =
        event.currentTarget;


    selectedLetterIndex =
        Number(
            letter.dataset.index
        );


    draggingLetter =
        true;


    dragStartX =
        event.clientX;


    dragStartY =
        event.clientY;


    letterStartX =
        letterPositions[
            selectedLetterIndex
        ].x;


    letterStartY =
        letterPositions[
            selectedLetterIndex
        ].y;


    letter.setPointerCapture(
        event.pointerId
    );


    letter.classList.add(
        "selected"
    );


    letter.addEventListener(
        "pointermove",
        moveLetter
    );


    letter.addEventListener(
        "pointerup",
        stopLetterDrag
    );


    letter.addEventListener(
        "pointercancel",
        stopLetterDrag
    );

}

function stopLetterDrag(event) {

    draggingLetter =
        false;


    const letter =
        event.currentTarget;


    letter.classList.remove(
        "selected"
    );


    letter.releasePointerCapture(
        event.pointerId
    );


    letter.removeEventListener(
        "pointermove",
        moveLetter
    );


    letter.removeEventListener(
        "pointerup",
        stopLetterDrag
    );


    letter.removeEventListener(
        "pointercancel",
        stopLetterDrag
    );

}

// =====================================
// Apply Preview Styles
// =====================================

function applyPreviewStyles() {

    const selectedFont =
        fontSelect.value;


    const size =
        Number(
            fontSize.value
        );


    const spacing =
        Number(
            letterSpacing.value
        );


    topperPreview.style.fontFamily =
        `"${selectedFont}"`;


    topperPreviewOffset.style.fontFamily =
        `"${selectedFont}"`;


    topperPreview.style.fontSize =
        `${size}px`;


    topperPreviewOffset.style.fontSize =
        `${size}px`;


    topperPreview.style.letterSpacing =
        `${spacing}px`;


    topperPreviewOffset.style.letterSpacing =
        `${spacing}px`;

}

// =====================================
// Move Letter
// =====================================

function moveLetter(event) {

    if (
        !draggingLetter ||
        selectedLetterIndex === null
    ) {

        return;

    }


    const deltaX =
        event.clientX -
        dragStartX;


    const deltaY =
        event.clientY -
        dragStartY;


    const newX =
        letterStartX +
        deltaX;


    const newY =
        letterStartY +
        deltaY;


    letterPositions[
        selectedLetterIndex
    ].x = newX;


    letterPositions[
        selectedLetterIndex
    ].y = newY;


    updateLetterPosition(
        selectedLetterIndex
    );

}

// =====================================
// Update Letter Position
// =====================================

function updateLetterPosition(
    index
) {

    const x =
        letterPositions[index].x;


    const y =
        letterPositions[index].y;


    const mainLetter =
        topperPreview.querySelector(
            `.topper-letter[data-index="${index}"]`
        );


    const offsetLetter =
        topperPreviewOffset.querySelector(
            `.topper-offset-letter[data-index="${index}"]`
        );


    if (mainLetter) {

        mainLetter.style.transform =
            `translate(${x}px, ${y}px)`;

    }


    if (offsetLetter) {

        offsetLetter.style.transform =
            `translate(${x}px, ${y}px)`;

    }

}


// =====================================
// Update Font
// =====================================

function updateTopperFont() {

    const selectedFont =
        fontSelect.value;


    topperPreview.style.fontFamily =
        `"${selectedFont}"`;


    topperPreviewOffset.style.fontFamily =
        `"${selectedFont}"`;

}


// =====================================
// Update Font Size
// =====================================

function updateFontSize() {

    const size =
        Number(fontSize.value);


    topperPreview.style.fontSize =
        `${size}px`;


    topperPreviewOffset.style.fontSize =
        `${size}px`;


    fontSizeValue.textContent =
        size;

}

// =====================================
// Update Letter Spacing
// =====================================

function updateLetterSpacing() {

    const spacing =
        Number(
            letterSpacing.value
        );


    topperPreview.style.letterSpacing =
        `${spacing}px`;


    topperPreviewOffset.style.letterSpacing =
        `${spacing}px`;


    letterSpacingValue.textContent =
        `${spacing} px`;

}


// =====================================
// Update Topper Width
// =====================================

function updateTopperWidth() {

    const width =
        Number(topperWidth.value);


    topperWidthValue.textContent =
        `${width} mm`;


    previewWidth.textContent =
        `${width} mm`;

}


// =====================================
// Update Offset
// =====================================

function updateOffset() {

    const offset =
        Number(offsetSize.value);


    offsetSizeValue.textContent =
        `${offset} mm`;


    previewOffset.textContent =
        `${offset} mm`;


    topperPreviewOffset.style.setProperty(
    "--topper-offset",
    `${offset}px`
);

}

// =====================================
// Update Connection Thickness
// =====================================

function updateConnectionThickness() {

    const thickness =
        Number(
            connectionThickness.value
        );


    connectionThicknessValue.textContent =
        `${thickness.toFixed(1)} mm`;


    previewConnection.textContent =
        `${thickness.toFixed(1)} mm`;

}


// =====================================
// Update Stick
// =====================================

function updateStick() {

    const selectedStick =
        document.querySelector(
            'input[name="stickOption"]:checked'
        );


    if (!selectedStick) {

        return;

    }


    previewStick.textContent =
        selectedStick.value === "yes"
            ? "Yes"
            : "No";

}


// =====================================
// Event Listeners
// =====================================

topperText.addEventListener(
    "input",
    updateTopperText
);


fontSelect.addEventListener(
    "change",
    updateTopperFont
);


fontSize.addEventListener(
    "input",
    updateFontSize
);

letterSpacing.addEventListener(
    "input",
    updateLetterSpacing
);


topperWidth.addEventListener(
    "input",
    updateTopperWidth
);


offsetSize.addEventListener(
    "input",
    updateOffset
);

connectionThickness.addEventListener(
    "input",
    updateConnectionThickness
);


document
    .querySelectorAll(
        'input[name="stickOption"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                updateStick
            );

        }
    );


// =====================================
// Initial State
// =====================================

updateTopperText();

updateTopperFont();

updateFontSize();

updateLetterSpacing();

updateTopperWidth();

updateOffset();

updateStick();

updateConnectionThickness();