// 全局 Toast 通知系统 - 使用 antd message 组件
import { message } from 'antd';

// 配置全局 message 默认选项
message.config({
  top: 100,           // 距离顶部距离
  duration: 3,        // 默认持续时间 (秒)
  maxCount: 3,        // 最大显示数量
  rtl: false,         // 从右到左
  prefixCls: 'ant-message',
});

// Toast API - 封装 antd message
export const toast = {
  /**
   * 成功提示
   * @param {string} message - 提示内容
   * @param {number} [duration] - 持续时间 (秒)
   */
  success: (msg, duration) => message.success(msg, duration),

  /**
   * 错误提示
   * @param {string} message - 提示内容
   * @param {number} [duration] - 持续时间 (秒)
   */
  error: (msg, duration) => message.error(msg, duration),

  /**
   * 警告提示
   * @param {string} message - 提示内容
   * @param {number} [duration] - 持续时间 (秒)
   */
  warning: (msg, duration) => message.warning(msg, duration),

  /**
   * 信息提示
   * @param {string} message - 提示内容
   * @param {number} [duration] - 持续时间 (秒)
   */
  info: (msg, duration) => message.info(msg, duration),

  /**
   * 加载提示
   * @param {string} message - 提示内容
   * @param {number} [duration] - 持续时间 (秒)
   */
  loading: (msg, duration) => message.loading(msg, duration),

  /**
   * 销毁所有提示
   */
  destroy: () => message.destroy(),
}

export default toast
