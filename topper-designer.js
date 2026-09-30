/* =====================================
   3D Contour
   Live Cake Topper Designer
   New Designer Engine
====================================== */


/* =====================================
   DOM Helpers
====================================== */

const $ = id =>
    document.getElementById(id);


const topperText =
    $("topperText");

const fontSelect =
    $("fontSelect");

const fontSize =
    $("fontSize");

const fontSizeValue =
    $("fontSizeValue");

const letterSpacing =
    $("letterSpacing");

const letterSpacingValue =
    $("letterSpacingValue");

const topperWidth =
    $("topperWidth");

const topperWidthValue =
    $("topperWidthValue");

const offsetSize =
    $("offsetSize");

const offsetSizeValue =
    $("offsetSizeValue");

const connectionThickness =
    $("connectionThickness");

const connectionThicknessValue =
    $("connectionThicknessValue");

const topperPreview =
    $("topperPreview");

const topperPreviewOffset =
    $("topperPreviewOffset");

const previewWidth =
    $("previewWidth");

const previewStick =
    $("previewStick");

const previewOffset =
    $("previewOffset");

const previewConnection =
    $("previewConnection");

const elementsList =
    $("elementsList");

const selectedElementEmpty =
    $("selectedElementEmpty");

const selectedElementControls =
    $("selectedElementControls");

const selectedElementLabel =
    $("selectedElementLabel");

const elementPositionX =
    $("elementPositionX");

const elementPositionY =
    $("elementPositionY");

const elementRotation =
    $("elementRotation");

const elementRotationValue =
    $("elementRotationValue");

const elementWidth =
    $("elementWidth");

const elementHeight =
    $("elementHeight");

const designerStatus =
    $("designerStatus");

const zoomValue =
    $("zoomValue");

const printabilityStatus =
    $("printabilityStatus");

const printabilityMessage =
    $("printabilityMessage");

const printabilityIssues =
    $("printabilityIssues");


/* =====================================
   Designer State
====================================== */

let design = {

    elements: [

        {

            id: "text-1",

            type: "text",

            name: "Happy Birthday",

            text: "Happy Birthday",

            font: "Great Vibes",

            fontSize: 90,

            letterSpacing: 0,

            x: 0,

            y: 0,

            rotation: 0,

            width: 0,

            height: 0,

            letterPositions: []

        }

    ],

    width: 180,

    offset: 3,

    connectionThickness: 0.5,

    stick: true,

    zoom: 1

};


let selectedElementId =
    "text-1";


let selectedLetterIndex =
    null;


let draggingLetter =
    false;


let dragStartX =
    0;


let dragStartY =
    0;


let letterStartX =
    0;


let letterStartY =
    0;


let history = [];


let historyIndex =
    -1;


/* =====================================
   Utilities
====================================== */

function createId(prefix = "element") {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );

}


function getSelectedElement() {

    return design.elements.find(
        element =>
            element.id ===
            selectedElementId
    ) || null;

}


function getDefaultLetterPositions(text) {

    return Array.from(text).map(
        () => ({
            x: 0,
            y: 0
        })
    );

}


function saveHistory() {

    const snapshot =
        JSON.stringify(design);


    if (
        historyIndex >= 0 &&
        history[historyIndex] === snapshot
    ) {

        return;

    }


    history =
        history.slice(
            0,
            historyIndex + 1
        );


    history.push(snapshot);


    historyIndex =
        history.length - 1;


    updateHistoryButtons();

}


function restoreSnapshot(snapshot) {

    design =
        JSON.parse(snapshot);


    selectedLetterIndex =
        null;


    renderDesigner();

}


function undo() {

    if (
        historyIndex <= 0
    ) {

        return;

    }


    historyIndex--;


    restoreSnapshot(
        history[historyIndex]
    );


    designerStatus.textContent =
        "Undo";


    updateHistoryButtons();

}


function redo() {

    if (
        historyIndex >=
        history.length - 1
    ) {

        return;

    }


    historyIndex++;


    restoreSnapshot(
        history[historyIndex]
    );


    designerStatus.textContent =
        "Redo";


    updateHistoryButtons();

}


