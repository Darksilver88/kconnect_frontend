interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'กำลังโหลดข้อมูล...' }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-slate-500 mt-2">{message}</p>
    </div>
  );
}
