// Calculate estimated new rank based on given pp value.
export const calculateRank = (pp, data) => {
    const { global, country } = data;
    const leaderboardInUse = pp < global[9999].pp ? country : global;

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
