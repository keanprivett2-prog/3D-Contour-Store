// =====================================
// 3D Contour - Custom Printing Settings
// =====================================

export const CUSTOM_PRINTING_SETTINGS = {

    // =====================================
    // Filament
    // =====================================

    filament: {

        PLA: {
    pricePerKg: 2890,
    density: 1.24,
    metresPerKg: 335
},
        PETG: {
    pricePerKg: 2650,
    density: 1.27,
    metresPerKg: 335
},

        TPU: {
    pricePerKg: 3000,
    density: 1.21,
    metresPerKg: 335
}

    },


    // =====================================
    // Printing Costs
    // =====================================

    printing: {

        machineCostPerHour: 15,

        electricityCostPerHour: 3,

        setupFee: 25

    },


    // =====================================
    // Default Print Assumptions
    // =====================================

    defaults: {

    infillPercent: 20,

    wallCount: 2,

    layerHeight: 0.2,

    nozzleDiameter: 0.4,

    filamentDiameter: 1.75,

    printSpeed: 30,

    efficiency: 0.90,

    topLayers: 3,

    bottomLayers: 3

},


    // =====================================
    // Pricing
    // =====================================

    pricing: {

        markupPercent: 40,

        minimumOrder: 35

    }

};