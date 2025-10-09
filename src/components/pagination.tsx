import { Button } from '@/components/ui/button';

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  pagination: PaginationData;
  showSummary?: boolean;
}

export function Pagination({
  currentPage,
  onPageChange,
  pagination,
  showSummary = true,
}: PaginationProps) {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const startItem = ((pagination.current_page - 1) * pagination.per_page) + 1;
  const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  // สร้าง array ของหน้าที่จะแสดง
  const getPageNumbers = () => {
    const totalPages = pagination.total_pages;
    const current = currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // ถ้าหน้าน้อย แสดงหมด
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // เสมอ: แสดงหน้า 1
    pages.push(1);

    if (current <= 3) {
      // หน้าแรกๆ: 1 2 3 4 ... last
      pages.push(2, 3, 4, '...', totalPages);
    } else if (current >= totalPages - 2) {
      // หน้าท้ายๆ: 1 ... last-3 last-2 last-1 last
      pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // หน้ากลาง: 1 ... current-1 current current+1 ... last
      pages.push('...', current - 1, current, current + 1, '...', totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200">
      {showSummary && (
        <div className="text-sm text-slate-600">
          แสดง {startItem}-{endItem} จาก {pagination.total} รายการ
        </div>
      )}
      <div className={`flex gap-2 flex-wrap justify-center ${!showSummary ? 'lg:ml-auto' : ''}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!pagination.has_prev}
        >
          ← ก่อนหน้า
        </Button>
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-slate-400 text-sm flex items-center"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {page}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(pagination.total_pages, currentPage + 1))}
          disabled={!pagination.has_next}
        >
          ถัดไป →
        </Button>
      </div>
    </div>
  );
}

// Component สำหรับแสดง summary เฉพาะข้อความ (ใช้ด้านบนตาราง)
interface PaginationSummaryProps {
  pagination: PaginationData;
}

export function PaginationSummary({ pagination }: PaginationSummaryProps) {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const startItem = ((pagination.current_page - 1) * pagination.per_page) + 1;
  const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return (
    <p className="text-sm text-slate-500 mt-1">
      แสดง {startItem}-{endItem} จาก {pagination.total} รายการ
    </p>
  );
}
