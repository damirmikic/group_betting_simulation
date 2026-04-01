export function initializeKnockoutStats(aggStats, groupTeamNames) {
    aggStats._knockout = { teamProgress: {} };
    Object.values(groupTeamNames).flat().forEach(team => {
        aggStats._knockout.teamProgress[team] = {
            reachR32: 0, reachR16: 0, reachQF: 0, reachSF: 0, reachFINAL: 0, winFINAL: 0,
            eliminateR32: 0, eliminateR16: 0, eliminateQF: 0, eliminateSF: 0,
            runnerUpCount: 0, thirdPlaceCount: 0,
            mostTournamentGFCount: 0, mostTournamentGACount: 0,
            tournamentGfSims: [], tournamentGaSims: [], tournamentGamesSims: []
        };
    });
}

export function incrementRoundReach(aggStats, team, round) {
    const teamStats = aggStats?._knockout?.teamProgress?.[team];
    if (!teamStats) return;
    if (round === 'R32') teamStats.reachR32++;
    if (round === 'R16') teamStats.reachR16++;
    if (round === 'QF') teamStats.reachQF++;
    if (round === 'SF') teamStats.reachSF++;
    if (round === 'FINAL') teamStats.reachFINAL++;
}
