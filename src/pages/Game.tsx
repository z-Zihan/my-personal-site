import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Gamepad2, Maximize2 } from 'lucide-react';
import { useLanguage } from '../utils/useLanguage';
import { tArr } from '../utils/i18n';
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
    <div className="relative overflow-x-hidden bg-gray-900">
      {/* 首屏：标题条 + 游戏区撑满视口(dvh 防移动端地址栏抖动) */}
      <div className="h-[100dvh] pt-20 pb-4 flex flex-col">
        <div className="max-w-[1800px] mx-auto w-full px-4 flex-1 min-h-0 flex flex-col relative z-10">
          {/* 标题条：左侧 badge + 标题 + 描述，右侧全屏/新窗口按钮 */}
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden shrink-0 sm:inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-medium tracking-widest text-orange-400 uppercase">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  {t('gameTag')}
                </div>
                <h1 className="truncate bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                  {t('gameTitle')}
                </h1>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {t('gameDesc')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleFullscreen}
                aria-label={t('gameFullscreen')}
                title={t('gameFullscreen')}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200 text-sm whitespace-nowrap transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('gameFullscreen')}</span>
              </button>
              <a
                href={GAME_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('gameNewTab')}
                title={t('gameNewTab')}
                onClick={() => trackEvent('game_open_new_tab', 'game', { page_path: '/game/ember-swarm' })}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200 text-sm whitespace-nowrap transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">{t('gameNewTab')}</span>
              </a>
            </div>
          </div>

          {/* 游戏画布区：flex-1 撑满剩余高度，不锁宽高比(游戏自适应任意尺寸) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-h-0 w-full flex flex-col"
          >
            <div
              ref={wrapRef}
              className="relative flex-1 min-h-0 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0d0f]"
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
          </motion.div>
        </div>
      </div>

      {/* 特性 chip：首屏之外，向下滚动可见 */}
      <div className="max-w-[1800px] mx-auto w-full px-4 pt-4 pb-24 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tArr('gameFeatures').map((feat, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
