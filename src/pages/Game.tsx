import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Gamepad2, Maximize2 } from 'lucide-react';
import { useLanguage } from '../utils/useLanguage';
import { trackEvent } from '../utils/analytics';
import type { Translations } from '../utils/i18n';

const GAME_URL = '/games/ember-swarm/index.html';

// Ember Swarm 游戏页：iframe 全屏嵌入 + 全屏/新窗口打开
// 游戏本体是零依赖 Canvas 2D,自带标题画面/操作说明/本地存档(localStorage 按 origin 隔离)
function GamePage() {
  const { t } = useLanguage();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    trackEvent('page_view', 'game', { page_path: '/game/ember-swarm' });
  }, []);

  const handleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 relative overflow-hidden bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* 标题区 */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium tracking-widest text-orange-400 uppercase">
            <Gamepad2 className="w-3.5 h-3.5" />
            {t('gameTag')}
          </div>
          <h1 className="bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            {t('gameTitle')}
          </h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('gameDesc')}
          </p>
        </div>

        {/* 游戏画布区 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            ref={wrapRef}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0d0f]"
            style={{ aspectRatio: '16 / 9' }}
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-500 text-sm animate-pulse">{t('loading')}</div>
              </div>
            )}
            <iframe
              src={GAME_URL}
              title="Ember Swarm"
              className="absolute inset-0 w-full h-full border-0"
              onLoad={() => setLoaded(true)}
              allow="autoplay"
            />
          </div>

          {/* 工具条 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleFullscreen}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" /> {t('gameFullscreen')}
            </button>
            <a
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('game_open_new_tab', 'game', { page_path: '/game/ember-swarm' })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> {t('gameNewTab')}
            </a>
          </div>

          {/* 操作说明卡 */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(t('gameFeatures') as unknown as string[]).map((feat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 text-center"
              >
                {feat}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GamePage;