function updateHistoryButtons() {

    const undoButton =
        $("undoButton");

    const redoButton =
        $("redoButton");


    if (undoButton) {

        undoButton.disabled =
            historyIndex <= 0;

    }


    if (redoButton) {

        redoButton.disabled =
            historyIndex >=
            history.length - 1;

    }

}


/* =====================================
   Render Everything
====================================== */

function renderDesigner() {

    renderElementsList();

    renderCanvas();

    updateControls();

    updateSummary();

    updatePrintability();

    updateZoom();

}


/* =====================================
   Elements List
====================================== */

function renderElementsList() {

    elementsList.innerHTML = "";


    design.elements.forEach(
        element => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "element-item";


            if (
                element.id ===
                selectedElementId
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.dataset.elementId =
                element.id;


            const icon =
                document.createElement(
                    "span"
                );


            icon.className =
                "element-icon";


            icon.textContent =
                element.type ===
                "text"
                    ? "T"
                    : "◇";


            const info =
                document.createElement(
                    "span"
                );


            info.className =
                "element-item-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                element.name;


            const type =
                document.createElement(
                    "small"
                );


            type.textContent =
                element.type ===
                "text"
                    ? "Text"
                    : "Shape";


            info.appendChild(name);

            info.appendChild(type);


            const handle =
                document.createElement(
                    "span"
                );


            handle.className =
                "element-drag-handle";


            handle.textContent =
                "⋮⋮";


            item.appendChild(icon);

            item.appendChild(info);

            item.appendChild(handle);


            item.addEventListener(
                "click",
                () => {

                    selectElement(
                        element.id
                    );

                }
            );


            elementsList.appendChild(
                item
            );

        }
    );

}


/* =====================================
   Select Element
====================================== */

function selectElement(id) {

    selectedElementId =
        id;


    selectedLetterIndex =
        null;


    designerStatus.textContent =
        "Selected";


    renderDesigner();

}


/* =====================================
   Canvas
====================================== */

function renderCanvas() {

    topperPreview.innerHTML =
        "";


    topperPreviewOffset.innerHTML =
        "";


    design.elements.forEach(
        element => {

            if (
                element.type ===
                "text"
            ) {

                renderTextElement(
                    element
                );

            }

            else {

                renderShapeElement(
                    element
                );

            }

        }
    );


    applyCanvasZoom();

}


/* =====================================
   Text Element
====================================== */

function renderTextElement(
    element
) {

    const main =
        document.createElement(
            "div"
        );


    main.className =
        "designer-text-element";


    main.dataset.elementId =
        element.id;


    main.style.position =
        "relative";


    main.style.display =
        "inline-block";


    main.style.fontFamily =
        `"${element.font}"`;


    main.style.fontSize =
        `${element.fontSize}px`;


    main.style.letterSpacing =
        `${element.letterSpacing}px`;


    main.style.lineHeight =
        "1";


    main.style.fontWeight =
        "700";


    main.style.transform =
        `
        translate(
            ${element.x}px,
            ${element.y}px
        )
        rotate(
            ${element.rotation}deg
        )
        `;


    if (
        element.id ===
        selectedElementId
    ) {

        main.classList.add(
            "designer-element-selected"
        );

    }


    Array.from(
        element.text
    ).forEach(
        (
            character,
            index
        ) => {

            const letter =
                document.createElement(
                    "span"
                );


            letter.className =
                "topper-letter";


            letter.dataset.elementId =
                element.id;


            letter.dataset.index =
                index;


            letter.textContent =
                character === " "
                    ? "\u00A0"
                    : character;


            const position =
                element.letterPositions[
                    index
                ] || {
                    x: 0,
                    y: 0
                };


            letter.style.transform =
                `
                translate(
                    ${position.x}px,
                    ${position.y}px
                )
                `;


            if (
                element.id ===
                    selectedElementId &&
                index ===
                    selectedLetterIndex
            ) {

                letter.classList.add(
                    "selected"
                );

            }


            letter.addEventListener(
                "pointerdown",
                startLetterDrag
            );


            main.appendChild(
                letter
            );

        }
    );


    main.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                main
            ) {

                event.stopPropagation();

                selectElement(
                    element.id
                );

            }

        }
    );


    topperPreview.appendChild(
        main
    );


    /* =================================
       Offset Copy
    ================================== */

    const offset =
        document.createElement(
            "div"
        );


    offset.className =
        "designer-text-element offset-element";


    offset.dataset.elementId =
        element.id;


    offset.style.position =
        "absolute";


    offset.style.left =
        "0";


    offset.style.top =
        "0";


    offset.style.fontFamily =
        `"${element.font}"`;


    offset.style.fontSize =
        `${element.fontSize}px`;


    offset.style.letterSpacing =
        `${element.letterSpacing}px`;


    offset.style.fontWeight =
        "700";


    offset.style.lineHeight =
        "1";


    offset.style.color =
        "transparent";


    offset.style.webkitTextStroke =
        `${design.offset}px #222`;


    offset.style.pointerEvents =
        "none";


    offset.style.transform =
        `
        translate(
            ${element.x}px,
            ${element.y}px
        )
        rotate(
            ${element.rotation}deg
        )
        `;


    Array.from(
        element.text
    ).forEach(
        (
            character,
            index
        ) => {

            const letter =
                document.createElement(
                    "span"
                );


            letter.className =
                "topper-offset-letter";


            letter.textContent =
                character === " "
                    ? "\u00A0"
                    : character;


            const position =
                element.letterPositions[
                    index
                ] || {
                    x: 0,
                    y: 0
                };


            letter.style.transform =
                `
                translate(
                    ${position.x}px,
                    ${position.y}px
                )
                `;


            offset.appendChild(
                letter
            );

        }
    );


    topperPreviewOffset.appendChild(
        offset
    );

}


