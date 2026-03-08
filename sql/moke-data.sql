-- ============================================
-- MyBlog 模拟数据插入脚本
-- ============================================
-- 包含：15 篇技术文章、20 条留言、每篇文章的评论
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- ============================================
-- 第一部分：插入 15 篇前端技术文章
-- ============================================

-- 文章 1: React Hooks 深度解析
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', 'React Hooks 深度解析：从入门到精通',
$code$
React Hooks 自 2018 年推出以来，彻底改变了我们编写 React 组件的方式。

## 一、useState 的工作原理

useState 是 React 提供的基础 Hook，用于在函数组件中添加状态管理。

## 二、useEffect 的依赖数组

useEffect 的依赖数组决定了副作用函数的执行时机。

## 三、useCallback 和 useMemo 的性能优化

这两个 Hook 用于性能优化，避免不必要的重新计算和渲染。

## 四、自定义 Hook

自定义 Hook 让我们可以复用状态逻辑。

## 总结

React Hooks 让代码更加简洁和可复用。
$code$,
'深入探讨 React Hooks 的内部机制和使用技巧。',
'https://images.unsplash.com/photo-1633356122102-3fe601e157f1?w=800',
'published', 1247, 8,
(SELECT id FROM categories WHERE slug = 'tech'),
'2025-11-15 10:30:00', '2025-11-20 14:22:00');

-- 文章 2: TypeScript 进阶
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000002', 'TypeScript 5.0 新特性全面解析',
$code$
TypeScript 5.0 带来了许多令人兴奋的新特性。

## 一、Decorators 正式支持

TypeScript 5.0 现在支持 ECMAScript 的装饰器标准。

## 二、const Type Parameters

新的 const 修饰符让泛型推断更加精确。

## 三、性能提升

TypeScript 5.0 编译速度提升了 10-30%。
$code$,
'介绍 TypeScript 5.0 的主要新特性。',
'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
'published', 892, 6,
(SELECT id FROM categories WHERE slug = 'tech'),
'2025-12-01 09:15:00', '2025-12-05 11:30:00');

-- 文章 3: CSS Grid 布局
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000003', 'CSS Grid 布局完全指南：打造现代网页布局',
$code$
CSS Grid 是强大的二维布局系统，让复杂布局变得简单。

## 一、Grid 基础概念

使用 display: grid 创建网格布局。

## 二、响应式卡片布局

使用 repeat(auto-fill, minmax()) 实现响应式。

## 三、实战案例：图片画廊

Grid 可以轻松实现各种复杂布局。

## 总结

掌握 CSS Grid 后，你将不再需要依赖 Bootstrap 等框架。
$code$,
'从基础语法到实战案例，全面掌握 CSS Grid 布局系统。',
'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
'published', 654, 7,
(SELECT id FROM categories WHERE slug = 'tech'),
'2025-12-10 14:20:00', '2025-12-12 16:45:00');

-- 文章 4: Vue 3 Composition API
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000004', 'Vue 3 Composition API 最佳实践',
$code$
Vue 3 的 Composition API 提供了更好的代码组织和类型推断。

## 一、Composition API vs Options API

Composition API 让逻辑复用更加灵活。

## 二、Composable 函数

Composable 函数是 Composition API 的核心。

## 三、与 TypeScript 配合

Vue 3 和 TypeScript 配合非常完美。
$code$,
'掌握 Vue 3 Composition API 的核心概念和最佳实践。',
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
'published', 523, 9,
(SELECT id FROM categories WHERE slug = 'tech'),
'2025-12-20 10:00:00', '2025-12-22 09:30:00');

-- 文章 5: JavaScript 异步编程
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000005', 'JavaScript 异步编程：从 Callback 到 Async/Await',
$code$
异步编程是 JavaScript 的核心特性。

## 一、Callback 时代

早期的异步编程使用回调函数。

## 二、Promise 的出现

Promise 让异步代码更加优雅。

## 三、Async/Await 简化代码

Async/Await 是异步编程的终极方案。

## 四、并发执行

使用 Promise.all 实现并发执行。
$code$,
'深入理解 JavaScript 异步编程的演进。',
'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
'published', 789, 6,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-01-05 11:30:00', '2026-01-08 15:20:00');

-- 文章 6: Next.js 14 实战
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000006', 'Next.js 14 App Router 完全指南',
$code$
Next.js 14 带来了全新的 App Router，基于 React Server Components 构建。

## 一、项目结构

