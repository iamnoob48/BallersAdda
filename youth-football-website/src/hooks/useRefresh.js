import { useEffect } from "react";
import api from "../api/axios";

export const useAutoRefresh = () => {
  useEffect(() => {
    const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 min (before expiry)

    const interval = setInterval(async () => {
      try {
        await api.post("/auth/refresh-token");
        console.log("✅ Token refreshed automatically");
      } catch (error) {
        console.error("❌ Auto refresh failed", error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);
};
