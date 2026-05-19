# Host Matches — Pickup/Turf Match Tracking

## Vision

Expand BallersAdda beyond academy/tournament users to casual players who play regular turf matches. One person (match admin) creates a match, adds players by name, logs the score. Other players can claim their profiles later via shared results link — zero-friction onboarding.

---

## Core Concepts

### Ghost Players
Players added by name only (no account). Their stats are tracked. When they sign up and claim their ghost profile, all historical data links to their real account.

### Match Admin
The user who creates and manages the pickup match. Responsible for adding players, logging score, and sharing results. Any registered user can be a match admin.

### Score Consensus (v2)
Both team captains/admins confirm the final score. Match marked "verified" only when both agree. Disputes flagged for resolution.

---

## Schema Design

### New Models

```prisma
// =====================================================================
// PICKUP MATCH — casual turf/street matches (not tournament-bound)
// =====================================================================
model PickupMatch {
  id          Int               @id @default(autoincrement())
  matchUid    String            @unique @default(cuid())  // public shareable ID
  title       String?           // "Sunday Turf Game", optional
  venue       String?           // turf name or location
  venueArea   String?           // area/locality for discovery
  city        String?
  state       String?
  date        DateTime          // when the match was/will be played
  status      PickupMatchStatus @default(UPCOMING)

  // Match config
  formatType  MatchFormatType   @default(FIVE_A_SIDE)
  durationMinutes Int           @default(60)
  halfLength  Int?              // minutes per half, nullable for no-half formats

  // Scores
  teamAName   String            @default("Team A")
  teamBName   String            @default("Team B")
  teamAScore  Int?
  teamBScore  Int?

  // Consensus
  teamAConfirmed Boolean        @default(false)
  teamBConfirmed Boolean        @default(false)
  isVerified     Boolean        @default(false) // true when both sides confirm

  // Admin (creator)
  adminId     Int
  admin       User              @relation("PickupMatchAdmin", fields: [adminId], references: [id])

  // Optional: second admin/captain for Team B (for consensus)
  teamBAdminId Int?
  teamBAdmin   User?            @relation("PickupMatchTeamBAdmin", fields: [teamBAdminId], references: [id])

  players     PickupMatchPlayer[]
  events      PickupMatchEvent[]

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([adminId])
  @@index([city])
  @@index([date])
  @@index([status])
  @@index([matchUid])
}

// =====================================================================
// PICKUP MATCH PLAYER — links real or ghost players to a pickup match
// =====================================================================
model PickupMatchPlayer {
  id            Int          @id @default(autoincrement())
  pickupMatchId Int
  pickupMatch   PickupMatch  @relation(fields: [pickupMatchId], references: [id], onDelete: Cascade)

  // Real player (nullable — ghost players won't have this)
  playerProfileId Int?
  playerProfile   PlayerProfile? @relation(fields: [playerProfileId], references: [id])

  // Ghost player fields (used when no account exists)
  ghostId       Int?
  ghost         GhostPlayer? @relation(fields: [ghostId], references: [id])

  team          PickupTeamSide  // TEAM_A or TEAM_B
  isCaptain     Boolean         @default(false)

  // Per-match stats
  goals         Int             @default(0)
  assists       Int             @default(0)
  yellowCards   Int             @default(0)
  redCards      Int             @default(0)
  rating        Float?          // post-match rating (1-10)
  motm          Boolean         @default(false)

  createdAt     DateTime        @default(now())

  @@unique([pickupMatchId, playerProfileId])
  @@unique([pickupMatchId, ghostId])
  @@index([playerProfileId])
  @@index([ghostId])
  @@index([pickupMatchId])
}

// =====================================================================
// GHOST PLAYER — unclaimed player profiles for pickup matches
// =====================================================================
model GhostPlayer {
  id          Int       @id @default(autoincrement())
  name        String    // display name given by match admin
  phone       String?   // optional, for matching during claim
  createdById Int       // which admin created this ghost
  createdBy   User      @relation("GhostCreator", fields: [createdById], references: [id])

  // When claimed, link to real profile
  claimedByProfileId Int?       @unique
  claimedBy          PlayerProfile? @relation("ClaimedGhost", fields: [claimedByProfileId], references: [id])
  claimedAt          DateTime?

  pickupMatches PickupMatchPlayer[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([createdById])
  @@index([claimedByProfileId])
  @@index([name])
}

// =====================================================================
// PICKUP MATCH EVENT — goal/assist/card timeline
// =====================================================================
model PickupMatchEvent {
  id            Int              @id @default(autoincrement())
  pickupMatchId Int
  pickupMatch   PickupMatch      @relation(fields: [pickupMatchId], references: [id], onDelete: Cascade)

  eventType     PickupEventType
  minute        Int?             // match minute (optional for casual)

  // Who did it (one of these will be set)
  playerProfileId Int?
  ghostId         Int?

  // For assists — who assisted
  assistPlayerProfileId Int?
  assistGhostId         Int?

  team          PickupTeamSide
  notes         String?

  createdAt     DateTime         @default(now())

  @@index([pickupMatchId])
}
```

