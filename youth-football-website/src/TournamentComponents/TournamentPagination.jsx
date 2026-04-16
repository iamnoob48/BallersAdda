import React from "react";

export default function TournamentPagination({ pagination, page, setPage, dm }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        disabled={!pagination.hasPrevPage}
        onClick={() => setPage((p) => p - 1)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${dm ? "bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
      >
        Previous
      </button>
      <span className={`text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button
        disabled={!pagination.hasNextPage}
        onClick={() => setPage((p) => p + 1)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${dm ? "bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
      >
        Next
      </button>
    </div>
  );
}
