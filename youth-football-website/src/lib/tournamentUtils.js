const gradients = [
  "from-green-500 to-emerald-700",
  "from-blue-500 to-indigo-700",
  "from-purple-500 to-pink-700",
  "from-orange-400 to-red-600",
  "from-teal-400 to-cyan-600",
];

export const formatTournamentDate = (iso, options = {}) =>
  new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });

export const formatCurrency = (value, currency = "INR") => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const mapTournamentToCardModel = (tournament) => {
  const maxTeams = tournament.maxTeams ?? 0;
  const registeredTeams = tournament._count?.teams ?? 0;
  const seatsLeft = Math.max(maxTeams - registeredTeams, 0);

  return {
    ...tournament,
    id: tournament.id,
    tournamentUid: tournament.tournamentUid,
    name: tournament.name,
    description: tournament.description,
    location: tournament.location,
    category: tournament.category || "Open",
    dateLabel: formatTournamentDate(tournament.startDate),
    dateISO: tournament.startDate,
    price: Number(tournament.price) || 0,
    prizeLabel: formatCurrency(tournament.price),
    registrationFee: Number(tournament.registrationFee) || 0,
    registrationDeadline: tournament.registrationDeadline,
    status: tournament.status,
    maxTeams,
    maxPlayersPerTeam: tournament.maxPlayersPerTeam ?? 11,
    totalSeats: maxTeams,
    seatsLeft,
    registeredTeams,
    registeredPlayers: tournament._count?.players ?? 0,
    venueImage: tournament.venueImage || null,
    imageGradient: gradients[tournament.id % gradients.length],
  };
};

export const getTournamentPrimaryAction = (status) => {
  if (status === "ONGOING") return "View Details";
  if (status === "COMPLETED") return "View Results";
  return "Register Now";
};

const buildTeamNames = (tournament) => {
  const city = tournament.location?.split(",")[0]?.trim() || "City";
  const category = tournament.category?.split(" ")[0] || "Elite";

  return [
    `${city} Falcons`,
    `${category} United`,
    "Royal Strikers",
    "NextGen Academy",
    "Blue Tigers",
    "Victory XI",
  ];
};

export const buildTournamentLiveData = (tournament) => {
  const teams = buildTeamNames(tournament);
  const seed = Number(tournament.id) || 1;

  const standings = teams.slice(0, 4).map((team, index) => {
    const played = 3 + ((seed + index) % 3);
    const wins = Math.max(0, played - index - 1);
    const draws = Math.min(played - wins, (seed + index) % 2);
    const losses = Math.max(0, played - wins - draws);
    const points = wins * 3 + draws;

    return {
      rank: index + 1,
      team,
      played,
      wins,
      draws,
      losses,
      points,
    };
  });

  const matches = [
    {
      id: `${tournament.id}-m1`,
      teamA: teams[0],
      teamB: teams[3],
      scoreA: (seed + 2) % 4,
      scoreB: seed % 3,
      phase: "Semi Final",
      status: "LIVE",
      clock: `${62 + (seed % 18)}'`,
    },
    {
      id: `${tournament.id}-m2`,
      teamA: teams[1],
      teamB: teams[2],
      scoreA: (seed + 1) % 3,
      scoreB: (seed + 2) % 3,
      phase: "Semi Final",
      status: "LIVE",
      clock: `${35 + (seed % 10)}'`,
    },
    {
      id: `${tournament.id}-m3`,
      teamA: teams[4],
      teamB: teams[5],
      scoreA: 1 + (seed % 2),
      scoreB: 0 + ((seed + 1) % 2),
      phase: "Group Stage",
      status: "FT",
      clock: "FT",
    },
  ];

  return { standings, matches };
};
