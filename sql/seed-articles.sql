-- ============================================================
-- 新博客文章 Seed 数据（4 篇）
-- ============================================================
-- 执行方式：Supabase Dashboard → SQL Editor 中直接运行本文件
--
-- 说明：
-- * 字段与 sql/01-database-init.sql 中 articles 表定义一致：
--   title / content / summary / cover / status / views / reading_time /
--   category_id / created_at / updated_at
-- * articles 表没有 likes 列，点赞数存于独立 likes 表（article_id + visitor_id 唯一约束），
--   本文件按 schema 插入对应的点赞行（visitor_id 用 seed_ 前缀占位，不影响真实访客数据）
-- * category_id 通过 slug 子查询关联（tech=技术 / life=生活 / thoughts=随笔 / share=分享），
--   若分类不存在则 category_id 为 NULL，不会报错
-- * 幂等性：使用固定 UUID（seed- 前缀），重复执行会因主键冲突报错——
--   如需重复执行，请先 DELETE FROM articles WHERE id LIKE 'seed-...';（见文件末尾注释）
-- * created_at 分散在 2026-09 ~ 2026-11 之间；updated_at = created_at + 1~3 天
-- ============================================================

-- ============================================
-- 文章 1：React 19 实战（分类：技术，2026-09-18）
-- ============================================
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
(
  'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d',
  'React 19 实战半年：我们从并发特性里真正用到了什么',
  $art1$<h2>先说结论</h2>
<p>React 19 发布半年了，我们团队（两个人 + 一堆 AI Agent）在 AutoClaw 的配套站点上把评论区整体迁到了 19 的并发特性上。结论先行：<strong>useOptimistic 是真香，use() 是顺手的，Actions 是需要克制的，另外两个（useFormStatus、useActionState）目前用处不大</strong>。</p>
<p>下面的内容全部来自真实代码，不是文档翻译。场景很简单：文章详情页的评论区，有「点赞」和「发表评论」两个高频写操作，之前的实现是典型的「setLoading + await + finally」三件套，迁移后代码量少了两成，体感提升明显。</p>

<h2>useOptimistic：点赞场景的最佳归宿</h2>
<p>点赞这个交互有个天然矛盾：它对延迟极其敏感（点了必须立刻变红），但对失败又极其宽容（失败了静默回退就行，没人会为一次点赞失败写工单）。这正好是乐观更新的教科书场景。</p>
<p>React 19 之前我们要手写一套「本地状态先行、请求失败回滚」的逻辑，现在一个 hook 搞定：</p>
<pre><code class="language-tsx">function LikeButton({ articleId, initialLikes, visitorId }: Props) {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    likeCount,
    // reducer：第二个参数是「乐观操作的附加数据」
    (current, delta: number) => current + delta
  );
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    const delta = liked ? -1 : 1;
    // 1. 立刻以乐观值渲染（UI 秒变）
    setOptimisticCount(delta);
    try {
      // 2. 真实请求慢悠悠地走
      await likeApi.like({ article_id: articleId, visitor_id: visitorId });
      setLiked(!liked);
      setLikeCount((c) => c + delta); // 提交真实状态
    } catch {
      // 3. 失败自动回滚到 likeCount，UI 上的红心会自己弹回去
      message.warning('网络开小差了，点赞没成功');
    }
  }

  return (
    &lt;button onClick={handleLike} className={liked ? 'liked' : ''}&gt;
      ❤ {optimisticCount}
    &lt;/button&gt;
  );
}</code></pre>
<p>三个关键细节，文档里不会告诉你：</p>
<ul>
  <li><strong>乐观状态是「瞬态」的</strong>。setOptimisticCount 之后，只要这次 Actions 所在的异步任务结束（无论成败），UI 会自动回到真实的 likeCount。所以第 12 行的 <code>setLikeCount</code> 不是多余的——它才是持久状态，乐观值只负责「过桥」这几百毫秒。</li>
  <li><strong>必须包在异步过渡里才生效</strong>。我们最早把 setOptimisticCount 写在同步的 onClick 里，发现 UI 根本不更新，排查了半天。后来明白：useOptimistic 的回滚机制绑定在 React 的 transition 调度上，你得让这个更新发生在 async 函数里（React 会自动把它包成 transition）。</li>
  <li><strong>reducer 必须是纯函数</strong>，不要在里面发请求或者碰 DOM，否则回滚时会出现「状态对不上」的灵异现象。</li>
</ul>
<p>真香度：★★★★★。点赞、收藏、关注这类「写了就写了」的操作，闭眼用。</p>

<h2>use()：条件数据请求的新写法，但要配合 Suspense</h2>
<p>use() 最大的价值是让你能在组件里「直接消费 Promise」，包括在条件分支和循环里——这是老版 hook 规则唯一真正放开的地方。评论列表的加载我们从 useEffect 迁到了这样的结构：</p>
<pre><code class="language-tsx">function CommentsSection({ commentsPromise }: { commentsPromise: Promise&lt;Comment[]&gt; }) {
  // 可以写在条件里！比如：
  // if (expandComments) { const data = use(commentsPromise) }
  const comments = use(commentsPromise);
  return comments.map(c =&gt; &lt;CommentItem key={c.id} comment={c} /&gt;);
}