/* =====================================
   Shape Element
====================================== */

function renderShapeElement(
    element
) {

    const shape =
        document.createElement(
            "div"
        );


    shape.className =
        "designer-shape-element";


    shape.dataset.elementId =
        element.id;


    shape.textContent =
        element.symbol ||
        "◇";


    shape.style.fontSize =
        `${element.fontSize}px`;


    shape.style.transform =
        `
        translate(
            ${element.x}px,
            ${element.y}px
        )
        rotate(
            ${element.rotation}deg
        )
        `;


    if (
        element.id ===
        selectedElementId
    ) {

        shape.classList.add(
            "designer-element-selected"
        );

    }


    shape.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            selectElement(
                element.id
            );

        }
    );


    topperPreview.appendChild(
        shape
    );

}


/* =====================================
   Letter Drag
====================================== */

function startLetterDrag(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const letter =
        event.currentTarget;


    const elementId =
        letter.dataset.elementId;


    const index =
        Number(
            letter.dataset.index
        );


    const element =
        design.elements.find(
            item =>
                item.id ===
                elementId
        );


    if (!element) {

        return;

    }


    selectElement(
        elementId
    );


    selectedLetterIndex =
        index;


    draggingLetter =
        true;


    dragStartX =
        event.clientX;


    dragStartY =
        event.clientY;


    letterStartX =
        element.letterPositions[
            index
        ]?.x || 0;


    letterStartY =
        element.letterPositions[
            index
        ]?.y || 0;


    letter.setPointerCapture(
        event.pointerId
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


    renderCanvas();

}


function moveLetter(
    event
) {

    if (
        !draggingLetter ||
        selectedLetterIndex ===
            null
    ) {

        return;

    }


    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    const deltaX =
        event.clientX -
        dragStartX;


    const deltaY =
        event.clientY -
        dragStartY;


    element.letterPositions[
        selectedLetterIndex
    ].x =
        letterStartX +
        deltaX;


    element.letterPositions[
        selectedLetterIndex
    ].y =
        letterStartY +
        deltaY;


    renderCanvas();

}


function stopLetterDrag(
    event
) {

    if (
        !draggingLetter
    ) {

        return;

    }


    draggingLetter =
        false;


    try {

        event.currentTarget
            .releasePointerCapture(
                event.pointerId
            );

    }

    catch (error) {

        // Pointer capture may
        // already have been released.

    }


    event.currentTarget
        .removeEventListener(
            "pointermove",
            moveLetter
        );


    event.currentTarget
        .removeEventListener(
            "pointerup",
            stopLetterDrag
        );


    event.currentTarget
        .removeEventListener(
            "pointercancel",
            stopLetterDrag
        );


    saveHistory();


    designerStatus.textContent =
        "Letter moved";


    renderDesigner();

}


/* =====================================
   Update Selected Controls
====================================== */

function updateControls() {

    const element =
        getSelectedElement();


    if (!element) {

        selectedElementEmpty.hidden =
            false;

        selectedElementControls.hidden =
            true;

        return;

    }


    selectedElementEmpty.hidden =
        true;


    selectedElementControls.hidden =
        false;


    selectedElementLabel.textContent =
        element.name;


    elementPositionX.value =
        Math.round(
            element.x * 10
        ) / 10;


    elementPositionY.value =
        Math.round(
            element.y * 10
        ) / 10;


    elementRotation.value =
        element.rotation;


    elementRotationValue.textContent =
        `${element.rotation}°`;


    elementWidth.value =
        element.width || 0;


    elementHeight.value =
        element.height || 0;

}


/* =====================================
   Text Controls
====================================== */

function syncSelectedTextFromControls() {

    const element =
        getSelectedElement();


    if (
        !element ||
        element.type !==
            "text"
    ) {

        return;

    }


    element.text =
        topperText.value.trim() ||
        "Your Cake Topper";


    element.name =
        element.text;


    element.font =
        fontSelect.value;


    element.fontSize =
        Number(
            fontSize.value
        );


    element.letterSpacing =
        Number(
            letterSpacing.value
        );


    const oldPositions =
        element.letterPositions || [];


    element.letterPositions =
        Array.from(
            element.text
        ).map(
            (
                character,
                index
            ) =>
                oldPositions[index] ||
                {
                    x: 0,
                    y: 0
                }
        );


    selectedLetterIndex =
        null;


    saveHistory();


    renderDesigner();

}


/* =====================================
   Selected Element Position
====================================== */

function updateElementPosition() {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    element.x =
        Number(
            elementPositionX.value
        ) || 0;


    element.y =
        Number(
            elementPositionY.value
        ) || 0;


    saveHistory();

    renderDesigner();

}


/* =====================================
   Rotation
====================================== */

function updateElementRotation() {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    element.rotation =
        Number(
            elementRotation.value
        ) || 0;


    elementRotationValue.textContent =
        `${element.rotation}°`;


    saveHistory();

    renderCanvas();

}


/* =====================================
   Size
====================================== */

function updateElementSize() {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    element.width =
        Number(
            elementWidth.value
        ) || 0;


    element.height =
        Number(
            elementHeight.value
        ) || 0;


    saveHistory();

    renderDesigner();

}


/* =====================================
   Add Text
====================================== */

function addTextElement() {

    const newElement = {

        id:
            createId("text"),

        type:
            "text",

        name:
            "New Text",

        text:
            "Your Text",

        font:
            "Great Vibes",

        fontSize:
            80,

        letterSpacing:
            0,

        x:
            0,

        y:
            0,

        rotation:
            0,

        width:
            0,

        height:
            0,

        letterPositions:
            getDefaultLetterPositions(
                "Your Text"
            )

    };


    design.elements.push(
        newElement
    );


    selectedElementId =
        newElement.id;


    selectedLetterIndex =
        null;


    loadSelectedTextControls();


    saveHistory();


    designerStatus.textContent =
        "Text added";


    renderDesigner();

}


/* =====================================
   Add Shape
====================================== */

function addShape(
    symbol,
    name
) {

    const newElement = {

        id:
            createId("shape"),

        type:
            "shape",

        name:
            name,

        symbol:
            symbol,

        fontSize:
            80,

        x:
            0,

        y:
            0,

        rotation:
            0,

        width:
            0,

        height:
            0

    };


    design.elements.push(
        newElement
    );


    selectedElementId =
        newElement.id;


    selectedLetterIndex =
        null;


    saveHistory();


    designerStatus.textContent =
        `${name} added`;


    renderDesigner();

}


/* =====================================
   Load Selected Text Controls
====================================== */

function loadSelectedTextControls() {

    const element =
        getSelectedElement();


    if (
        !element ||
        element.type !==
            "text"
    ) {

        return;

    }


    topperText.value =
        element.text;


    fontSelect.value =
        element.font;


    fontSize.value =
        element.fontSize;


    fontSizeValue.textContent =
        element.fontSize;


    letterSpacing.value =
        element.letterSpacing;


    letterSpacingValue.textContent =
        `${element.letterSpacing} px`;

}


/* =====================================
   Delete Selected Element
====================================== */

function deleteSelectedElement() {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    if (
        design.elements.length <=
        1
    ) {

        designerStatus.textContent =
            "Keep at least one element.";

        return;

    }


    design.elements =
        design.elements.filter(
            item =>
                item.id !==
                selectedElementId
        );


    selectedElementId =
        design.elements[0].id;


    selectedLetterIndex =
        null;


    saveHistory();


    designerStatus.textContent =
        "Element deleted";


    loadSelectedTextControls();


    renderDesigner();

}


/* =====================================
   Duplicate Selected Element
====================================== */

function duplicateSelectedElement() {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    const duplicate =
        JSON.parse(
            JSON.stringify(element)
        );


    duplicate.id =
        createId(
            element.type
        );


    duplicate.name =
        `${element.name} Copy`;


    duplicate.x +=
        25;


    duplicate.y +=
        25;


    design.elements.push(
        duplicate
    );


    selectedElementId =
        duplicate.id;


    selectedLetterIndex =
        null;


    loadSelectedTextControls();


    saveHistory();


    designerStatus.textContent =
        "Element duplicated";


    renderDesigner();

}


/* =====================================
   Alignment
====================================== */

function alignSelected(
    direction
) {

    const element =
        getSelectedElement();


    if (!element) {

        return;

    }


    if (
        direction ===
        "left"
    ) {

        element.x =
            -100;

    }


    if (
        direction ===
        "center"
    ) {

        element.x =
            0;

    }


    if (
        direction ===
        "right"
    ) {

        element.x =
            100;

    }


    saveHistory();


    renderDesigner();

}


/* =====================================
   Overall Settings
====================================== */

function updateOverallWidth() {

    design.width =
        Number(
            topperWidth.value
        );


    topperWidthValue.textContent =
        `${design.width} mm`;


    previewWidth.textContent =
        `${design.width} mm`;


    saveHistory();

}


function updateOverallOffset() {

    design.offset =
        Number(
            offsetSize.value
        );


    offsetSizeValue.textContent =
        `${design.offset} mm`;


    previewOffset.textContent =
        `${design.offset} mm`;


    saveHistory();


    renderCanvas();

}


function updateConnectionThickness() {

    design.connectionThickness =
        Number(
            connectionThickness.value
        );


    connectionThicknessValue.textContent =
        `${design.connectionThickness.toFixed(1)} mm`;


    previewConnection.textContent =
        `${design.connectionThickness.toFixed(1)} mm`;


    saveHistory();

}


function updateStick() {

    const selected =
        document.querySelector(
            'input[name="stickOption"]:checked'
        );


    if (!selected) {

        return;

    }


    design.stick =
        selected.value ===
        "yes";


    previewStick.textContent =
        design.stick
            ? "Yes"
            : "No";


    saveHistory();

}


/* =====================================
   Zoom
====================================== */

function updateZoom() {

    const percentage =
        Math.round(
            design.zoom * 100
        );


    zoomValue.textContent =
        `${percentage}%`;


    applyCanvasZoom();

}


function applyCanvasZoom() {

    const canvas =
        $("topperCanvas");


    if (!canvas) {

        return;

    }


    canvas.style.transform =
        `
        translate(-50%, -50%)
        scale(${design.zoom})
        `;

}


function zoomIn() {

    design.zoom =
        Math.min(
            2,
            design.zoom +
                0.1
        );


    saveHistory();

    updateZoom();

}


function zoomOut() {

    design.zoom =
        Math.max(
            0.5,
            design.zoom -
                0.1
        );


    saveHistory();

    updateZoom();

}


function resetZoom() {

    design.zoom =
        1;


    saveHistory();

    updateZoom();

}


/* =====================================
   Printability
====================================== */

function updatePrintability() {

    const issues = [];


    design.elements.forEach(
        element => {

            if (
                element.type ===
                "text"
            ) {

                if (
                    element.text.trim()
                        .length === 0
                ) {

                    issues.push(
                        "A text element is empty."
                    );

                }


                if (
                    element.fontSize <
                    35
                ) {

                    issues.push(
                        `${element.name} may be too small to print comfortably.`
                    );

                }

            }

        }
    );


    if (
        design.offset <=
        0
    ) {

        issues.push(
            "No outline/offset is currently applied."
        );

    }


    printabilityIssues.innerHTML =
        "";


    if (
        issues.length ===
        0
    ) {

        printabilityStatus.textContent =
            "Ready";


        printabilityMessage.textContent =
            "No obvious design issues detected.";

        return;

    }


    printabilityStatus.textContent =
        `${issues.length} issue${
            issues.length === 1
                ? ""
                : "s"
        }`;


    printabilityMessage.textContent =
        "Please review the following:";


    issues.forEach(
        issue => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "printability-issue";


            item.textContent =
                issue;


            printabilityIssues.appendChild(
                item
            );

        }
    );

}


