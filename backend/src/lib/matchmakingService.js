import prisma from "../prismaClient.js";

/**
 * Generates a randomized single-elimination bracket for a tournament.
 * @param {number} tournamentId
 */
export const generateRandomBracket = async (tournamentId) => {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { bracketStatus: "GENERATING", bracketError: null },
    });

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: {
          select: { id: true, status: true },
        },
        matches: {
          take: 1,
        }
      },
    });

    if (!tournament) {
      console.error(`Tournament ${tournamentId} not found.`);
      return;
    }

    if (tournament.matches.length > 0) {
      console.log(`Matches already exist for tournament ${tournamentId}. Skipping bracket generation.`);
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { bracketStatus: "COMPLETED" },
      });
      return;
    }

    if (tournament.tournamentStyle !== 'KNOCKOUT' && tournament.tournamentStyle !== 'HYBRID') {
      console.log(`Tournament ${tournamentId} is not a KNOCKOUT tournament. Bracket generation skipped.`);
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { bracketStatus: null, bracketError: null },
      });
      return;
    }

    const participatingTeams = tournament.teams.filter(t => t.status !== 'REJECTED');

    if (participatingTeams.length === 0) {
      console.log(`No teams available for tournament ${tournamentId}.`);
      await markBracketFailed(tournamentId, "No eligible teams available");
      return;
    }

    // Fisher-Yates shuffle — uniform distribution, no comparator needed
    const shuffledTeams = [...participatingTeams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
    }

    const numTeams = shuffledTeams.length;
    let bracketSize = 1;
    while (bracketSize < numTeams) {
      bracketSize *= 2;
    }

    const totalRounds = Math.log2(bracketSize);

    const matchesByRound = Array.from({ length: totalRounds }, () => []);

    for (let r = 0; r < totalRounds; r++) {
      const roundNum = r + 1;
      const numMatchesInRound = bracketSize / Math.pow(2, r + 1);

      for (let m = 0; m < numMatchesInRound; m++) {
        matchesByRound[r].push({
          round: roundNum,
          bracketPosition: m + 1,
          homeTeamId: null,
          awayTeamId: null,
        });
      }
    }

    let teamIndex = 0;
    for (let m = 0; m < matchesByRound[0].length; m++) {
        matchesByRound[0][m].homeTeamId = teamIndex < numTeams ? shuffledTeams[teamIndex++].id : null;
        matchesByRound[0][m].awayTeamId = teamIndex < numTeams ? shuffledTeams[teamIndex++].id : null;
    }

    let nextRoundMatches = [];

    await prisma.$transaction(async (tx) => {
        for (let r = totalRounds - 1; r >= 0; r--) {
            const roundData = matchesByRound[r].map((matchData, m) => {
                let nextMatchId = null;
                if (r < totalRounds - 1) {
                    nextMatchId = nextRoundMatches[Math.floor(m / 2)].id;
                }

                return {
                    matchType: 'OFFICIAL_TOURNAMENT',
                    status: 'SCHEDULED',
                    tournamentId,
                    round: matchData.round,
                    bracketPosition: matchData.bracketPosition,
                    homeTeamId: matchData.homeTeamId,
                    awayTeamId: matchData.awayTeamId,
                    nextMatchId,
                };
            });

            nextRoundMatches = await tx.match.createManyAndReturn({
                data: roundData,
                select: { id: true, bracketPosition: true },
            });

            nextRoundMatches.sort((a, b) => a.bracketPosition - b.bracketPosition);
        }

        // Auto-advance byes: Round 1 matches with only one team
        const byeMatches = await tx.match.findMany({
          where: {
            tournamentId,
            round: 1,
            OR: [
              { homeTeamId: null, awayTeamId: { not: null } },
              { homeTeamId: { not: null }, awayTeamId: null },
            ],
          },
          select: { id: true, homeTeamId: true, awayTeamId: true, nextMatchId: true, bracketPosition: true },
        });

        for (const bye of byeMatches) {
          const winnerId = bye.homeTeamId ?? bye.awayTeamId;

          await tx.match.update({
            where: { id: bye.id },
            data: { status: "COMPLETED" },
          });

          if (bye.nextMatchId) {
            // Odd bracketPosition → homeTeam slot, even → awayTeam slot
            const slot = bye.bracketPosition % 2 === 1 ? "homeTeamId" : "awayTeamId";
            await tx.match.update({
              where: { id: bye.nextMatchId },
              data: { [slot]: winnerId },
            });
          }
        }

        await tx.tournament.update({
          where: { id: tournamentId },
          data: { bracketStatus: "COMPLETED", bracketError: null },
        });
    });

    console.log(`Bracket generated successfully for tournament ${tournamentId} with ${numTeams} teams.`);

  } catch (error) {
    console.error(`Error generating random bracket for tournament ${tournamentId}:`, error);
    await markBracketFailed(tournamentId, error.message);
  }
};

async function markBracketFailed(tournamentId, errorMessage) {
  try {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        bracketStatus: "FAILED",
        bracketError: String(errorMessage).slice(0, 500),
      },
    });
  } catch (e) {
    console.error(`Failed to mark bracket status for tournament ${tournamentId}:`, e.message);
  }
}