### New Enums

```prisma
enum PickupMatchStatus {
  UPCOMING
  LIVE        // match in progress
  COMPLETED   // score submitted
  VERIFIED    // both sides confirmed
  CANCELLED
}

enum MatchFormatType {
  FIVE_A_SIDE
  SEVEN_A_SIDE
  ELEVEN_A_SIDE
  FUTSAL
  CUSTOM
}

enum PickupTeamSide {
  TEAM_A
  TEAM_B
}

enum PickupEventType {
  GOAL
  ASSIST
  YELLOW_CARD
  RED_CARD
  SUBSTITUTION
  OWN_GOAL
}
```

### Relations to Add on Existing Models

```prisma
// Add to User model:
  adminPickupMatches    PickupMatch[]     @relation("PickupMatchAdmin")
  teamBPickupMatches    PickupMatch[]     @relation("PickupMatchTeamBAdmin")
  createdGhostPlayers   GhostPlayer[]     @relation("GhostCreator")

// Add to PlayerProfile model:
  pickupMatches         PickupMatchPlayer[]
  claimedGhostProfile   GhostPlayer?      @relation("ClaimedGhost")
```

---

## Data Points Tracked

### Per Match
| Field | Purpose |
|-------|---------|
| venue, city, state | Location tracking, discovery, turf leaderboards |
| date | Match history timeline |
| formatType | 5v5, 7v7, 11v11 — affects stat normalization |
| teamAScore/teamBScore | Final scoreline |
| isVerified | Consensus confirmation flag |
| durationMinutes | Actual play time |

### Per Player Per Match
| Field | Purpose |
|-------|---------|
| goals | Goal tally |
| assists | Assist tally |
| yellowCards/redCards | Discipline tracking |
| rating | Post-match rating (1-10) |
| motm | Man of the match |
| team | Which side they played on |

### Aggregated Stats (Computed/Cached)
| Stat | Description |
|------|-------------|
| totalPickupMatches | Lifetime pickup games played |
| totalPickupGoals | Goals across all pickup matches |
| totalPickupAssists | Assists across all pickup matches |
| pickupWinRate | Wins / total matches |
| avgPickupRating | Average rating across matches |
| motmCount | Total MOTM awards |
| currentStreak | Consecutive weeks played |
| favoriteVenue | Most played turf/venue |
| favoritePosition | Most common team side/role |

---

## API Design

### Base Path: `/api/v1/pickup`

### Match CRUD

```
POST   /pickup/matches              — Create a pickup match
GET    /pickup/matches              — List user's pickup matches (as admin or player)
GET    /pickup/matches/:matchUid    — Get match details (public via matchUid)
PATCH  /pickup/matches/:matchUid    — Update match details (admin only)
DELETE /pickup/matches/:matchUid    — Cancel/delete match (admin only)
```

### Player Management

```
POST   /pickup/matches/:matchUid/players          — Add player(s) to match
DELETE /pickup/matches/:matchUid/players/:playerId — Remove player from match
PATCH  /pickup/matches/:matchUid/players/:playerId — Update player stats (goals, assists, etc.)
```

