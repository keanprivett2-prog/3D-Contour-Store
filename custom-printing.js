import {
    CUSTOM_PRINTING_SETTINGS
} from "./custom-printing-settings.js";


// =====================================
// Custom Printing - File Uploads
// =====================================

const stlUpload =
    document.getElementById("stlUpload");

const imageUpload =
    document.getElementById("imageUpload");

const selectedFiles =
    document.getElementById("selectedFiles");

const stlAnalysisCard =
    document.getElementById("stlAnalysisCard");

const stlAnalysisStatus =
    document.getElementById("stlAnalysisStatus");


// =====================================
// Display Selected Files
// =====================================

function displaySelectedFiles() {

    if (!selectedFiles) {
        return;
    }


    selectedFiles.innerHTML = "";


    if (
        stlUpload &&
        stlUpload.files.length > 0
    ) {

        Array.from(
            stlUpload.files
        ).forEach(
            function (file) {

                addSelectedFile(
                    file,
                    "STL"
                );

            }
        );

    }


    if (
        imageUpload &&
        imageUpload.files.length > 0
    ) {

        Array.from(
            imageUpload.files
        ).forEach(
            function (file) {

                addSelectedFile(
                    file,
                    "IMAGE"
                );

            }
        );

    }

}


// =====================================
// Add File To Display
// =====================================

function addSelectedFile(
    file,
    fileType
) {

    const fileRow =
        document.createElement(
            "div"
        );


    fileRow.className =
        "selected-file";


    const fileName =
        document.createElement(
            "span"
        );


    fileName.className =
        "selected-file-name";


    fileName.textContent =
        file.name;


    const typeLabel =
        document.createElement(
            "span"
        );


    typeLabel.className =
        "selected-file-type";


    typeLabel.textContent =
        fileType;


    fileRow.appendChild(
        fileName
    );


    fileRow.appendChild(
        typeLabel
    );


    selectedFiles.appendChild(
        fileRow
    );

}


// =====================================
// STL Selection
// =====================================

if (stlUpload) {

    stlUpload.addEventListener(
        "change",
        function () {

            displaySelectedFiles();


            if (
                !stlUpload.files ||
                stlUpload.files.length === 0
            ) {

                if (stlAnalysisCard) {

                    stlAnalysisCard.hidden =
                        true;

                }

                return;

            }


            const stlFile =
                stlUpload.files[0];


            analyseSTLFile(
                stlFile
            );

        }
    );

}


// =====================================
// Image Selection
// =====================================

if (imageUpload) {

    imageUpload.addEventListener(
        "change",
        function () {

            displaySelectedFiles();

        }
    );

}


// =====================================
// STL File Analysis
// =====================================

function analyseSTLFile(file) {

    if (!file) {
        return;
    }


    if (stlAnalysisCard) {

        stlAnalysisCard.hidden =
            false;

    }


    if (stlAnalysisStatus) {

        stlAnalysisStatus.textContent =
            "Analysing STL...";

    }


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const arrayBuffer =
                    event.target.result;


                const triangles =
                    parseSTL(
                        arrayBuffer
                    );


                if (
                    !triangles ||
                    triangles.length === 0
                ) {

                    throw new Error(
                        "No triangles were found in the STL file."
                    );

                }


                const analysis =
                    calculateSTLGeometry(
                        triangles
                    );


                updateSTLResults(
                    analysis
                );


                if (stlAnalysisStatus) {

                    stlAnalysisStatus.textContent =
                        "STL analysed";

                }


                console.log(
                    "STL Analysis:",
                    analysis
                );


            } catch (error) {

                console.error(
                    "STL analysis failed:",
                    error
                );


                if (stlAnalysisStatus) {

                    stlAnalysisStatus.textContent =
                        "Unable to analyse STL";

                }

            }

        };


    reader.onerror =
        function () {

            if (stlAnalysisStatus) {

                stlAnalysisStatus.textContent =
                    "Unable to read STL";

            }

        };


    reader.readAsArrayBuffer(
        file
    );

}


// =====================================
// Detect and Parse STL
// =====================================

