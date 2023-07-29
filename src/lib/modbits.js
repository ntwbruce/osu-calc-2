// Modbits as dictated by peppy himself. There are values from osu! source code and used in calculations by ojsama library, so we will stick with convention.
export const modbits = {
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
