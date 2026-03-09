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


-- ============================================
-- 第五部分：国际化留言数据（全球随机位置、对应语言）
-- ============================================

INSERT INTO messages (id, visitor_id, visitor_name, content, location, created_at) VALUES
-- 日本
(uuid_generate_v4(), 'intl_001', '田中太郎', 'このブログは非常に役に立ちます。Reactの記事が特に良かったです！', '東京 渋谷区', '2025-04-12 09:30:00'),
(uuid_generate_v4(), 'intl_002', '山田花子', 'Tailwind CSSの記事、とても分かりやすかったです。ありがとうございます！', '大阪 北区', '2025-05-23 14:15:00'),
(uuid_generate_v4(), 'intl_003', '佐藤健', 'Vue 3のComposition APIについて詳しく説明されていて勉強になりました。', '京都 中京区', '2025-06-07 11:45:00'),

-- 韩国
(uuid_generate_v4(), 'intl_004', '김민수', '블로그 디자인이 정말 깔끔해요. 글 내용도 유익합니다!', '서울 강남구', '2025-04-18 16:20:00'),
(uuid_generate_v4(), 'intl_005', '이지영', '성능 최적화 관련 글이 실무에 많은 도움이 되었습니다.', '부산 해운대구', '2025-07-02 10:30:00'),
(uuid_generate_v4(), 'intl_006', '박준혁', 'Next.js 14 가이드 최고예요! 바로 적용해봤어요.', '인천 남동구', '2025-08-15 19:00:00'),

-- 美国
(uuid_generate_v4(), 'intl_007', 'Michael Chen', 'Great blog! The React Hooks article helped me understand useEffect better.', 'San Francisco, CA', '2025-03-22 08:45:00'),
(uuid_generate_v4(), 'intl_008', 'Sarah Johnson', 'Love the clean design and well-structured tutorials. Keep it up!', 'New York, NY', '2025-05-10 12:30:00'),
(uuid_generate_v4(), 'intl_009', 'David Wilson', 'The TypeScript 5.0 article was exactly what I needed. Thanks!', 'Seattle, WA', '2025-06-28 15:00:00'),
(uuid_generate_v4(), 'intl_010', 'Emily Davis', 'Finally understood CSS Grid thanks to your comprehensive guide!', 'Austin, TX', '2025-09-05 11:15:00'),
(uuid_generate_v4(), 'intl_011', 'James Brown', 'Bookmarked this blog. The content quality is exceptional.', 'Boston, MA', '2025-10-12 14:45:00'),

-- 英国
(uuid_generate_v4(), 'intl_012', 'Thomas Anderson', 'Brilliant articles on frontend development. Very helpful for my team.', 'London, UK', '2025-04-05 10:00:00'),
(uuid_generate_v4(), 'intl_013', 'Emma Williams', 'The micro-frontend architecture post was insightful. Thank you!', 'Manchester, UK', '2025-07-19 16:30:00'),
(uuid_generate_v4(), 'intl_014', 'Oliver Smith', 'Learned so much about Zustand from your article. Simple and effective!', 'Birmingham, UK', '2025-11-08 09:20:00'),

-- 德国
(uuid_generate_v4(), 'intl_015', 'Hans Mueller', 'Ausgezeichnete Artikel über Frontend-Entwicklung. Sehr empfehlenswert!', 'Berlin, Germany', '2025-03-30 13:00:00'),
(uuid_generate_v4(), 'intl_016', 'Anna Schmidt', 'Die TypeScript-Tutorials sind sehr gut erklärt. Danke!', 'Munich, Germany', '2025-06-14 11:45:00'),
(uuid_generate_v4(), 'intl_017', 'Klaus Weber', 'Next.js App Router Artikel ist fantastisch. Weiter so!', 'Hamburg, Germany', '2025-08-22 15:30:00'),

-- 法国
(uuid_generate_v4(), 'intl_018', 'Pierre Dupont', 'Excellent blog sur le développement frontend! Très instructif.', 'Paris, France', '2025-04-25 09:15:00'),
(uuid_generate_v4(), 'intl_019', 'Marie Laurent', 'Les articles sur React sont très bien écrits. Merci beaucoup!', 'Lyon, France', '2025-07-08 14:00:00'),
(uuid_generate_v4(), 'intl_020', 'Jean Martin', 'Guide CSS Grid très complet. Je recommande!', 'Marseille, France', '2025-09-28 16:45:00'),

-- 西班牙
(uuid_generate_v4(), 'intl_021', 'Carlos García', '¡Increíble blog! Los artículos sobre JavaScript son muy útiles.', 'Madrid, Spain', '2025-05-02 11:30:00'),
(uuid_generate_v4(), 'intl_022', 'María Rodríguez', 'Me encantó el artículo sobre Vue 3. ¡Muy bien explicado!', 'Barcelona, Spain', '2025-08-11 10:00:00'),
(uuid_generate_v4(), 'intl_023', 'Antonio López', 'La guía de Tailwind CSS me ayudó mucho en mi proyecto.', 'Valencia, Spain', '2025-10-25 13:15:00'),

-- 意大利
(uuid_generate_v4(), 'intl_024', 'Marco Rossi', 'Ottimo blog sulla programmazione frontend! Complimenti!', 'Rome, Italy', '2025-04-08 15:20:00'),
(uuid_generate_v4(), 'intl_025', 'Giulia Bianchi', 'Gli articoli su React sono fantastici. Grazie mille!', 'Milan, Italy', '2025-06-30 09:45:00'),
(uuid_generate_v4(), 'intl_026', 'Luca Ferrari', 'La guida TypeScript è molto chiara e utile.', 'Naples, Italy', '2025-09-14 12:00:00'),