### Score & Consensus

```
POST   /pickup/matches/:matchUid/score             — Submit final score (admin)
POST   /pickup/matches/:matchUid/confirm            — Confirm score (team B admin)
POST   /pickup/matches/:matchUid/dispute            — Dispute score
```

### Match Events (v2 — live timeline)

```
POST   /pickup/matches/:matchUid/events            — Log event (goal, card, etc.)
GET    /pickup/matches/:matchUid/events            — Get match timeline
DELETE /pickup/matches/:matchUid/events/:eventId   — Remove event
```

### Ghost Player & Claiming

```
POST   /pickup/ghost-players                       — Create ghost player
GET    /pickup/ghost-players/claimable              — Get ghosts that match current user
POST   /pickup/ghost-players/:ghostId/claim         — Claim a ghost profile
GET    /pickup/ghost-players/:ghostId/matches       — Get ghost player's match history
```

### Share & Invite

```
GET    /pickup/matches/:matchUid/share             — Get shareable match result link
POST   /pickup/matches/:matchUid/invite            — Invite team B admin (via link/phone)
```

### Stats & Leaderboards

```
GET    /pickup/stats/me                            — Current user's pickup stats
GET    /pickup/stats/:playerProfileId              — Any player's pickup stats
GET    /pickup/leaderboards                        — Turf/area leaderboards
GET    /pickup/leaderboards/:city                  — City-specific leaderboard
GET    /pickup/venues/popular                      — Popular turfs by match count
```

---

## API Request/Response Examples

### POST `/pickup/matches` — Create Match

```json
// Request
{
  "title": "Sunday Turf Game",
  "venue": "Kicks Arena",
  "venueArea": "Koramangala",
  "city": "Bangalore",
  "state": "Karnataka",
  "date": "2026-05-18T16:00:00Z",
  "formatType": "FIVE_A_SIDE",
  "durationMinutes": 60,
  "teamAName": "Blue Devils",
  "teamBName": "Red Warriors",
  "players": [
    { "name": "Rahul", "team": "TEAM_A", "isCaptain": true, "playerProfileId": null },
    { "name": "Arjun", "team": "TEAM_A", "playerProfileId": 42 },
    { "name": "Vaibhav", "team": "TEAM_B", "isCaptain": true, "playerProfileId": null }
  ]
}

// Response
{
  "id": 1,
  "matchUid": "clxyz123abc",
  "title": "Sunday Turf Game",
  "venue": "Kicks Arena",
  "status": "UPCOMING",
  "shareLink": "https://ballersadda.com/m/clxyz123abc",
  "players": [...],
  "createdAt": "2026-05-14T10:00:00Z"
}
```

### POST `/pickup/matches/:matchUid/score` — Submit Score

```json
// Request
{
  "teamAScore": 3,
  "teamBScore": 2,
  "playerStats": [
    { "playerId": 1, "goals": 2, "assists": 0, "motm": true },
    { "playerId": 2, "goals": 1, "assists": 1 },
    { "playerId": 3, "goals": 1, "assists": 0 },
    { "playerId": 4, "goals": 0, "assists": 2 }
  ]
}

// Response
{
  "matchUid": "clxyz123abc",
  "status": "COMPLETED",
  "teamAScore": 3,
  "teamBScore": 2,
  "isVerified": false,
  "message": "Score submitted. Waiting for Team B confirmation."
}
```

### GET `/pickup/stats/me` — Player Stats

```json
{
  "totalMatches": 47,
  "wins": 28,
  "draws": 8,
  "losses": 11,
  "winRate": 59.6,
  "totalGoals": 34,
  "totalAssists": 21,
  "motmAwards": 7,
  "avgRating": 7.2,
  "currentStreak": 4,
  "favoriteVenue": "Kicks Arena, Koramangala",
  "recentForm": ["W", "W", "L", "W", "D"],
  "monthlyBreakdown": [
    { "month": "2026-05", "matches": 5, "goals": 4, "assists": 2 }
  ]
}
```

---

