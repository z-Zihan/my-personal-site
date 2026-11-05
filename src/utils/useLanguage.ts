import { useCallback, useEffect, useState } from 'react'
import { getLanguage, setLanguage, t, Language, Translations } from './i18n'

/** 插值参数：t('pageInfo', { current: 1, total: 5 }) */
export type TranslationParams = Record<string, string | number>

export interface UseLanguageResult {
  /** 当前语言 */
  lang: Language
  /** 切换语言（写入 localStorage + 广播 languageChanged 事件） */
  setLang: (lang: Language) => void
  /** 翻译函数（已绑定当前语言，支持 {key} 插值） */
  t: (key: keyof Translations, params?: TranslationParams) => string
}

const LANGUAGE_CHANGED_EVENT = 'languageChanged'

/**
 * 语言 hook：组件接入国际化的统一入口。
 *
 * - 首次访问（localStorage 无 language key）按 navigator.language 自动选择：
 *   zh-* → 中文，其余 → 英文。检测结果会写入 localStorage，之后以用户选择为准。
 * - setLang 切换后通过 languageChanged 自定义事件通知所有挂载的 hook 实例，
 *   组件无需任何额外订阅即可实时刷新。
 */
export function useLanguage(): UseLanguageResult {
  const [lang, setLangState] = useState<Language>(() => getLanguage())

  // 语言切换事件：任何实例调用 setLanguage 都会广播，这里同步本地状态
  useEffect(() => {
    const handleChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ lang: Language }>).detail
      if (detail?.lang) {
        setLangState(detail.lang)
      }
    }
    window.addEventListener(LANGUAGE_CHANGED_EVENT, handleChanged)
    // 挂载时兜底同步一次（跨标签页 storage 事件不触发本事件，保持简单不处理）
    setLangState(getLanguage())
    return () => window.removeEventListener(LANGUAGE_CHANGED_EVENT, handleChanged)
  }, [])

  const setLang = useCallback((next: Language) => {
    setLanguage(next) // 内部写 localStorage + dispatch languageChanged
    // 同步 <html lang>，利于读屏与 SEO
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  const translate = useCallback(
    (key: keyof Translations, params?: TranslationParams) => t(key, lang, params),
    [lang]
  )

  return { lang, setLang, t: translate }
}

export default useLanguage
