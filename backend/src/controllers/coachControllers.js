import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================================
//  GET /coach/profile
// =====================================================================
export const getCoachProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // The user role must be COACH or ACADEMY
    if (req.user.role !== "COACH" && req.user.role !== "ACADEMY") {
      return res.status(403).json({ message: "Forbidden: Not a coach" });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId },
      include: {
        academy: {
          select: { id: true, name: true, academyLogoURL: true, country: true, city: true, state: true }
        },
        teams: {
          include: {
            tournament: { select: { name: true, location: true } }
          }
        }
      }
    });

    if (!coach) {
      return res.status(404).json({ message: "Coach profile not found" });
    }

    return res.status(200).json(coach);
  } catch (error) {
    console.error("Error fetching coach profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================================
//  PUT /coach/profile
// =====================================================================
export const updateCoachProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, experienceYears, certifications, coachLicenceNo, profilePicLogo } = req.body;

    const data = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (bio) data.bio = bio;
    if (experienceYears !== undefined) data.experienceYears = parseInt(experienceYears);
    if (certifications) data.certifications = certifications;
    if (coachLicenceNo) data.coachLicenceNo = coachLicenceNo;
    if (profilePicLogo) data.profilePicLogo = profilePicLogo;

    const updatedCoach = await prisma.coach.update({
      where: { userId },
      data,
      include: { academy: { select: { name: true } } }
    });

    return res.status(200).json(updatedCoach);
  } catch (error) {
    console.error("Error updating coach profile:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "License No already exists" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================================
//  GET /coach/roster
// =====================================================================
export const getAcademyRoster = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate coach
    const coach = await prisma.coach.findUnique({ where: { userId } });
    if (!coach || !coach.academyId) {
      return res.status(404).json({ message: "Coach profile or Academy connection not found" });
    }

    // A coach can view the PlayerProfiles of their linked Academy
    const roster = await prisma.playerProfile.findMany({
      where: { academyId: coach.academyId },
      include: {
        user: { select: { username: true, email: true } },
        metrics: true
      }
    });

    return res.status(200).json(roster);
  } catch (error) {
    console.error("Error fetching roster:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================================
//  POST /coach/team
// =====================================================================
export const createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, tournamentId, playerIds = [] } = req.body;

    if (!name || !tournamentId) {
      return res.status(400).json({ message: "Team name and tournament ID are required." });
    }

    const coach = await prisma.coach.findUnique({ where: { userId } });
    if (!coach) return res.status(404).json({ message: "Coach profile not found" });

    // Validate Tournament
    const tournament = await prisma.tournament.findUnique({ where: { id: parseInt(tournamentId) } });
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });

    const newTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name,
          coachId: coach.id,
          tournamentId: tournament.id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          players: {
            connect: playerIds.map(id => ({ id: parseInt(id) }))
          }
        },
        include: { players: true }
      });

      // Also create PlayerTournament entries for the drafted players
      if (playerIds.length > 0) {
        const ptData = playerIds.map(playerId => ({
          playerId: parseInt(playerId),
          tournamentId: tournament.id,
          teamId: team.id
        }));

        await tx.playerTournament.createMany({
          data: ptData,
          skipDuplicates: true // in case they were already joined without a team
        });
      }

      return team;
    });

    return res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
