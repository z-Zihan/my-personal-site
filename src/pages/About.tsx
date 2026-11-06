import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  ExternalLink,
  FolderGit2,
  Github,
  Layers,
  MapPin,
  MessageSquare,
  Sparkles as SparklesIcon,
  Star,
  Users,
} from 'lucide-react';
import { statsApi } from '../api';
import { useLanguage } from '../utils/useLanguage';
import { trackEvent } from '../utils/analytics';
import type { Language } from '../utils/i18n';

// ==================== 内容数据（内置常量，GitHub API 不可达时的降级数据） ====================

const GITHUB_USER = 'z-Zihan';
const GITHUB_URL = `https://github.com/${GITHUB_USER}`;
const AVATAR_URL = `https://avatars.githubusercontent.com/${GITHUB_USER}`;
const X_URL = 'https://x.com/zZihan01';

interface Project {
  name: string;
  desc: Record<Language, string>;
  lang: string;
  stars: number;
  url: string;
}

const PROJECTS: Project[] = [
  {
    name: 'Evir',
    desc: {
      en: 'A clean, local-first AI agent powered by your own models.',
      zh: '简洁的本地优先 AI Agent，由你自己的模型驱动。',
    },
    lang: 'TypeScript',
    stars: 11,
    url: `${GITHUB_URL}/Evir`,
  },
  {
    name: 'Chorus',
    desc: {
      en: 'Local-first workspace for AI agents to communicate and collaborate.',
      zh: '让 AI Agent 相互沟通与协作的本地优先工作空间。',
    },
    lang: 'TypeScript',
    stars: 3,
    url: `${GITHUB_URL}/Chorus`,
  },
  {
    name: 'awesome-skills',
    desc: {
      en: 'A curated collection of daily development skills for AI coding agents.',
      zh: '为 AI 编程 Agent 精选的日常开发 skills 合集。',
    },
    lang: 'Python',
    stars: 4,
    url: `${GITHUB_URL}/awesome-skills`,
  },
  {
    name: 'LLM-101',
    desc: {
      en: 'A zero-to-one LLM roadmap: AI, LLM, RAG, Agent, MCP, Coding Agent.',
      zh: '从 0 到 1 的 LLM 学习路线：AI、LLM、RAG、Agent、MCP、Coding Agent。',
    },
    lang: 'Python',
    stars: 1,
    url: `${GITHUB_URL}/LLM-101`,
  },
  {
    name: 'build-meta-injector',
    desc: {
      en: 'Inject build time, version, environment and Git metadata into your frontend build.',
      zh: '将构建时间、版本、环境与 Git 元信息注入前端产物。',
    },
    lang: 'JavaScript',
    stars: 1,
    url: `${GITHUB_URL}/build-meta-injector`,
  },
  {
    name: 'my-personal-site',
    desc: {
      en: 'This blog itself: a full-stack personal site built with React + Vite + Supabase.',
      zh: '本博客本体：React + Vite + Supabase 全栈个人站点。',
    },
    lang: 'TypeScript',
    stars: 1,
    url: `${GITHUB_URL}/my-personal-site`,
  },
];

// GitHub 语言配色
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
};

interface GithubStats {
  stars: number;
  repos: number;
  followers: number;
}

// 降级常量：取自代表项目的 star 合计与公开主页的近似值
const FALLBACK_STATS: GithubStats = {
  stars: PROJECTS.reduce((sum, p) => sum + p.stars, 0),
  repos: 8,
  followers: 12,
};

const SKILL_GROUPS: { key: 'languages' | 'frameworks' | 'tools'; icon: typeof Code2; color: string; skills: { name: string; level: number }[] }[] = [
  {
    key: 'languages',
    icon: Code2,
    color: 'from-purple-500 to-pink-500',
    skills: [
      { name: 'TypeScript', level: 95 },
      { name: 'JavaScript', level: 92 },
      { name: 'Python', level: 80 },
      { name: 'Rust', level: 65 },
      { name: 'SQL', level: 72 },
    ],
  },
  {
    key: 'frameworks',
    icon: Layers,
    color: 'from-pink-500 to-orange-400',
    skills: [
      { name: 'React', level: 95 },
      { name: 'Vite', level: 88 },
      { name: 'Node.js', level: 85 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'Tauri', level: 70 },
    ],
  },
  {
    key: 'tools',
    icon: Cpu,
    color: 'from-cyan-500 to-blue-500',
    skills: [
      { name: 'Claude Code', level: 95 },
      { name: 'Codex', level: 85 },
      { name: 'GitHub Actions', level: 82 },
      { name: 'Supabase', level: 80 },
      { name: 'Vercel', level: 85 },
    ],
  },
];

