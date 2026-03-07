import { post } from '../utils/request';

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
    return post('/api/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
