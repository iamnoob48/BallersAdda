import prisma from '../prismaClient.js';
import { cacheGet, cacheDel } from '../config/cacheUtils.js';
import cloudinary from '../config/cloudinaryConfig.js';
// ── Validation helpers ──────────────────────────────────────────────────
const VALID_POSITIONS = [
  'Goalkeeper', 'Defender', 'Midfielder', 'Forward',
  'Center Back', 'Full Back', 'Wing Back',
  'Central Midfielder', 'Attacking Midfielder', 'Defensive Midfielder',
  'Winger', 'Striker',
];

const VALID_GENDERS = ['Male', 'Female', 'Other'];
const VALID_FEET = ['Left', 'Right', 'Both'];

// =====================================================================
//  GET /player/playerProfile
// =====================================================================
export const getPlayerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `player:profile:${userId}`;

    const { data: result } = await cacheGet(cacheKey, 600, async () => {
      const [user, playerProfile] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { profilePic: true },
        }),
        prisma.playerProfile.findUnique({
          where: { userId },
          include: {
            tournaments: {
              include: {
                tournament: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                    category: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      return { playerProfile, profilePic: user?.profilePic || null };
    });

    if (!result.playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /player/createPlayerProfile
// =====================================================================
export const enterPlayerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, displayName, age, gender, position, height, weight, dominantFoot } = req.body;

    // --- Required field validation ---
    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    // --- Numeric field validation ---
    const parsedAge = age != null ? parseInt(age, 10) : null;
    const parsedHeight = height != null ? parseFloat(height) : null;
    const parsedWeight = weight != null ? parseFloat(weight) : null;

    if (parsedAge != null && (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 100)) {
      return res.status(400).json({ message: 'Age must be between 3 and 100' });
    }
    if (parsedHeight != null && (isNaN(parsedHeight) || parsedHeight <= 0 || parsedHeight > 300)) {
      return res.status(400).json({ message: 'Height must be a positive number (cm)' });
    }
    if (parsedWeight != null && (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 300)) {
      return res.status(400).json({ message: 'Weight must be a positive number (kg)' });
    }

    // --- Enum-like validation ---
    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ message: `Gender must be one of: ${VALID_GENDERS.join(', ')}` });
    }
    if (position && !VALID_POSITIONS.includes(position)) {
      return res.status(400).json({ message: `Invalid position. Choose from: ${VALID_POSITIONS.join(', ')}` });
    }
    if (dominantFoot && !VALID_FEET.includes(dominantFoot)) {
      return res.status(400).json({ message: `Dominant foot must be one of: ${VALID_FEET.join(', ')}` });
    }

    // --- Check for existing profile ---
    const existing = await prisma.playerProfile.findUnique({ where: { userId } });
    if (existing) {
      return res.status(409).json({ message: 'Player profile already exists' });
    }

    const newProfile = await prisma.playerProfile.create({
      data: {
        userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio?.trim() || null,
        displayName: displayName?.trim() || null,
        age: parsedAge,
        gender: gender.toUpperCase() || null,
        position: position.toUpperCase() || null,
        height: parsedHeight,
        weight: parsedWeight,
        dominantFoot: dominantFoot.toUpperCase() || null,
      },
    });

    // Invalidate player cache on creation
    await cacheDel(`player:profile:${userId}`);

    return res.status(201).json({ message: 'Player profile created successfully', playerProfile: newProfile });
  } catch (error) {
    console.error('Create player profile error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Player profile already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /player/updatePlayerProfile
// =====================================================================
export const updatePlayerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, age, gender, height, weight, position, dominantFoot } = req.body;

    // --- Check profile exists ---
    const existing = await prisma.playerProfile.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    // --- Build update data from only supplied fields (partial update) ---
    const data = {};

    if (firstName !== undefined) {
      if (!firstName.trim()) return res.status(400).json({ message: 'First name cannot be empty' });
      data.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      if (!lastName.trim()) return res.status(400).json({ message: 'Last name cannot be empty' });
      data.lastName = lastName.trim();
    }
    if (bio !== undefined) data.bio = bio?.trim() || null;

    if (age !== undefined) {
      const parsed = parseInt(age, 10);
      if (isNaN(parsed) || parsed < 3 || parsed > 100) {
        return res.status(400).json({ message: 'Age must be between 3 and 100' });
      }
      data.age = parsed;
    }
    if (height !== undefined) {
      const parsed = parseFloat(height);
      if (isNaN(parsed) || parsed <= 0) return res.status(400).json({ message: 'Invalid height' });
      data.height = parsed;
    }
    if (weight !== undefined) {
      const parsed = parseFloat(weight);
      if (isNaN(parsed) || parsed <= 0) return res.status(400).json({ message: 'Invalid weight' });
      data.weight = parsed;
    }

    if (gender !== undefined) {
      if (gender && !VALID_GENDERS.includes(gender)) {
        return res.status(400).json({ message: `Gender must be one of: ${VALID_GENDERS.join(', ')}` });
      }
      data.gender = gender || null;
    }
    if (position !== undefined) {
      if (position && !VALID_POSITIONS.includes(position)) {
        return res.status(400).json({ message: `Invalid position` });
      }
      data.position = position || null;
    }
    if (dominantFoot !== undefined) {
      if (dominantFoot && !VALID_FEET.includes(dominantFoot)) {
        return res.status(400).json({ message: `Dominant foot must be one of: ${VALID_FEET.join(', ')}` });
      }
      data.dominantFoot = dominantFoot || null;
    }

    // Avoid empty updates
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updated = await prisma.playerProfile.update({
      where: { userId },
      data,
    });

    // Invalidate player cache on update
    await cacheDel(`player:profile:${userId}`);

    return res.status(200).json({ message: 'Player profile updated successfully', playerProfile: updated });
  } catch (error) {
    console.error('Update player profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  GET /player/academyDetailsOfPlayer
// =====================================================================
export const getAcademyDetailsOfPlayer = async (req, res) => {
  try {
    const userId = req.user.id;

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { academyId: true },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    if (!playerProfile.academyId) {
      return res.status(404).json({ message: 'Player is not part of any academy' });
    }

    const academy = await prisma.academy.findUnique({
      where: { id: playerProfile.academyId },
      select: {
        id: true,
        name: true,
        state: true,
        city: true,
        address: true,
        country: true,
        contactEmail: true,
        contactPhone: true,
        description: true,
        establishedAt: true,
        academyLogoURL: true,
        rating: true,
        noOfStudents: true,
      },
    });

    if (!academy) {
      return res.status(404).json({ message: 'Academy not found' });
    }

    return res.status(200).json({ academy });
  } catch (error) {
    console.error('Error fetching academy details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//For a player to join academy
export const joinAcademy = async (req, res) => {
  try {
    const userId = req.user.id;
    const academyId = parseInt(req.body.academyId, 10);
    const { batchId, planId } = req.body;

    if (!academyId || isNaN(academyId)) {
      return res.status(400).json({ message: 'Valid academyId is required' });
    }

    // 1. Fetch player & include 'id' to prevent the crash
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    // 2. The Guardrail
    if (playerProfile.academyId) {
      return res.status(400).json({ message: 'You must leave your current academy before joining a new one.' });
    }

    // 3. Verify Academy exists (Optimized: we only need the ID, not the description/logo)
    const academyExists = await prisma.academy.findUnique({
      where: { id: academyId },
      select: { id: true },
    });

    if (!academyExists) {
      return res.status(404).json({ message: 'Academy not found' });
    }

    // 4. THE TRANSACTION: All three happen together, or none of them do.
    const [updatedPlayer, newEnrollment, updatedAcademy] = await prisma.$transaction([
      // A. Update the player's active academy pointer
      prisma.playerProfile.update({
        where: { userId },
        data: { academyId },
      }),

      // B. Create the immutable ledger record
      prisma.academyEnrollment.create({
        data: {
          playerId: playerProfile.id,
          academyId,
          batchId: batchId || null, // Fallbacks in case they are undefined
          planId: planId || null,
          status: 'ACTIVE' // Explicitly setting our Enum
        },
      }),

      // C. Atomically increment the student count (No race conditions!)
      prisma.academy.update({
        where: { id: academyId },
        data: { noOfStudents: { increment: 1 } },
      })
    ]);

    return res.status(200).json({
      message: 'Player joined academy successfully',
      playerProfile: updatedPlayer,
      enrollment: newEnrollment,
      academy: updatedAcademy
    });

  } catch (error) {
    console.error("Error joining academy:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// For player to leave academy by making the enrollment status FORMER
export const leaveAcademy = async (req, res) => {
  try {
    const userId = req.user.id;

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });
    if (!playerProfile) {
      return res.status(404).json({ message: "Player profile not found" });
    }
    if (!playerProfile.academyId) {
      return res.status(404).json({ message: "Player is not part of any academy" });
    }
    const [updatedPlayer, updatedEnrollment, updatedAcademy] = await prisma.$transaction([
      // A. Update the player's active academy pointer
      prisma.playerProfile.update({
        where: { userId },
        data: { academyId: null },
      }),

      // B. Update the enrollment status to FORMER
      prisma.academyEnrollment.updateMany({
        where: {
          playerId: playerProfile.id,
          academyId: playerProfile.academyId,
          status: "ACTIVE"
        },
        data: {
          status: 'FORMER',
          leftAt: new Date(),
        }
      }),

      // C. Decrement the student count
      prisma.academy.update({
        where: { id: playerProfile.academyId },
        data: { noOfStudents: { decrement: 1 } },
      })
    ]);
    return res.status(200).json({
      message: 'Player left academy successfully',
      playerProfile: updatedPlayer,
      enrollment: updatedEnrollment,
      academy: updatedAcademy
    });
  } catch (error) {
    console.error("Error leaving academy:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// =====================================================================
//  GET /player/myTournaments
//  Returns every tournament the logged-in player is rostered for,
//  queried through the PlayerTournament junction table (not Team.captainId)
//  so magic-link invitees are included.
// =====================================================================
export const getMyTournaments = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Resolve PlayerProfile — we need playerProfile.id for the junction query
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!playerProfile) {
      // No profile yet → treat as "0 tournaments" rather than an error
      return res.status(200).json({ tournaments: [] });
    }

    // 2. Query PlayerTournament for this player, include related data
    const entries = await prisma.playerTournament.findMany({
      where: { playerId: playerProfile.id },
      orderBy: { tournament: { startDate: 'asc' } },
      select: {
        id: true,
        teamId: true,
        joinedAt: true,
        tournament: {
          select: {
            id: true,
            name: true,
            venueImage: true,
            startDate: true,
            endDate: true,
            location: true,
            status: true,
            category: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // 3. Flatten into a cleaner shape for the frontend
    const tournaments = entries.map((e) => ({
      entryId: e.id,
      joinedAt: e.joinedAt,
      tournament: e.tournament,
      team: e.team,
    }));

    return res.status(200).json({ tournaments });
  } catch (error) {
    console.error('Error fetching player tournaments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  GET /player/academyStats
//  Returns the PlayerAcademyStats row for the player's current academy.
//  Returns all-zero defaults if a row doesn't exist yet (new player).
// =====================================================================
export const getPlayerAcademyStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });

    if (!playerProfile) return res.status(404).json({ message: 'Player profile not found' });
    if (!playerProfile.academyId) return res.status(404).json({ message: 'Player is not part of any academy' });

    const stats = await prisma.playerAcademyStats.findUnique({
      where: {
        playerId_academyId: {
          playerId: playerProfile.id,
          academyId: playerProfile.academyId,
        },
      },
    });

    // New players won't have a row yet — return safe zeros so the UI still renders
    return res.status(200).json({
      stats: stats ?? {
        officialCaps: 0,
        officialGoals: 0,
        officialAssists: 0,
        officialMotm: 0,
        officialAvgRating: 0.0,
        practiceMatches: 0,
        practiceGoals: 0,
        practiceAssists: 0,
        practiceMotm: 0,
        practiceAvgRating: 0.0,
      },
    });
  } catch (error) {
    console.error('Error fetching player academy stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  GET /player/attendance
//  Returns monthly attendance summary, last-5-session form, and streak.
//  Scoped to the player's current academy sessions only.
// =====================================================================
export const getPlayerAttendance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });

    if (!playerProfile) return res.status(404).json({ message: 'Player profile not found' });
    if (!playerProfile.academyId) return res.status(404).json({ message: 'Player is not part of any academy' });

    // Current calendar-month window
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // All attendance records for this player at their current academy, newest first
    const records = await prisma.sessionAttendance.findMany({
      where: {
        playerId: playerProfile.id,
        session: { academyId: playerProfile.academyId },
      },
      select: {
        isPresent: true,
        session: { select: { date: true } },
      },
      orderBy: { session: { date: 'desc' } },
    });

    // Monthly summary
    const monthlyRecords = records.filter((r) => {
      const d = new Date(r.session.date);
      return d >= monthStart && d <= monthEnd;
    });
    const totalThisMonth = monthlyRecords.length;
    const attendedThisMonth = monthlyRecords.filter((r) => r.isPresent).length;

    // Last 5 sessions — reversed so order is oldest→newest (matches chart convention)
    const recentForm = records.slice(0, 5).map((r) => r.isPresent).reverse();

    // Streak: consecutive isPresent starting from the most-recent session
    let streak = 0;
    for (const r of records) {
      if (r.isPresent) streak++;
      else break;
    }

    return res.status(200).json({
      attendance: { attended: attendedThisMonth, total: totalThisMonth },
      recentForm,
      streak,
    });
  } catch (error) {
    console.error('Error fetching player attendance:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  GET /player/team-hub/:teamId
//  Returns the full "Locker Room" payload for a team the player belongs to.
//  Includes: tournament details, roster (players + profilePic from User),
//  tournamentStats, and all matches (home & away).
// =====================================================================
export const getTeamHubData = async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId, 10);
    if (!Number.isInteger(teamId) || teamId <= 0) {
      return res.status(400).json({ message: 'Invalid team ID.' });
    }

    const userId = req.user.id;

    // Verify the logged-in user is on this team's roster
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!playerProfile) {
      return res.status(403).json({ message: 'Player profile not found.' });
    }

    const teamData = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            status: true,
            category: true,
            venueImage: true,
            venueAddressLink: true,
            formatAndRules: true,
            maxPlayersPerTeam: true,
            registrationDeadline: true,
          },
        },
        captain: {
          select: { id: true, username: true, profilePic: true },
        },
        players: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            user: {
              select: { profilePic: true },
            },
          },
        },
        tournamentStats: {
          select: {
            id: true,
            playerId: true,
            goals: true,
            assists: true,
            yellowCards: true,
            redCards: true,
            rating: true,
            player: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        homeMatches: {
          include: {
            awayTeam: { select: { id: true, name: true, logoUrl: true } },
          },
          orderBy: { kickoffAt: 'asc' },
        },
        awayMatches: {
          include: {
            homeTeam: { select: { id: true, name: true, logoUrl: true } },
          },
          orderBy: { kickoffAt: 'asc' },
        },
      },
    });

    if (!teamData) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Authorization: check the logged-in player is on the roster
    const isOnRoster = teamData.players.some((p) => p.id === playerProfile.id);
    if (!isOnRoster) {
      return res.status(403).json({ message: 'You are not on this team\'s roster.' });
    }

    return res.status(200).json({ team: teamData });
  } catch (error) {
    console.error('Error fetching team hub data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Player Academy stats and attendece

// =====================================================================
//  GET /player/academyHistory
//  Returns all AcademyEnrollment records (ACTIVE + FORMER) for the player.
//  Used to: (a) show academy history in dashboard, (b) gate page access.
// =====================================================================
export const getAcademyHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    const enrollments = await prisma.academyEnrollment.findMany({
      where: { playerId: playerProfile.id },
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        status: true,
        joinedAt: true,
        leftAt: true,
        academy: {
          select: {
            id: true,
            name: true,
            academyLogoURL: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return res.status(200).json({ enrollments });
  } catch (error) {
    console.error('Error fetching academy history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//For uploading profile picture to player profile
export const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { image } = req.body; // base64 data URI

    if (!image) return res.status(400).json({ message: 'No image provided' });

    const result = await cloudinary.uploader.upload(image, {
      folder: 'profile_pics',
      public_id: `user_${userId}`,
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    await prisma.user.update({
      where: { id: userId },
      data: { profilePic: result.secure_url },
    });

    return res.status(200).json({ profilePic: result.secure_url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
