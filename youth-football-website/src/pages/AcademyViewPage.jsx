import React, { useEffect } from "react";
import AcademyDetailsPage from "../AcademyDetailsPage/Details-Page";
import { useGetAcademyByIdQuery } from "../redux/slices/academySlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayerProfile } from "../redux/slices/playerSlice";

function AcademyViewPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.player.profile);
  const profileLoading = useSelector((state) => state.player.loading);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchPlayerProfile());
    }
  }, [dispatch, profile]);

  const { data, isLoading, error } = useGetAcademyByIdQuery(id);

  if (isLoading || (!profile && profileLoading)) return <p>Loading academy details...</p>;
  if (error) return <p>Failed to load academy. Try again.</p>;

  return (
    <div>
      <AcademyDetailsPage ACADEMY_DATA={data} />
    </div>
  );
}

export default AcademyViewPage;
