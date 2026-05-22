import React, { useEffect } from "react";
import { motion } from "motion/react";
import AcademyDetailsPage from "../AcademyDetailsPage/Details-Page";
import { useGetAcademyByIdQuery } from "../redux/slices/academySlice";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayerProfile } from "../redux/slices/playerSlice";
import NavBar from "../components/Navbar.jsx";
import TopNav from "../components/TopNav.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";

/* ── Skeleton block helper ── */
const Bone = ({ className, dm }) => (
  <div
    className={`animate-pulse rounded-lg ${
      dm ? "bg-gray-800" : "bg-gray-200"
    } ${className}`}
  />
);

/* ── Full-page skeleton that mirrors AcademyDetailsPage layout ── */
function AcademyDetailsSkeleton() {
  const dm = useSelector((state) => state.theme.darkMode);
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${
        dm ? "bg-[#0a0a0a] text-gray-200" : "bg-[#F8F9FA] text-gray-800"
      }`}
    >
      {isMobile ? <TopNav /> : <NavBar />}

      {/* ── HERO SKELETON ── */}
      <section
        className={`relative w-full h-[420px] md:h-[540px] lg:h-[600px] overflow-hidden ${
          dm ? "bg-gray-900" : "bg-gray-300"
        }`}
      >
        {/* Shimmer background */}
        <div className="absolute inset-0 animate-pulse" />

        {/* Gradient overlays (same as real page) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero content skeleton */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 pb-5 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-8">
              {/* Logo placeholder */}
              <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl animate-pulse bg-white/10 flex-shrink-0" />

              {/* Info placeholders */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Academy name */}
                <div className="h-8 md:h-12 lg:h-14 w-3/4 rounded-xl animate-pulse bg-white/10" />

                {/* Location + rating row */}
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 rounded-full animate-pulse bg-white/10" />
                  <div className="h-4 w-24 rounded-full animate-pulse bg-white/10" />
                </div>

                {/* Service tags */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-7 rounded-full animate-pulse bg-white/10"
                      style={{ width: `${60 + i * 16}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop CTA placeholder */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="h-14 w-44 rounded-2xl animate-pulse bg-white/10" />
              </div>
            </div>

            {/* Stat cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-5 md:mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 md:px-4 md:py-3.5 rounded-xl md:rounded-2xl animate-pulse bg-white/[0.07] border border-white/[0.08]"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-5 w-12 rounded bg-white/10" />
                    <div className="h-2.5 w-20 rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT SKELETON ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-5 md:mt-8 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Middle section (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Image gallery card */}
            <div
              className={`rounded-2xl overflow-hidden border ${
                dm
                  ? "bg-[#1a1a1a] border-white/[0.06]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Bone dm={dm} className="w-full h-56 md:h-72 !rounded-none" />
              <div className="p-5 space-y-3">
                <Bone dm={dm} className="h-5 w-48" />
                <Bone dm={dm} className="h-3 w-full" />
                <Bone dm={dm} className="h-3 w-5/6" />
                <Bone dm={dm} className="h-3 w-3/4" />
              </div>
            </div>

            {/* Achievement badges row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-4 border ${
                    dm
                      ? "bg-[#1a1a1a] border-white/[0.06]"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <Bone dm={dm} className="w-10 h-10 !rounded-xl mb-3" />
                  <Bone dm={dm} className="h-5 w-12 mb-1" />
                  <Bone dm={dm} className="h-3 w-20" />
                </div>
              ))}
            </div>

            {/* Coaches card */}
            <div
              className={`rounded-2xl p-5 border ${
                dm
                  ? "bg-[#1a1a1a] border-white/[0.06]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Bone dm={dm} className="h-6 w-36 mb-5" />
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Bone dm={dm} className="w-16 h-16 !rounded-full" />
                    <Bone dm={dm} className="h-3 w-16" />
                    <Bone dm={dm} className="h-2.5 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description / About block */}
            <div
              className={`rounded-2xl p-5 border ${
                dm
                  ? "bg-[#1a1a1a] border-white/[0.06]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Bone dm={dm} className="h-6 w-32 mb-4" />
              <div className="space-y-2.5">
                <Bone dm={dm} className="h-3 w-full" />
                <Bone dm={dm} className="h-3 w-full" />
                <Bone dm={dm} className="h-3 w-5/6" />
                <Bone dm={dm} className="h-3 w-4/6" />
                <Bone dm={dm} className="h-3 w-3/4" />
              </div>
            </div>

            {/* Reviews block */}
            <div
              className={`rounded-2xl p-5 border ${
                dm
                  ? "bg-[#1a1a1a] border-white/[0.06]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Bone dm={dm} className="h-6 w-28 mb-5" />
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <Bone dm={dm} className="w-10 h-10 !rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Bone dm={dm} className="h-3.5 w-28" />
                    <Bone dm={dm} className="h-3 w-full" />
                    <Bone dm={dm} className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar (col-span-4) */}
          <div className="lg:col-span-4">
            <div
              className={`rounded-2xl overflow-hidden border sticky top-24 ${
                dm
                  ? "bg-[#141414] border-white/[0.06]"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Accent bar */}
              <div
                className={`h-1.5 w-full ${
                  dm
                    ? "bg-gradient-to-r from-gray-700 via-gray-800 to-transparent"
                    : "bg-gradient-to-r from-gray-300 via-gray-200 to-transparent"
                } animate-pulse`}
              />

              <div className="p-6 space-y-5">
                {/* Header row */}
                <div className="flex items-center gap-3">
                  <Bone dm={dm} className="w-10 h-10 !rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Bone dm={dm} className="h-5 w-28" />
                    <Bone dm={dm} className="h-3 w-20" />
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center gap-1.5">
                        <Bone dm={dm} className="w-8 h-8 !rounded-xl" />
                        <Bone dm={dm} className="h-2.5 w-10" />
                      </div>
                      {s < 3 && (
                        <Bone dm={dm} className="flex-1 !h-px" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Service select */}
                <div>
                  <Bone dm={dm} className="h-3 w-24 mb-2" />
                  <Bone dm={dm} className="h-12 w-full !rounded-xl" />
                </div>

                {/* Plan cards */}
                <div>
                  <Bone dm={dm} className="h-3 w-20 mb-2" />
                  <div className="space-y-2.5">
                    {[1, 2].map((p) => (
                      <Bone
                        key={p}
                        dm={dm}
                        className="h-16 w-full !rounded-2xl"
                      />
                    ))}
                  </div>
                </div>

                {/* CTA button */}
                <Bone dm={dm} className="h-14 w-full !rounded-xl" />

                {/* Trust text */}
                <Bone dm={dm} className="h-2.5 w-40 mx-auto" />

                {/* Contact row */}
                <div className="flex justify-center gap-5 pt-4">
                  {[1, 2, 3, 4].map((c) => (
                    <div key={c} className="flex flex-col items-center gap-1.5">
                      <Bone dm={dm} className="w-10 h-10 !rounded-xl" />
                      <Bone dm={dm} className="h-2 w-7" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobile && <BottomNav />}
    </motion.div>
  );
}

/* ── Page component ── */
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

  if (isLoading || (!profile && profileLoading)) return <AcademyDetailsSkeleton />;
  if (error) return <p>Failed to load academy. Try again.</p>;

  return (
    <div>
      <AcademyDetailsPage ACADEMY_DATA={data} />
    </div>
  );
}

export default AcademyViewPage;
