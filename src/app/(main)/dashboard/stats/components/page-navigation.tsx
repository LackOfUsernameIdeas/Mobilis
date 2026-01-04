import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigationProps {
  currentPage: 1 | 2;
  onPageChange: (page: 1 | 2) => void;
}

export function PageNavigation({ currentPage, onPageChange }: PageNavigationProps) {
  return (
    <div className="ml-auto flex items-center gap-2">
      {[1, 2].map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page as 1 | 2)}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all ${
            currentPage === page
              ? "bg-muted-foreground text-background shadow-sm"
              : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
          } `}
        >
          {page === 1 && <ChevronLeft className="h-4 w-4" />}
          <span>Страница {page}</span>
          {page === 2 && <ChevronRight className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}