## User-Facing Features & Benefits

### For Match Admin (Day 1)
- **Create match** in 30 seconds — venue, date, add players by name
- **Log score** post-match with individual player stats
- **Share results** via WhatsApp/Instagram link
- **Match history** — all past games organized by date

### For Claimed Players
- **Personal dashboard** — goals, assists, win rate, streaks across all pickup games
- **Match timeline** — every game you've played, results, your contribution
- **Rating graph** — performance trend over time
- **MOTM badges** — gamification carries over from academy features

### For Discovery (v2)
- **Turf leaderboards** — top scorers at a specific venue
- **City leaderboards** — best players in Bangalore, Mumbai, etc.
- **Popular venues** — where most matches happen in your area
- **Find players** — see who plays regularly at your turf

### For Retention
- **Weekly streak** — played every week? Keep your streak alive
- **Season summaries** — monthly/quarterly stat rollups
- **Shareable stat cards** — Instagram-story-ready match summary images
- **Unified profile** — pickup stats + academy stats + tournament stats = one football identity

---

## Ghost Player Claim Flow

```
1. Admin creates match → adds "Rahul" (ghost player created, ghostId = 5)
2. Match played → admin logs score + stats for each player
3. Admin shares results link via WhatsApp
4. Rahul opens link → sees match summary → sees his name with 2 goals
5. Rahul taps "Claim your profile" → SignUp/Login page
6. After auth, system shows: "We found 3 matches with 'Rahul' — is this you?"
7. Rahul confirms → ghostId 5 linked to his PlayerProfile
8. All historical stats now appear on Rahul's dashboard
```

### Smart Matching for Claims
- Name match (fuzzy — "Rahul" matches "Rahul S.")
- Phone match (if admin added phone)
- Same match group (ghosts created by admins the player has played with before)
- Manual claim with admin approval (fallback)

---

## Implementation Phases

### Phase 1 — MVP (Core Loop)
- [ ] PickupMatch, PickupMatchPlayer, GhostPlayer schema + migration
- [ ] CRUD APIs for matches (create, list, get, update)
- [ ] Add players (real + ghost) to match
- [ ] Score submission
- [ ] Shareable match results page (public, no auth required to view)
- [ ] Basic match history for logged-in users
- [ ] Frontend: Create Match form, Match Detail page, My Matches list

### Phase 2 — Stats & Claims
- [ ] Ghost player claim flow (link ghost → real profile)
- [ ] Aggregated pickup stats (computed on read or cached)
- [ ] Player pickup dashboard (goals, wins, streaks)
- [ ] Score consensus (team B admin confirms)
- [ ] Match events timeline (goal-by-goal)

### Phase 3 — Discovery & Social
- [ ] Venue/city leaderboards
- [ ] Popular turfs
- [ ] Shareable stat cards (image generation)
- [ ] "Find players near me" (based on venue history)
- [ ] Weekly streak notifications

### Phase 4 — Unified Profile
- [ ] Merge pickup stats into main PlayerProfile dashboard
- [ ] Combined leaderboards (pickup + tournament + academy)
- [ ] Cross-feature badges ("Played 10 pickup + 5 tournament games")

---

## Technical Notes

### Why Separate `PickupMatch` Instead of Reusing `Match`?
Current `Match` model tightly coupled to `Tournament` and `Team`. Pickup matches have no tournament, no formal teams, support ghost players, and need consensus. Separate model avoids polluting tournament logic with nullable fields and keeps queries clean. Can unify later via a view or computed stats layer.

### Caching Strategy
- Player aggregate stats → Redis cache, invalidate on score submission
- Leaderboards → Redis sorted sets, recompute every 15 min or on-demand
- Match detail → cache by matchUid, invalidate on update

### Share Link Format
`https://ballersadda.com/m/:matchUid` — public page, no auth to view. SSR-friendly for WhatsApp/social previews (OG tags with score, venue, player names).

### Mobile Considerations
Score input UI must be tap-friendly. Big buttons for +1 goal, player selector as avatar grid not dropdown. Designed for one-handed use on the sideline.