function parseSTL(
    arrayBuffer
) {

    const binaryTriangles =
        parseBinarySTL(
            arrayBuffer
        );


    if (
        binaryTriangles &&
        binaryTriangles.length > 0
    ) {

        return binaryTriangles;

    }


    return parseASCIISTL(
        arrayBuffer
    );

}


// =====================================
// Binary STL Parser
// =====================================

function parseBinarySTL(
    arrayBuffer
) {

    if (
        arrayBuffer.byteLength < 84
    ) {

        return null;

    }


    const view =
        new DataView(
            arrayBuffer
        );


    const triangleCount =
        view.getUint32(
            80,
            true
        );


    const expectedLength =
        84 +
        (
            triangleCount *
            50
        );


    if (
        expectedLength >
        arrayBuffer.byteLength
    ) {

        return null;

    }


    const triangles = [];


    let offset = 84;


    for (
        let i = 0;
        i < triangleCount;
        i++
    ) {

        // Skip normal vector

        offset += 12;


        const ax =
            view.getFloat32(
                offset,
                true
            );


        const ay =
            view.getFloat32(
                offset + 4,
                true
            );


        const az =
            view.getFloat32(
                offset + 8,
                true
            );


        offset += 12;


        const bx =
            view.getFloat32(
                offset,
                true
            );


        const by =
            view.getFloat32(
                offset + 4,
                true
            );


        const bz =
            view.getFloat32(
                offset + 8,
                true
            );


        offset += 12;


        const cx =
            view.getFloat32(
                offset,
                true
            );


        const cy =
            view.getFloat32(
                offset + 4,
                true
            );


        const cz =
            view.getFloat32(
                offset + 8,
                true
            );


        offset += 12;


        triangles.push(
            [
                {
                    x: ax,
                    y: ay,
                    z: az
                },

                {
                    x: bx,
                    y: by,
                    z: bz
                },

                {
                    x: cx,
                    y: cy,
                    z: cz
                }
            ]
        );


        // Attribute byte count

        offset += 2;

    }


    return triangles;

}


// =====================================
// ASCII STL Parser
// =====================================

function parseASCIISTL(
    arrayBuffer
) {

    const decoder =
        new TextDecoder(
            "utf-8"
        );


    const text =
        decoder.decode(
            arrayBuffer
        );


    const vertexMatches =
        text.match(
            /vertex\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/gi
        );


    if (
        !vertexMatches ||
        vertexMatches.length < 3
    ) {

        return null;

    }


    const vertices = [];


    vertexMatches.forEach(
        function (match) {

            const parts =
                match
                    .trim()
                    .split(
                        /\s+/
                    );


            vertices.push(
                {
                    x: Number(parts[1]),
                    y: Number(parts[2]),
                    z: Number(parts[3])
                }
            );

        }
    );


    const triangles = [];


    for (
        let i = 0;
        i + 2 < vertices.length;
        i += 3
    ) {

        triangles.push(
            [
                vertices[i],
                vertices[i + 1],
                vertices[i + 2]
            ]
        );

    }


    return triangles;

}


// =====================================
// Calculate STL Geometry
// =====================================

function calculateSTLGeometry(
    triangles
) {

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;


    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;


    let volume = 0;


    triangles.forEach(
        function (triangle) {

            triangle.forEach(
                function (vertex) {

                    minX =
                        Math.min(
                            minX,
                            vertex.x
                        );


                    minY =
                        Math.min(
                            minY,
                            vertex.y
                        );


                    minZ =
                        Math.min(
                            minZ,
                            vertex.z
                        );


                    maxX =
                        Math.max(
                            maxX,
                            vertex.x
                        );


                    maxY =
                        Math.max(
                            maxY,
                            vertex.y
                        );


                    maxZ =
                        Math.max(
                            maxZ,
                            vertex.z
                        );

                }
            );


            const a =
                triangle[0];

            const b =
                triangle[1];

            const c =
                triangle[2];


            volume +=
                (
                    a.x *
                    (
                        b.y * c.z -
                        b.z * c.y
                    )

                    -

                    a.y *
                    (
                        b.x * c.z -
                        b.z * c.x
                    )

                    +

                    a.z *
                    (
                        b.x * c.y -
                        b.y * c.x
                    )
                ) / 6;

        }
    );


    volume =
        Math.abs(
            volume
        );


    const sizeX =
        maxX - minX;


    const sizeY =
        maxY - minY;


    const sizeZ =
        maxZ - minZ;


    const volumeCm3 =
        volume / 1000;


    return {

    dimensions: {

        x: sizeX,

        y: sizeY,

        z: sizeZ

    },

    volumeMm3:
        volume,

    volumeCm3:
        volumeCm3,

    triangles:
        triangles

};

}