/* =====================================
   Summary
====================================== */

function updateSummary() {

    previewWidth.textContent =
        `${design.width} mm`;


    previewOffset.textContent =
        `${design.offset} mm`;


    previewConnection.textContent =
        `${design.connectionThickness.toFixed(1)} mm`;


    previewStick.textContent =
        design.stick
            ? "Yes"
            : "No";


    topperWidthValue.textContent =
        `${design.width} mm`;


    offsetSizeValue.textContent =
        `${design.offset} mm`;


    connectionThicknessValue.textContent =
        `${design.connectionThickness.toFixed(1)} mm`;

}


/* =====================================
   Canvas Background Click
====================================== */

$("previewStage")
    .addEventListener(
        "pointerdown",
        event => {

            if (
                event.target ===
                $("previewStage") ||
                event.target ===
                $("topperCanvas")
            ) {

                selectedLetterIndex =
                    null;

                designerStatus.textContent =
                    "Canvas";


                renderCanvas();

            }

        }
    );


/* =====================================
   Text Events
====================================== */

topperText.addEventListener(
    "input",
    () => {

        syncSelectedTextFromControls();

    }
);


fontSelect.addEventListener(
    "change",
    () => {

        syncSelectedTextFromControls();

    }
);


fontSize.addEventListener(
    "input",
    () => {

        const element =
            getSelectedElement();


        if (
            !element ||
            element.type !==
                "text"
        ) {

            return;

        }


        element.fontSize =
            Number(
                fontSize.value
            );


        fontSizeValue.textContent =
            element.fontSize;


        renderCanvas();

    }
);


