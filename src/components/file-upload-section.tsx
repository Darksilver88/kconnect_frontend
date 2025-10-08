import { Upload, X, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FileItem {
  id: number;
  file_name: string;
  file_path: string;
  file_ext?: string;
  file_size?: number;
}

interface FileUploadSectionProps {
  attachments: FileItem[];
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDelete: (fileId: number) => void;
  accept?: string;
  multiple?: boolean;
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

  // เอกสาร
  if (['pdf'].includes(ext)) {
    return FileText;
  }
  if (['doc', 'docx'].includes(ext)) {
    return FileText;
  }
  if (['xls', 'xlsx'].includes(ext)) {
    return FileSpreadsheet;
  }

  // ไฟล์ทั่วไป
  return File;
}

// ตรวจสอบว่าเป็นรูปภาพหรือไม่
function isImage(fileExt: string): boolean {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  return imageExts.includes(fileExt.toLowerCase());
}

// แปลง accept string เป็นข้อความที่อ่านง่าย
function getAcceptedFileTypes(accept: string): string {
  const types = accept.split(',').map(type => type.trim());
  const formatted = types.map(type => {
    if (type === 'image/*') return 'รูปภาพ';
    return type.replace('.', '').toUpperCase();
  });
  return formatted.join(', ');
}

export function FileUploadSection({
  attachments,
  uploading,
  onFileUpload,
  onFileDelete,
  accept = 'image/*',
  multiple = true,
  label = 'ไฟล์แนบ',
}: FileUploadSectionProps) {
  const acceptedTypes = getAcceptedFileTypes(accept);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={onFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center cursor-pointer ${
            uploading ? 'opacity-50' : ''
          }`}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-600">
            {uploading ? 'กำลังอัปโหลด...' : 'คลิกเพื่อเลือกไฟล์'}
          </span>
          <span className="text-xs text-slate-400 mt-1">รองรับไฟล์ {acceptedTypes}</span>
        </label>
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {attachments.map((file) => {
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
                <button
                  type="button"
                  onClick={() => onFileDelete(file.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
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
      )}
    </div>
  );
}
