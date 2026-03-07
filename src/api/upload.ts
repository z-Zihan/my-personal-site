import { post } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface UploadResponse {
  url?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * 图片上传 API
 */
export const uploadApi = {
  /**
   * 上传图片
   * @param file - 图片文件
   */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return post<UploadResponse>(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