// =====================================
// Format Print Time
// =====================================

function formatPrintTime(
    totalSeconds
) {

    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );


    if (hours > 0) {

        return (
            `${hours}h ${minutes}m`
        );

    }


    return (
        `${minutes} min`
    );

}


// =====================================
// Cura-Style Material + Print Calculation
// =====================================

function calculateMaterial(
    analysis
) {

    // =====================================
    // Selected Material
    // =====================================

    const materialSelect =
        document.getElementById(
            "materialSelect"
        );


    const selectedMaterial =
        materialSelect
            ? materialSelect.value
            : "PLA";


    const materialSettings =
        CUSTOM_PRINTING_SETTINGS
            .filament[
                selectedMaterial
            ];


    if (!materialSettings) {

        throw new Error(
            "Material settings not found."
        );

    }


    // =====================================
    // Print Settings
    // =====================================

    const defaults =
        CUSTOM_PRINTING_SETTINGS
            .defaults;


    const infillPercent =
        defaults.infillPercent;


    const wallCount =
        defaults.wallCount;


    const layerHeight =
        defaults.layerHeight;


    const nozzleDiameter =
        defaults.nozzleDiameter;


    const printSpeed =
        defaults.printSpeed;


    const efficiency =
        defaults.efficiency;


    // =====================================
    // Top / Bottom Settings
    // =====================================

    const topLayers =
        defaults.topLayers;


    const bottomLayers =
        defaults.bottomLayers;


    // =====================================
    // Model Dimensions
    // =====================================

    const width =
        analysis.dimensions.x;


    const depth =
        analysis.dimensions.y;


    const height =
        analysis.dimensions.z;


    const modelVolumeMm3 =
        analysis.volumeMm3;


    const modelVolumeCm3 =
        analysis.volumeCm3;


    // =====================================
    // Layer Count
    // =====================================

    const layerCount =
        Math.max(
            1,
            Math.ceil(
                height /
                layerHeight
            )
        );


    // =====================================
    // Top / Bottom Layer Count
    // =====================================

    const topBottomLayers =
        Math.min(
            layerCount,
            topLayers +
            bottomLayers
        );


    // =====================================
    // Estimate Surface Area
    //
    // The STL triangles give us the actual
    // surface area of the model.
    // =====================================

    let surfaceAreaMm2 = 0;


    analysis.triangles.forEach(
        function (triangle) {

            const a =
                triangle[0];

            const b =
                triangle[1];

            const c =
                triangle[2];


            const ab = {

                x:
                    b.x - a.x,

                y:
                    b.y - a.y,

                z:
                    b.z - a.z

            };


            const ac = {

                x:
                    c.x - a.x,

                y:
                    c.y - a.y,

                z:
                    c.z - a.z

            };


            const crossX =
                (
                    ab.y * ac.z
                ) -
                (
                    ab.z * ac.y
                );


            const crossY =
                (
                    ab.z * ac.x
                ) -
                (
                    ab.x * ac.z
                );


            const crossZ =
                (
                    ab.x * ac.y
                ) -
                (
                    ab.y * ac.x
                );


            const triangleArea =
                0.5 *
                Math.sqrt(
                    (
                        crossX *
                        crossX
                    ) +

                    (
                        crossY *
                        crossY
                    ) +

                    (
                        crossZ *
                        crossZ
                    )
                );


            surfaceAreaMm2 +=
                triangleArea;

        }
    );


    // =====================================
    // Estimate Wall Material
    // =====================================

    const wallThickness =
        wallCount *
        nozzleDiameter;


    const wallVolumeMm3 =
        surfaceAreaMm2 *
        wallThickness *
        0.50;


    // =====================================
    // Estimate Top / Bottom Material
    // =====================================

    const topBottomThickness =
        topBottomLayers *
        layerHeight;


    const projectedAreaMm2 =
        width *
        depth;


    const topBottomVolumeMm3 =
        Math.min(
            modelVolumeMm3,
            projectedAreaMm2 *
            topBottomThickness *
            0.35
        );


    // =====================================
    // Remaining Volume For Infill
    // =====================================

    const remainingVolumeMm3 =
        Math.max(
            0,
            modelVolumeMm3 -
            wallVolumeMm3 -
            topBottomVolumeMm3
        );


    // =====================================
    // Infill Material
    // =====================================

    const infillVolumeMm3 =
        remainingVolumeMm3 *
        (
            infillPercent /
            100
        );


   // =====================================
// Total Estimated Extruded Volume
// =====================================

const rawExtrusionVolumeMm3 =

    wallVolumeMm3 +

    topBottomVolumeMm3 +

    infillVolumeMm3;


// =====================================
// Prevent Overestimation
// =====================================

// Filament used cannot exceed the actual
// physical volume of the STL.

let estimatedExtrusionVolumeMm3 =

    Math.min(

        rawExtrusionVolumeMm3,

        modelVolumeMm3

    );


// =====================================
// Efficiency Adjustment
// =====================================

estimatedExtrusionVolumeMm3 *=

    efficiency;


    // =====================================
    // Convert To cm³
    // =====================================

    const estimatedExtrusionVolumeCm3 =
        estimatedExtrusionVolumeMm3 /
        1000;


    // =====================================
    // Weight
    // =====================================

    const estimatedWeightGrams =
        estimatedExtrusionVolumeCm3 *
        materialSettings.density;


    const estimatedWeightKg =
        estimatedWeightGrams /
        1000;


    // =====================================
    // Filament Length
    // =====================================

    const metresPerKg =
        materialSettings.metresPerKg;


    const filamentLengthMetres =
        estimatedWeightKg *
        metresPerKg;


    // =====================================
    // Material Cost
    // =====================================

    const materialCost =
        estimatedWeightKg *
        materialSettings.pricePerKg;


    // =====================================
    // Print Time
    // =====================================

    const lineWidth =
        nozzleDiameter *
        1.2;


    const layerAreaMm2 =
        Math.max(
            1,
            (
                estimatedExtrusionVolumeMm3 /
                height
            )
        );


    const volumetricFlow =
        lineWidth *
        layerHeight *
        printSpeed;


    const extrusionTimeSeconds =
        estimatedExtrusionVolumeMm3 /
        volumetricFlow;


    // =====================================
    // Travel / Layer Overhead
    // =====================================

    const layerOverheadSeconds =
        layerCount *
        2;


    const travelMultiplier =
        1.35;


    const totalPrintTimeSeconds =
        (
            extrusionTimeSeconds *
            travelMultiplier
        ) +
        layerOverheadSeconds;


    // =====================================
    // Printing Costs
    // =====================================

    

    const markupPercent =
        CUSTOM_PRINTING_SETTINGS
            .pricing
            .markupPercent;


    const minimumOrder =
        CUSTOM_PRINTING_SETTINGS
            .pricing
            .minimumOrder;


    


    


    


    // =====================================
    // Production Cost
    // =====================================

    const productionCost =
    materialCost;


    // =====================================
    // Markup
    // =====================================

    const markupAmount =
        productionCost *
        (
            markupPercent /
            100
        );


    // =====================================
    // Final Price
    // =====================================

    const calculatedPrice =
        productionCost +
        markupAmount;


    const finalPrice =
        Math.max(
            calculatedPrice,
            minimumOrder
        );


    return {

    material:
        selectedMaterial,

    weightGrams:
        estimatedWeightGrams,

    weightKg:
        estimatedWeightKg,

    filamentMetres:
        filamentLengthMetres,

    materialCost:
        materialCost,

    printTimeSeconds:
        totalPrintTimeSeconds,

    printTime:
        formatPrintTime(
            totalPrintTimeSeconds
        ),

    // Price before minimum order
    calculatedPrice:
        calculatedPrice,

    // Minimum order value
    minimumOrder:
        minimumOrder,

    // Current single-unit price
    estimatedPrice:
        finalPrice

};

}

    


