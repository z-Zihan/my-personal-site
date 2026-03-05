import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../constants/apiConstants';

export default function SearchBar({ onSearchResults }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE}/api/search`, { params: { q: query } });
          setResults(res.data.data || []);
          setIsOpen(true);
          if (onSearchResults) {
            onSearchResults(res.data.data || []);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearchResults]);

  const handleSelect = (articleId) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/blog/${articleId}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          placeholder="搜索文章..."
          className="w-full md:w-64 px-4 py-2 pl-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-4 text-center text-gray-500">搜索中...</div>
          ) : results.length > 0 ? (
            results.map((article) => (
              <div
                key={article.id}
                onClick={() => handleSelect(article.id)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {article.summary}
                </p>
              </div>
            ))
          ) : query.length >= 1 ? (
            <div className="p-4 text-center text-gray-500">未找到相关文章</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