fontSize.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


letterSpacing.addEventListener(
    "input",
    () => {

        const element =
            getSelectedElement();


        if (
            !element ||
            element.type !==
                "text"
        ) {

            return;

        }


        element.letterSpacing =
            Number(
                letterSpacing.value
            );


        letterSpacingValue.textContent =
            `${element.letterSpacing} px`;


        renderCanvas();

    }
);


letterSpacing.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


/* =====================================
   Overall Controls
====================================== */

topperWidth.addEventListener(
    "input",
    () => {

        design.width =
            Number(
                topperWidth.value
            );


        updateSummary();

    }
);


topperWidth.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


offsetSize.addEventListener(
    "input",
    () => {

        design.offset =
            Number(
                offsetSize.value
            );


        updateSummary();

        renderCanvas();

    }
);


offsetSize.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


connectionThickness.addEventListener(
    "input",
    () => {

        design.connectionThickness =
            Number(
                connectionThickness.value
            );


        updateSummary();

    }
);


connectionThickness.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


document
    .querySelectorAll(
        'input[name="stickOption"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    updateStick();

                    renderDesigner();

                }
            );

        }
    );


/* =====================================
   Position Controls
====================================== */

elementPositionX.addEventListener(
    "change",
    updateElementPosition
);


elementPositionY.addEventListener(
    "change",
    updateElementPosition
);


