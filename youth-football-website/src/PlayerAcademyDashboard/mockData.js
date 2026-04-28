// ── Shared mock data (replace with real API data once backend supports it) ──

export const MOCK = {
  squad: "U-15 Elite Squad",
  status: "Active Roster",
  attendance: { attended: 17, total: 20 },
  recentForm: [true, true, false, true, true],
  streak: 5,
  stats: {
    caps: 23,
    goals: 8,
    assists: 12,
    motm: 4,
    avgRating: 7.6,
  },
  leaderboard: [
    { rank: 1, name: "Arjun Mehta",    rating: 8.4, avatar: null },
    { rank: 2, name: "Ravi Singh",     rating: 8.1, avatar: null },
    { rank: 3, name: "Karthik Nair",   rating: 7.9, avatar: null },
    { rank: 4, name: "You",            rating: 7.6, avatar: null, isUser: true },
    { rank: 5, name: "Aditya Sharma",  rating: 7.5, avatar: null },
    { rank: 6, name: "Prateek Joshi",  rating: 7.2, avatar: null },
    { rank: 7, name: "Vikram Patel",   rating: 6.9, avatar: null },
  ],
};
