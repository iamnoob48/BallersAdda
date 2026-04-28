import { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/select";
import { useSelector } from "react-redux";

// --- Generate page numbers with ellipses ---
const getRange = (current, total, max = 7) => {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(current - 1, 1);
  const right = Math.min(current + 1, total);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 2;

  if (!showLeftDots && showRightDots) {
    return [...Array.from({ length: 5 }, (_, i) => i + 1), "...", total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, "...", ...Array.from({ length: 5 }, (_, i) => total - 4 + i)];
  }
  if (showLeftDots && showRightDots) {
    return [1, "...", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "...", total];
  }
  return [];
};

export const AcademyPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  maxButtons = 7,
  showFirstLast = true,
  className,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const dm = useSelector((state) => state.theme.darkMode);
  const totalPages = Math.ceil(totalItems / pageSize);
  const pages = useMemo(() => getRange(currentPage, totalPages, maxButtons), [currentPage, totalPages, maxButtons]);

  const go = (p) => {
    if (p >= 1 && p <= totalPages && p !== currentPage) onPageChange(p);
  };

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const navBtn = (label, icon, onClick, disabled) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "h-9 w-9",
        dm
          ? "text-gray-500 hover:text-[#00FF88] hover:bg-[#00FF88]/10 disabled:text-gray-700"
          : "text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:text-gray-300"
      )}
    >
      {icon}
    </Button>
  );

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)} role="navigation" aria-label="Pagination">
      <div className={cn(
        "flex items-center gap-1 p-1 rounded-xl border",
        dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"
      )}>
        {showFirstLast && navBtn("First page", <ChevronsLeft className="h-4 w-4" />, () => go(1), isFirst)}
        {navBtn("Previous", <ChevronLeft className="h-4 w-4" />, () => go(currentPage - 1), isFirst)}

        {pages.map((p, i) =>
          p === "..." ? (
            <div key={`dots-${i}`} className="flex items-center justify-center w-9 h-9">
              <MoreHorizontal className={cn("h-4 w-4", dm ? "text-gray-600" : "text-gray-400")} />
            </div>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "ghost"}
              size="icon"
              onClick={() => go(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "h-9 w-9 text-sm font-medium transition-colors",
                p === currentPage
                  ? dm
                    ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 border-0"
                    : "bg-green-600 text-white hover:bg-green-700 border-0"
                  : dm
                    ? "text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50"
              )}
            >
              {p}
            </Button>
          )
        )}

        {navBtn("Next", <ChevronRight className="h-4 w-4" />, () => go(currentPage + 1), isLast)}
        {showFirstLast && navBtn("Last page", <ChevronsRight className="h-4 w-4" />, () => go(totalPages), isLast)}
      </div>

      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className={cn("text-sm hidden sm:inline", dm ? "text-gray-500" : "text-gray-500")}>Rows:</span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className={cn(
              "h-9 w-[70px] text-sm",
              dm ? "bg-[#1a1a1a] border-[#87A98D]/20 text-gray-300" : "bg-white border-gray-200 text-gray-600"
            )}>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent className={dm ? "bg-[#1a1a1a] border-[#87A98D]/20" : ""}>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)} className={dm ? "text-gray-300 focus:bg-[#00FF88]/10 focus:text-[#00FF88]" : "focus:bg-green-50"}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
