// 留言来源分类：区分博主留言、生成的氛围留言与真实访客留言（纯前端约定，不动表结构）

export type MessageOrigin = 'owner' | 'seed' | 'mock' | 'real'

interface MessageLike {
  visitor_id?: string | null
  visitor_name?: string | null
}

/**
 * 按 visitor_id 前缀分类：
 * - owner_*                → owner（博主，后台约定用这个前缀发）
 * - visitor_<纯数字>        → seed（初始种子数据）
 * - mock_visitor_* / intl_* → mock（批量生成的氛围留言）
 * - 其余（visitor_<ts>_<rand>）→ real
 */
export function classifyMessage(m: MessageLike): MessageOrigin {
  const id = m.visitor_id || ''
  if (id.startsWith('owner_')) return 'owner'
  if (/^visitor_\d+$/.test(id)) return 'seed'
  if (id.startsWith('mock_visitor_') || id.startsWith('intl_')) return 'mock'
  return 'real'
}

export const isOwnerMessage = (m: MessageLike): boolean => classifyMessage(m) === 'owner'

interface SortableMessage extends MessageLike {
  likes?: number | null
  created_at?: string | null
}

const OWNER_HOT_BOOST = 1000
const MINUTE = 60 * 1000

/**
 * 前台排序加权（稳定排序，不改变 random 模式）：
 * - hot：owner 留言 likes +1000，保证置顶
 * - time：同一分钟内 owner 优先
 */
export function applyOwnerWeight<T extends SortableMessage>(
  list: T[],
  sort: 'random' | 'time' | 'hot'
): T[] {
  if (sort === 'random') return list
  const indexed = list.map((m, i) => ({ m, i }))
  indexed.sort((a, b) => {
    const ownerA = isOwnerMessage(a.m) ? 1 : 0
    const ownerB = isOwnerMessage(b.m) ? 1 : 0
    if (sort === 'hot') {
      const diff =
        (b.m.likes || 0) + ownerB * OWNER_HOT_BOOST - ((a.m.likes || 0) + ownerA * OWNER_HOT_BOOST)
      return diff || a.i - b.i
    }
    const minuteA = Math.floor(new Date(a.m.created_at || 0).getTime() / MINUTE)
    const minuteB = Math.floor(new Date(b.m.created_at || 0).getTime() / MINUTE)
    if (minuteA !== minuteB) return minuteB - minuteA
    return ownerB - ownerA || a.i - b.i
  })
  return indexed.map((x) => x.m)
}