App Router 采用文件系统路由。

## 二、服务端组件

默认使用服务端组件渲染。

## 三、客户端组件

使用 use client 指令创建客户端组件。

## 四、增量静态生成

支持 ISR 增量静态再生成。
$code$,
'掌握 Next.js 14 App Router 的核心概念。',
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
'published', 1156, 10,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-01-15 09:00:00', '2026-01-18 14:30:00');

-- 文章 7: Vite 构建优化
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000007', 'Vite 构建性能优化实战',
$code$
Vite 基于 ES Modules 提供了极速的开发体验。

## 一、Vite 工作原理

开发环境使用 ES Modules 按需编译。

## 二、配置优化

使用代码分割和 Tree Shaking 优化构建。

## 三、按需加载

动态导入实现组件级代码分割。
$code$,
'深入 Vite 构建原理，分享优化策略。',
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
'published', 445, 5,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-01-25 16:00:00', '2026-01-28 10:15:00');

-- 文章 8: Tailwind CSS 实战
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000008', 'Tailwind CSS 高效开发指南',
$code$
Tailwind CSS 是原子化 CSS 框架，能够极速构建 UI。

## 一、快速上手

使用预定义的类名快速构建样式。

## 二、响应式设计

使用 md、lg 等前缀实现响应式。

## 三、Dark Mode

支持暗色模式切换。

## 四、自定义配置

可以自定义主题和扩展配置。
$code$,
'掌握 Tailwind CSS 的核心用法和高效技巧。',
'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800',
'published', 678, 6,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-02-01 10:30:00', '2026-02-05 14:00:00');

-- 文章 9: 前端性能优化
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000009', '前端性能优化完整指南',
$code$
性能直接影响用户体验和 SEO。

## 一、核心指标

LCP、FID、CLS 是 Core Web Vitals 的核心指标。

## 二、图片优化

使用懒加载和响应式图片优化。

## 三、代码分割

按需加载减少初始加载时间。

## 四、缓存策略

使用 Service Worker 实现离线缓存。
$code$,
'全面提升前端性能的实战方案。',
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
'published', 923, 8,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-02-10 11:00:00', '2026-02-15 09:45:00');

-- 文章 10: Zustand 状态管理
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000010', 'Zustand：轻量级状态管理方案',
$code$
Zustand 是 React 的轻量级状态管理库。

## 一、基础用法

使用 create 创建状态 store。

## 二、选择器优化

只订阅需要的状态避免重渲染。

## 三、中间件

支持 persist、devtools 等中间件。
$code$,
'探索 Zustand 状态管理库的核心特性。',
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
'published', 412, 5,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-02-20 14:30:00', '2026-02-22 16:00:00');

-- 文章 11: Web Components
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000011', 'Web Components 实战指南',
$code$
Web Components 是浏览器的原生组件标准。

## 一、自定义元素

使用 HTMLElement 创建自定义元素。

## 二、Shadow DOM

使用 Shadow DOM 实现样式隔离。

## 三、Lit 库简化开发

Lit 让 Web Components 开发更简单。
$code$,
'学习 Web Components 的核心概念。',
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
'published', 287, 7,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-02-25 09:00:00', '2026-02-28 11:30:00');

-- 文章 12: 前端安全
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000012', '前端安全攻防：XSS 与 CSRF 防护',
$code$
前端安全不容忽视。

## 一、XSS 防护

对用户输入进行 HTML 转义。

## 二、CSRF 防护

使用 CSRF Token 和 SameSite Cookie。

## 三、其他安全实践

使用 HTTPS、定期更新依赖。
$code$,
'深入理解前端安全漏洞及防护措施。',
'https://images.unsplash.com/photo-1555982085-6c3b89c8c0a8?w=800',
'published', 534, 8,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-03-01 10:00:00', '2026-03-03 15:30:00');

-- 文章 13: 单元测试
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000013', 'React 组件测试实战：Vitest + Testing Library',
$code$
测试是保证代码质量的重要手段。

## 一、环境配置

安装 vitest 和 testing-library。

## 二、基础测试

测试组件渲染和用户交互。

## 三、异步测试

测试异步数据加载。
$code$,
'掌握 React 组件测试的核心技巧。',
'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800',
'published', 356, 6,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-03-05 13:00:00', '2026-03-06 10:00:00');

-- 文章 14: 前端监控
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000014', '搭建前端监控体系：错误追踪与性能分析',
$code$
前端监控帮助及时发现和解决问题。

