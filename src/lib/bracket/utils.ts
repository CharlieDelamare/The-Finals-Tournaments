export function getIdealTournamentSize(
  totalTeams: number,
  teamsPerLobby: number,
  advancersPerLobby: number
): number {
  const multiplier = teamsPerLobby / advancersPerLobby;
  let idealSize = teamsPerLobby;
  while (idealSize < totalTeams) {
    idealSize *= multiplier;
  }
  return idealSize;
}

export function calculateByes(
  totalTeams: number,
  teamsPerLobby: number,
  advancersPerLobby: number
): number {
  const idealSize = getIdealTournamentSize(totalTeams, teamsPerLobby, advancersPerLobby);
  return idealSize - totalTeams;
}

export function getRoundName(roundNumber: number, totalRounds: number): string {
  if (roundNumber === totalRounds) return "Grand Final";
  if (roundNumber === totalRounds - 1) return "Semi Finals";
  if (roundNumber === totalRounds - 2) return "Quarter Finals";
  return `Round ${roundNumber}`;
}

export function snakeSeedDistribution<T>(items: T[], lobbyCount: number): T[][] {
  const lobbies: T[][] = Array.from({ length: lobbyCount }, () => []);
  let lobbyIndex = 0;
  let direction = 1;

  for (const item of items) {
    lobbies[lobbyIndex].push(item);
    lobbyIndex += direction;
    if (lobbyIndex >= lobbyCount || lobbyIndex < 0) {
      direction *= -1;
      lobbyIndex += direction;
    }
  }

  return lobbies;
}

export interface RoundPlan {
  roundNumber: number;
  name: string;
  lobbyCount: number;
  teamsInRound: number;
}

export function calculateRoundPlans(
  totalTeams: number,
  teamsPerLobby: number,
  advancersPerLobby: number
): RoundPlan[] {
  const byeCount = calculateByes(totalTeams, teamsPerLobby, advancersPerLobby);
  const effectiveTotal = totalTeams + byeCount;
  const rounds: RoundPlan[] = [];

  let teamsRemaining = effectiveTotal;
  let roundNumber = 1;

  while (teamsRemaining > teamsPerLobby) {
    const lobbyCount = Math.ceil(teamsRemaining / teamsPerLobby);
    rounds.push({
      roundNumber,
      name: "",
      lobbyCount,
      teamsInRound: teamsRemaining,
    });
    teamsRemaining = lobbyCount * advancersPerLobby;
    roundNumber++;
  }

  // Grand Final
  rounds.push({
    roundNumber,
    name: "",
    lobbyCount: 1,
    teamsInRound: teamsRemaining,
  });

  // Name the rounds
  const totalRounds = rounds.length;
  for (const round of rounds) {
    round.name = getRoundName(round.roundNumber, totalRounds);
  }

  return rounds;
}
