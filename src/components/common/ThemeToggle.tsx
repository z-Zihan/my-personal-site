import React from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
      aria-label="切换主题"
    >
      {darkMode ? (
        <SunOutlined className="text-2xl text-amber-500" />
      ) : (
        <MoonOutlined className="text-2xl text-indigo-500" />
      )}
    </button>
  );
}