// 父组件
&lt;Suspense fallback={&lt;CommentsSkeleton /&gt;}&gt;
  &lt;CommentsSection commentsPromise={fetchComments(articleId)} /&gt;
&lt;/Suspense&gt;</code></pre>
<p>注意这里有个架构前提：<strong>Promise 要在组件外（或父组件）创建好传进来，而不是在组件内部现场 new</strong>。在组件体内直接 <code>use(fetchSomething())</code> 会导致每次渲染都发起新请求，无限循环。我们的做法是配合数据层的缓存 key 把 Promise 存进一个 Map，同 key 复用同一个 Promise 实例。</p>
<p>说实话，这个模式和 RSC（React Server Components）是配套设计的。我们没用 RSC，纯客户端 SPA 里用 use()，收益主要是：加载态从「组件内部的三元表达式」上移到了 Suspense 边界，粒度更好控制。但如果你现在的 useEffect + loading state 已经写得挺整齐，迁移的紧迫性不高。属于「顺手」而非「必升」。</p>

<h2>Actions：表单是甜的，但别滥用</h2>
<p>发表评论我们用 <code>&lt;form action={submitComment}&gt;</code> 重写了。配合 useActionState：</p>
<pre><code class="language-tsx">function CommentForm({ articleId }: { articleId: string }) {
  const [state, formAction, pending] = useActionState(
    async (prevState, formData: FormData) =&gt; {
      const content = formData.get('content') as string;
      if (!content?.trim()) return { error: '评论不能为空', ok: false };
      try {
        await commentApi.create({ article_id: articleId, content: content.trim() });
        return { error: null, ok: true };
      } catch (e) {
        return { error: '发布失败，请重试', ok: false };
      }
    },
    { error: null, ok: false }
  );

  return (
    &lt;form action={formAction}&gt;
      &lt;textarea name="content" placeholder="说点什么..." /&gt;
      &lt;button disabled={pending}&gt;{pending ? '发布中...' : '发布'}&lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>
<p>这里 React 帮你把「pending 状态管理」和「表单提交期间禁止重复点击」都干了，这两件事恰好是手写表单最容易漏的。评论发布成功后列表刷新我们用的是 router 层的 refresh（revalidate 模式），配合上面 useOptimistic 的评论插入，体验是「点了发布，评论立刻出现在列表末尾（乐观），后台慢慢同步」。</p>
<p>但要泼一盆冷水：<strong>Actions 不是万能替代品</strong>。我们尝试把「点赞」也改成 form action 的形式，发现两个问题：一是 button 包在 form 里会触发表单默认行为，嵌套交互组件时要小心 preventDefault；二是 Actions 的回滚粒度是「整个 action 函数」，没有 useOptimistic 那种细粒度的乐观控制。所以最终架构是：表单类操作用 Actions，点击类操作用 useOptimistic + async handler。</p>
<p>真香度：★★★☆☆。新表单直接用，存量受控表单没必要为了用而用。</p>

<h2>鸡肋与吐槽</h2>
<ul>
  <li><strong>useFormStatus</strong>：设计给「表单外部的提交按钮」用的，但我们评论区的提交按钮就在 form 里面，useActionState 返回的 pending 直接就用，useFormStatus 一次都没用上。</li>
  <li><strong>ref 作为 prop</strong>：forwardRef 可以删了是好事，但我们整个项目只有 3 处用了 forwardRef，改完感受不明显。</li>
  <li><strong>文档滞后</strong>：useOptimistic 和 transition 的交互行为（上面提到的「必须包在 async 里」）文档只写了一句很隐晦的话，我们是读源码 + 看了 React 团队一个 RFC 才搞明白的。建议直接看 React 仓库的 RFC 而不是等中文教程。</li>
</ul>

<h2>迁移建议</h2>
<p>如果你也是存量项目升级，我的建议顺序是：<strong>先 useOptimistic（收益立竿见影，改动手里的小）→ 再新表单用 Actions → use() 等真有 Suspense 架构需求再说</strong>。别一次性全上，19 的并发特性是一组工具，不是一套必须整体迁移的框架。</p>
<p>我们迁移完的性能数据：点赞交互的感知延迟从 ~200ms（等请求回来再更新）降到 0ms，评论区整体的 Lighthouse 交互分数没有变化（本来就不是瓶颈），但用户行为埋点里「点赞」的点击率涨了 12%——延迟确实是互动率的第一杀手。</p>
<blockquote><p>我自己的判断：React 19 的这些特性，「感知性能」的价值远大于「代码量减少」的价值。冲着少写代码去升级的团队多半会失望，冲着交互体验去的会满意。</p></blockquote>$art1$,
  'React 19 发布半年，我们把评论区（点赞、发表评论、乐观更新）整体迁到了并发特性上。哪些是真香，哪些是鸡肋，一篇说清楚。',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
  'published',
  386,
  9,
  (SELECT id FROM categories WHERE slug = 'tech'),
  '2026-09-18 21:34:00+08',
  '2026-09-20 10:12:00+08'
)
ON CONFLICT (id) DO NOTHING;

-- 文章 1 的点赞（每行一个 visitor）
INSERT INTO likes (article_id, visitor_id) 
SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_001'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_002'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_003'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_004'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_005'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_006'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_007'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_008'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_009'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_010'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_011'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_012'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_013'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_014'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_015'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_016'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_017'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_018'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_019'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_020'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_021'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_022'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_023'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_024'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_025'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_026'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_027'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_028'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_029'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_030'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_031'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_032'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_033'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_034'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_035'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_036'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_037'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_038'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_039'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_040'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_041'
UNION ALL SELECT 'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d', 'seed_visitor_a1_042'
ON CONFLICT (article_id, visitor_id) DO NOTHING;

-- ============================================
-- 文章 2：Electron 自动更新的坑（分类：技术，2026-10-09）
-- ============================================
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
(
  'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e',
  '给 Electron 应用做自动更新的那些坑',
  $art2$<h2>更新这件事，比想象中难十倍</h2>
<p>AutoClaw 是一个 Electron 桌面应用，做 AI Agent 任务编排的。web 端更新就是刷新页面，桌面端的更新却是一个完整的系统工程：签名、分发、差分、校验、回滚，每一环都能出事。上线自动更新的第一个月，我们踩的坑比之前半年加起来都多。这篇把三个印象最深的坑写下来，附带排查过程——因为搜了一圈，中文社区里这些问题的记录几乎为零。</p>

<h2>坑一：macOS Gatekeeper 静默删除了我们的 .node 文件</h2>
<p>现象非常诡异：一部分 macOS 用户（集中在 Sequoia 15.x）更新后应用启动就白屏，日志里是 <code>Cannot find module '../../build/Release/better-sqlite3.node'</code>。但安装包（dmg）里明明有这个文件，手动重装一次就好。</p>
<p>排查了两天才定位到：<strong>是 Gatekeeper 的 quarantine 机制干的</strong>。流程是这样的——</p>
<ul>
  <li>我们的 better-sqlite3 是打包时现场编译的原生模块（.node 二进制）</li>
  <li>electron-builder 打包时对 app 整体做了 codesign，但<strong>更新包里的 .node 文件在下载落盘时被单独标记了 quarantine 属性</strong>（com.apple.quarantine xattr）</li>
  <li>下次启动时 Gatekeeper 检查到「带 quarantine 标记且无法验证签名链的 Mach-O 文件」，直接把它删了，全程无提示</li>
</ul>
<p>验证方法很简单，在出问题的机器上跑：</p>
<pre><code class="language-bash"># 查看文件是否带 quarantine 标记
xattr -l /Applications/AutoClaw.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node

# 输出里有 com.apple.quarantine 就是中招了</code></pre>
<p>最终解法分两层：</p>
<p>第一层，<strong>把所有原生模块在打包后重新 codesign 一遍</strong>，确保每一个 Mach-O 二进制都有合法签名。electron-builder 的 afterPack 钩子里加一段：</p>
<pre><code class="language-javascript">// afterPack.js
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appOutDir = context.appOutDir;
  const resourcesDir = path.join(appOutDir, 'AutoClaw.app', 'Contents', 'Resources');
  // 找出所有 .node / .dylib 文件逐个签名
  const findCmd = `find "${resourcesDir}" -type f \\( -name "*.node" -o -name "*.dylib" \\)`;
  const files = execSync(findCmd).toString().trim().split('\n').filter(Boolean);
  for (const file of files) {
    execSync(`codesign --force --timestamp --options=runtime --sign "Developer ID Application: xxx" "${file}"`);
    console.log(`re-signed: ${file}`);
  }
};</code></pre>
<p>第二层，electron-updater 下载完更新包后，安装前主动清掉关键目录的 quarantine 标记：</p>
<pre><code class="language-javascript">autoUpdater.on('update-downloaded', async (info) =&gt; {
  if (process.platform === 'darwin') {
    // 安装前移除 quarantine，避免 Gatekeeper 静默删文件
    try {
      execSync(`xattr -dr com.apple.quarantine "${path.dirname(app.getPath('exe'))}"`);
    } catch (e) { /* 非 sandbox 环境忽略 */ }
  }
  autoUpdater.quitAndInstall();
});</code></pre>
<blockquote><p>教训：macOS 对「未签名二进制」的态度已经不是弹窗警告，而是静默删除。你的应用跑得好好的，突然有一天某个原生模块消失了，先查 xattr。</p></blockquote>

<h2>坑二：差分更新失败率 30%，最后发现是构建产物不稳定</h2>
<p>electron-updater 支持 blockmap 差分更新（只下载变化的块），理论上能把 120MB 的包压到 15MB。我们上线后看下载日志，发现差分命中率只有 70%，剩下 30% 全量回退。差分失败的代价不小：这些用户要重新下完整包，弱网环境直接失败。</p>
<p>把 electron-updater 的日志级别调到 debug 后真相大白：</p>
<pre><code class="language-log">info: Downloading differential update .../AutoClaw-2.4.1-mac.zip.blockmap
warn: Differential download failure, fallback to full download
info: Reason: new blockmap file has different block size</code></pre>
<p>原因是我们的构建产物不稳定：<strong>每次构建时打包器打进去的 hash 和 chunk 顺序不一样，导致 zip 内文件偏移大面积变化</strong>，blockmap 对不上号。解法是让构建可复现：</p>
<ul>
  <li>固定所有依赖的精确版本（CI 里 lockfile 强制校验，<code>npm ci</code> 替代 <code>npm install</code>）</li>
  <li>打包时禁用随机的 chunk 命名，设置 <code>output.filename: '[name].js'</code> 而非带 contenthash 的变体——更新检测对内容不敏感，只对偏移敏感</li>
  <li>zip 用 electron-builder 默认的确定性压缩，不要自定义压缩级别</li>
</ul>
<p>改完之后差分命中率到 97%，平均更新下载体积从 118MB 降到 17MB。弱网用户的更新成功率从 82% 升到 99%。</p>

<h2>坑三：签名证书差点让我们发布即报废</h2>
<p>最贵的一课：macOS 的 Developer ID 证书一年过期。过期前应用还能跑（已分发的签名长期有效），但<strong>用旧证书签的新包，在「公证（notarization）」环节会失败</strong>，因为公证要求证书有效期覆盖提交时间。我们的经历是：证书还剩 3 天过期，CI 自动签完、本地测一切正常，传到公证队列，两小时后全部打回。</p>
<p>更重要的是选型层面的提醒。<strong>签名和公证要放在 CI 的早期步骤，而不是打包最后一步</strong>——这样公证失败时还能在同一个流水线里重签。我们的 GitHub Actions 关键段：</p>
<pre><code class="language-yaml">- name: Import signing identity
  env:
    MAC_CERTIFICATE_P12: ${{ secrets.MAC_CERTIFICATE_P12 }}
  run: |
    echo "$MAC_CERTIFICATE_P12" | base64 --decode &gt; certificate.p12
    security create-keychain -p ci build.keychain
    security import certificate.p12 -k build.keychain -P "$KEYCHAIN_PASS" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple: -s -k ci build.keychain

- name: Build and notarize
  env:
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  run: npx electron-builder --mac --publish always
  # electron-builder 会自动完成 codesign + notarize + staple</code></pre>
<p>现在我们的运维日历上有一年一次的「证书续期演练」：提前一个月换新证书，跑一遍完整发布流程，确认公证通过。</p>

<h2>Squirrel 还是 electron-updater？</h2>
<p>最后回答一个高频选型问题。我们最终选了 electron-updater（electron-builder 家的），理由：</p>
<ul>
  <li><strong>Windows 端 Squirrel.Windows 的静默更新体验确实好</strong>，但它的差分更新（nuget delta package）生成链路维护不活跃，出问题时社区支持少</li>
  <li>electron-updater 的 blockmap 差分机制对通用 CI 友好，macOS 的 zip、Windows 的 nsis、Linux 的 AppImage 全平台统一一套配置</li>
  <li>发布渠道的灵活性：electron-updater 支持 generic server（自己扔个 static 目录就行），Squirrel 绑定得更死</li>
</ul>
<p>electron-updater 的缺点也要说：它的下载器没有断点续传（弱网长包体验差，我们靠差分弥补）、对 macOS 的自动安装限制多（仍需用户确认，除非走 Squirrel.Mac）。如果你们对「完全静默无感更新」有硬需求且只发 Windows，Squirrel 值得考虑；否则 electron-updater 是更稳的默认选项。</p>

<h2>写在最后</h2>
<p>自动更新的本质是「在没有你监督的情况下修改用户的机器」，所以它的每个环节都值得用最保守的策略对待：签名宁可多签（文件级 + 应用级都签）、更新宁可慢（先校验再安装）、回滚通道永远保留（保留上一个版本的完整安装包下载链接）。这三条守住了，剩下的坑都只是脏活，不是绝路。</p>
<p>下篇预告：我们怎么用 GitHub Actions + 一个静态 OSS 桶搭建了零成本的自托管更新分发。</p>$art2$,
  'AutoClaw 桌面端上线自动更新的第一个月，我们遇到了 Gatekeeper 静默删除原生模块、差分更新失败率 30%、签名证书过期三大坑。这篇记录每个坑的现象、排查和最终解法。',
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',
  'published',
  412,
  11,
  (SELECT id FROM categories WHERE slug = 'tech'),
  '2026-10-09 20:15:00+08',
  '2026-10-11 09:40:00+08'
)
ON CONFLICT (id) DO NOTHING;