// =====================================
// Update STL Results
// =====================================

function updateSTLResults(
    analysis
) {

    // =====================================
    // Calculate Everything
    // =====================================

    const material =
        calculateMaterial(
            analysis
        );


    // =====================================
    // Dimensions
    // =====================================

    const dimensionsElement =
        document.getElementById(
            "stlDimensions"
        );


    if (dimensionsElement) {

        dimensionsElement.textContent =
            `${analysis.dimensions.x.toFixed(1)} × ` +
            `${analysis.dimensions.y.toFixed(1)} × ` +
            `${analysis.dimensions.z.toFixed(1)} mm`;

    }


    // =====================================
    // Volume
    // =====================================

    const volumeElement =
        document.getElementById(
            "stlVolume"
        );


    if (volumeElement) {

        volumeElement.textContent =
            `${analysis.volumeCm3.toFixed(2)} cm³`;

    }


    // =====================================
    // Weight
    // =====================================

    const weightElement =
        document.getElementById(
            "stlFilamentWeight"
        );


    if (weightElement) {

        weightElement.textContent =
            `${material.weightGrams.toFixed(2)} g`;

    }


    // =====================================
    // Filament Length
    // =====================================

    const filamentLengthElement =
        document.getElementById(
            "stlFilamentLength"
        );


    if (filamentLengthElement) {

        filamentLengthElement.textContent =
            `${material.filamentMetres.toFixed(2)} m`;

    }


    // =====================================
    // Print Time
    // =====================================

    const printTimeElement =
        document.getElementById(
            "stlPrintTime"
        );


    if (printTimeElement) {

        printTimeElement.textContent =
            material.printTime;

    }

    // =====================================
// Display Calculated Print Cost
// =====================================

const calculatedCostElement =
    document.getElementById(
        "stlCalculatedCost"
    );


if (calculatedCostElement) {

    calculatedCostElement.textContent =
        `R${material.calculatedPrice.toFixed(2)}`;

}


    // =====================================
    // Estimated Price
    // =====================================

    const priceElement =
        document.getElementById(
            "stlEstimatedPrice"
        );


    if (priceElement) {

        priceElement.textContent =
            `R${material.estimatedPrice.toFixed(2)}`;

    }

    


// =====================================
// Update Quantity Pricing
// =====================================

updateQuantityPricing();


    // =====================================
    // Console Information
    // =====================================

    console.log(
        "3D Contour Material Cost:",
        {

            material:
                material.material,

            weightGrams:
                material.weightGrams,

            filamentMetres:
                material.filamentMetres,

            materialCost:
                material.materialCost,

            printTime:
                material.printTime,

            estimatedPrice:
                material.estimatedPrice

        }
    );

}

