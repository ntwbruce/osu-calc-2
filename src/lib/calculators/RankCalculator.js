// Calculate estimated new rank based on given pp value.
export const calculateRank = (pp, data) => {
    const { globalValues, countryValues } = data;
    const leaderboardInUse = pp < globalValues[9999].pp ? countryValues : globalValues;

    let min = 0;
    let max = 9999;
    let curr = Math.round((min + max) / 2);
    
    while(min < max) {
        const currRankPP = leaderboardInUse[curr].pp;
        if (pp === currRankPP) break;
        if (pp < currRankPP) {
            min = curr + 1;
        } else {
            max = curr - 1;
        }
        curr = Math.round((min + max) / 2);
    }

    return leaderboardInUse[curr].rank; 
};
