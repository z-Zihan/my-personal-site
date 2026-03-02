import React from 'react';

export default function ShareButtons({ title, url }) {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks = {
    wechat: `https://qr.aiwei.ai/?text=${shareTitle}%0A${shareUrl}`,
    weibo: `https://service.weibo.com/share/share.php?title=${shareTitle}&url=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
    copy: () => {
      navigator.clipboard.writeText(url);
      alert('链接已复制到剪贴板！');
    }
  };

  return (
    <div className="flex gap-3 mt-6">
      <span className="text-sm text-gray-500 dark:text-gray-400 self-center">分享：</span>
      <button
        onClick={() => window.open(shareLinks.weibo, '_blank')}
        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        title="分享到微博"
      >
        微
      </button>
      <button
        onClick={() => window.open(shareLinks.twitter, '_blank')}
        className="p-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
        title="分享到 Twitter"
      >
        🐦
      </button>
      <button
        onClick={shareLinks.copy}
        className="p-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
        title="复制链接"
      >
        🔗
      </button>
    </div>
  );
}
