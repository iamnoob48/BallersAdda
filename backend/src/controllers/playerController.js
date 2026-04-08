import prisma from '../prismaClient.js';


//For fetching the player profile of the user
export const getPlayerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile pic
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePic: true },
    });

    // Fetch player profile + tournaments (with joined tournament data)
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: userId },
      include: {
        tournaments: {
          include: {
            tournament: true, // join Tournament data inside PlayerTournament
          },
        },
      },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    res.status(200).json({
      playerProfile,
      profilePic: user?.profilePic || null,
    });
  } catch (error) {
    console.error("Error fetching player profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//For entering the player profle details from frontend
export const enterPlayerProfile = async (req, res) => {
  const { firstName, lastName, bio, displayName, age, gender, position, height, weight, dominantFoot } = req.body;
  try {
    const userId = req.user.id;
    //Check if player profile already exists
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId: userId }
    });
    if (existingProfile) {
      return res.status(400).json({ message: 'Player profile already exists' });
    }
    //Create new player profile
    const newPlayerProfile = await prisma.playerProfile.create({
      data: {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        displayName: displayName,
        age: parseInt(age),
        gender: gender,
        position: position,
        height: parseInt(height),
        weight: parseInt(weight),
        dominantFoot: dominantFoot,




      }
    });
    res.status(201).json({ message: 'Player profile created successfully', playerProfile: newPlayerProfile });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
    console.log(error);

  }

}

//For updating personal details of player profile
export const updatePlayerProfile = async (req, res) => {
  const { firstName, lastName, bio, age, gender, height, weight, position, dominantFoot } = req.body;
  try {
    //Check if player profile exists
    const userId = req.user.id;
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId: userId }
    });
    if (!existingProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }
    //Update player profile
    const updatedProfile = await prisma.playerProfile.update({
      where: { userId: parseInt(userId) },
      data: {
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        age: age,
        gender: gender,
        height: height,
        weight: weight,
        position: position,
        dominantFoot: dominantFoot
      }
    })
    res.status(200).json({ message: 'Player profile updated successfully', playerProfile: updatedProfile });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
    console.log(error);

  }
}

//For academy details of player based on academy id
export const getAcademyDetailsOfPlayer = async (req, res) => {
  try {
    const userId = req.user.id;
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: userId }
    });
    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }
    const academyId = playerProfile.academyId;
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(academyId) },
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
      }
    });
    if (!academy) {
      return res.status(404).json({ message: 'Academy not found' });
    }
    res.status(200).json({ academy });
  } catch (error) {
    console.error("Error fetching academy details:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