-- 巴西
(uuid_generate_v4(), 'intl_027', 'Pedro Silva', 'Blog incrível! Os artigos sobre React me ajudaram muito.', 'São Paulo, Brazil', '2025-03-18 14:30:00'),
(uuid_generate_v4(), 'intl_028', 'Ana Santos', 'Adorei o artigo sobre CSS Grid. Muito bem explicado!', 'Rio de Janeiro, Brazil', '2025-05-26 11:00:00'),
(uuid_generate_v4(), 'intl_029', 'Lucas Oliveira', 'O guia de Next.js é excelente. Recomendo para todos!', 'Brasília, Brazil', '2025-08-03 16:15:00'),

-- 俄罗斯
(uuid_generate_v4(), 'intl_030', 'Александр Петров', 'Отличный блог! Статьи по React очень полезные.', 'Moscow, Russia', '2025-04-15 10:45:00'),
(uuid_generate_v4(), 'intl_031', 'Елена Иванова', 'Очень понравилась статья про TypeScript. Спасибо!', 'Saint Petersburg, Russia', '2025-07-21 14:00:00'),
(uuid_generate_v4(), 'intl_032', 'Дмитрий Сидоров', 'Гайд по Next.js 14 супер! Буду использовать в проектах.', 'Novosibirsk, Russia', '2025-10-06 09:30:00'),

-- 印度
(uuid_generate_v4(), 'intl_033', 'Raj Patel', 'Amazing blog! The React Hooks article solved my doubts.', 'Mumbai, India', '2025-03-25 06:30:00'),
(uuid_generate_v4(), 'intl_034', 'Priya Sharma', 'Love the detailed TypeScript tutorials. Very helpful!', 'Bangalore, India', '2025-06-09 11:15:00'),
(uuid_generate_v4(), 'intl_035', 'Arjun Kumar', 'The performance optimization guide is excellent. Thanks!', 'Delhi, India', '2025-08-27 15:45:00'),
(uuid_generate_v4(), 'intl_036', 'Neha Gupta', 'Vue 3 article was exactly what I needed. Great work!', 'Chennai, India', '2025-11-15 10:00:00'),

-- 澳大利亚
(uuid_generate_v4(), 'intl_037', 'Jack Wilson', 'Brilliant articles! The CSS Grid guide is fantastic.', 'Sydney, Australia', '2025-04-02 07:00:00'),
(uuid_generate_v4(), 'intl_038', 'Sophie Taylor', 'Learned so much from your TypeScript series. Cheers!', 'Melbourne, Australia', '2025-07-14 12:30:00'),
(uuid_generate_v4(), 'intl_039', 'Liam Brown', 'Next.js 14 article is top-notch. Keep them coming!', 'Brisbane, Australia', '2025-09-20 09:15:00'),

-- 加拿大
(uuid_generate_v4(), 'intl_040', 'Ryan Campbell', 'Great content on frontend development! Very practical.', 'Toronto, Canada', '2025-03-28 13:00:00'),
(uuid_generate_v4(), 'intl_041', 'Megan Scott', 'The React performance tips were exactly what I needed.', 'Vancouver, Canada', '2025-06-17 11:45:00'),
(uuid_generate_v4(), 'intl_042', 'Daniel Lee', 'Zustand article helped simplify our state management!', 'Montreal, Canada', '2025-08-29 15:00:00'),

-- 荷兰
(uuid_generate_v4(), 'intl_043', 'Jan de Vries', 'Uitstekende blog over frontend development. Aanrader!', 'Amsterdam, Netherlands', '2025-04-20 10:30:00'),
(uuid_generate_v4(), 'intl_044', 'Sophie van Berg', 'De TypeScript artikelen zijn zeer goed geschreven.', 'Rotterdam, Netherlands', '2025-07-05 14:15:00'),

-- 波兰
(uuid_generate_v4(), 'intl_045', 'Jan Kowalski', 'Świetny blog! Artykuły o React są bardzo pomocne.', 'Warsaw, Poland', '2025-05-08 11:00:00'),
(uuid_generate_v4(), 'intl_046', 'Anna Nowak', 'Przewodnik po CSS Grid jest fantastyczny!', 'Krakow, Poland', '2025-08-18 09:45:00'),

-- 瑞典
(uuid_generate_v4(), 'intl_047', 'Erik Johansson', 'Fantastisk blogg om frontend-utveckling! Mycket bra innehåll.', 'Stockholm, Sweden', '2025-04-12 13:30:00'),
(uuid_generate_v4(), 'intl_048', 'Emma Lindberg', 'TypeScript-artiklarna är mycket välskrivna. Tack!', 'Gothenburg, Sweden', '2025-07-25 10:00:00'),

-- 新加坡
(uuid_generate_v4(), 'intl_049', 'Wei Ming Tan', 'Excellent blog! Very practical tutorials for developers.', 'Singapore', '2025-03-15 09:00:00'),
(uuid_generate_v4(), 'intl_050', 'Li Hua Chen', 'The Next.js guide is comprehensive and easy to follow!', 'Singapore', '2025-06-22 14:30:00'),

-- 泰国
(uuid_generate_v4(), 'intl_051', 'Somchai Prasert', 'บล็อกที่ยอดเยี่ยม! บทความ React ช่วยฉันได้มาก', 'Bangkok, Thailand', '2025-04-28 11:15:00'),
(uuid_generate_v4(), 'intl_052', 'Nattaya Somsak', 'คู่มือ CSS Grid อธิบายได้เข้าใจง่ายมากค่ะ', 'Chiang Mai, Thailand', '2025-08-05 15:00:00'),