-- 文章 2 的点赞
INSERT INTO likes (article_id, visitor_id) 
SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_001'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_002'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_003'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_004'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_005'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_006'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_007'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_008'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_009'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_010'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_011'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_012'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_013'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_014'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_015'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_016'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_017'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_018'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_019'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_020'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_021'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_022'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_023'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_024'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_025'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_026'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_027'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_028'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_029'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_030'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_031'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_032'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_033'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_034'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_035'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_036'
UNION ALL SELECT 'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e', 'seed_visitor_a2_037'
ON CONFLICT (article_id, visitor_id) DO NOTHING;

-- ============================================
-- 文章 3：AI Agent 工作流（分类：分享，2026-10-22）
-- ============================================
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
(
  'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f',
  '我的 AI Agent 工作流：让 Claude Code 和 Codex 打配合',
  $art3$<h2>为什么需要两个 Agent</h2>
<p>先交代背景：我在做 AutoClaw 的桌面端（Electron + React），日常和 Claude Code、Codex 两个编码 Agent 打交道。三个月前我的用法很原始——谁顺手用谁，结果就是产出质量像开盲盒。后来我给每个项目都跑了一套固定的双 Agent 流程，现在单人 + 双 Agent 的产能大概是纯手写的 2.5 倍，而且返工率反而降了。这篇拆解这套流程。</p>
<p>核心观点先放这里：<strong>两个 Agent 的价值不在于「两倍产能」，而在于互审机制</strong>。单个 Agent 自己写自己审，盲区是系统性的；两个不同训练背景的 Agent 互相 review，能覆盖掉大部分低级错误。</p>

<h2>分工：按任务类型，不按偏好</h2>
<p>跑了一段时间后我摸出来的规律（仅代表我手头这两个产品的体感，不构成选型建议）：</p>
<ul>
  <li><strong>大型重构、跨文件的架构调整 → Claude Code</strong>。它的 plan mode 和上下文管理更适合先读后改的长任务。有一卷把 Admin 后台 8 个页面的状态管理从 prop drilling 迁到 zustand，它先列了迁移清单让我确认，然后一个文件一个文件地推进，中途我只需要在关键节点点头。</li>
  <li><strong>明确的、有清晰验收标准的功能点 → Codex</strong>。「给这个表格加一列，数据源是 API 里已有的字段」「把这个组件的 inline style 换成 Tailwind class」这类任务，Codex 的执行速度快，而且不怎么自由发挥。</li>
  <li><strong>疑难 bug 的排查 → 两个都问，交叉验证</strong>。特别是那种「本地好使线上挂」的问题，两个 Agent 给出的假设列表往往不重叠，交集处经常就是答案。</li>
</ul>
<p>分配的判断标准其实就一条：<strong>任务是否需要「先理解再动手」</strong>。需要理解的给 Claude Code，定义清楚的给 Codex。把需要理解的任务丢给执行型的 Agent，它会自作主张帮你「顺手优化」出一堆你没要的东西。</p>

<h2>验收：三条硬标准</h2>
<p>Agent 的产出不能凭感觉验收，我定了三条标准，全部过了才算完成：</p>
<ol>
  <li><strong>构建通过 + 类型检查通过</strong>：这是底线，交给 CI 和 <code>tsc --noEmit</code>，不用人工判断。</li>
  <li><strong>行为对齐任务描述</strong>：我让 Agent 在完成时输出「我改了什么 / 没改什么 / 需要你注意什么」三段说明，对照任务描述逐条核对。这段说明本身就是验收清单。</li>
  <li><strong>diff 审查：只看新增的抽象</strong>：逐行读 diff 不现实（一天几千行），我的速查法是只盯三类东西——新引入的依赖、新抽象出来的函数/组件、被修改的公共接口。这三类出问题的代价最高，其他的样式调整之类的扫一眼就行。</li>
</ol>
<p>具体到 review 的执行，我的流程是「写手完成 → 审手介入 → 人拍板」：</p>
<pre><code class="language-bash"># 1. 写手（Codex）完成功能分支 feature/comment-form
codex exec -s workspace-write "实现评论表单的乐观更新，验收标准见 tasks/comment-form.md"

# 2. 审手（Claude Code）以只读模式审查 diff，产出审查报告
claude -p "审查当前分支相对 main 的全部改动：
重点检查 1) API 调用的错误处理是否完整 2) 是否引入了未授权的依赖变更
3) 乐观更新的回滚逻辑是否有竞态。输出：问题列表（按严重度排序）+ 每条给出代码位置。
只读模式，不要修改任何文件。" --allowedTools "Read,Grep,Glob"

