// Calculate total raw pp based on an array of pp values and a selection.
export const calculateTotalPP = (ppValues, selection) => {
    let count = 0;
    return ppValues.reduce((acc, curr, index) => acc + (selection[index] ? 0 : curr * Math.pow(0.95, count++)), 0);
};

export const calculateTotalPPNoSelection = (ppValues) => {
    let count = 0;
    return ppValues.reduce((acc, curr) => acc + curr * Math.pow(0.95, count++), 0);
};