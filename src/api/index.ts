// API 统一导出
export { articleApi, likeArticle, unlikeArticle } from './article';
export type { Article, ArticleListParams, ArticleListResponse } from './article';

export { messageApi } from './message';
export type { Message } from './message';

export { hotNewsApi } from './hotNews';
export type { HotNews } from './hotNews';

export { statsApi } from './stats';
export type { Stats } from './stats';

export { analyticsApi } from './analytics';
export type {
  AnalyticsOverview,
  AnalyticsDaily,
  AnalyticsPage,
  AnalyticsDevice,
  AnalyticsBrowser,
  AnalyticsCountry,
} from './analytics';

export { searchApi } from './search';
export type { SearchResult } from './search';

export { authApi } from './auth';
export type { LoginData, LoginResponse } from './auth';

export { commentApi } from './comment';
export type { Comment, CommentListParams, CommentListResponse } from './comment';

export { categoryApi } from './category';
export type { Category } from './category';

export { uploadApi } from './upload';
export type { UploadResponse } from './upload';