const ROLES = ['AI Agent Engineer', 'Local-first Builder', 'Open Source Contributor'];

// ==================== 页面局部文案字典 ====================

const COPY = {
  zh: {
    greeting: '你好，我是',
    location: 'Base 北京',
    bio: ['把 AI Agent 变成好用的产品', 'Local-first 信仰者', 'Vibe coding', '终身学习者'],
    statsTitle: '数据一览',
    stars: 'GitHub Stars',
    repos: '公开仓库',
    followers: 'Followers',
    articles: '博客文章',
    projectsTitle: '代表项目',
    projectsSub: '一些我正在构建、并且乐于分享的东西',
    skillsTitle: '技术栈',
    skillsSub: '日常使用的语言、框架与工具',
    languages: 'Languages',
    frameworks: 'Frameworks',
    tools: 'AI & Tools',
    timelineTitle: '旅程',
    timelineSub: '一路走来的几个关键节点',
    timeline: [
      { year: '2019', text: '写下第一行代码，入坑编程' },
      { year: '2021', text: '深耕前端工程：React 生态、构建优化、工程化体系' },
      { year: '2024', text: '转向 AI Agent 方向：Agent 系统、本地优先软件、模型工具链' },
      { year: '2025', text: '开源 Evir / Chorus，探索多 Agent 协作与 local-first AI' },
      { year: 'Now', text: 'Building in public，把 AI Agent 变成真正好用的产品' },
    ],
    contactTitle: '找到我',
    contactSub: '欢迎交流 AI Agent、local-first 与开源',
    github: '看看我的开源项目',
    twitter: '日常碎碎念与构建记录',
    board: '留言板',
    boardDesc: '在站内给我留句话',
    slogan: '在公开中构建，带着品味交付。',
    cta: '去留言板打个招呼',
    viewRepo: '查看仓库',
  },
  en: {
    greeting: "Hi, I'm",
    location: 'Based in Beijing',
    bio: ['Turning AI agents into products people love', 'Local-first believer', 'Vibe coding', 'Lifelong learner'],
    statsTitle: 'At a glance',
    stars: 'GitHub Stars',
    repos: 'Public Repos',
    followers: 'Followers',
    articles: 'Blog Posts',
    projectsTitle: 'Featured Projects',
    projectsSub: "Things I'm building and happy to share",
    skillsTitle: 'Tech Stack',
    skillsSub: 'Languages, frameworks and tools I use every day',
    languages: 'Languages',
    frameworks: 'Frameworks',
    tools: 'AI & Tools',
    timelineTitle: 'Journey',
    timelineSub: 'A few milestones along the way',
    timeline: [
      { year: '2019', text: 'Wrote my first line of code and fell for programming' },
      { year: '2021', text: 'Went deep on frontend engineering: React ecosystem, build optimization, tooling' },
      { year: '2024', text: 'Pivoted to AI agents: agent systems, local-first software, model toolchains' },
      { year: '2025', text: 'Open-sourced Evir / Chorus, exploring multi-agent collaboration and local-first AI' },
      { year: 'Now', text: 'Building in public — turning AI agents into genuinely useful products' },
    ],
    contactTitle: 'Find me',
    contactSub: 'Happy to chat about AI agents, local-first and open source',
    github: 'Browse my open source work',
    twitter: 'Daily notes and build logs',
    board: 'Message Board',
    boardDesc: 'Leave me a note right here',
    slogan: 'Build in public. Ship with taste.',
    cta: 'Say hi on the message board',
    viewRepo: 'View repo',
  },
} as const;

// ==================== Hooks ====================

interface GithubRepo {
  name: string;
  fork: boolean;
  stargazers_count: number;
}

/** 拉取 GitHub 实时数据；任何失败都静默降级到内置常量 */
function useGithubData() {
  const [stats, setStats] = useState<GithubStats>(FALLBACK_STATS);
  const [repoStars, setRepoStars] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    const fetchJson = async <T,>(url: string): Promise<T> => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    };

    Promise.allSettled([
      fetchJson<{ public_repos?: number; followers?: number }>(`https://api.github.com/users/${GITHUB_USER}`),
      fetchJson<GithubRepo[]>(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
    ]).then(([userRes, reposRes]) => {
      if (controller.signal.aborted) return;
      const next = { ...FALLBACK_STATS };
      if (userRes.status === 'fulfilled') {
        if (typeof userRes.value.public_repos === 'number') next.repos = userRes.value.public_repos;
        if (typeof userRes.value.followers === 'number') next.followers = userRes.value.followers;
      }
      if (reposRes.status === 'fulfilled' && Array.isArray(reposRes.value)) {
        const own = reposRes.value.filter((r) => !r.fork);
        next.stars = own.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        setRepoStars(Object.fromEntries(own.map((r) => [r.name.toLowerCase(), r.stargazers_count])));
      }
      setStats(next);
    });

    return () => controller.abort();
  }, []);

  return { stats, repoStars };
}