-- 越南
(uuid_generate_v4(), 'intl_053', 'Nguyễn Văn A', 'Blog tuyệt vời! Các bài viết về React rất hữu ích.', 'Ho Chi Minh City, Vietnam', '2025-05-15 10:30:00'),
(uuid_generate_v4(), 'intl_054', 'Trần Thị B', 'Hướng dẫn TypeScript rất chi tiết và dễ hiểu.', 'Hanoi, Vietnam', '2025-07-30 14:00:00'),

-- 印度尼西亚
(uuid_generate_v4(), 'intl_055', 'Budi Santoso', 'Blog yang luar biasa! Artikel React sangat membantu.', 'Jakarta, Indonesia', '2025-04-03 09:45:00'),
(uuid_generate_v4(), 'intl_056', 'Siti Rahayu', 'Panduan Next.js sangat komprehensif. Terima kasih!', 'Surabaya, Indonesia', '2025-06-11 13:15:00'),

-- 马来西亚
(uuid_generate_v4(), 'intl_057', 'Ahmad Razak', 'Great blog with practical tutorials. Very helpful!', 'Kuala Lumpur, Malaysia', '2025-05-20 11:00:00'),
(uuid_generate_v4(), 'intl_058', 'Sarah Lim', 'The CSS Grid article is fantastic. Well explained!', 'Penang, Malaysia', '2025-08-08 15:30:00'),

-- 菲律宾
(uuid_generate_v4(), 'intl_059', 'Jose Santos', 'Amazing blog! The React tutorials are top-notch.', 'Manila, Philippines', '2025-03-10 10:00:00'),
(uuid_generate_v4(), 'intl_060', 'Maria Cruz', 'Learned so much from the TypeScript series. Thanks!', 'Cebu, Philippines', '2025-06-25 14:45:00'),

-- 墨西哥
(uuid_generate_v4(), 'intl_061', 'José Hernández', '¡Excelente blog! Los artículos sobre React son muy útiles.', 'Mexico City, Mexico', '2025-04-07 12:00:00'),
(uuid_generate_v4(), 'intl_062', 'Ana González', 'Me encantó la guía de CSS Grid. ¡Muy bien explicada!', 'Guadalajara, Mexico', '2025-07-16 09:30:00'),

-- 阿根廷
(uuid_generate_v4(), 'intl_063', 'Diego Fernández', '¡Increíble blog! Los tutoriales de TypeScript son geniales.', 'Buenos Aires, Argentina', '2025-05-12 11:15:00'),
(uuid_generate_v4(), 'intl_064', 'Lucía Martínez', 'El artículo sobre Next.js me ayudó mucho. Gracias!', 'Córdoba, Argentina', '2025-08-21 15:00:00'),

-- 智利
(uuid_generate_v4(), 'intl_065', 'Pablo Muñoz', 'Excelente contenido sobre desarrollo frontend!', 'Santiago, Chile', '2025-04-18 10:45:00'),
(uuid_generate_v4(), 'intl_066', 'Carmen López', 'Los artículos de React son muy prácticos. Recomendado!', 'Valparaíso, Chile', '2025-07-04 14:30:00'),

-- 埃及
(uuid_generate_v4(), 'intl_067', 'Ahmed Hassan', 'Great blog! Very helpful tutorials for web developers.', 'Cairo, Egypt', '2025-03-22 08:00:00'),
(uuid_generate_v4(), 'intl_068', 'Fatima Ali', 'The TypeScript guide is excellent. Learned a lot!', 'Alexandria, Egypt', '2025-06-08 12:30:00'),

-- 南非
(uuid_generate_v4(), 'intl_069', 'Johan van der Berg', 'Brilliant blog on frontend development! Very informative.', 'Cape Town, South Africa', '2025-04-25 11:00:00'),
(uuid_generate_v4(), 'intl_070', 'Sarah Naidoo', 'The CSS Grid tutorial was exactly what I needed. Thanks!', 'Johannesburg, South Africa', '2025-08-12 14:15:00'),

-- 阿联酋
(uuid_generate_v4(), 'intl_071', 'Mohammed Al-Rashid', 'Excellent blog with high-quality content on web development.', 'Dubai, UAE', '2025-05-05 09:30:00'),
(uuid_generate_v4(), 'intl_072', 'Fatima Al-Hassan', 'The React performance article was very insightful!', 'Abu Dhabi, UAE', '2025-07-28 13:00:00'),

-- 以色列
(uuid_generate_v4(), 'intl_073', 'David Cohen', 'Fantastic blog! The JavaScript async guide is superb.', 'Tel Aviv, Israel', '2025-04-10 10:15:00'),
(uuid_generate_v4(), 'intl_074', 'Sarah Levi', 'Learned a lot from the Vue 3 article. Thank you!', 'Jerusalem, Israel', '2025-06-15 14:45:00'),

-- 土耳其
(uuid_generate_v4(), 'intl_075', 'Ahmet Yılmaz', 'Harika bir blog! React makaleleri çok yardımcı oldu.', 'Istanbul, Turkey', '2025-03-28 12:00:00'),
(uuid_generate_v4(), 'intl_076', 'Elif Demir', 'CSS Grid rehberi mükemmel anlatılmış. Teşekkürler!', 'Ankara, Turkey', '2025-07-02 09:45:00'),

-- 波兰
(uuid_generate_v4(), 'intl_077', 'Piotr Wiśniewski', 'Świetne artykuły o TypeScript. Polecam każdemu!', 'Gdansk, Poland', '2025-05-18 11:30:00'),

-- 挪威
(uuid_generate_v4(), 'intl_078', 'Ole Hansen', 'Fantastisk blogg om frontend-utvikling! Veldig lærerikt.', 'Oslo, Norway', '2025-04-22 13:45:00'),
(uuid_generate_v4(), 'intl_079', 'Ingrid Larsen', 'React-artiklene er meget bra skrevet. Takk!', 'Bergen, Norway', '2025-07-09 10:00:00'),

