// Calculate overall accuracy based on an array of accuracy values and a selection.
export const calculateOverallAcc = (accValues, selection) => {
    let count = 0;
    const accSum = accValues.reduce((acc, curr, index) => acc + (selection[index] ? 0 : curr * Math.pow(0.95, count++)), 0);
    return 100 / (20 * (1 - Math.pow(0.95, count))) * accSum;
};

export const calculateOverallAccNoSelection = (accValues) => {
    let count = 0;
    const accSum = accValues.reduce((acc, curr,) => acc + curr * Math.pow(0.95, count++), 0);
    return 100 / (20 * (1 - Math.pow(0.95, count))) * accSum;
};