/** 博客文章数；失败返回 null */
function useArticleCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    statsApi
      .getStats()
      .then((res) => {
        // 拦截器只解包了 axios 的 response.data，业务字段可能还包在一层 data 里，两层都尝试
        const res0 = res as any;
        // 优先取已发布数（totalArticles 含草稿），旧接口无该字段时回退
        const n = [
          res0?.publishedArticles,
          res0?.data?.publishedArticles,
          res0?.totalArticles,
          res0?.data?.totalArticles,
        ].find((v): v is number => typeof v === 'number');
        if (!cancelled && n !== undefined) setCount(n);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return count;
}

/** 打字机效果 */
function useTypewriter(text: string, enabled: boolean, speed = 120) {
  const [shown, setShown] = useState(enabled ? '' : text);
  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, enabled, speed]);
  return shown;
}

// ==================== 小组件 ====================

/** X（原 Twitter）品牌图标；lucide 的 Twitter 仍是旧蓝鸟 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SectionHeader({ icon, kicker, title, sub }: { icon: ReactNode; kicker: string; title: string; sub: string }) {
  return (
    <motion.div
      className="mb-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium tracking-widest text-purple-600 uppercase dark:text-purple-300">
        {icon}
        {kicker}
      </div>
      <h2 className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-purple-300 dark:via-pink-300 dark:to-cyan-300">
        {title}
      </h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">{sub}</p>
    </motion.div>
  );
}

function AvatarRing({ reduceMotion }: { reduceMotion: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-36 w-36 sm:h-44 sm:w-44">
      {/* 旋转发光环 */}
      <motion.div
        className="absolute -inset-2 rounded-full opacity-80 blur-md"
        style={{ background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #06b6d4, #a855f7)' }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -inset-1 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #06b6d4, #a855f7)' }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-gray-100 dark:border-gray-900 dark:bg-gray-800">
        {failed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 text-5xl font-bold text-white">
            Z
          </div>
        ) : (
          <img
            src={AVATAR_URL}
            alt="zZihan"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {/* 在线状态点 */}
      <span className="absolute right-3 bottom-3 flex h-4 w-4">
        {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900" />
      </span>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  inView,
  reduceMotion,
  index,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
  inView: boolean;
  reduceMotion: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/70 p-5 text-center backdrop-blur-xl transition-colors hover:border-purple-400/50 dark:border-white/10 dark:bg-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 text-purple-600 dark:text-purple-300">
        {icon}
      </div>
      <div className="font-mono text-3xl font-bold text-gray-900 tabular-nums sm:text-4xl dark:text-white">
        {value === null ? (
          '—'
        ) : inView && !reduceMotion ? (
          <CountUp end={value} duration={2} preserveValue />
        ) : (
          value
        )}
      </div>
      <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">{label}</div>
    </motion.div>
  );
}

function ProjectCard({
  project,
  stars,
  lang,
  viewRepo,
  reduceMotion,
  index,
}: {
  project: Project;
  stars: number;
  lang: Language;
  viewRepo: string;
  reduceMotion: boolean;
  index: number;
}) {
  // 3D tilt：鼠标位置映射为旋转角
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, rgba(168,85,247,0.18), transparent 40%)`
  );

  const handleMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
    >
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={() => trackEvent('about_project_click', 'engagement', { project: project.name })}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={reduceMotion ? undefined : { y: -6 }}
        className="group relative block h-full rounded-2xl bg-gradient-to-br from-purple-500/30 via-gray-200/60 to-cyan-500/30 p-px transition-shadow duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] dark:via-white/10"
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/90 p-6 backdrop-blur-xl dark:bg-gray-900/90">
          <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glow }} />
          <div className="relative mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 shrink-0 text-purple-500 dark:text-purple-300" />
              <h3 className="font-mono text-lg font-semibold break-all text-gray-900 dark:text-white">{project.name}</h3>
            </div>
            <ExternalLink
              className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-500"
              aria-label={viewRepo}
            />
          </div>
          <p className="relative mb-5 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{project.desc[lang]}</p>
          <div className="relative flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LANG_COLORS[project.lang] ?? '#a855f7' }} />
              {project.lang}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {stars}
            </span>
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}

function SkillBar({ name, level, color, reduceMotion, delay }: { name: string; level: number; color: string; reduceMotion: boolean; delay: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <motion.div
          className={`relative h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: reduceMotion ? `${level}%` : 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 1.2, delay, ease: 'easeOut' }}
        >
          <span className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        </motion.div>
      </div>
    </div>
  );
}