-- 芬兰
(uuid_generate_v4(), 'intl_080', 'Matti Virtanen', 'Erinomainen blogi frontend-kehityksestä! Hyvin kirjoitettu.', 'Helsinki, Finland', '2025-05-06 12:15:00');

-- ============================================
-- 第六部分：访客数据（用于地域分布统计）
-- ============================================

INSERT INTO visitors (visitor_id, ip_address, country, region, city, language, screen_resolution, timezone, first_seen_at, last_seen_at, session_count) VALUES
-- 中国
('visitor_cn_001', '116.22.33.44', 'China', 'Beijing', 'Beijing', 'zh-CN', '1920x1080', 'Asia/Shanghai', '2025-04-05 09:00:00', '2026-03-08 15:30:00', 12),
('visitor_cn_002', '118.45.56.67', 'China', 'Shanghai', 'Shanghai', 'zh-CN', '2560x1440', 'Asia/Shanghai', '2025-05-12 10:15:00', '2026-03-07 11:00:00', 8),
('visitor_cn_003', '120.33.44.55', 'China', 'Guangdong', 'Shenzhen', 'zh-CN', '1920x1080', 'Asia/Shanghai', '2025-06-20 14:30:00', '2026-03-06 09:45:00', 15),
('visitor_cn_004', '119.22.33.44', 'China', 'Zhejiang', 'Hangzhou', 'zh-CN', '1366x768', 'Asia/Shanghai', '2025-07-08 11:00:00', '2026-03-05 16:20:00', 6),
('visitor_cn_005', '121.55.66.77', 'China', 'Jiangsu', 'Nanjing', 'zh-CN', '1920x1080', 'Asia/Shanghai', '2025-08-15 09:30:00', '2026-03-04 10:15:00', 9),
('visitor_cn_006', '122.11.22.33', 'China', 'Sichuan', 'Chengdu', 'zh-CN', '2560x1440', 'Asia/Shanghai', '2025-09-22 13:45:00', '2026-03-03 14:00:00', 7),
('visitor_cn_007', '123.44.55.66', 'China', 'Hubei', 'Wuhan', 'zh-CN', '1920x1080', 'Asia/Shanghai', '2025-10-10 10:00:00', '2026-03-02 11:30:00', 11),
('visitor_cn_008', '124.66.77.88', 'China', 'Shaanxi', 'Xian', 'zh-CN', '1366x768', 'Asia/Shanghai', '2025-11-05 15:20:00', '2026-03-01 09:00:00', 5),

-- 美国
('visitor_us_001', '192.168.1.1', 'United States', 'California', 'San Francisco', 'en-US', '1920x1080', 'America/Los_Angeles', '2025-03-10 08:30:00', '2026-03-08 12:00:00', 18),
('visitor_us_002', '10.0.0.1', 'United States', 'New York', 'New York', 'en-US', '2560x1440', 'America/New_York', '2025-04-15 11:00:00', '2026-03-07 15:45:00', 14),
('visitor_us_003', '172.16.0.1', 'United States', 'Washington', 'Seattle', 'en-US', '1920x1080', 'America/Los_Angeles', '2025-05-20 09:15:00', '2026-03-06 10:30:00', 10),
('visitor_us_004', '192.168.2.1', 'United States', 'Texas', 'Austin', 'en-US', '1366x768', 'America/Chicago', '2025-06-25 14:00:00', '2026-03-05 16:15:00', 7),
('visitor_us_005', '10.0.1.1', 'United States', 'Massachusetts', 'Boston', 'en-US', '1920x1080', 'America/New_York', '2025-07-30 10:45:00', '2026-03-04 11:00:00', 9),
('visitor_us_006', '172.16.1.1', 'United States', 'Illinois', 'Chicago', 'en-US', '2560x1440', 'America/Chicago', '2025-08-18 13:30:00', '2026-03-03 14:45:00', 12),

-- 日本
('visitor_jp_001', '133.1.2.3', 'Japan', 'Tokyo', 'Tokyo', 'ja-JP', '1920x1080', 'Asia/Tokyo', '2025-04-08 10:00:00', '2026-03-08 09:30:00', 16),
('visitor_jp_002', '133.2.3.4', 'Japan', 'Osaka', 'Osaka', 'ja-JP', '2560x1440', 'Asia/Tokyo', '2025-05-15 14:30:00', '2026-03-07 11:15:00', 8),
('visitor_jp_003', '133.3.4.5', 'Japan', 'Kyoto', 'Kyoto', 'ja-JP', '1366x768', 'Asia/Tokyo', '2025-06-22 09:00:00', '2026-03-05 15:00:00', 6),

-- 韩国
('visitor_kr_001', '14.1.2.3', 'South Korea', 'Seoul', 'Seoul', 'ko-KR', '1920x1080', 'Asia/Seoul', '2025-04-12 11:30:00', '2026-03-08 10:00:00', 14),
('visitor_kr_002', '14.2.3.4', 'South Korea', 'Busan', 'Busan', 'ko-KR', '2560x1440', 'Asia/Seoul', '2025-05-28 15:00:00', '2026-03-06 13:45:00', 7),
('visitor_kr_003', '14.3.4.5', 'South Korea', 'Incheon', 'Incheon', 'ko-KR', '1920x1080', 'Asia/Seoul', '2025-07-10 09:15:00', '2026-03-04 16:30:00', 5),

