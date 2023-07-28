import ojsama from "ojsama";

const modbits = {
  SD: 0,
  PF: 0,
  NM: 1 << 0,
  NF: 1 << 0,
  EZ: 1 << 1,
  TD: 1 << 2,
  HD: 1 << 3,
  HR: 1 << 4,
  DT: 1 << 6,
  HT: 1 << 8,
  NC: 1 << 9,
  FL: 1 << 10,
  SO: 1 << 12,
};

export const calculateModValue = (mods) =>
  mods.reduce((acc, curr) => acc + modbits[curr], 0);

export const calculateStarRating = (beatmapFileData, modArr) => {
  const mods = calculateModValue(modArr);
  const { map } = new ojsama.parser().feed(beatmapFileData);
  return new ojsama.std_diff().calc({ map, mods }).total;
};
