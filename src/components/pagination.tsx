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

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
      {showSummary && (
        <div className="text-sm text-slate-600">
          แสดง {startItem}-{endItem} จาก {pagination.total} รายการ
        </div>
      )}
      <div className={`flex gap-2 ${!showSummary ? 'ml-auto' : ''}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={!pagination.has_prev}
        >
          ← ก่อนหน้า
        </Button>
        {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {page}
          </Button>
        ))}
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