-- 德国
('visitor_de_001', '217.1.2.3', 'Germany', 'Berlin', 'Berlin', 'de-DE', '1920x1080', 'Europe/Berlin', '2025-03-25 13:00:00', '2026-03-08 11:30:00', 11),
('visitor_de_002', '217.2.3.4', 'Germany', 'Bavaria', 'Munich', 'de-DE', '2560x1440', 'Europe/Berlin', '2025-05-02 10:15:00', '2026-03-06 14:00:00', 9),
('visitor_de_003', '217.3.4.5', 'Germany', 'Hamburg', 'Hamburg', 'de-DE', '1920x1080', 'Europe/Berlin', '2025-06-18 15:30:00', '2026-03-04 09:45:00', 6),

-- 英国
('visitor_uk_001', '51.1.2.3', 'United Kingdom', 'England', 'London', 'en-GB', '1920x1080', 'Europe/London', '2025-04-03 09:30:00', '2026-03-08 10:15:00', 13),
('visitor_uk_002', '51.2.3.4', 'United Kingdom', 'England', 'Manchester', 'en-GB', '2560x1440', 'Europe/London', '2025-05-20 11:45:00', '2026-03-06 13:30:00', 8),
('visitor_uk_003', '51.3.4.5', 'United Kingdom', 'England', 'Birmingham', 'en-GB', '1366x768', 'Europe/London', '2025-07-05 14:00:00', '2026-03-04 16:45:00', 5),

-- 法国
('visitor_fr_001', '163.1.2.3', 'France', 'Île-de-France', 'Paris', 'fr-FR', '1920x1080', 'Europe/Paris', '2025-04-18 10:30:00', '2026-03-08 11:00:00', 12),
('visitor_fr_002', '163.2.3.4', 'France', 'Auvergne-Rhône-Alpes', 'Lyon', 'fr-FR', '2560x1440', 'Europe/Paris', '2025-06-02 14:15:00', '2026-03-05 15:30:00', 7),
('visitor_fr_003', '163.3.4.5', 'France', 'Provence-Alpes-Côte d''Azur', 'Marseille', 'fr-FR', '1920x1080', 'Europe/Paris', '2025-07-18 09:00:00', '2026-03-03 12:00:00', 4),

-- 印度
('visitor_in_001', '103.1.2.3', 'India', 'Maharashtra', 'Mumbai', 'en-IN', '1920x1080', 'Asia/Kolkata', '2025-03-15 06:00:00', '2026-03-08 08:30:00', 20),
('visitor_in_002', '103.2.3.4', 'India', 'Karnataka', 'Bangalore', 'en-IN', '2560x1440', 'Asia/Kolkata', '2025-04-28 11:30:00', '2026-03-06 14:15:00', 15),
('visitor_in_003', '103.3.4.5', 'India', 'Delhi', 'New Delhi', 'en-IN', '1366x768', 'Asia/Kolkata', '2025-06-10 09:45:00', '2026-03-04 10:00:00', 11),
('visitor_in_004', '103.4.5.6', 'India', 'Tamil Nadu', 'Chennai', 'en-IN', '1920x1080', 'Asia/Kolkata', '2025-07-25 15:00:00', '2026-03-02 16:30:00', 8),

-- 澳大利亚
('visitor_au_001', '203.1.2.3', 'Australia', 'New South Wales', 'Sydney', 'en-AU', '1920x1080', 'Australia/Sydney', '2025-04-01 07:30:00', '2026-03-08 09:00:00', 10),
('visitor_au_002', '203.2.3.4', 'Australia', 'Victoria', 'Melbourne', 'en-AU', '2560x1440', 'Australia/Melbourne', '2025-05-16 12:00:00', '2026-03-05 14:30:00', 7),
('visitor_au_003', '203.3.4.5', 'Australia', 'Queensland', 'Brisbane', 'en-AU', '1920x1080', 'Australia/Brisbane', '2025-07-02 10:15:00', '2026-03-03 11:45:00', 5),

-- 加拿大
('visitor_ca_001', '99.1.2.3', 'Canada', 'Ontario', 'Toronto', 'en-CA', '1920x1080', 'America/Toronto', '2025-03-22 13:00:00', '2026-03-08 12:15:00', 9),
('visitor_ca_002', '99.2.3.4', 'Canada', 'British Columbia', 'Vancouver', 'en-CA', '2560x1440', 'America/Vancouver', '2025-05-08 11:30:00', '2026-03-05 15:00:00', 6),
('visitor_ca_003', '99.3.4.5', 'Canada', 'Quebec', 'Montreal', 'en-CA', '1366x768', 'America/Montreal', '2025-06-22 14:45:00', '2026-03-03 10:30:00', 4),

-- 巴西
('visitor_br_001', '177.1.2.3', 'Brazil', 'São Paulo', 'São Paulo', 'pt-BR', '1920x1080', 'America/Sao_Paulo', '2025-04-05 14:30:00', '2026-03-08 11:00:00', 8),
('visitor_br_002', '177.2.3.4', 'Brazil', 'Rio de Janeiro', 'Rio de Janeiro', 'pt-BR', '2560x1440', 'America/Sao_Paulo', '2025-05-22 10:00:00', '2026-03-05 14:15:00', 6),
('visitor_br_003', '177.3.4.5', 'Brazil', 'Distrito Federal', 'Brasília', 'pt-BR', '1920x1080', 'America/Sao_Paulo', '2025-07-08 16:15:00', '2026-03-02 09:30:00', 4),