// ==================== 页面 ====================

export default function About() {
  const { lang } = useLanguage();
  const copy = COPY[lang];
  const reduceMotion = useReducedMotion() ?? false;
  const { stats, repoStars } = useGithubData();
  const articleCount = useArticleCount();
  const typedName = useTypewriter('zZihan', !reduceMotion);
  const [roleIndex, setRoleIndex] = useState(0);
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    document.title = `${lang === 'zh' ? '关于' : 'About'} · zZihan`;
  }, [lang]);

  // roles 轮播
  useEffect(() => {
    const timer = window.setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2800);
    return () => window.clearInterval(timer);
  }, []);

  const statItems = [
    { icon: <Star className="h-5 w-5" />, label: copy.stars, value: stats.stars },
    { icon: <FolderGit2 className="h-5 w-5" />, label: copy.repos, value: stats.repos },
    { icon: <Users className="h-5 w-5" />, label: copy.followers, value: stats.followers },
    { icon: <BookOpen className="h-5 w-5" />, label: copy.articles, value: articleCount },
  ];

  const contacts = [
    { href: GITHUB_URL, external: true, icon: Github, title: 'GitHub', handle: '@z-Zihan', desc: copy.github, color: 'from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white' },
    { href: X_URL, external: true, icon: XIcon, title: 'X / Twitter', handle: '@zZihan01', desc: copy.twitter, color: 'from-neutral-800 to-black dark:from-neutral-100 dark:to-white' },
    { href: '/message', external: false, icon: MessageSquare, title: copy.board, handle: '/message', desc: copy.boardDesc, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      {/* 全局网格背景 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ========== Hero ========== */}
      <section className="relative flex min-h-[72vh] items-center md:min-h-[80vh] justify-center overflow-hidden px-4 pt-24 pb-16">
        {/* 极光背景 */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-1/3 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 rounded-full opacity-30 blur-3xl dark:opacity-40"
            style={{ background: 'conic-gradient(from 90deg at 50% 50%, #a855f7, #ec4899, #06b6d4, #10b981, #a855f7)' }}
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-purple-500/40 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, 80, 0], y: [0, 40, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/40 blur-3xl"
            animate={reduceMotion ? undefined : { x: [0, -80, 0], y: [0, -40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/40 via-gray-50/70 to-gray-50 dark:from-gray-950/30 dark:via-gray-950/60 dark:to-gray-950" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 text-center md:flex-row md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <AvatarRing reduceMotion={reduceMotion} />
          </motion.div>

          <div className="flex-1">
            <motion.p
              className="mb-2 font-mono text-sm tracking-widest text-purple-600 uppercase dark:text-purple-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {copy.greeting}
            </motion.p>
            <h1 className="mb-4 font-mono text-5xl font-black tracking-tight sm:text-7xl" aria-label="zZihan">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent dark:from-purple-300 dark:via-pink-300 dark:to-cyan-300">
                {typedName}
              </span>
              <span className={`ml-1 inline-block w-1 bg-pink-500 align-middle ${reduceMotion ? '' : 'animate-pulse'}`} style={{ height: '0.9em' }} />
            </h1>

            {/* roles 轮播：overflow-hidden 用于裁切上下滑动动画；窄屏长 role 可能折成两行，高度按两行 text-xl 预留 */}
            <div className="relative mb-6 flex h-14 items-center justify-center overflow-hidden text-xl font-semibold sm:h-10 sm:text-2xl md:justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={roleIndex}
                  className="text-gray-800 dark:text-gray-100"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -24 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-cyan-600 dark:text-cyan-300">&gt;</span> {ROLES[roleIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {copy.bio.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-gray-300/70 bg-white/60 px-3 py-1 text-sm text-gray-700 backdrop-blur-md dark:border-white/15 dark:bg-white/5 dark:text-gray-200"
                >
                  {b}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 md:justify-start dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-pink-500" />
                {copy.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-purple-500" />
                @ z.ai
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== 数据统计条 ========== */}
      <section ref={statsRef} className="relative mx-auto -mt-8 max-w-5xl px-4" aria-label={copy.statsTitle}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statItems.map((s, i) => (
            <StatItem key={s.label} {...s} inView={statsInView} reduceMotion={reduceMotion} index={i} />
          ))}
        </div>
      </section>

      {/* ========== 代表项目 ========== */}
      <section id="projects" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <SectionHeader icon={<FolderGit2 className="h-3.5 w-3.5" />} kicker="01 / Projects" title={copy.projectsTitle} sub={copy.projectsSub} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <ProjectCard
              key={p.name}
              project={p}
              stars={repoStars[p.name.toLowerCase()] ?? p.stars}
              lang={lang}
              viewRepo={copy.viewRepo}
              reduceMotion={reduceMotion}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ========== 技术栈 ========== */}
      <section id="stack" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pb-24">
        <SectionHeader icon={<Code2 className="h-3.5 w-3.5" />} kicker="02 / Stack" title={copy.skillsTitle} sub={copy.skillsSub} />
        <div className="grid gap-6 md:grid-cols-3">
          {SKILL_GROUPS.map((group, gi) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.key}
                className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: gi * 0.12 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${group.color} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{copy[group.key]}</h3>
                </div>
                <div className="space-y-4">
                  {group.skills.map((s, si) => (
                    <SkillBar key={s.name} {...s} color={group.color} reduceMotion={reduceMotion} delay={gi * 0.12 + si * 0.08} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========== 时间线 ========== */}
      <section id="journey" className="relative mx-auto max-w-3xl scroll-mt-24 px-4 pb-24">
        <SectionHeader icon={<SparklesIcon className="h-3.5 w-3.5" />} kicker="03 / Journey" title={copy.timelineTitle} sub={copy.timelineSub} />
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500 md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-10">
            {copy.timeline.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <motion.div
                  key={item.year}
                  className={`relative flex items-center pl-12 md:pl-0 ${left ? 'md:justify-start' : 'md:justify-end'}`}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : left ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                >
                  {/* 发光节点 */}
                  <span className="absolute top-1/2 left-4 z-10 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 md:left-1/2">
                    {!reduceMotion && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-60" />}
                    <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_12px_rgba(236,72,153,0.9)] dark:border-gray-950" />
                  </span>
                  <div
                    className={`w-full rounded-2xl border border-gray-200 bg-white/70 p-5 backdrop-blur-xl md:w-[calc(50%-2rem)] dark:border-white/10 dark:bg-white/5 ${
                      left ? 'md:text-right' : ''
                    }`}
                  >
                    <div className="mb-1 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text font-mono text-xl font-bold text-transparent dark:from-purple-300 dark:to-cyan-300">
                      {item.year}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 联系 ========== */}
      <section id="contact" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-24">
        <SectionHeader icon={<MessageSquare className="h-3.5 w-3.5" />} kicker="04 / Contact" title={copy.contactTitle} sub={copy.contactSub} />
        <div className="grid gap-5 sm:grid-cols-3">
          {contacts.map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg transition-transform group-hover:scale-110 dark:text-gray-900`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mb-0.5 flex items-center gap-1.5 font-semibold">
                  {c.title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
                <div className="mb-2 font-mono text-xs text-purple-600 dark:text-purple-300">{c.handle}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{c.desc}</p>
              </>
            );
            const className =
              'group block h-full rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-purple-400/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.6)] dark:border-white/10 dark:bg-white/5';
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {c.external ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                ) : (
                  <Link to={c.href} className={className}>
                    {inner}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========== CTA ========== */}
      {/* overflow-hidden + 负扩散阴影：光晕收敛在卡片下方，不向两侧溢出 */}
      <section className="relative overflow-hidden px-4 pt-4 pb-28">
        {/* 只做位移不做缩放：scale 合成层会让按钮文字发虚 */}
        <motion.div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 p-10 text-center text-white shadow-[0_24px_48px_-24px_rgba(168,85,247,0.55)] sm:p-14"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <p className="relative mb-2 font-mono text-sm tracking-widest text-white/90 uppercase">
            {lang === 'zh' ? 'Build in public. Ship with taste.' : '在公开中构建，带着品味交付。'}
          </p>
          <h2 className="relative mb-8 text-2xl font-bold sm:text-4xl">{copy.slogan}</h2>
          <Link
            to="/message"
            onClick={() => trackEvent('about_cta_click', 'engagement', { page_path: window.location.pathname })}
            className="group relative inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-purple-800 antialiased shadow-lg transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-600 focus-visible:outline-none dark:text-purple-800"
          >
            {copy.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
