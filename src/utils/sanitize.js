/**
 * XSS 防护工具函数
 * 用于清理用户输入，防止脚本注入攻击
 */

/**
 * 清理 HTML 特殊字符，防止 XSS 攻击
 * @param {string} str - 需要清理的字符串
 * @returns {string} - 清理后的字符串
 */
export function sanitizeInput(str) {
  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * 清理用户输入，移除危险的 HTML 标签和脚本
 * @param {string} str - 需要清理的字符串
 * @returns {string} - 清理后的字符串
 */
export function cleanUserInput(str) {
  if (!str) return '';

  let cleaned = String(str);

  // 移除 script 标签及其内容
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 移除 on* 事件处理器
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // 移除 javascript: 协议
  cleaned = cleaned.replace(/javascript:/gi, '');

  // 移除 data: 协议（可能用于 XSS）
  cleaned = cleaned.replace(/data:/gi, '');

  // 移除 vbscript: 协议
  cleaned = cleaned.replace(/vbscript:/gi, '');

  // 清理 HTML 特殊字符
  cleaned = sanitizeInput(cleaned);

  return cleaned;
}

/**
 * 输入验证规则
 */
export const inputRules = {
  // 评论最大长度
  commentMaxLength: 1000,

  // 留言最大长度
  messageMaxLength: 200,

  // 昵称最大长度
  nicknameMaxLength: 20,

  // 搜索关键词最大长度
  searchMaxLength: 50,

  // URL 最大长度
  urlMaxLength: 500,

  // 最小长度
  minLength: 1,
};

/**
 * 验证输入长度
 * @param {string} str - 需要验证的字符串
 * @param {number} maxLength - 最大长度
 * @returns {object} - { valid: boolean, message: string }
 */
export function validateInputLength(str, maxLength) {
  if (!str) {
    return { valid: false, message: '输入不能为空' };
  }

  if (str.length > maxLength) {
    return {
      valid: false,
      message: `输入长度不能超过 ${maxLength} 个字符`
    };
  }

  return { valid: true, message: '' };
}

/**
 * 验证输入是否包含危险字符
 * @param {string} str - 需要验证的字符串
 * @returns {boolean} - 是否安全
 */
export function isInputSafe(str) {
  if (!str) return true;

  const dangerousPatterns = [
    /<script/i,
    /<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /onfocus\s*=/i,
    /onblur\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /document\.cookie/i,
    /document\.location/i,
    /window\.location/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
    /prompt\s*\(/i,
    /confirm\s*\(/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(str));
}