-- 俄罗斯
('visitor_ru_001', '5.1.2.3', 'Russia', 'Moscow', 'Moscow', 'ru-RU', '1920x1080', 'Europe/Moscow', '2025-03-28 11:00:00', '2026-03-08 10:30:00', 12),
('visitor_ru_002', '5.2.3.4', 'Russia', 'Saint Petersburg', 'Saint Petersburg', 'ru-RU', '2560x1440', 'Europe/Moscow', '2025-05-12 15:30:00', '2026-03-05 14:00:00', 7),
('visitor_ru_003', '5.3.4.5', 'Russia', 'Novosibirsk', 'Novosibirsk', 'ru-RU', '1920x1080', 'Asia/Novosibirsk', '2025-06-28 09:45:00', '2026-03-02 12:15:00', 5),

-- 新加坡
('visitor_sg_001', '103.10.20.30', 'Singapore', 'Singapore', 'Singapore', 'en-SG', '1920x1080', 'Asia/Singapore', '2025-04-10 09:00:00', '2026-03-08 11:30:00', 11),
('visitor_sg_002', '103.11.21.31', 'Singapore', 'Singapore', 'Singapore', 'en-SG', '2560x1440', 'Asia/Singapore', '2025-05-25 14:00:00', '2026-03-05 16:15:00', 8),

-- 荷兰
('visitor_nl_001', '145.1.2.3', 'Netherlands', 'North Holland', 'Amsterdam', 'nl-NL', '1920x1080', 'Europe/Amsterdam', '2025-04-15 10:30:00', '2026-03-07 13:00:00', 7),
('visitor_nl_002', '145.2.3.4', 'Netherlands', 'South Holland', 'Rotterdam', 'nl-NL', '2560x1440', 'Europe/Amsterdam', '2025-06-01 14:15:00', '2026-03-04 10:45:00', 5),

-- 西班牙
('visitor_es_001', '88.1.2.3', 'Spain', 'Madrid', 'Madrid', 'es-ES', '1920x1080', 'Europe/Madrid', '2025-04-20 11:30:00', '2026-03-07 12:15:00', 9),
('visitor_es_002', '88.2.3.4', 'Spain', 'Catalonia', 'Barcelona', 'es-ES', '2560x1440', 'Europe/Madrid', '2025-06-05 15:00:00', '2026-03-04 14:30:00', 6),

-- 意大利
('visitor_it_001', '93.1.2.3', 'Italy', 'Lazio', 'Rome', 'it-IT', '1920x1080', 'Europe/Rome', '2025-04-25 09:15:00', '2026-03-07 10:30:00', 8),
('visitor_it_002', '93.2.3.4', 'Italy', 'Lombardy', 'Milan', 'it-IT', '2560x1440', 'Europe/Rome', '2025-06-12 13:45:00', '2026-03-04 16:00:00', 5),

-- 波兰
('visitor_pl_001', '79.1.2.3', 'Poland', 'Masovia', 'Warsaw', 'pl-PL', '1920x1080', 'Europe/Warsaw', '2025-05-02 10:00:00', '2026-03-06 11:30:00', 6),
('visitor_pl_002', '79.2.3.4', 'Poland', 'Lesser Poland', 'Krakow', 'pl-PL', '2560x1440', 'Europe/Warsaw', '2025-06-18 14:30:00', '2026-03-03 15:15:00', 4),

-- 瑞典
('visitor_se_001', '185.1.2.3', 'Sweden', 'Stockholm', 'Stockholm', 'sv-SE', '1920x1080', 'Europe/Stockholm', '2025-04-28 11:00:00', '2026-03-06 12:30:00', 7),
('visitor_se_002', '185.2.3.4', 'Sweden', 'Västra Götaland', 'Gothenburg', 'sv-SE', '2560x1440', 'Europe/Stockholm', '2025-06-14 15:15:00', '2026-03-03 09:45:00', 4),

-- 土耳其
('visitor_tr_001', '78.1.2.3', 'Turkey', 'Istanbul', 'Istanbul', 'tr-TR', '1920x1080', 'Europe/Istanbul', '2025-05-08 12:00:00', '2026-03-06 14:00:00', 6),
('visitor_tr_002', '78.2.3.4', 'Turkey', 'Ankara', 'Ankara', 'tr-TR', '2560x1440', 'Europe/Istanbul', '2025-06-25 10:30:00', '2026-03-03 11:15:00', 4),

-- 墨西哥
('visitor_mx_001', '189.1.2.3', 'Mexico', 'Mexico City', 'Mexico City', 'es-MX', '1920x1080', 'America/Mexico_City', '2025-04-12 11:30:00', '2026-03-05 14:45:00', 5),
('visitor_mx_002', '189.2.3.4', 'Mexico', 'Jalisco', 'Guadalajara', 'es-MX', '2560x1440', 'America/Mexico_City', '2025-05-28 09:00:00', '2026-03-02 12:30:00', 3);

-- ============================================
-- 第七部分：页面访问数据（用于详细统计）
-- ============================================

