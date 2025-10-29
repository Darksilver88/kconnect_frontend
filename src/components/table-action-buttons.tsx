import { Button } from '@/components/ui/button';

interface TableActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

export function TableActionButtons({
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
}: TableActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {showView && onView && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 cursor-pointer"
          onClick={onView}
        >
          <i className="fas fa-eye"></i>
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 cursor-pointer"
          onClick={onEdit}
        >
          <i className="fas fa-edit"></i>
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-[#fee2e2] text-[#ef4444] hover:bg-red-100 border-0 cursor-pointer"
          onClick={onDelete}
        >
          <i className="fas fa-trash"></i>
        </Button>
      )}
    </div>
  );
}
