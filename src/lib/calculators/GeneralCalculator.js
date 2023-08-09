export const calculateMean = (values) =>
  values.reduce((acc, val) => acc + val, 0) / values.length;

export const calculateMedian = (values) => {
  values.sort();
  return values.length % 2 === 0
    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    : values[(values.length - 1) / 2];
};
