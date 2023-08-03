import ojsama from "ojsama";
import { calculateModValue } from "../modbits";

export const calculateStarRating = (beatmapFileData, modArr) => {
  const mods = calculateModValue(modArr);
  const { map } = new ojsama.parser().feed(beatmapFileData);
  return new ojsama.std_diff().calc({ map, mods }).total;
};
