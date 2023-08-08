// Group mods by value for pie chart etc
export const groupModsByValue = (modCombis) => {
  let individualModCount = {};
  let modCombinationCount = {};
  modCombis.forEach((modCombi) => {
    modCombi.forEach((mod) => {
      mod in individualModCount
        ? individualModCount[mod]++
        : (individualModCount[mod] = 1);
    });
    const modString = modCombi.join("");
    modString in modCombinationCount
      ? modCombinationCount[modString]++
      : (modCombinationCount[modString] = 1);
  });
  console.log(individualModCount);
  console.log(modCombinationCount);
  return { individualModCount, modCombinationCount };
};