// =====================================
// Quantity Pricing
// =====================================

function updateQuantityPricing() {

    const customQuantityInput =
    document.getElementById(
        "customQuantityInput"
    );


let quantity = 1;


if (
    customQuantityInput &&
    customQuantityInput.value !== ""
) {

    const customQuantity =
        Number(
            customQuantityInput.value
        );


    if (
        customQuantity >= 1 &&
        customQuantity <= 9999
    ) {

        quantity =
            Math.floor(
                customQuantity
            );

    }

}


    const quantityDisplay =
        document.getElementById(
            "stlQuantityDisplay"
        );

        const pricePerItemElement =
    document.getElementById(
        "stlPricePerItem"
    );


    const orderTotalElement =
        document.getElementById(
            "stlOrderTotal"
        );


    const calculatedCostElement =
        document.getElementById(
            "stlCalculatedCost"
        );


    if (
        !calculatedCostElement ||
        !orderTotalElement
    ) {

        return;

    }


    const calculatedPrice =
        Number(
            calculatedCostElement.textContent
                .replace("R", "")
                .trim()
        );


    if (isNaN(calculatedPrice)) {

        return;

    }


    const minimumOrder =
        CUSTOM_PRINTING_SETTINGS
            .pricing
            .minimumOrder;


    const orderCalculatedPrice =
        calculatedPrice *
        quantity;


    const orderTotal =
        Math.max(
            orderCalculatedPrice,
            minimumOrder
        );

        const minimumOrderNotice =
    document.getElementById(
        "stlMinimumOrderNotice"
    );


if (minimumOrderNotice) {

    if (
        orderCalculatedPrice <
        minimumOrder
    ) {

        minimumOrderNotice.hidden =
            false;

    } else {

        minimumOrderNotice.hidden =
            true;

    }

}

        if (pricePerItemElement) {

    pricePerItemElement.textContent =
        `R${calculatedPrice.toFixed(2)}`;

}


    if (quantityDisplay) {

        quantityDisplay.textContent =
            quantity;

    }


    orderTotalElement.textContent =
        `R${orderTotal.toFixed(2)}`;

}

