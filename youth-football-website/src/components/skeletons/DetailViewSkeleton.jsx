import React from 'react';
import { useSelector } from 'react-redux';

// ── Reusable text line block ─────────────────────────────────────────────
function TextLine({ widthClass = 'w-full', dm }) {
  return (
    <div
      className={`h-3.5 rounded-full ${widthClass} ${dm ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}
    />
  );
}

// =====================================================================
//  DetailViewSkeleton
//
//  Props:
//    avatarShape   — "circle" (default) | "card"
//                   "circle" → overlapping rounded-full avatar (ProfilePage)
//                   "card"   → overlapping rounded-2xl info card (TeamHubPage)
//    tabCount      — number of tab pill skeletons (default 4)
//    contentRows   — number of text-line skeletons below (default 5)
// =====================================================================
export default function DetailViewSkeleton({
  avatarShape = 'circle',
  tabCount = 4,
  contentRows = 5,
}) {
  const dm = useSelector((s) => s.theme.darkMode);

  const bg = dm ? 'bg-[#121212]' : 'bg-gray-50';
  const block = dm ? 'bg-[#1a1a1a]' : 'bg-gray-200';
  const subBlock = dm ? 'bg-[#2a2a2a]' : 'bg-gray-300';

  return (
    <div className={`min-h-screen ${bg} animate-pulse`}>
      {/* ── BANNER ──────────────────────────────────────────────────── */}
      <div className={`h-48 sm:h-56 w-full ${block}`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ── AVATAR / INFO CARD ──────────────────────────────────── */}
        {avatarShape === 'circle' ? (
          // Circular avatar overlapping the banner
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <div
              className={`h-24 w-24 shrink-0 rounded-full border-4 ${subBlock} ${dm ? 'border-[#121212]' : 'border-white'}`}
            />
            <div className="flex-1 pb-2 space-y-2">
              <TextLine widthClass="w-48" dm={dm} />
              <TextLine widthClass="w-32" dm={dm} />
            </div>
          </div>
        ) : (
          // Floating card overlapping the banner (TeamHubPage style)
          <div
            className={`-mt-20 relative z-10 rounded-2xl border p-5 sm:p-6 shadow-lg ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3 flex-1">
                <TextLine widthClass="w-64" dm={dm} />
                <TextLine widthClass="w-40" dm={dm} />
              </div>
              <div className={`h-7 w-20 rounded-lg ${subBlock}`} />
            </div>
          </div>
        )}

        {/* ── TAB BAR ─────────────────────────────────────────────── */}
        <div
          className={`flex gap-1 p-1 rounded-xl mt-6 ${dm ? 'bg-[#1a1a1a]' : 'bg-gray-100'}`}
        >
          {Array.from({ length: tabCount }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-10 rounded-lg ${subBlock}`}
            />
          ))}
        </div>

        {/* ── CONTENT AREA ────────────────────────────────────────── */}
        <div
          className={`mt-6 rounded-2xl border p-6 space-y-4 ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}
        >
          {/* Section heading */}
          <TextLine widthClass="w-36" dm={dm} />

          {/* Body text lines — alternating widths for a natural look */}
          {Array.from({ length: contentRows }).map((_, i) => (
            <TextLine
              key={i}
              widthClass={['w-full', 'w-5/6', 'w-full', 'w-4/5', 'w-3/4'][i % 5]}
              dm={dm}
            />
          ))}

          {/* Simulated sub-card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-20 rounded-xl ${subBlock}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
