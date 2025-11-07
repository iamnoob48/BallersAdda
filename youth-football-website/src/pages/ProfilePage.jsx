import React, { useEffect, useState } from "react";
import PlayerProfilePage from "../ProfilePageComponents/PlayerProfilePage";
import NavBar from "../HomeComponents/Navbar";
import api from "../api/axios";

function ProfilePage() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const playerProfile = async () => {
      try {
        const res = await api.get("/player/playerProfile");
        setPlayer(res.data.playerProfile);
      } catch (error) {
        console.error("Error fetching player profile:", error);
      }
    };

    playerProfile();
  }, []);

  return (
    <div>
      <NavBar />
      <div className="mt-15">
        {player ? (
          <PlayerProfilePage player={player} />
        ) : (
          <PlayerProfilePage player={null} />
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