## 一、错误监控

捕获全局错误和 Promise 错误。

## 二、性能监控

使用 PerformanceObserver 采集性能指标。

## 三、上报策略

使用 sendBeacon 保证数据可靠上报。
$code$,
'构建完整的前端监控体系。',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
'published', 467, 7,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-03-07 09:30:00', '2026-03-07 14:00:00');

-- 文章 15: 微前端
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
('a1b2c3d4-0001-0001-0001-000000000015', '微前端架构实践：从原理到落地',
$code$
微前端将大型应用拆分为可独立开发部署的小应用。

## 一、为什么需要微前端

技术栈无关、独立开发和部署。

## 二、qiankun 方案

阿里开源的微前端框架。

## 三、Module Federation

Webpack 5 的模块联邦功能。
$code$,
'深入理解微前端架构。',
'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
'published', 598, 9,
(SELECT id FROM categories WHERE slug = 'tech'),
'2026-03-08 10:00:00', '2026-03-08 10:00:00');

-- ============================================
-- 第二部分：文章标签关联
-- ============================================

INSERT INTO article_tags (article_id, tag_id) VALUES
('a1b2c3d4-0001-0001-0001-000000000001', (SELECT id FROM tags WHERE slug = 'react')),
('a1b2c3d4-0001-0001-0001-000000000001', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000001', (SELECT id FROM tags WHERE slug = 'javascript')),
('a1b2c3d4-0001-0001-0001-000000000002', (SELECT id FROM tags WHERE slug = 'javascript')),
('a1b2c3d4-0001-0001-0001-000000000002', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000003', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000004', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000004', (SELECT id FROM tags WHERE slug = 'javascript')),
('a1b2c3d4-0001-0001-0001-000000000005', (SELECT id FROM tags WHERE slug = 'javascript')),
('a1b2c3d4-0001-0001-0001-000000000005', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000006', (SELECT id FROM tags WHERE slug = 'react')),
('a1b2c3d4-0001-0001-0001-000000000006', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000006', (SELECT id FROM tags WHERE slug = 'backend')),
('a1b2c3d4-0001-0001-0001-000000000007', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000008', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000009', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000010', (SELECT id FROM tags WHERE slug = 'react')),
('a1b2c3d4-0001-0001-0001-000000000010', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000011', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000012', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000013', (SELECT id FROM tags WHERE slug = 'react')),
('a1b2c3d4-0001-0001-0001-000000000013', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000014', (SELECT id FROM tags WHERE slug = 'frontend')),
('a1b2c3d4-0001-0001-0001-000000000015', (SELECT id FROM tags WHERE slug = 'frontend'));

-- ============================================
-- 第三部分：20 条留言数据（带地点）
-- ============================================

INSERT INTO messages (id, visitor_id, visitor_name, content, location, created_at) VALUES
(uuid_generate_v4(), 'visitor_001', '前端小白', '博客设计得很棒，学到了很多！', '北京 朝阳区', '2025-12-15 14:30:00'),
(uuid_generate_v4(), 'visitor_002', 'CodingDaily', 'React Hooks 那篇文章写得太好了，通俗易懂', '上海 浦东新区', '2025-12-20 09:15:00'),
(uuid_generate_v4(), 'visitor_003', 'Web 开发者', '希望多出一些 TypeScript 的教程', '广州 天河区', '2026-01-02 16:45:00'),
(uuid_generate_v4(), 'visitor_004', 'Vue 爱好者', 'Vue 3 的文章什么时候更新？', '深圳 南山区', '2026-01-10 11:20:00'),
(uuid_generate_v4(), 'visitor_005', '全栈工程师', '博主的技术栈很全面，赞！', '杭州 西湖区', '2026-01-15 08:30:00'),
(uuid_generate_v4(), 'visitor_006', 'JS 学习者', '异步编程那篇解决了我很多困惑', '成都 武侯区', '2026-01-22 19:00:00'),
(uuid_generate_v4(), 'visitor_007', '设计转前端', 'CSS Grid 太实用了，谢谢分享', '南京 鼓楼区', '2026-01-28 13:45:00'),
(uuid_generate_v4(), 'visitor_008', '架构师之路', '微前端文章很有深度，收藏了', '武汉 洪山区', '2026-02-03 10:10:00'),
(uuid_generate_v4(), 'visitor_009', '独立开发者', '性能优化建议很实用，已实践', '西安 雁塔区', '2026-02-08 21:30:00'),
(uuid_generate_v4(), 'visitor_010', '学生党', '作为初学者，这个博客帮了大忙', '长沙 岳麓区', '2026-02-12 15:20:00'),
(uuid_generate_v4(), 'visitor_011', 'React 开发者', 'Next.js 14 的文章来得正是时候', '重庆 渝北区', '2026-02-16 12:00:00'),
(uuid_generate_v4(), 'visitor_012', '前端农民工', 'Tailwind 的技巧很实用，学到了', '苏州 工业园区', '2026-02-20 17:45:00'),
(uuid_generate_v4(), 'visitor_013', 'UI 设计师', '从设计角度看，这个博客的 UI 很舒服', '厦门 思明区', '2026-02-24 14:15:00'),
(uuid_generate_v4(), 'visitor_014', '性能狂魔', '性能优化文章数据很详实，好评', '天津 和平区', '2026-02-27 09:30:00'),
(uuid_generate_v4(), 'visitor_015', '安全先锋', '前端安全的内容很重要，希望更多', '青岛 市南区', '2026-03-01 11:50:00'),
(uuid_generate_v4(), 'visitor_016', '测试工程师', '单元测试的实战很有帮助', '大连 中山区', '2026-03-03 16:20:00'),
(uuid_generate_v4(), 'visitor_017', 'DevOps 小哥', '监控体系文章很系统，已采用', '郑州 金水区', '2026-03-05 10:40:00'),
(uuid_generate_v4(), 'visitor_018', '创业 CTO', '博客内容质量很高，已加入书签', '合肥 蜀山区', '2026-03-06 14:00:00'),
(uuid_generate_v4(), 'visitor_019', '自由职业者', '文章覆盖面广，适合团队学习', '福州 鼓楼区', '2026-03-07 18:30:00'),
(uuid_generate_v4(), 'visitor_020', '技术博主', '同行前来学习交流，写得很棒', '昆明 五华区', '2026-03-08 08:15:00');

-- ============================================
-- 第四部分：每篇文章的评论（3-5 条）
-- ============================================

-- 文章 1: React Hooks 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000001', 'user_101', 'React 爱好者', 'useState 的使用注意事项很实用，之前一直没理解依赖数组的机制', '2025-11-16 10:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000001', 'user_102', '前端学徒', 'useEffect 的清理函数终于搞明白了', '2025-11-18 14:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000001', 'user_103', 'CodeNewbie', '自定义 Hook 的例子很好，已收藏', '2025-11-22 09:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000001', 'user_104', '高级前端', '性能优化部分讲得很到位', '2025-11-25 16:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000001', 'user_105', '全栈开发', 'Hook 的规则很重要，新手容易踩坑', '2025-11-28 11:00:00');

-- 文章 2: TypeScript 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000002', 'user_201', 'TS 爱好者', 'const 泛型这个特性很实用', '2025-12-02 10:00:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000002', 'user_202', '类型安全', '装饰器终于正式支持了', '2025-12-04 15:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000002', 'user_203', '编译原理', '性能提升很明显', '2025-12-08 09:45:00');

-- 文章 3: CSS Grid 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000003', 'user_301', 'CSS 大师', '圣杯布局的例子很经典', '2025-12-11 11:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000003', 'user_302', '响应式专家', 'auto-fill 和 minmax 配合太巧妙了', '2025-12-13 16:00:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000003', 'user_303', '设计开发者', '终于不需要 Bootstrap 了', '2025-12-15 14:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000003', 'user_304', '前端新手', 'Grid 布局学习必备文章', '2025-12-18 10:15:00');

-- 文章 4: Vue 3 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000004', 'user_401', 'Vue 开发者', 'Composable 函数太实用了', '2025-12-21 09:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000004', 'user_402', '组合式爱好者', '比 Options API 灵活多了', '2025-12-23 14:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000004', 'user_403', '类型爱好者', '和 TS 配合很完美', '2025-12-26 11:00:00');

-- 文章 5: 异步编程评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000005', 'user_501', 'Promise 大师', 'Promise.all 的例子很好理解', '2026-01-06 10:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000005', 'user_502', '异步专家', '错误处理很全面', '2026-01-09 15:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000005', 'user_503', 'JS 学习者', '从 Callback 到 async/await 的演进很清晰', '2026-01-11 09:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000005', 'user_504', '并发编程', '并发执行的对比很直观', '2026-01-14 16:00:00');

-- 文章 6: Next.js 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000006', 'user_601', 'Next.js 粉丝', 'App Router 确实好用', '2026-01-16 11:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000006', 'user_602', '服务端组件', 'RSC 的概念讲得很清楚', '2026-01-17 14:00:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000006', 'user_603', '全栈开发者', '数据获取的方式很优雅', '2026-01-19 10:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000006', 'user_604', 'ISR 爱好者', '增量静态生成很实用', '2026-01-22 16:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000006', 'user_605', '性能追求者', 'Next.js 性能确实好', '2026-01-25 09:00:00');

-- 文章 7: Vite 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000007', 'user_701', '构建优化', '代码分割策略很有用', '2026-01-26 10:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000007', 'user_702', '性能狂魔', '编译速度确实快', '2026-01-29 14:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000007', 'user_703', '前端工程化', 'Vite 插件生态很丰富', '2026-02-01 11:45:00');

-- 文章 8: Tailwind 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000008', 'user_801', '原子化 CSS', '开发效率提升很多', '2026-02-02 09:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000008', 'user_802', '响应式布局', 'Dark Mode 配置很实用', '2026-02-04 15:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000008', 'user_803', 'UI 开发者', '自定义主题很方便', '2026-02-07 12:00:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000008', 'user_804', 'PurgeCSS', '打包体积很小', '2026-02-10 10:45:00');

-- 文章 9: 性能优化评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000009', 'user_901', 'Core Web Vitals', '指标解释很清楚', '2026-02-11 11:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000009', 'user_902', '图片优化', '响应式图片的例子很好', '2026-02-13 16:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000009', 'user_903', 'Service Worker', '缓存策略很全面', '2026-02-16 09:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000009', 'user_904', '性能监控', 'Web Vitals 监控很实用', '2026-02-19 14:00:00');

-- 文章 10: Zustand 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000010', 'user_1001', '状态管理', '比 Redux 简洁多了', '2026-02-21 10:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000010', 'user_1002', '选择器优化', '避免重渲染的技巧很好', '2026-02-23 15:45:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000010', 'user_1003', '中间件用户', 'persist 中间件很实用', '2026-02-26 11:30:00');

-- 文章 11: Web Components 评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000011', 'user_1101', '原生 JS', '不依赖框架很好', '2026-02-26 09:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000011', 'user_1102', '组件开发', '可复用性很高', '2026-02-27 14:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000011', 'user_1103', 'Lit 用户', 'Lit 库确实方便', '2026-03-01 10:00:00');

-- 文章 12: 前端安全评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000012', 'user_1201', '安全专家', 'XSS 防护很重要', '2026-03-02 11:20:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000012', 'user_1202', 'CSRF 防护', 'SameSite Cookie 很实用', '2026-03-04 16:00:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000012', 'user_1203', 'CSP 用户', 'CSP 配置需要了解', '2026-03-06 09:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000012', 'user_1204', 'SRI 支持', 'Subresource Integrity 很重要', '2026-03-07 14:45:00');

-- 文章 13: 单元测试评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000013', 'user_1301', 'TDD 实践', '测试驱动开发很好', '2026-03-05 10:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000013', 'user_1302', '异步测试', '异步测试的例子很好懂', '2026-03-06 15:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000013', 'user_1303', 'Mock 专家', 'Mock API 的技巧很实用', '2026-03-07 11:00:00');

-- 文章 14: 前端监控评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000014', 'user_1401', '错误追踪', '错误收集很全面', '2026-03-07 10:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000014', 'user_1402', '性能分析', 'PerformanceObserver 很好用', '2026-03-07 14:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000014', 'user_1403', 'sendBeacon', '批量上报很实用', '2026-03-08 09:00:00');

-- 文章 15: 微前端评论
INSERT INTO comments (id, article_id, visitor_id, visitor_name, content, created_at) VALUES
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000015', 'user_1501', '架构师', '微前端架构很适合大团队', '2026-03-08 10:30:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000015', 'user_1502', 'qiankun 用户', 'qiankun 确实好用', '2026-03-08 11:15:00'),
(uuid_generate_v4(), 'a1b2c3d4-0001-0001-0001-000000000015', 'user_1503', 'MF 实践', 'Module Federation 很强大', '2026-03-08 12:00:00');

-- ============================================
-- 数据插入完成！
-- ============================================
-- 数据统计：
-- - 文章：15 篇
-- - 标签关联：24 条
-- - 留言：20 条
-- - 评论：52 条
-- ============================================
