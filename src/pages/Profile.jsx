import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { getLanguage, setLanguage, t } from '../utils/i18n';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Profile() {
  const navigate = useNavigate();
  const [visitorId, setVisitorId] = useState('');
  const [language, setLang] = useState('zh');
  const [stats, setStats] = useState({ comments: 0, likes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取访客 ID
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
      vid = 'visitor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitor_id', vid);
    }
    setVisitorId(vid);

    // 获取语言设置
    const lang = getLanguage();
    setLang(lang);

    // 获取统计数据
    const comments = JSON.parse(localStorage.getItem('my_comments') || '[]').length;
    const likes = JSON.parse(localStorage.getItem('my_likes') || '[]').length;
    setStats({ comments, likes });
    setLoading(false);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setLang(lang);
    toast.success(lang === 'zh' ? '语言已切换为中文' : 'Language switched to English');
  };

  const handleClearData = () => {
    if (confirm('确定要清除本地数据吗？')) {
      localStorage.removeItem('my_comments');
      localStorage.removeItem('my_likes');
      toast.success('数据已清除');
      setStats({ comments: 0, likes: 0 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ThemeToggle />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t('profile')}
        </h1>

        {/* 访客信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            👤 {t('visitorInfo')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                {t('visitorId')}
              </label>
              <div className="mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm break-all">
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
            ⚙️ {t('settings')}
          </h2>
          
          {/* 语言切换 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🌐 {t('language')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('zh')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'zh'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🇨🇳 中文
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* 主题切换提示 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎨 {t('theme')}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              点击右上角的 🌙/☀️ 按钮切换主题
            </p>
          </div>

          {/* 清除数据 */}
          <div>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ 清除本地数据
            </button>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
