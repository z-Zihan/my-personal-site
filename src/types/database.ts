// ============================================
// 数据库类型定义
// 基于 SQL 脚本生成 - 2026-03-07
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  color?: string
  created_at?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at?: string
}

export interface Article {
  id: string
  title: string
  content: string
  summary?: string
  cover?: string
  status: 'published' | 'draft' | 'archived' | 'scheduled'
  views?: number
  reading_time?: number
  category_id?: string
  scheduled_at?: string
  created_at?: string
  updated_at?: string
  is_recommended?: boolean
  recommend_order?: number
}

export interface ArticleWithTag extends Article {
  tags?: Tag[]
  categories?: { name: string; id: string }
  likes?: number
  comment_count?: number
  article_title?: string
}

export interface ArticleTag {
  article_id: string
  tag_id: string
  created_at?: string
}

export interface Comment {
  id: string
  article_id: string
  visitor_id: string
  visitor_name?: string
  visitor_avatar?: string
  content: string
  parent_id?: string
  is_admin?: boolean
  location?: string
  created_at?: string
}

export interface Like {
  id: string
  article_id: string
  visitor_id: string
  created_at?: string
}

export interface Bookmark {
  id: string
  article_id: string
  visitor_id: string
  created_at?: string
}

export interface DailyView {
  id: string
  date: string
  count: number
  created_at?: string
}

export interface UserPreference {
  id: string
  visitor_id: string
  dark_mode?: boolean
  created_at?: string
  updated_at?: string
}

export interface HotNews {
  id?: string
  title: string
  link: string
  source?: string
  hot?: number
  created_at?: string
}

export interface HotNewsCache {
  id: string
  news_data: Record<string, unknown>
  is_valid?: boolean
  updated_at?: string
}

export interface Message {
  id: string
  visitor_id: string
  content: string
  visitor_name?: string
  location?: string
  created_at?: string
}

// ============================================
// 埋点分析表类型
// ============================================

export interface Visitor {
  id: string
  visitor_id: string
  ip_address?: string
  user_agent?: string
  country?: string
  region?: string
  city?: string
  language?: string
  screen_resolution?: string
  timezone?: string
  first_seen_at?: string
  last_seen_at?: string
  session_count?: number
  created_at?: string
}

export interface Session {
  id: string
  visitor_id: string
  session_id: string
  start_time?: string
  end_time?: string
  duration?: number
  page_views?: number
  bounce?: boolean
  device_type?: string
  browser?: string
  os?: string
  country?: string
  region?: string
  city?: string
}

export interface PageView {
  id: string
  visitor_id: string
  session_id: string
  page_path: string
  page_title?: string
  referrer?: string
  entry_path?: string
  exit_path?: string
  time_on_page?: number
  device_type?: string
  browser?: string
  os?: string
  created_at?: string
}

export interface Event {
  id: string
  visitor_id: string
  session_id: string
  event_name: string
  event_type?: string
  event_data?: Record<string, unknown>
  page_path?: string
  element_selector?: string
  element_text?: string
  created_at?: string
}

// ============================================
// API 响应类型
// ============================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: {
    username: string
  }
}

export interface TokenVerifyRequest {
  token: string
}

export interface TokenVerifyResponse {
  valid: boolean
  expiresAt?: string
}

export interface ImageUploadResponse {
  success: boolean
  url: string
  fileName?: string
  size?: number
}
