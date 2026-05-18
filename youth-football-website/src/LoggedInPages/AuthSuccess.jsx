import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyUser } from "../redux/slices/authSlice.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { storeTokens } from "../api/tokenStorage.js";

export default function AuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const syncUser = async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          const res = await api.post("/auth/exchange-oauth-code", { code });
          if (res.data?.tokens) storeTokens(res.data.tokens);
        }

        await dispatch(verifyUser()).unwrap();
        navigate("/home");
      } catch (err) {
        console.error("Verification failed:", err);
        navigate("/login");
      }
    };
    syncUser();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">Logging you in...</p>
    </div>
  );
}
