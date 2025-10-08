interface ErrorAlertProps {
  error: string;
  title?: string;
}

export function ErrorAlert({ error, title = 'ข้อผิดพลาด' }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      <strong>{title}:</strong> {error}
    </div>
  );
}
