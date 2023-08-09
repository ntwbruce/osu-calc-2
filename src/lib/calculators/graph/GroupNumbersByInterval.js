// Create histogram data with given numbers split by given interval
export const groupNumbersByInterval = (numbers, interval) => {
  let numberCountByInterval = {};
  let smallestInterval = -1;
  let largestInterval = -1;

  numbers.forEach((number) => {
    const nearestInterval = Math.floor(number / interval) * interval;
    if (nearestInterval < smallestInterval || smallestInterval === -1) {
      smallestInterval = nearestInterval;
    }
    if (nearestInterval > largestInterval || largestInterval === -1) {
      largestInterval = nearestInterval;
    }
    nearestInterval in numberCountByInterval
      ? numberCountByInterval[nearestInterval]++
      : (numberCountByInterval[nearestInterval] = 1);
  });

  for (
    let currInterval = smallestInterval + interval;
    currInterval < largestInterval;
    currInterval += interval
  ) {
    if (!(currInterval in numberCountByInterval)) {
      numberCountByInterval[currInterval] = 0;
    }
  }

  let intervalArray = [];
  for (const interval in numberCountByInterval) {
    intervalArray.push({
      interval: parseFloat(interval),
      count: numberCountByInterval[interval],
    });
  }

  const tickCount = (largestInterval - smallestInterval) / interval + 2;

  console.log({
    intervalArray,
    ticks: {
      smallestTick: smallestInterval,
      largestTick: largestInterval + interval,
      tickCount,
    },
  });
  return {
    intervalArray,
    histogramTicks: {
      smallestTick: smallestInterval,
      largestTick: largestInterval + interval,
      tickCount,
    },
  };
};
