import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Sun, Moon, Globe, Palette } from 'lucide-react';
import { toast } from '../utils/toast';
import type { Language } from '../utils/i18n';
import { useLanguage } from '../utils/useLanguage';
import { useThemeStore } from '../store/themeStore';
import Avatar from '../components/common/Avatar';
import { sanitizeInput, inputRules } from '../utils/sanitize';

export default function Profile() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useThemeStore();
  const [visitorId, setVisitorId] = useState(() => localStorage.getItem('visitor_id') || '');
  const { t, lang: language, setLang } = useLanguage();
  const [userName, setUserName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [stats, setStats] = useState({ comments: 0, likes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化主题
    useThemeStore.getState().initTheme();
    
    // 获取访客 ID
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
      vid = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', vid);
    }
    setVisitorId(vid);

    // 获取用户名
    const name = localStorage.getItem('userName') || '';
    setUserName(name);

    // 获取统计数据
    const comments = JSON.parse(localStorage.getItem('my_comments') || '[]').length;
    const likes = JSON.parse(localStorage.getItem('my_likes') || '[]').length;
    setStats({ comments, likes });
    setLoading(false);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLang(lang);
    toast.success(t(lang === 'zh' ? 'switchToChinese' : 'switchToEnglish'));
  };

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    toast.success(t(isDark ? 'switchedToDark' : 'switchedToLight'));
  };

  const handleSaveName = () => {
    // 验证输入长度
    if (userName.length > inputRules.nicknameMaxLength) {
      toast.error(t('nicknameTooLong', { max: inputRules.nicknameMaxLength }));
      return;
    }

    // 清理输入内容，防止 XSS 攻击
    const cleanedName = sanitizeInput(userName);
    localStorage.setItem('userName', cleanedName);
    setEditingName(false);
    toast.success(t('nicknameSaved'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          {/* 旋转渐变圆环 */}
          <div className="w-20 h-20 border-4 border-pink-200 dark:border-pink-900 rounded-full animate-spin" style={{ borderLeftColor: '#ec4899', borderTopColor: '#a855f7' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-4 border-purple-200 dark:border-purple-900 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse', borderRightColor: '#a855f7', borderBottomColor: '#06b6d4' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse shadow-lg" />
          <p className="text-center mt-8 text-gray-600 dark:text-gray-400 animate-pulse">{t('loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-24">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t('profile')}
        </h1>

        {/* 用户信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('personalInfo')}
          </h2>

          {/* 头像和用户名 */}
          <div className="flex items-center gap-6 mb-6">
            <Avatar userId={visitorId} size={80} className="shadow-lg" editable />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {t('nickname')}
              </label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    placeholder={t('nicknamePlaceholder')}
                    maxLength={inputRules.nicknameMaxLength}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer"
                  >
                    {t('save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setUserName(localStorage.getItem('userName') || '');
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-lg text-gray-900 dark:text-white">
                    {userName || t('nicknameNotSet')}
                  </span>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-purple-500 hover:text-purple-600 text-sm cursor-pointer"
                  >
                    {t('edit')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                {t('visitorId')}
              </label>
              <div className="mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm break-all text-gray-700 dark:text-gray-300">
                {visitorId}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="px-4 py-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.comments}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('myComments')}
                </div>
              </div>
              <div className="px-4 py-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.likes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('myLikes')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 设置卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            <Settings className="inline w-6 h-6 mr-2" /> {t('settings')}
          </h2>

          {/* 语言切换 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="inline w-5 h-5 mr-2" /> {t('language')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('zh')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  language === 'zh'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🇨🇳 {t('chinese')}
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🇺🇸 {t('english')}
              </button>
            </div>
          </div>

          {/* 主题切换 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Palette className="inline w-5 h-5 mr-2" /> {t('theme')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange(false)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  !darkMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Sun className="w-5 h-5" /> {t('light')}
              </button>
              {/* <button
                onClick={() => handleThemeChange(true)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  darkMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Moon className="w-5 h-5" /> {t('dark')}
              </button> */}
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            ← {t('backHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