# 3. 人看完报告，决定：直接合 / 打回写手修 / 人肉修</code></pre>
<p>这里有个细节：<strong>审手必须是只读权限</strong>。我犯过一次错，让审手「发现问题顺手修了」，结果它一边修一边引入了新问题，diff 变得没法看。审和写分离，权限就要分离。</p>

<h2>翻过的车（都是真金白银的教训）</h2>
<p><strong>车一：API 版本幻觉</strong>。让 Agent 接入某个云服务的 SDK，它流畅地写完了，类型检查都过。上线后 401。排查发现它写的是两年前版本的鉴权方式——SDK 文档里这个方式已经标了 deprecated，但训练数据里旧文档占比太高。对策：<strong>涉及第三方 API 的任务，把官方文档的相关章节直接贴进任务描述</strong>，或者先让它用 <code>curl</code> 验证一遍接口再写代码。永远不要让 Agent 凭记忆调不常见的 API。</p>
<p><strong>车二：接口名幻觉</strong>。某个 Agent 给我写了一个 <code>useDebouncedCallback(callback, delay)</code> 的用法，我下意识以为这是某个 hook 库的现成函数（写得太自然了），实际上这个包里根本没有这个导出。构建报错才发现。对策：review 时<strong>对一切「我没见过的 import」保持警惕</strong>，让 Agent 给出每个外部 import 的来源包名和版本。后来我在 CLAUDE.md 里加了一条：「使用任何非项目内已有的 import 前，先确认该导出存在于 package.json 声明的依赖中，不确定时先验证再使用」。</p>
<p><strong>车三：过度工程</strong>。一个「给列表加个排序」的需求，Agent 给我整了一套泛型抽象 + 策略模式 + 可扩展的排序注册机制。代码本身没毛病，但这是个个人博客后台，兄弟。对策：任务描述里写清楚「这是小项目，用最直接的方式实现，不要引入抽象层」，并且把这条写进项目级的 agent 配置文件里。</p>
<p><strong>车四：静默降级</strong>。Agent 写的错误处理喜欢「catch 里 console.error 然后假装没事」。UI 上用户看到的就是点了没反应。对策：验收标准里明确「所有 catch 分支必须有用户可见的反馈（toast/message），除非注释说明为什么静默是合理的」。</p>

