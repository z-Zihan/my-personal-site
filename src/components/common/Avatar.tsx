import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarProps {
  userId?: string
  size?: number
  className?: string
  editable?: boolean
  isSelf?: boolean
}

// 炫酷渐变色方案
const GRADIENT_PRESETS = [
  ['#667eea', '#764ba2'],  // 紫蓝
  ['#f093fb', '#f5576c'],  // 粉红
  ['#4facfe', '#00f2fe'],  // 天蓝
  ['#43e97b', '#38f9d7'],  // 薄荷绿
  ['#fa709a', '#fee140'],  // 粉金
  ['#a18cd1', '#fbc2eb'],  // 薰衣草
  ['#fccb90', '#d57eeb'],  // 橙紫
  ['#e0c3fc', '#8ec5fc'],  // 淡紫蓝
  ['#f6d365', '#fda085'],  // 暖橙
  ['#667eea', '#f093fb'],  // 蓝粉
  ['#89f7fe', '#66a6ff'],  // 冰蓝
  ['#fddb92', '#d1fdff'],  // 鹅黄
  ['#c471f5', '#fa71cd'],  // 霓虹紫
  ['#48c6ef', '#6f86d6'],  // 海蓝
  ['#feada6', '#f5efef'],  // 玫瑰金
  ['#a1c4fd', '#c2e9fb'],  // 清蓝
  ['#d4fc79', '#96e6a1'],  // 青绿
  ['#84fab0', '#8fd3f4'],  // 湖蓝绿
  ['#fbc2eb', '#a6c1ee'],  // 粉蓝
  ['#ff9a9e', '#fecfef'],  // 粉嫩
  ['#ff6b6b', '#ee5a24'],  // 烈焰红
  ['#f7971e', '#ffd200'],  // 金橙
  ['#56ab2f', '#a8e063'],  // 森林绿
  ['#1cb5e0', '#000046'],  // 深海蓝
  ['#ff5f6d', '#ffc371'],  // 珊瑚橙
  ['#36d1dc', '#5b86e5'],  // 极光蓝
  ['#c94b4b', '#4b134f'],  // 暗红紫
  ['#f2994a', '#f2c94c'],  // 向日葵
  ['#11998e', '#38ef7d'],  // 翡翠绿
  ['#ee0979', '#ff6a00'],  // 火焰粉
  ['#7f00ff', '#e100ff'],  // 电光紫
  ['#fc5c7d', '#6a82fb'],  // 晚霞蓝
  ['#00c9ff', '#92fe9d'],  // 清新蓝绿
  ['#f857a6', '#ff5858'],  // 玫红
  ['#4568dc', '#b06ab3'],  // 皇家紫
  ['#0575e6', '#021b79'],  // 宝石蓝
  ['#e65c00', '#f9d423'],  // 芒果黄
  ['#2193b0', '#6dd5ed'],  // 水晶蓝
  ['#cc2b5e', '#753a88'],  // 莓果紫
  ['#42275a', '#734b6d'],  // 暮色紫
]

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const AVATAR_STORAGE_KEY = 'avatar_seed'
const AVATAR_CHANGE_EVENT = 'avatar-seed-changed'

/**
 * 用户头像组件
 * - editable=true: 点击可换头像（仅在 Profile 页使用）
 * - isSelf=true: 当前用户自己的头像，会读取自定义 seed（Navbar 等处使用）
 * - 默认: 根据 userId 确定性生成
 */
export default function Avatar({ userId, size = 40, className = '', editable = false, isSelf = false }: AvatarProps) {
  const [spinning, setSpinning] = useState(false)
  const [localSeed, setLocalSeed] = useState<number>(() => {
    const saved = localStorage.getItem(AVATAR_STORAGE_KEY)
    return saved ? parseInt(saved, 10) : 0
  })

  // isSelf 的头像监听自定义事件，同步更新
  useEffect(() => {
    if (!isSelf) return
    const handler = (e: Event) => {
      const newSeed = (e as CustomEvent<number>).detail
      setLocalSeed(newSeed)
    }
    window.addEventListener(AVATAR_CHANGE_EVENT, handler)
    return () => window.removeEventListener(AVATAR_CHANGE_EVENT, handler)
  }, [isSelf])

  const shouldUseCustomSeed = editable || isSelf

  const avatar = useMemo(() => {
    if (shouldUseCustomSeed && localSeed > 0) {
      return generateAvatarFromSeed(localSeed)
    }
    return generateAvatar(userId)
  }, [userId, shouldUseCustomSeed, localSeed])

  const handleClick = useCallback(() => {
    if (!editable) return
    setSpinning(true)
    const newSeed = Date.now()
    localStorage.setItem(AVATAR_STORAGE_KEY, String(newSeed))
    setLocalSeed(newSeed)
    // 通知其他 Avatar 实例同步更新
    window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: newSeed }))
    setTimeout(() => setSpinning(false), 600)
  }, [editable])

  const background = avatar.gradient
    ? `linear-gradient(135deg, ${avatar.gradient[0]}, ${avatar.gradient[1]})`
    : (avatar.backgroundColor || '#a18cd1')

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <motion.div
        onClick={handleClick}
        whileHover={editable ? { scale: 1.1 } : {}}
        whileTap={editable ? { scale: 0.9 } : {}}
        animate={spinning ? { rotate: [0, 360] } : {}}
        transition={spinning ? { duration: 0.5, ease: 'easeInOut' } : { duration: 0.2 }}
        className={`rounded-full flex items-center justify-center font-bold text-white select-none relative overflow-hidden ${editable ? 'cursor-pointer' : ''} ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          fontSize: Math.floor(size * 0.45),
          background: background,
          backgroundColor: avatar.gradient ? avatar.gradient[0] : (avatar.backgroundColor || '#a18cd1'),
          boxShadow: avatar.gradient
            ? `0 4px 15px ${avatar.gradient[0]}40, 0 2px 8px ${avatar.gradient[1]}30`
            : undefined,
        }}
      >
        {/* 光泽效果 */}
        {avatar.gradient && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.span
            key={`${avatar.letter}-${localSeed}`}
            initial={spinning ? { opacity: 0, scale: 0.3, rotate: -180 } : false}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.3, rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {avatar.letter}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* 可编辑提示 */}
      {editable && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          点击更换头像
        </div>
      )}
    </div>
  )
}

interface AvatarResult {
  letter: string
  backgroundColor?: string
  gradient?: [string, string]
}

/**
 * 根据 seed 生成渐变头像（用于当前用户可编辑头像）
 */
function generateAvatarFromSeed(seed: number): AvatarResult {
  const letterIndex = seed % 26
  const gradientIndex = Math.floor(seed / 26) % GRADIENT_PRESETS.length
  return {
    letter: LETTERS[letterIndex],
    gradient: GRADIENT_PRESETS[gradientIndex] as [string, string],
  }
}

/**
 * 根据用户 ID 生成唯一的字母和渐变背景
 */
function generateAvatar(userId: string | null | undefined): AvatarResult {
  if (!userId) {
    return { letter: '?', gradient: ['#a18cd1', '#fbc2eb'] }
  }

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }

  const letterIndex = Math.abs(hash) % 26
  const letter = LETTERS[letterIndex]
  const gradientIndex = Math.abs(hash >> 5) % GRADIENT_PRESETS.length
  const gradient = GRADIENT_PRESETS[gradientIndex] as [string, string]

  return { letter, gradient }
}
