-- ============================================================
-- seed-articles.sql —— 4 篇博客文章种子数据
-- 执行方式：Supabase Dashboard → SQL Editor 中直接运行
-- 字段以 sql/01-database-init.sql 的 articles 表真实 schema 为准
-- （本表无 likes / is_recommend 字段，点赞数存于 likes 表，故不写入）
-- ============================================================

INSERT INTO articles (title, summary, content, cover, status, views, reading_time, created_at, updated_at) VALUES
(
  'React 19 实战半年：我们从并发特性里真正用到了什么',
  '升级 React 19 半年后盘点：useOptimistic 和 Actions 真香，use() 用了一半就撤了，use cache 还在等。附点赞、评论场景的落地代码和翻车记录。',
  $content$<h2>升级半年，先说结论</h2>
<p>今年四月，我把手头两个项目——个人博客和一个内部工单工具——升到了 React 19。当时的心态是「新特性先跑起来再说」，半年过去，回头盘点一下：真正在生产里站住脚的是 useOptimistic 和 Actions，use() 用了一半又撤了一半，剩下的并发特性基本还躺在文档里。</p>
<h2>点赞按钮：useOptimistic 的教科书场景</h2>
<p>博客文章详情页有个点赞按钮，之前的实现是很经典的「点击 → setState(loading) → await 请求 → 成功后 +1」。网络好的时候没什么，但我在地铁里刷自己的博客（是的，我会这么干）时，那个按钮会卡在转圈状态好几秒——点赞这种操作，用户根本不该感知网络延迟。</p>
<p>用 useOptimistic 重构后：</p>
<pre><code>function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (current, delta) =&gt; current + delta
  );

  async function handleClick() {
    addOptimisticLike(1); // 立刻 +1，不等请求
    try {
      const real = await likeApi.create(postId);
      startTransition(() =&gt; setLikes(real.count));
    } catch {
      toast.error(&quot;点赞失败，请重试&quot;);
    }
  }

  return &lt;button onClick={handleClick}&gt;👍 {optimisticLikes}&lt;/button&gt;;
}</code></pre>
<p>这里的关键认知是：useOptimistic 的价值不在「乐观更新」本身——手写一个临时 state 也能做到——而在于它和 React 的渲染周期绑定。乐观值活在 transition 里，请求落地后自动对齐真实值，失败后自动回滚。你不需要自己维护「乐观值什么时候被覆盖」这个状态机。</p>
<blockquote>之前手写版本我们出过一个事故：请求失败后乐观值忘记回滚，某篇文章的点赞数虚高了一整天，用户截图发群里问「这文章怎么突然火了」。这就是自己管状态机的代价。</blockquote>
<h2>评论提交：Actions + useActionState</h2>
<p>第二个真香的点是表单 Actions。之前每个表单都要写 onSubmit 三件套：preventDefault、收集表单值、手动管理 pending state。现在：</p>
<pre><code>const [state, formAction, pending] = useActionState(
  async (prev, formData) =&gt; {
    const content = String(formData.get(&quot;content&quot;) || &quot;&quot;);
    if (!content.trim()) return { error: &quot;评论不能为空&quot; };
    await commentApi.create(postId, content);
    return { error: null };
  },
  { error: null }
);

