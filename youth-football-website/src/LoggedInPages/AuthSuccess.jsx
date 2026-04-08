import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyUser } from "../redux/slices/authSlice.js";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = async () => {
      try {
        await dispatch(verifyUser()).unwrap(); // ✅ verifies JWT cookie
        navigate("/home"); // redirect to home once verified
      } catch (err) {
        console.error("Verification failed:", err);
        navigate("/login");
      }
    };
    syncUser();
  }, [dispatch, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-600 text-lg">Logging you in...</p>
    </div>
  );
}