// =====================================
// Custom Quantity
// =====================================


const customQuantityInput =
    document.getElementById(
        "customQuantityInput"
    );


if (customQuantityInput) {

    customQuantityInput.addEventListener(
        "input",
        updateQuantityPricing
    );


    customQuantityInput.addEventListener(
        "blur",
        function () {

            if (
                customQuantityInput.value === "" ||
                Number(customQuantityInput.value) < 1
            ) {

                customQuantityInput.value = 1;

                updateQuantityPricing();

            }

        }
    );

}

// =====================================
// Add Custom Print To Cart
// =====================================

const addCustomPrintToCartButton =
    document.getElementById(
        "addCustomPrintToCartButton"
    );

const customPrintCartMessage =
    document.getElementById(
        "customPrintCartMessage"
    );


if (addCustomPrintToCartButton) {

    addCustomPrintToCartButton.addEventListener(
        "click",
        function () {

            const stlFile =
                stlUpload &&
                stlUpload.files &&
                stlUpload.files.length > 0
                    ? stlUpload.files[0]
                    : null;


            if (!stlFile) {

                if (customPrintCartMessage) {

                    customPrintCartMessage.hidden = false;

                    customPrintCartMessage.textContent =
                        "Please upload an STL file first.";

                }

                return;

            }


            const calculatedCostElement =
                document.getElementById(
                    "stlCalculatedCost"
                );

            const orderTotalElement =
                document.getElementById(
                    "stlOrderTotal"
                );

            const customQuantityInput =
                document.getElementById(
                    "customQuantityInput"
                );


            if (
                !calculatedCostElement ||
                !orderTotalElement
            ) {

                return;

            }


            const pricePerItem =
                Number(
                    calculatedCostElement.textContent
                        .replace("R", "")
                        .trim()
                );


            const orderTotal =
                Number(
                    orderTotalElement.textContent
                        .replace("R", "")
                        .trim()
                );


            let quantity = 1;


            if (
                customQuantityInput &&
                customQuantityInput.value !== ""
            ) {

                const enteredQuantity =
                    Number(
                        customQuantityInput.value
                    );


                if (
                    enteredQuantity >= 1 &&
                    enteredQuantity <= 9999
                ) {

                    quantity =
                        Math.floor(
                            enteredQuantity
                        );

                }

            }


            const materialSelect =
                document.getElementById(
                    "materialSelect"
                );


            const material =
                materialSelect
                    ? materialSelect.value
                    : "PLA";


            const cartItem = {

                id:
                    "custom-print-" +
                    Date.now(),

                name:
                    "Custom 3D Print - " +
                    stlFile.name,

                type:
                    "custom-print",

                filename:
                    stlFile.name,

                material:
                    material,

                quantity:
                    quantity,

                price:
                    pricePerItem,

                    minimumOrder:
    35,

                total:
                    orderTotal

            };


            let cart = [];


            try {

                cart =
                    JSON.parse(
                        localStorage.getItem(
                            "cart"
                        )
                    ) || [];

            } catch (error) {

                cart = [];

            }


            cart.push(cartItem);


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            if (customPrintCartMessage) {

                customPrintCartMessage.hidden = false;

                customPrintCartMessage.textContent =
                    "✓ Custom print added to your cart.";

            }

        }
    );

}