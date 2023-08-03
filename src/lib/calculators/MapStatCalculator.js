import { modbits } from "../modbits";

// Deconstruct modbit value and check for stat changing mods.
const deconstructMods = (mods) => {
  const EZ = (mods & modbits["EZ"]) === modbits["EZ"];
  const HR = (mods & modbits["HR"]) === modbits["HR"];
  const DT = (mods & modbits["DT"]) === modbits["DT"];
  const HT = (mods & modbits["HT"]) === modbits["HT"];
  const NC = (mods & modbits["NC"]) === modbits["NC"];
  return { EZ, HR, DT, HT, NC };
};

// Calculate new AR with given mods.
export const calculateAR = (baseAR, { EZ, HR, DT, HT, NC }) => {
  let newAR = baseAR;

  if (EZ) {
    newAR = 0.5 * newAR;
  } else if (HR) {
    newAR = Math.min(1.4 * newAR, 10);
  }

  if (HT) {
    if (newAR < 5) {
      const time = 1200 + 600 * ((5 - newAR) / 5);
      newAR = 5 - (((4 / 3) * time - 1200) / 600) * 5;
    } else {
      const time = 1200 - 750 * ((newAR - 5) / 5);
      newAR =
        time > 900
          ? 5 - (((4 / 3) * time - 1200) / 600) * 5
          : ((1200 - (4 / 3) * time) / 750) * 5 + 5;
    }
  } else if (DT || NC) {
    let time;
    if (newAR < 5) {
      time = 1200 + 600 * ((5 - newAR) / 5);
    } else {
      time = 1200 - 750 * ((newAR - 5) / 5);
    }
    newAR = Math.min(((1200 - (2 / 3) * time) / 750) * 5 + 5, 11);
  }

  return Math.round(newAR * 10) / 10;
};

// Calculate new OD with given mods.
export const calculateOD = (baseOD, { EZ, HR, DT, HT, NC }) => {
  let newOD = baseOD;

  if (EZ) {
    newOD = 0.5 * newOD;
  } else if (HR) {
    newOD = Math.min(1.4 * newOD, 10);
  }

  const window = 80 - 6 * newOD;
  if (HT) {
    newOD = (80 - (4 / 3) * window) / 6;
  } else if (DT || NC) {
    newOD = (80 - (2 / 3) * window) / 6;
  }

  return Math.round(newOD * 10) / 10;
};

// Calculate new HP with given mods.
export const calculateHP = (baseHP, { EZ, HR }) => {
  let newHP = baseHP;

  if (EZ) {
    newHP = 0.5 * newHP;
  } else if (HR) {
    newHP = Math.min(1.4 * newHP, 10);
  }

  return Math.round(newHP * 10) / 10;
};

// Calculate new CS with given mods.
export const calculateCS = (baseCS, { EZ, HR }) => {
  let newCS = baseCS;

  if (EZ) {
    newCS = 0.5 * newCS;
  } else if (HR) {
    newCS = Math.min(1.3 * newCS, 10);
  }

  return Math.round(newCS * 10) / 10;
};

// Calculate new beatmap length with given mods.
export const calculateLength = (baseLength, { HT, DT, NC }) => {
  if (HT) {
    return Math.round((4 / 3) * baseLength * 10) / 10;
  } else if (DT || NC) {
    return Math.round((2 / 3) * baseLength * 10) / 10;
  }
  return Math.round(baseLength * 10) / 10;
};

// Calculate new BPM with given mods.
export const calculateBPM = (baseBPM, { HT, DT, NC }) => {
  if (HT) {
    return (3 / 4) * baseBPM;
  } else if (DT || NC) {
    return (3 / 2) * baseBPM;
  }
  return Math.round(baseBPM * 10) / 10;
};

export const calculateMapStats = (
  { baseAR, baseOD, baseHP, baseCS, baseTotalLength, baseDrainLength, baseBPM },
  mods
) => {
  const { EZ, HR, DT, HT, NC } = deconstructMods(mods);
  return {
    newAR: calculateAR(baseAR, { EZ, HR, DT, HT, NC }),
    newOD: calculateOD(baseOD, { EZ, HR, DT, HT, NC }),
    newHP: calculateHP(baseHP, { EZ, HR }),
    newCS: calculateCS(baseCS, { EZ, HR }),
    newTotalLength: calculateLength(baseTotalLength, { HT, DT, NC }),
    newDrainLength: calculateLength(baseDrainLength, { HT, DT, NC }),
    newBPM: calculateBPM(baseBPM, { HT, DT, NC }),
  };
};
