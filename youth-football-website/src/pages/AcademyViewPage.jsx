import React from "react";
import AcademyDetailsPage from "../AcademyDetailsPage/Details-Page";
import { useGetAcademyByIdQuery } from "../redux/slices/academySlice";
import { useParams } from "react-router-dom";

function AcademyViewPage() {
  const { id } = useParams();

  const { data, isLoading, error } = useGetAcademyByIdQuery(id);

  if (isLoading) return <p>Loading academy details...</p>;
  if (error) return <p>Failed to load academy. Try again.</p>;

  return (
    <div>
      <AcademyDetailsPage ACADEMY_DATA={data} />
    </div>
  );
}

export default AcademyViewPage;