elementRotation.addEventListener(
    "input",
    updateElementRotation
);


elementRotation.addEventListener(
    "change",
    () => {

        saveHistory();

        renderDesigner();

    }
);


elementWidth.addEventListener(
    "change",
    updateElementSize
);


elementHeight.addEventListener(
    "change",
    updateElementSize
);


/* =====================================
   Buttons
====================================== */

$("addTextElementButton")
    .addEventListener(
        "click",
        addTextElement
    );


$("addTextButton")
    .addEventListener(
        "click",
        addTextElement
    );


$("addShapeButton")
    .addEventListener(
        "click",
        () => {

            addShape(
                "◇",
                "Diamond"
            );

        }
    );


$("addHeartButton")
    .addEventListener(
        "click",
        () => {

            addShape(
                "♥",
                "Heart"
            );

        }
    );


$("addStarButton")
    .addEventListener(
        "click",
        () => {

            addShape(
                "★",
                "Star"
            );

        }
    );


$("duplicateElementButton")
    .addEventListener(
        "click",
        duplicateSelectedElement
    );


$("deleteElementButton")
    .addEventListener(
        "click",
        deleteSelectedElement
    );


$("alignLeftButton")
    .addEventListener(
        "click",
        () => alignSelected("left")
    );


$("alignCenterButton")
    .addEventListener(
        "click",
        () => alignSelected("center")
    );


