import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils"; // specific to shadcn projects
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Helper to generate range with ellipses ---
const generatePaginationRange = (currentPage, totalPages, maxButtons = 7) => {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const siblingCount = 1; // How many numbers on each side of current page
  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  // Case 2: No left dots, but right dots (start of list)
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  // Case 3: No right dots, but left dots (end of list)
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  // Case 4: Both dots (middle of list)
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
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
  compact = false,
  className,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginationRange = useMemo(
    () => generatePaginationRange(currentPage, totalPages, maxButtons),
    [currentPage, totalPages, maxButtons]
  );

  // Handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  // --- Render: Compact Mobile Mode ---
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between w-full gap-2 p-2 bg-gray-50 rounded-lg shadow-sm border border-gray-100",
          className
        )}
        role="navigation"
        aria-label="Pagination"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirst}
          className="h-8 w-8 p-0 text-gray-600"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <span className="text-xs text-gray-500 sr-only md:not-sr-only">
            {totalItems} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPageSizeChange && (
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs bg-white">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isLast}
            className="h-8 w-8 p-0 text-gray-600"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // --- Render: Full Desktop Mode ---
  return (
    <div
      className={cn("flex flex-wrap items-center gap-4", className)}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
        {/* First Page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={isFirst}
            className="h-9 w-9 text-gray-500 hover:text-green-600 hover:bg-green-50"
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirst}
          className="h-9 w-9 text-gray-500 hover:text-green-600 hover:bg-green-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Numbers Loop */}
        <div className="flex items-center gap-1 mx-1">
          <AnimatePresence mode="popLayout">
            {paginationRange.map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <motion.div
                    key={`ellipsis-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center w-9 h-9"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </motion.div>
                );
              }

              const isSelected = pageNumber === currentPage;

              return (
                <motion.div
                  key={pageNumber}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant={isSelected ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handlePageChange(Number(pageNumber))}
                    aria-current={isSelected ? "page" : undefined}
                    aria-label={`Page ${pageNumber}`}
                    className={cn(
                      "h-9 w-9 relative overflow-hidden transition-all duration-300",
                      isSelected
                        ? "bg-gradient-to-br from-green-600 to-purple-600 text-white shadow-md hover:opacity-90 border-0"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                    )}
                  >
                    <span className="relative z-10">{pageNumber}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="activePageIndicator"
                        className="absolute inset-0 bg-gradient-to-br from-green-600 to-purple-600"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLast}
          className="h-9 w-9 text-gray-500 hover:text-green-600 hover:bg-green-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        {showFirstLast && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={isLast}
            className="h-9 w-9 text-gray-500 hover:text-green-600 hover:bg-green-50"
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-gray-500 hidden sm:inline-block">
            Rows:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-9 w-[70px] bg-white border-gray-200 text-gray-600 focus:ring-green-500/20">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
                >
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