return (
  &lt;form action={formAction}&gt;
    &lt;textarea name=&quot;content&quot; /&gt;
    &lt;button disabled={pending}&gt;{pending ? &quot;发布中&quot; : &quot;发布&quot;}&lt;/button&gt;
    {state.error &amp;&amp; &lt;p className=&quot;error&quot;&gt;{state.error}&lt;/p&gt;}
  &lt;/form&gt;
);</code></pre>
<p>代码量降了大概三成，而且 textarea 配上 name 属性就能免受控组件化，表单逻辑收敛到 action 函数里，测试起来也简单——它就是个纯函数。</p>
<p>两个注意点：一是 useActionState 的 pending 是表单级的，一个组件里有多个表单时要小心别互相干扰；二是错误处理走返回值还是 throw，我们内部讨论过很久——throw 会进 error boundary，用户填了一半的评论直接丢失，所以交互类的错误统一用返回值，只有不可恢复的错误才抛。</p>
<h2>use()：用了一半就撤了</h2>
<p>use() 直接读 Promise 配合 Suspense 的写法确实优雅：</p>
<pre><code>const article = use(fetchArticle(id)); // 配合外层 &lt;Suspense fallback={&lt;Skeleton/&gt;}&gt;</code></pre>
<p>但撤掉一半的原因很现实：use() 本身没有缓存，同一个 Promise 重复传进来还是会重复请求，完整的方案要等框架层的 cache（Next 的 use cache 到现在还在 canary）。我们在纯客户端 SPA 里用它重构了文章详情的骨架屏，收益是有的，但说实话——以前 useEffect + loading flag 的写法也没难到哪里去。</p>
<p>我的结论：在纯 SPA 里，use() 目前是语法糖而不是范式。等缓存方案稳定了再全面铺开不迟。</p>
<h2>没动的地方：老将继续站岗</h2>
<p>useDeferredValue 和 useTransition 是 18 就有的，19 里没变化，工单工具里的搜索过滤场景继续用它们，没有迁移的必要。至于真正的重头戏 use cache 和 Cache Components——还在 canary，生产项目我不当小白鼠。</p>
<h2>半年后的结论</h2>
<ul>
<li><strong>真香</strong>：useOptimistic（凡「点击后本地可预判结果」的场景都值得：点赞、收藏、关注）、Actions + useActionState（表单类交互，代码量肉眼可见地降）</li>
<li><strong>观望</strong>：纯 SPA 里的 use()，等缓存生态</li>
<li><strong>建议</strong>：别为了 19 而 19。从点赞按钮开始迁移，一个下午搞定，收益立竿见影——这比通读 RFC 有用得多。</li>
</ul>$content$,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
  'published',
  386,
  6,
  '2026-09-12 10:30:00+08:00',
  '2026-09-12 10:30:00+08:00'
),
(
  '给 Electron 应用做自动更新的那些坑',
  'macOS 签名公证的正确姿势、electron-updater 配置细节，以及一次 Gatekeeper 静默删除未签名 .node 原生模块的事故复盘，附 xattr + codesign 修复方案。',
  $content$<h2>从一次「文件消失」说起</h2>
<p>AutoClaw 的桌面端用 electron-updater 做自动更新，三年用下来，Windows 侧一直平安无事，真正让我们头疼的是 macOS——尤其是那次 Gatekeeper 静默删掉原生模块的事故，排查了整整两天。这篇把 macOS 分发的坑一次说清。</p>
<h2>签名 + 公证：门槛在证书之外</h2>
<p>macOS 对外分发的完整链路是：Developer ID Application 证书签名 → notarytool 公证 → staple 票据。很多人卡在以为「签个名就完事」，实际上没有公证的 app，用户双击会被 Gatekeeper 直接拦截；而公证没过 stapler，离线环境安装又会出问题。</p>
<pre><code># 提交公证并等待结果
xcrun notarytool submit MyApp.dmg --keychain-profile &quot;notary&quot; --wait
# 把公证票据钉到安装包上
xcrun stapler staple MyApp.dmg</code></pre>
<p>electron-builder 里对应配 notarize: true 加上 appleId 相关环境变量就行，CI 里跑没问题。但有一个关键认知要先建立：<strong>公证是对整个 app bundle 的校验</strong>——任何一个内嵌的二进制（framework、dylib、.node 原生模块）签名无效，整个公证都会被拒，而报错信息只会给你一个含糊的 log ID，要去 notarytool log 里翻细节。</p>
<h2>事故：Gatekeeper 静默删除 .node 文件</h2>
<p>今年的事故值得完整复盘。现象：CI 打出来的包，本地和测试机一切正常；用户下载安装后首次启动，主功能直接报错 <code>Module did not self-register</code>，日志里还有 dlopen 失败。更诡异的是，报错说文件不存在——让用户打开 app 包检查，<code>app-builder_arm64.node</code> 和 iconv-corefoundation 里的 <code>native.node</code>，这两个文件真的没了。</p>
<p>消失的文件，这方向一开始就想偏了。我们先怀疑打包配置漏了 asarUnpack，折腾了一天 asar 相关配置，一无所获。直到在干净测试机上复现了完整链路：<strong>只要 app 带 quarantine 隔离属性</strong>（从浏览器下载的安装包都带），Gatekeeper 在首次校验时会扫描 bundle 里所有 Mach-O 二进制，凡是签名无效的可执行文件直接删除，全程无提示、无日志、不弹窗。</p>
<blockquote>根因链：electron-builder 打包时，.node 原生模块被解包到 app 目录后没有完成有效签名；dmg 整体公证时部分工具链只校验了主 binary，漏过了这些原生模块；而 macOS 15 收紧了 Gatekeeper 的校验逻辑，这个历史上的灰色地带直接变成了静默删除。本地直接 open 安装好的 app 是测不出问题的——本地路径没有 quarantine 属性。</blockquote>
<h2>修复：两步，写进 afterPack</h2>
<pre><code># 1. 清掉隔离属性（-r 递归，-c 清除全部类型）
xattr -cr &quot;MyApp.app&quot;

# 2. 对所有原生模块做 ad-hoc 重签
find &quot;MyApp.app&quot; -name &quot;*.node&quot; -exec codesign --force --sign - {} \;</code></pre>
<p><code>codesign --force --sign -</code> 是 ad-hoc 签名，不需要任何证书，作用是让每个 .node 文件有合法的签名结构。之后主 bundle 再用真证书签、走公证，一次通过。把这两行放进 electron-builder 的 afterPack hook，CI 里固化，问题再没复发。</p>
<h2>electron-updater 的配置小坑</h2>
<ul>
<li><strong>mac 必须同时发布 zip</strong>：差分更新依赖 latest-mac.json 里指向的 zip，只发 dmg 会导致更新检测异常甚至静默失败</li>
<li><strong>差分下载偶发损坏</strong>：升级后校验不过，保险起见给 disableDifferentialDownload 留个开关兜底</li>
<li><strong>别全开自动装</strong>：autoDownload + autoInstallOnAppQuit 全开会变成「用户毫无感知就被重启」，至少留一个「本次跳过」。更新提示的时机也有讲究——我们选在用户完成当前任务后的空闲点弹，转化率比启动即弹高不少</li>
<li>Windows 侧 nsis + 双签名反而省心，配置一次三年没动过</li>
</ul>
<h2>一点体会</h2>
<p>macOS 分发的本质是「持续对抗系统收紧的安全策略」——每年大版本更新都可能把昨天的正确做法变成今天的事故。这次给我的教训写进了团队 checklist：升级 Xcode 或 macOS 大版本后，必须在「带 quarantine 属性的下载安装路径」上完整回归一遍。别信本地的完美表现，用户拿到手的包，永远比你测的多一层 Gatekeeper。</p>$content$,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=600&fit=crop',
  'published',
  452,
  6,
  '2026-09-28 20:15:00+08:00',
  '2026-09-28 20:15:00+08:00'
),
(
  '我的 AI Agent 工作流：让 Claude Code 和 Codex 打配合',
  'AutoClaw 项目半年实践：任务怎么在 Claude Code 和 Codex 之间分配、交叉 review 怎么设计、AI 幻觉接口名和写错 API 版本怎么防，附任务书模板和 prompt 示例。',
  $content$<h2>我不写业务代码，已经半年了</h2>
<p>做 AutoClaw 这半年，我基本不再亲手写业务代码了。但这话的另一半是：我的日常变成了写任务书、验收、review——「AI 写代码」不等于甩手掌柜，只是工作重心从实现挪到了定义和把关。这篇分享一套跑顺了的 Claude Code + Codex 协作流。</p>
<h2>分工：按耦合度分，不按聪明度分</h2>
<p>很多人纠结「CC 和 Codex 哪个更强」，我的经验是这个问题问错了。分工标准应该是<strong>任务的耦合度</strong>：</p>
<ul>
<li><strong>Claude Code</strong>：多文件重构、跨模块改造、需要先理解现状再动手的任务。它读代码库的方式更适合建立全局理解</li>
<li><strong>Codex</strong>：边界清晰的独立任务——一个新脚本、一个独立模块、一个描述明确的 bug fix。sandbox 模式跑起来放心，不怕它越界</li>
<li><strong>我自己</strong>：架构决策、接口设计、以及一切涉及钱的和涉及删库的操作</li>
</ul>
<blockquote>「优化一下登录页」这种任务谁都不给——这不是分工问题，是任务书没写完的问题。</blockquote>
<h2>流程：任务书 → 各自跑 → 交叉 review</h2>
<h3>第一步：写任务书</h3>
<p>这是整个流程里我最花时间的环节，也是性价比最高的环节。我的模板：</p>
<pre><code>## 任务
&lt;一句话目标&gt;

## 背景
&lt;项目结构、相关文件路径、已有约定&gt;

## 边界
- 只允许改：&lt;明确的文件列表&gt;
- 禁止：git push、修改共享配置文件

## 验收
- npm run build 通过、lint 不新增 error
- &lt;具体的行为断言，逐条列出&gt;</code></pre>
<p>血泪教训：任务书写得越细，翻车率越低。模糊任务书等于让 AI 自由发挥，而 AI 自由发挥的第一反应是给你加三层抽象和五个设计模式。</p>
<h3>第二步：交叉 review</h3>
<p>A 写的代码丢给 B 看。我的 review prompt 固定成模板：</p>
<pre><code>review 这个 diff（git diff main）。
重点检查：
1. 有没有调用不存在的接口或方法（对照真实依赖的文档/类型定义）
2. 有没有改坏任务书之外的现有行为
3. 错误处理是否完整（catch 之后不能当成功继续跑）
输出：按严重程度排序的问题列表，不要复述代码，不要夸奖。</code></pre>
<p>AI review AI 有个意外好处：它不碍于情面，问题列表非常诚实，还能顺着 diff 追到调用链深处——人 review 大 diff 时经常看到第三个文件就累了。</p>
<h3>第三步：人工把关</h3>
<p>我只看两样东西：diff 有没有超出任务书的改动范围，以及核心逻辑和我脑子里的是否一致。前者防止 AI 的「热心肠」，后者是最终责任——出了线上事故，不能说「是 AI 写的」。</p>
<h2>翻过的车：三次，三种对策</h2>
<p><strong>1. 幻觉接口名。</strong>Codex 写 Supabase 查询时用了一个 <code>db.from(&quot;articles&quot;).search()</code>——这个方法不存在，文档里没有，是它编的。最危险的是代码看起来完全合理，不跑不知道。对策：任务书里附上真实依赖的 API 签名片段；验收时把它新增的每个 import 和每个链式调用 grep 一遍。</p>
<p><strong>2. 写错 API 版本。</strong>CC 用 React 19 的 <code>useActionState</code> 写了组件，而项目当时还在 18。它「知道」最新 API，但没核对项目的依赖版本——AI 的知识是训练时点的，你的 package.json 是现在时。对策：任务书显式声明「项目是 React 18.x，禁止使用 19 的 API」，并把 package.json 相关行贴进任务书。</p>
<p><strong>3. 自信的错误处理。</strong>两个 agent 都爱写 <code>catch (e) { console.error(e) }</code> 然后当成功继续跑。这在 UI 场景是白屏，在数据场景是脏数据。对策：review prompt 里点名错误处理（就是上面模板里的第 3 条），这是固定必查项。</p>
<h2>验收：不看代码看行为</h2>
<p>我的验收三件套：build 必须过、lint 不新增 error、行为冒烟——把任务书里的验收条款逐条人工过一遍。代码 review 是辅助手段，行为是硬标准。有次 CC 的实现我看代码觉得「写得真漂亮」，一跑发现它把分页参数的语义理解反了——代码质量和行为正确是两回事。</p>
<h2>半年后的感受</h2>
<p>AI 把「写代码」的成本打下来了，但「定义什么是正确的代码」的成本涨上去了，而且涨到了人这一边。整个工作流里最不可替代的环节，是任务书里那句「只允许改哪些文件」——它背后是我在整个项目层面的取舍判断。这件事目前 AI 干不了，我也不打算让它干。</p>$content$,
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
  'published',
  517,
  7,
  '2026-10-18 09:40:00+08:00',
  '2026-10-18 09:40:00+08:00'
),
(
  '从零部署一个人的博客：Vercel + Supabase 免费套餐的极限',
  '以本博客为例：Vercel Edge Functions 冷启动实测、Supabase 免费额度的真实红线（500MB 数据库 / 5GB 带宽 / 7 天休眠）、RLS 安全策略，以及一次 PWA 预缓存导致的白屏事故。',
  $content$<h2>零成本跑起来的博客长什么样</h2>
<p>你现在看到的这个博客，跑在 Vercel + Supabase 的免费套餐上，零成本。免费套餐不是「玩具限定」，但确实有几条红线要绕着走——带宽、休眠、缓存一致性。这篇以本站为例，把架构选型和踩过的坑一次讲完。</p>
<h2>架构，30 秒讲完</h2>
<p>React SPA 部署在 Vercel（静态托管），API 用 Vercel Edge Functions 写，数据层是 Supabase（Postgres + Storage + Auth）。有人问为什么不直接用 Supabase 的 Edge Functions：原因很简单，前端全在 Vercel，API 放同一家，域名绑定、日志、预览环境部署都是现成的，没必要为了一朵「更正统」的云多维护一套工具链。</p>
<h2>Edge Functions 冷启动：体感比数字重要</h2>
<p>冷启动实测 200-400ms。数字不大，但它叠在首屏的第一个 API 请求上，体感就是「打开页面先顿一下」。几个实测有效的缓解手段：</p>
<ul>
<li>supabase client 提到模块顶层复用实例——仅这一项，把首个查询耗时从 300ms 压到 80ms</li>
<li>控制 API bundle 依赖，别把整个 SDK 家族拖进函数</li>
<li>列表页的批量计数查询用 Promise.all 并行，不要串行四个往返</li>
</ul>
<p>另外一个容易忽略的点：Region 要选离用户近的，默认配置偶尔会把函数调度到远端 Region，冷启动数字直接翻倍。</p>
<h2>Supabase 免费额度：500MB 数据库够用，带宽要算账</h2>
<p>免费层的额度大致是：500MB 数据库、每月 5GB 出口带宽、5 万月活用户。个人博客，数据库三年都未必用得到 100MB；真正的账在<strong>带宽</strong>——文章全文走 API 出口的话，列表页一次拉 20 篇、每篇正文 30KB，光一次浏览就是 600KB 的无意义流量。我的省带宽三板斧：</p>
<ul>
<li>封面图用 unsplash 外链直出，不占自己的出口</li>
<li>API 做字段裁剪：列表接口不返回 content 全文，详情页才拉</li>
<li>静态资源全部走 Vercel 的 CDN，Edge Function 只做数据</li>
</ul>
<p>比额度更现实的红线是：<strong>Supabase 免费项目 7 天不活跃会休眠</strong>，休眠后第一个访客会撞上几十秒的唤醒延迟，体验极差。解法很朴素：用 UptimeRobot 免费版每天 ping 一次健康检查接口，保活同时顺便做了可用性监控。</p>
<h2>RLS：免费套餐里的安全底线</h2>
<p>没有传统后端鉴权层，Row Level Security 是唯一防线。我的策略分两类：公开数据限制读取条件，私有数据限制操作者。</p>
<pre><code>alter table articles enable row level security;

create policy &quot;public read published articles&quot;
on articles for select
using (status = &apos;published&apos;);</code></pre>
<p>写操作（发文章、删评论）的策略要求 authenticated 且 uid 等于记录所有者；articles 表的更新策略额外限定只有草稿作者本人能改。曾经踩过一个深坑：某天调试时把 RLS 关了忘了开回来，第二天早上 spam 评论进来两百多条。从那以后，RLS 在我的项目里不是「配置项」，是「上线检查清单的第一行」。</p>
<h2>PWA 缓存：一次白屏事故</h2>
<p>博客加过 PWA，Workbox 预缓存默认把构建产物全部缓存——这个项目哪怕优化后仍有约 5MB 的 precache，包含组件库大 chunk 和一份 1.4MB 的 GeoJSON。事故过程：发新版 → 文件名全部变化 → 老用户的 SW 尝试下载新 precache，部分大文件在弱网下超时 → SW 卡在 installing，页面请求仍被旧 SW 拦截 → 旧 chunk 已随部署失效 → 白屏，且刷新无效（SW 的锅会自我延续）。</p>
<p>修复方案：</p>
<ul>
<li>precache 面积砍到最小：只留 HTML 入口和关键小资源，JS chunk 改走 runtimeCaching 的 StaleWhileRevalidate</li>
<li>保留的大文件用 maximumFileSizeToCacheInBytes 显式放行，不依赖默认值</li>
<li>navigateFallback 必须指向一个真实存在于预缓存里的文件——配错这个，离线打开直接裸奔报错</li>
</ul>
<blockquote>个人博客没有真正的离线场景，PWA 的收益只有「可安装」一个噱头。为一个噱头引入白屏风险，得不偿失。小项目做 PWA，precache 面积越小越好，甚至不做。</blockquote>
<h2>结语</h2>
<p>免费套餐跑个人博客完全够用，前提是把三笔账算清楚：带宽账（出口流量是最容易爆的）、休眠账（7 天不动就睡给你看）、缓存账（SW 一旦配错，伤害的是最忠诚的老访客）。等哪天流量真把 5GB 带宽跑满，那是幸福的烦恼——到那天再花钱，一点都不迟。</p>$content$,
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop',
  'published',
  293,
  6,
  '2026-11-02 15:20:00+08:00',
  '2026-11-02 15:20:00+08:00'
);
