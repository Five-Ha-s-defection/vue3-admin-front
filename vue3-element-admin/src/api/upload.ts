import request from "@/utils/request";

const UPLOAD_BASE_URL = "/api/upload";

// 上传响应类型
export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// 进度回调函数类型
export type ProgressCallback = (progress: number) => void;

/**
 * 上传图片文件
 * @param file 文件对象
 * @param onProgress 进度回调函数
 * @returns Promise<UploadResponse>
 */
export const uploadImage = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: `${UPLOAD_BASE_URL}/image`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

/**
 * 上传Base64图片
 * @param base64Data Base64字符串
 * @param fileName 文件名
 * @returns Promise<UploadResponse>
 */
export const uploadBase64Image = async (
  base64Data: string, 
  fileName: string
): Promise<UploadResponse> => {
  return request({
    url: `${UPLOAD_BASE_URL}/base64`,
    method: 'post',
    data: {
      base64: base64Data,
      fileName: fileName,
    },
  });
};

/**
 * 删除上传的文件
 * @param fileName 文件名
 * @returns Promise<void>
 */
export const deleteUploadedFile = async (fileName: string): Promise<void> => {
  return request({
    url: `${UPLOAD_BASE_URL}/delete`,
    method: 'delete',
    data: { fileName },
  });
};

/**
 * 批量上传图片
 * @param files 文件数组
 * @param onProgress 进度回调函数
 * @returns Promise<UploadResponse[]>
 */
export const uploadMultipleImages = async (
  files: File[], 
  onProgress?: ProgressCallback
): Promise<UploadResponse[]> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  return request({
    url: `${UPLOAD_BASE_URL}/multiple`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
}; 