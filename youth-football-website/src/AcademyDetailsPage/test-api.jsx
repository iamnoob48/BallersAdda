import { useGetAcademyByIdQuery } from "../redux/slices/academySlice.js";

function AcademyDetailsPageTest() {
  const { data, isLoading, isError } = useGetAcademyByIdQuery(1);
  return <div>Academy details : {JSON.stringify(data)}</div>;
}

export default AcademyDetailsPageTest;
