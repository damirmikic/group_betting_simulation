export function resolveBracketReference(ref, context) {
    const {
        groupStandings,
        thirdQualifiedByGroup,
        thirdRankedList,
        usedTeams,
        knockoutWinners,
        knockoutLosers
    } = context;
    const cleaned = String(ref || '').trim();
    const winnerGroupMatch = cleaned.match(/^Winner Group\s+([A-Za-z0-9]+)$/i);
    if (winnerGroupMatch) return groupStandings[winnerGroupMatch[1]]?.[0]?.name || null;
    const runnerUpGroupMatch = cleaned.match(/^Runner-up Group\s+([A-Za-z0-9]+)$/i);
    if (runnerUpGroupMatch) return groupStandings[runnerUpGroupMatch[1]]?.[1]?.name || null;
    const thirdGroupMatch = cleaned.match(/^3rd Group\s+(.+)$/i);
    if (thirdGroupMatch) {
        const groups = thirdGroupMatch[1].split('/').map(g => g.trim()).filter(Boolean);
        const pick = thirdRankedList.find(team => groups.includes(team.group) && thirdQualifiedByGroup.has(team.group) && !usedTeams.has(team.name));
        return pick?.name || null;
    }
    const winnerMatchRef = cleaned.match(/^Winner Match\s+(\d+)$/i);
    if (winnerMatchRef) return knockoutWinners[parseInt(winnerMatchRef[1], 10)] || null;
    const loserMatchRef = cleaned.match(/^Loser Match\s+(\d+)$/i);
    if (loserMatchRef) return knockoutLosers[parseInt(loserMatchRef[1], 10)] || null;
    return cleaned || null;
}

export function runKnockoutStage({
    parsedBracketMatches,
    aggStats,
    groupStandings,
    thirdRankedList,
    simTournamentTotals,
    simulateKnockoutMatch,
    incrementRoundReach
}) {
    if (!parsedBracketMatches.length) return;
    const roundOrder = { R32: 1, R16: 2, QF: 3, SF: 4, '3RD': 5, FINAL: 6 };
    const sortedBracketMatches = [...parsedBracketMatches].sort((a, b) => {
        const roundDiff = (roundOrder[a.round] || 99) - (roundOrder[b.round] || 99);
        if (roundDiff !== 0) return roundDiff;
        return a.matchNum - b.matchNum;
    });
    const knockoutWinners = {};
    const knockoutLosers = {};
    const thirdQualifiedByGroup = new Set(thirdRankedList.map(t => t.group));
    const usedTeamsInRound = {};
    const pendingMatches = [...sortedBracketMatches];

    while (pendingMatches.length > 0) {
        let resolvedAny = false;
        for (let idx = 0; idx < pendingMatches.length; idx++) {
            const match = pendingMatches[idx];
            usedTeamsInRound[match.round] = usedTeamsInRound[match.round] || new Set();
            const usedTeams = usedTeamsInRound[match.round];
            const resolutionCtx = {
                groupStandings,
                thirdQualifiedByGroup,
                thirdRankedList,
                usedTeams,
                knockoutWinners,
                knockoutLosers
            };
            const teamA = resolveBracketReference(match.sideARef, resolutionCtx);
            const teamB = resolveBracketReference(match.sideBRef, resolutionCtx);
            if (!teamA || !teamB || teamA === teamB) continue;

            usedTeams.add(teamA);
            usedTeams.add(teamB);
            incrementRoundReach(aggStats, teamA, match.round);
            incrementRoundReach(aggStats, teamB, match.round);

            const { winner, loser, goalsA, goalsB } = simulateKnockoutMatch(teamA, teamB);
            if (simTournamentTotals[teamA]) {
                simTournamentTotals[teamA].gf += goalsA;
                simTournamentTotals[teamA].ga += goalsB;
                simTournamentTotals[teamA].games += 1;
            }
            if (simTournamentTotals[teamB]) {
                simTournamentTotals[teamB].gf += goalsB;
                simTournamentTotals[teamB].ga += goalsA;
                simTournamentTotals[teamB].games += 1;
            }
            knockoutWinners[match.matchNum] = winner;
            knockoutLosers[match.matchNum] = loser;
            const loserStats = aggStats._knockout?.teamProgress?.[loser];
            if (loserStats) {
                if (match.round === 'R32') loserStats.eliminateR32++;
                if (match.round === 'R16') loserStats.eliminateR16++;
                if (match.round === 'QF') loserStats.eliminateQF++;
                if (match.round === 'SF') loserStats.eliminateSF++;
                if (match.round === 'FINAL') loserStats.runnerUpCount++;
            }
            if (match.round === '3RD' && aggStats._knockout?.teamProgress?.[winner]) {
                aggStats._knockout.teamProgress[winner].thirdPlaceCount++;
            }
            if (match.round === 'FINAL' && aggStats._knockout?.teamProgress?.[winner]) {
                aggStats._knockout.teamProgress[winner].winFINAL++;
            }

            pendingMatches.splice(idx, 1);
            idx--;
            resolvedAny = true;
        }

        if (!resolvedAny) break;
    }
}
