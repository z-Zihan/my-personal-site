import { post } from '../utils/request';
import { API_ENDPOINTS } from '../constants/apiConstants';

/**
 * 图片上传 API
 */
export const uploadApi = {
  /**
   * 上传图片
   * @param {File} file - 图片文件
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
