import { FileText, FileSpreadsheet, File } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FileItem {
  id: number;
  file_name: string;
  file_path: string;
  file_ext?: string;
  file_size?: number;
}

interface FilePreviewProps {
  files: FileItem[];
  label?: string;
}

// ฟังก์ชันแปลงขนาดไฟล์
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ฟังก์ชันเลือก icon ตามประเภทไฟล์
function getFileIcon(fileExt: string) {
  const ext = fileExt.toLowerCase();

  if (['pdf'].includes(ext)) {
    return FileText;
  }
  if (['doc', 'docx'].includes(ext)) {
    return FileText;
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return FileSpreadsheet;
  }

  return File;
}

// ตรวจสอบว่าเป็นรูปภาพหรือไม่
function isImage(fileExt: string): boolean {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExts.includes(fileExt.toLowerCase());
}

export function FilePreview({ files, label = 'ไฟล์แนบ' }: FilePreviewProps) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div>
      <Label className="text-slate-500 text-sm">
        {label} ({files.length} ไฟล์)
      </Label>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {files.map((file) => {
          const fileExt = file.file_ext || '';
          const isImageFile = isImage(fileExt);
          const FileIcon = getFileIcon(fileExt);

          return (
            <div
              key={file.id}
              className="relative aspect-square bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-2"
            >
              <a
                href={file.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full h-full flex items-center justify-center rounded-md overflow-hidden ${
                  isImageFile ? 'bg-black' : 'bg-slate-50'
                }`}
              >
                {isImageFile ? (
                  <img
                    src={file.file_path}
                    alt={file.file_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <FileIcon className="w-16 h-16 text-slate-400" />
                )}
              </a>
              <div className="mt-1">
                <p className="text-xs text-slate-600 truncate text-center">
                  {file.file_name}
                </p>
                {file.file_size && (
                  <p className="text-xs text-slate-400 text-center">
                    {formatFileSize(file.file_size)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