$("alignRightButton")
    .addEventListener(
        "click",
        () => alignSelected("right")
    );


$("undoButton")
    .addEventListener(
        "click",
        undo
    );


$("redoButton")
    .addEventListener(
        "click",
        redo
    );


$("resetDesignButton")
    .addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Reset your cake topper design?"
                )
            ) {

                return;

            }


            design = {

                elements: [

                    {

                        id:
                            "text-1",

                        type:
                            "text",

                        name:
                            "Happy Birthday",

                        text:
                            "Happy Birthday",

                        font:
                            "Great Vibes",

                        fontSize:
                            90,

                        letterSpacing:
                            0,

                        x:
                            0,

                        y:
                            0,

                        rotation:
                            0,

                        width:
                            0,

                        height:
                            0,

                        letterPositions:
                            getDefaultLetterPositions(
                                "Happy Birthday"
                            )

                    }

                ],

                width:
                    180,

                offset:
                    3,

                connectionThickness:
                    0.5,

                stick:
                    true,

                zoom:
                    1

            };


            selectedElementId =
                "text-1";


            selectedLetterIndex =
                null;


            saveHistory();


            loadSelectedTextControls();


            designerStatus.textContent =
                "Design reset";


            renderDesigner();

        }
    );


$("zoomInButton")
    .addEventListener(
        "click",
        zoomIn
    );


$("zoomOutButton")
    .addEventListener(
        "click",
        zoomOut
    );


$("centerCanvasButton")
    .addEventListener(
        "click",
        resetZoom
    );


/* =====================================
   Keyboard Shortcuts
====================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "z"
        ) {

            event.preventDefault();

            undo();

            return;

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "y"
        ) {

            event.preventDefault();

            redo();

            return;

        }


        if (
            event.key ===
                "Delete" &&
            document.activeElement.tagName !==
                "INPUT" &&
            document.activeElement.tagName !==
                "TEXTAREA" &&
            document.activeElement.tagName !==
                "SELECT"
        ) {

            deleteSelectedElement();

        }

    }
);


/* =====================================
   Initial State
====================================== */

function initialiseDesigner() {

    const element =
        getSelectedElement();


    if (element) {

        topperText.value =
            element.text;

        fontSelect.value =
            element.font;

        fontSize.value =
            element.fontSize;

        letterSpacing.value =
            element.letterSpacing;

    }


    design.width =
        Number(
            topperWidth.value
        ) || 180;


    design.offset =
        Number(
            offsetSize.value
        ) || 3;


    design.connectionThickness =
        Number(
            connectionThickness.value
        ) || 0.5;


    const stick =
        document.querySelector(
            'input[name="stickOption"]:checked'
        );


    design.stick =
        stick
            ? stick.value ===
                "yes"
            : true;


    history = [];

    historyIndex = -1;


    saveHistory();


    renderDesigner();


    designerStatus.textContent =
        "Ready";

}


initialiseDesigner();