import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ฟังก์ชันสร้าง random string 32 ตัวอักษร สำหรับ upload_key
export function generateUploadKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ฟังก์ชันอัปโหลดไฟล์
export async function uploadFiles(
  files: FileList | File[],
  uploadKey: string,
  menu: string,
  uid: number
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('upload_key', uploadKey);
    formData.append('menu', menu);
    formData.append('uid', String(uid));

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}upload_file`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      message: 'ไม่สามารถเชื่อมต่อ API ได้: ' + err.message
    };
  }
}

// ฟังก์ชันลบไฟล์
export async function deleteFile(
  fileId: number,
  menu: string,
  uid: number
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}delete_file`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: fileId,
        menu: menu,
        uid: uid,
      }),
    });

    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      message: 'ไม่สามารถเชื่อมต่อ API ได้: ' + err.message
    };
  }
}