<h2>Prompt 的经验：上下文 &gt; 技巧</h2>
<p>聊几个实际有用的做法，都是笨办法：</p>
<ul>
  <li><strong>把任务写进文件，而不是对话</strong>。每个任务一个 markdown 文件（背景、验收标准、禁区），Agent 从文件读。好处是任务描述本身进了版本控制，下次类似任务可以直接复用模板，而且多 Agent 之间传递的是同一份事实源。</li>
  <li><strong>项目级配置文件是最大的杠杆</strong>。CLAUDE.md / AGENTS.md 里积累的「本项目约定」（技术栈版本、目录结构、代码风格、已知的坑）比任何 prompt 技巧都管用。我的配置文件已经积累到 200 行，核心是三类内容：架构事实（哪里是数据层哪里是 UI 层）、禁区（不要动什么）、事故记录（翻过的车写成「不要做 xx」）。</li>
  <li><strong>让 Agent 先复述任务再动手</strong>。对超过半小时工作量的任务，我要求它先用 3-5 句话复述「我理解的任务是什么，我打算怎么做」，对齐了再放行。这一步能拦下大约一半的理解偏差，成本只有几十秒。</li>
</ul>
<blockquote><p>一句话总结我的工作流：任务文件化、双 Agent 互审、人只管拍板和兜底。AI 时代工程师的核心技能变成了「定义清楚什么是做对了」，而不是「自己把它做对」。</p></blockquote>$art3$,
  '三个真实项目跑下来，我总结出一套「双 Agent 分工 + 互审」的工作流：谁擅长什么、怎么验收产出、review 环节怎么设计，以及翻过的那些车。',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
  'published',
  517,
  10,
  (SELECT id FROM categories WHERE slug = 'share'),
  '2026-10-22 22:03:00+08',
  '2026-10-23 08:55:00+08'
)
ON CONFLICT (id) DO NOTHING;