INSERT INTO page_views (visitor_id, session_id, page_path, page_title, referrer, device_type, browser, os, created_at) VALUES
-- 中国访客
('visitor_cn_001', 'session_cn_001', '/', 'MyBlog - 个人博客', NULL, 'desktop', 'Chrome', 'Windows', '2025-04-05 09:00:00'),
('visitor_cn_001', 'session_cn_001', '/articles', '文章列表 - MyBlog', '/', 'desktop', 'Chrome', 'Windows', '2025-04-05 09:05:00'),
('visitor_cn_001', 'session_cn_001', '/articles/react-hooks', 'React Hooks 深度解析', '/articles', 'desktop', 'Chrome', 'Windows', '2025-04-05 09:10:00'),
('visitor_cn_002', 'session_cn_002', '/', 'MyBlog - 个人博客', 'google.com', 'desktop', 'Chrome', 'macOS', '2025-05-12 10:15:00'),
('visitor_cn_002', 'session_cn_002', '/articles/typescript-5', 'TypeScript 5.0 新特性', '/', 'desktop', 'Chrome', 'macOS', '2025-05-12 10:20:00'),
('visitor_cn_003', 'session_cn_003', '/', 'MyBlog - 个人博客', 'baidu.com', 'mobile', 'Safari', 'iOS', '2025-06-20 14:30:00'),
('visitor_cn_003', 'session_cn_003', '/articles/nextjs-14', 'Next.js 14 完全指南', '/', 'mobile', 'Safari', 'iOS', '2025-06-20 14:35:00'),
('visitor_cn_004', 'session_cn_004', '/articles/css-grid', 'CSS Grid 完全指南', 'bing.com', 'desktop', 'Edge', 'Windows', '2025-07-08 11:00:00'),
('visitor_cn_005', 'session_cn_005', '/', 'MyBlog - 个人博客', NULL, 'desktop', 'Firefox', 'Linux', '2025-08-15 09:30:00'),
('visitor_cn_005', 'session_cn_005', '/messages', '留言板 - MyBlog', '/', 'desktop', 'Firefox', 'Linux', '2025-08-15 09:35:00'),

-- 美国访客
('visitor_us_001', 'session_us_001', '/', 'MyBlog - 个人博客', 'google.com', 'desktop', 'Chrome', 'macOS', '2025-03-10 08:30:00'),
('visitor_us_001', 'session_us_001', '/articles/react-hooks', 'React Hooks 深度解析', '/', 'desktop', 'Chrome', 'macOS', '2025-03-10 08:35:00'),
('visitor_us_001', 'session_us_001', '/articles/nextjs-14', 'Next.js 14 完全指南', '/articles/react-hooks', 'desktop', 'Chrome', 'macOS', '2025-03-10 08:50:00'),
('visitor_us_002', 'session_us_002', '/articles/typescript-5', 'TypeScript 5.0 新特性', 'twitter.com', 'desktop', 'Chrome', 'Windows', '2025-04-15 11:00:00'),
('visitor_us_002', 'session_us_002', '/articles/vue-3', 'Vue 3 Composition API', '/articles/typescript-5', 'desktop', 'Chrome', 'Windows', '2025-04-15 11:20:00'),
('visitor_us_003', 'session_us_003', '/', 'MyBlog - 个人博客', 'github.com', 'desktop', 'Chrome', 'macOS', '2025-05-20 09:15:00'),
('visitor_us_003', 'session_us_003', '/articles/vite', 'Vite 构建性能优化', '/', 'desktop', 'Chrome', 'macOS', '2025-05-20 09:20:00'),
('visitor_us_004', 'session_us_004', '/articles/tailwind', 'Tailwind CSS 指南', 'reddit.com', 'mobile', 'Safari', 'iOS', '2025-06-25 14:00:00'),
('visitor_us_005', 'session_us_005', '/articles/performance', '前端性能优化指南', NULL, 'desktop', 'Firefox', 'Windows', '2025-07-30 10:45:00'),
('visitor_us_006', 'session_us_006', '/', 'MyBlog - 个人博客', 'google.com', 'desktop', 'Edge', 'Windows', '2025-08-18 13:30:00'),

-- 日本访客
('visitor_jp_001', 'session_jp_001', '/articles/react-hooks', 'React Hooks 深度解析', 'google.co.jp', 'desktop', 'Chrome', 'macOS', '2025-04-08 10:00:00'),
('visitor_jp_001', 'session_jp_001', '/articles', '文章列表 - MyBlog', '/articles/react-hooks', 'desktop', 'Chrome', 'macOS', '2025-04-08 10:20:00'),
('visitor_jp_002', 'session_jp_002', '/articles/css-grid', 'CSS Grid 完全指南', NULL, 'desktop', 'Safari', 'macOS', '2025-05-15 14:30:00'),
('visitor_jp_003', 'session_jp_003', '/', 'MyBlog - 个人博客', 'yahoo.co.jp', 'mobile', 'Safari', 'iOS', '2025-06-22 09:00:00'),

-- 韩国访客
('visitor_kr_001', 'session_kr_001', '/', 'MyBlog - 个人博客', 'google.co.kr', 'desktop', 'Chrome', 'Windows', '2025-04-12 11:30:00'),
('visitor_kr_001', 'session_kr_001', '/articles/nextjs-14', 'Next.js 14 完全指南', '/', 'desktop', 'Chrome', 'Windows', '2025-04-12 11:35:00'),
('visitor_kr_002', 'session_kr_002', '/articles/typescript-5', 'TypeScript 5.0 新特性', 'naver.com', 'desktop', 'Chrome', 'macOS', '2025-05-28 15:00:00'),
('visitor_kr_003', 'session_kr_003', '/articles/vue-3', 'Vue 3 Composition API', NULL, 'mobile', 'Chrome', 'Android', '2025-07-10 09:15:00'),

-- 德国访客
('visitor_de_001', 'session_de_001', '/articles/react-hooks', 'React Hooks 深度解析', 'google.de', 'desktop', 'Firefox', 'Linux', '2025-03-25 13:00:00'),
('visitor_de_001', 'session_de_001', '/articles/async-js', 'JavaScript 异步编程', '/articles/react-hooks', 'desktop', 'Firefox', 'Linux', '2025-03-25 13:15:00'),
('visitor_de_002', 'session_de_002', '/', 'MyBlog - 个人博客', 'linkedin.com', 'desktop', 'Chrome', 'macOS', '2025-05-02 10:15:00'),
('visitor_de_003', 'session_de_003', '/articles/zustand', 'Zustand 状态管理', NULL, 'desktop', 'Chrome', 'Windows', '2025-06-18 15:30:00'),

