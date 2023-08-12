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

  let individualModArray = [];
  let modCombinationArray = [];

  for (const mod in individualModCount) {
    individualModArray.push({ mod, count: individualModCount[mod] });
  }
  for (const mods in modCombinationCount) {
    modCombinationArray.push({ mods, count: modCombinationCount[mods] });
  }

  individualModArray.sort((a, b) =>
    a.count < b.count ? 1 : a.count > b.count ? -1 : 0
  );
  modCombinationArray.sort((a, b) =>
    a.count < b.count ? 1 : a.count > b.count ? -1 : 0
  );

  console.log(individualModArray);
  console.log(modCombinationArray);
  return { individualModArray, modCombinationArray };
};