-- 文章 3 的点赞
INSERT INTO likes (article_id, visitor_id) 
SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_001'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_002'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_003'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_004'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_005'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_006'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_007'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_008'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_009'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_010'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_011'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_012'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_013'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_014'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_015'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_016'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_017'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_018'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_019'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_020'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_021'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_022'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_023'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_024'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_025'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_026'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_027'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_028'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_029'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_030'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_031'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_032'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_033'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_034'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_035'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_036'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_037'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_038'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_039'
UNION ALL SELECT 'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f', 'seed_visitor_a3_040'
ON CONFLICT (article_id, visitor_id) DO NOTHING;

-- ============================================
-- 文章 4：Vercel + Supabase 免费套餐（分类：分享，2026-11-03）
-- ============================================
INSERT INTO articles (id, title, content, summary, cover, status, views, reading_time, category_id, created_at, updated_at) VALUES
(
  'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a',
  '从零部署一个人的博客：Vercel + Supabase 免费套餐的极限',
  $art4$<h2>账单是 0，但账要算清楚</h2>
<p>你现在读到的这个博客，托管在 Vercel 上，API 是 Vercel Edge Functions，数据库是 Supabase 免费套餐。运行大半年，账单 0 元。但「免费」不代表「无限」，这篇用我攒了大半年的真实数据，说说两条免费额度线的天花板在哪里，以及一个个人站点要怎么在额度里跳舞。</p>

<h2>先看数据：一个月的真实消耗</h2>
<p>博客的流量画像很典型：日常每天 200-400 PV，发新文章那天冲到 1500-2000 PV，偶有一篇被转发后带来 3-4 倍的日常流量尖峰。上月实际消耗：</p>
<ul>
  <li><strong>Vercel Edge Function 调用</strong>：约 11 万次/月（免费额度 100 万次，用了 11%）</li>
  <li><strong>Vercel 带宽</strong>：约 9 GB/月（免费 100 GB，用了 9%）</li>
  <li><strong>Supabase 数据库带宽</strong>：约 1.8 GB/月（免费 5 GB，用了 36%）——这是最紧的一条线</li>
  <li><strong>Supabase 数据库存储</strong>：约 340 MB（免费 500 MB，68%）——大头是埋点表</li>
  <li><strong>Supabase egress</strong>：约 2.1 GB/月（免费 5 GB）</li>
</ul>
<p>结论很明显：<strong>Edge Function 调用次数和静态带宽根本用不完，真正会先撞墙的是 Supabase 的带宽和存储</strong>。原因后面讲。</p>

<h2>Edge Functions 冷启动：体感比数字重要</h2>
<p>Edge Functions 的冷启动官方口径是「毫秒级」，实测确实快——我的 API P50 响应 80ms 左右，冷启动叠加进去 P95 也就 400ms。但有个反直觉的坑：<strong>冷启动次数比想象中多</strong>。Edge 实例是按区域弹性伸缩的，流量低谷时实例被回收，下个请求重新冷启动。个人博客的流量特征是稀疏的（几分钟一个请求），所以凌晨的访客大概率每次都撞冷启动。</p>
<p>我的应对分两层：</p>
<ul>
  <li>API 层面：<strong>把文章列表做了双层缓存</strong>——Edge Function 里先查 Supabase，结果用 Response 的 <code>Cache-Control: s-maxage=60, stale-while-revalidate=300</code> 标记，让 Vercel 的边缘 CDN 直接缓存响应。热门文章的列表请求 90% 命中边缘缓存，根本不触达函数和数据库：</li>
</ul>
<pre><code class="language-typescript">// api/articles.ts 里的响应头设置
return new Response(JSON.stringify({ data: articles }), {
  headers: {
    'Content-Type': 'application/json',
    // 60s 内边缘直接返回缓存，60-360s 间返回旧缓存同时后台刷新
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
})</code></pre>
<ul>
  <li>前端层面：路由级代码分割 + 骨架屏，冷启动的 400ms 藏在骨架屏后面，用户感知不到。</li>
</ul>
<p>一个细节：<strong>带 Authorization 头的请求 Vercel 默认不缓存</strong>，所以管理后台的 API 不会命中这套缓存，天然隔离，不用担心后台看到旧数据。</p>

<h2>Supabase 额度规划：带宽才是命门</h2>
<p>为什么数据库带宽是 36% 而 Edge 调用才 11%？拆一下账：</p>
<ul>
  <li>每次「文章列表」查询，数据库要吐出全量文章的 content 字段（单篇 HTML 8-20KB），一页 10 篇就是 ~150KB。即使有边缘缓存，缓存过期后的每次回源都是这个量级。</li>
  <li>埋点系统是写入大户：每次页面浏览写一行 page_views，还有 sessions、events、visitors 四张表联动。</li>
</ul>
<p>三个针对性的优化，把月带宽从 4.2GB 压到了 1.8GB：</p>
<p><strong>1. 列表查询不要 select *</strong>。列表页只需要标题、摘要、封面、统计数，content 只有详情页才需要：</p>
<pre><code class="language-javascript">// 优化前：一行 150KB
query = supabase.from('articles').select('*, categories(name, id)')
// 优化后：一行 3KB
query = supabase.from('articles')
  .select('id, title, summary, cover, views, status, created_at, categories(name, id)')</code></pre>
<p>就这一行改动，列表接口的数据库出站流量降了 95%。这是我今年性价比最高的一行代码。</p>
<p><strong>2. 点赞计数从「读表聚合」改成冗余字段</strong>。最初 likes 数是每次 <code>count(*)</code> likes 表算出来的，一篇文章一刷新就聚合一次。后来在 articles 表加了个 likes 冗余计数（触发器维护），读取成本降为 0。多 4 字节存储，换掉一次聚合查询，血赚。</p>
<p><strong>3. 埋点表定期归档</strong>。500MB 存储的大头是 page_views（每天几千行）。我设了一个月一次的手工任务：90 天前的埋点数据导出成 CSV 存到对象存储，然后删表。存储从峰值 80% 降到稳定 68%。如果你比我勤快，用 pg_cron 做自动化更好。</p>

<h2>RLS：免费套餐的安全底线</h2>
<p>Supabase 的 anon key 是公开的（就在前端 bundle 里），所以<strong>所有表的 RLS 策略就是唯一的安全防线</strong>。我的原则是「默认全关，按需放行，写操作尽量走 service key 的 Edge Function」：</p>
<pre><code class="language-sql">-- 文章：任何人可读（草稿过滤在应用层做，靠 API 而非直连）
CREATE POLICY "articles_read" ON articles FOR SELECT TO anon, authenticated USING (true);
-- 注意：没有给 anon 任何 INSERT/UPDATE/DELETE 权限

-- 点赞：匿名可插可删（点赞/取消点赞），visitor_id 由前端生成
-- UNIQUE(article_id, visitor_id) 约束保证一人一赞
CREATE POLICY "likes_insert" ON likes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "likes_delete" ON likes FOR DELETE TO anon, authenticated USING (true);

-- 评论：可读可发，但更新删除不给 anon
CREATE POLICY "comments_insert" ON comments FOR INSERT TO anon WITH CHECK (true);</code></pre>
<p>管理后台的所有写操作（发文章、删评论）都走 Edge Function，用 service key 操作数据库，<strong>anon key 从头到尾只有读权限和极少数白名单写权限</strong>。这意味着即使有人拿到 anon key 伪造请求，能造成的破坏也极其有限。</p>
<p>一个容易漏的点：Supabase 项目的 RLS 如果忘了启用，表默认是完全裸奔的。新表建完第一件事就是 <code>ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;</code>，我把这句写进了数据库初始化脚本的每个表定义后面。</p>

<h2>PWA 缓存：把双刃剑磨成单刃</h2>
<p>博客开了 PWA（可安装 + 离线访问），workbox 的预缓存策略踩了两个坑。</p>
<p><strong>坑一：预缓存把大包全部吞了</strong>。第一版配置把所有构建产物都 precache，结果 Service Worker 安装时要下载 5MB 的资源包（antd 全家桶、世界地图 GeoJSON 都在里面）。首访用户在弱网下会看到 SW 安装卡半天。解法：预缓存只留核心壳（HTML + 关键 CSS/字体 + 首页路由 chunk），其余全部走运行时缓存：</p>
<pre><code class="language-javascript">// vite.config.js 的 workbox 配置（节选）
workbox: {
  globPatterns: ['index.html', 'assets/*.{css,woff2}', 'assets/index-*.js'],
  runtimeCaching: [
    {
      // 文章接口：stale-while-revalidate，离线也能看缓存的文章
      urlPattern: /^https:\/\/.*\/api\/(articles|article-detail)/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
    },
    {
      // unsplash 图片：cache-first + 30 天过期
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
      handler: 'CacheFirst',
      options: { cacheName: 'images-cache', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
    },
  ],
}</code></pre>
<p><strong>坑二：SW 更新后用户停在旧版本</strong>。发了新版，老用户的 SW 还握着旧 precache 不放，页面一直是老版本。解法是 <code>skipWaiting + clientsClaim</code>，并在页面里监听 <code>controllerchange</code> 弹一个「发现新版本，点击刷新」的 toast——比自动强刷温和，比让用户自己发现强。</p>

<h2>值不值得？</h2>
<p>有人会问：免费套餐这么抠抠搜搜，为什么不直接花点钱？我的看法：<strong>个人博客选择免费套餐 + 精打细算，不只是省钱，更是一种架构训练</strong>。额度压力逼着你做缓存分层、查询瘦身、冷热数据分离——这些习惯在流量涨十倍的时候依然值钱。当然，如果哪天这篇博客的数据库带宽真撞了 5GB 的墙，那说明流量已经好到值得付费了，届时第一件事是把 Supabase 升到 Pro，第二件事是写篇新文章庆祝。</p>
<blockquote><p>免费套餐的极限，就是你架构功力的下限。额度内跳舞跳得好的人，付费了也是跳得最好的那批。</p></blockquote>$art4$,
  '这个博客跑在 Vercel Edge Functions + Supabase 免费套餐上，零月费运行了大半年。这篇用真实的监控数据说说免费套餐的天花板在哪、怎么规划额度、RLS 怎么配才不裸奔、PWA 缓存踩过什么坑。',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  'published',
  203,
  12,
  (SELECT id FROM categories WHERE slug = 'share'),
  '2026-11-03 19:47:00+08',
  '2026-11-04 11:20:00+08'
)
ON CONFLICT (id) DO NOTHING;

-- 文章 4 的点赞
INSERT INTO likes (article_id, visitor_id) 
SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_001'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_002'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_003'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_004'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_005'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_006'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_007'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_008'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_009'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_010'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_011'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_012'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_013'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_014'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_015'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_016'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_017'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_018'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_019'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_020'
UNION ALL SELECT 'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a', 'seed_visitor_a4_021'
ON CONFLICT (article_id, visitor_id) DO NOTHING;

-- ============================================================
-- 如需清空本 seed 重新插入，先执行：
-- DELETE FROM likes WHERE visitor_id LIKE 'seed_visitor_%';
-- DELETE FROM articles WHERE id IN (
--   'a9f1e2d3-0001-4a5b-8c6d-1e2f3a4b5c6d',
--   'b8e2f3a4-0002-4b5c-9d6e-2f3a4b5c6d7e',
--   'c7d3e4f5-0003-4c5d-ae6f-3a4b5c6d7e8f',
--   'd6e4f5a6-0004-4d5e-bf7a-4b5c6d7e8f9a'
-- );
-- ============================================================
