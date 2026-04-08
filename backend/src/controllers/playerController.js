import prisma from '../prismaClient.js';

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

    // Run both queries in parallel for speed
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

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    return res.status(200).json({
      playerProfile,
      profilePic: user?.profilePic || null,
    });
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
        gender: gender || null,
        position: position || null,
        height: parsedHeight,
        weight: parsedWeight,
        dominantFoot: dominantFoot || null,
      },
    });

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
