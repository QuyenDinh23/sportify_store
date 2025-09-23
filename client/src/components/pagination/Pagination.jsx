import { Button } from "../ui/button";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Trước
      </Button>

      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        const isActive = page === currentPage;

        // Hiển thị các nút đầu, cuối và xung quanh currentPage
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 2 && page <= currentPage + 2)
        ) {
          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              className="w-10 h-10"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        } else if (
          page === currentPage - 3 ||
          page === currentPage + 3
        ) {
          return (
            <span key={page} className="w-10 h-10 flex items-center justify-center">
              ...
            </span>
          );
        }
        return null;
      })}

      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Sau
      </Button>
    </div>
  );
};

export default Pagination;