-- 英国访客
('visitor_uk_001', 'session_uk_001', '/', 'MyBlog - 个人博客', 'google.co.uk', 'desktop', 'Chrome', 'macOS', '2025-04-03 09:30:00'),
('visitor_uk_001', 'session_uk_001', '/articles/micro-frontend', '微前端架构实践', '/', 'desktop', 'Chrome', 'macOS', '2025-04-03 09:40:00'),
('visitor_uk_002', 'session_uk_002', '/articles/performance', '前端性能优化指南', 'twitter.com', 'desktop', 'Safari', 'macOS', '2025-05-20 11:45:00'),
('visitor_uk_003', 'session_uk_003', '/articles/security', '前端安全攻防', NULL, 'mobile', 'Safari', 'iOS', '2025-07-05 14:00:00'),

-- 法国访客
('visitor_fr_001', 'session_fr_001', '/articles/css-grid', 'CSS Grid 完全指南', 'google.fr', 'desktop', 'Chrome', 'Windows', '2025-04-18 10:30:00'),
('visitor_fr_001', 'session_fr_001', '/articles/tailwind', 'Tailwind CSS 指南', '/articles/css-grid', 'desktop', 'Chrome', 'Windows', '2025-04-18 10:45:00'),
('visitor_fr_002', 'session_fr_002', '/', 'MyBlog - 个人博客', NULL, 'desktop', 'Firefox', 'Linux', '2025-06-02 14:15:00'),
('visitor_fr_003', 'session_fr_003', '/articles/testing', 'React 组件测试实战', 'duckduckgo.com', 'desktop', 'Chrome', 'macOS', '2025-07-18 09:00:00'),

-- 印度访客
('visitor_in_001', 'session_in_001', '/', 'MyBlog - 个人博客', 'google.co.in', 'desktop', 'Chrome', 'Windows', '2025-03-15 06:00:00'),
('visitor_in_001', 'session_in_001', '/articles/react-hooks', 'React Hooks 深度解析', '/', 'desktop', 'Chrome', 'Windows', '2025-03-15 06:05:00'),
('visitor_in_001', 'session_in_001', '/articles/nextjs-14', 'Next.js 14 完全指南', '/articles/react-hooks', 'desktop', 'Chrome', 'Windows', '2025-03-15 06:20:00'),
('visitor_in_002', 'session_in_002', '/articles/typescript-5', 'TypeScript 5.0 新特性', 'linkedin.com', 'desktop', 'Chrome', 'macOS', '2025-04-28 11:30:00'),
('visitor_in_003', 'session_in_003', '/articles/async-js', 'JavaScript 异步编程', NULL, 'mobile', 'Chrome', 'Android', '2025-06-10 09:45:00'),
('visitor_in_004', 'session_in_004', '/', 'MyBlog - 个人博客', 'twitter.com', 'desktop', 'Edge', 'Windows', '2025-07-25 15:00:00'),

-- 澳大利亚访客
('visitor_au_001', 'session_au_001', '/articles/nextjs-14', 'Next.js 14 完全指南', 'google.com.au', 'desktop', 'Chrome', 'macOS', '2025-04-01 07:30:00'),
('visitor_au_001', 'session_au_001', '/articles/vite', 'Vite 构建性能优化', '/articles/nextjs-14', 'desktop', 'Chrome', 'macOS', '2025-04-01 07:45:00'),
('visitor_au_002', 'session_au_002', '/', 'MyBlog - 个人博客', NULL, 'desktop', 'Safari', 'macOS', '2025-05-16 12:00:00'),
('visitor_au_003', 'session_au_003', '/articles/performance', '前端性能优化指南', 'reddit.com', 'mobile', 'Safari', 'iOS', '2025-07-02 10:15:00'),

-- 巴西访客
('visitor_br_001', 'session_br_001', '/articles/react-hooks', 'React Hooks 深度解析', 'google.com.br', 'desktop', 'Chrome', 'Windows', '2025-04-05 14:30:00'),
('visitor_br_001', 'session_br_001', '/messages', '留言板 - MyBlog', '/articles/react-hooks', 'desktop', 'Chrome', 'Windows', '2025-04-05 14:45:00'),
('visitor_br_002', 'session_br_002', '/articles/css-grid', 'CSS Grid 完全指南', NULL, 'desktop', 'Firefox', 'Linux', '2025-05-22 10:00:00'),
('visitor_br_003', 'session_br_003', '/', 'MyBlog - 个人博客', 'twitter.com', 'mobile', 'Chrome', 'Android', '2025-07-08 16:15:00'),

-- 俄罗斯访客
('visitor_ru_001', 'session_ru_001', '/', 'MyBlog - 个人博客', 'yandex.ru', 'desktop', 'Chrome', 'Windows', '2025-03-28 11:00:00'),
('visitor_ru_001', 'session_ru_001', '/articles/typescript-5', 'TypeScript 5.0 新特性', '/', 'desktop', 'Chrome', 'Windows', '2025-03-28 11:10:00'),
('visitor_ru_002', 'session_ru_002', '/articles/vue-3', 'Vue 3 Composition API', 'google.ru', 'desktop', 'Firefox', 'Linux', '2025-05-12 15:30:00'),
('visitor_ru_003', 'session_ru_003', '/articles/monitoring', '前端监控体系', NULL, 'desktop', 'Chrome', 'macOS', '2025-06-28 09:45:00');

-- ============================================
-- 模拟数据插入完成！
-- ============================================
-- 新增数据统计：
-- - 国际化留言：80 条（覆盖 30+ 国家，多语言）
-- - 访客数据：55 条（用于地域分布统计）
-- - 页面访问：50+ 条（用于详细分析）
-- ============================================
