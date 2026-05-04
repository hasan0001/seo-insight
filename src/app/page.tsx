'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Search,
  Globe,
  Link2,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Loader2,
  ExternalLink,
  FileText,
  Target,
  Lightbulb,
  ArrowRight,
  Zap,
  Shield,
  Eye,
  LayoutDashboard,
  KeyRound,
  ClipboardCheck,
  LineChart,
  Menu,
  Sparkles,
  ArrowUpRight,
  Layers,
  Brain,
  MessageSquare,
  ThumbsUp,
  FileSearch,
  Bot,
  Gauge,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeywordResult {
  keyword: string;
  source: string;
  difficulty: { score: number; label: string };
  cluster?: string;
}

interface SerpItem {
  position: number;
  title: string;
  url: string;
  snippet: string;
  resultType: 'blog' | 'ecommerce' | 'video' | 'forum' | 'news' | 'web';
  isFeatured: boolean;
}

interface SerpAnalysis {
  keyword: string;
  results: SerpItem[];
  featuredSnippet: SerpItem | null;
  resultTypeBreakdown: Record<string, number>;
  avgWordCountInTitles: number;
  commonTitleWords: string[];
}

interface CrawledPageData {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  hasFavicon: boolean;
  isHttps: boolean;
  loadTime: number;
  headings: string[];
  bodyText: string;
}

interface CrawlResult {
  sessionId: string;
  startUrl: string;
  totalPages: number;
  pages: CrawledPageData[];
  errors: string[];
}

interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  detail: string;
  impact: number;
}

interface PageAuditResult {
  url: string;
  seoScore: number;
  issues: SeoIssue[];
  suggestions: string[];
  categoryScores: {
    titles: number;
    meta: number;
    headings: number;
    content: number;
    links: number;
    technical: number;
  };
}

interface SiteAuditResult {
  totalPages: number;
  averageScore: number;
  pageResults: PageAuditResult[];
  siteWideIssues: SeoIssue[];
  topSuggestions: string[];
}

interface AeoIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  detail: string;
}

interface AeoResult {
  url: string;
  aeoScore: number;
  issues: AeoIssue[];
  strengths: string[];
  recommendations: string[];
  answerReadiness: {
    hasDirectAnswers: boolean;
    hasFAQ: boolean;
    hasStructuredLists: boolean;
    hasDefinitions: boolean;
    hasConciseParagraphs: boolean;
  };
}

interface GeoIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  detail: string;
}

interface GeoResult {
  url: string;
  geoScore: number;
  issues: GeoIssue[];
  strengths: string[];
  recommendations: string[];
  generativeReadiness: {
    hasEntities: boolean;
    hasStructuredData: boolean;
    hasTrustSignals: boolean;
    hasClarity: boolean;
    hasFactualDensity: boolean;
    hasUniqueValue: boolean;
  };
}

interface BacklinkOpportunity {
  url: string;
  title: string;
  type: 'blog' | 'directory' | 'forum' | 'resource' | 'news' | 'competitor';
  outreachStrategy: string;
  contentIdea: string;
  priority: 'high' | 'medium' | 'low';
}

interface BacklinkStrategy {
  keyword: string;
  opportunities: BacklinkOpportunity[];
  contentSuggestions: string[];
  outreachTemplates: { type: string; template: string }[];
}

interface PatternInsight {
  metric: string;
  topRankingAvg: number | string;
  yourValue: number | string;
  status: 'good' | 'improve' | 'missing';
  recommendation: string;
}

interface PatternAnalysis {
  keyword: string;
  insights: PatternInsight[];
  mustAdd: string[];
  youAreMissing: string[];
  contentGapAnalysis: string[];
  competitiveAdvantage: string[];
}

type ActiveTab = 'dashboard' | 'keywords' | 'audit' | 'serp';

// ─── Apple Color Constants ─────────────────────────────────────────────────────

const BLUE = '#0071e3';
const BLUE_LIGHT = '#2997ff';
const GREEN = '#34c759';
const ORANGE = '#ff9f0a';
const RED = '#ff3b30';

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[#0071e3]';
  if (score >= 60) return 'text-[#1d1d1f]';
  return 'text-[#86868b]';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-[#0071e3]';
  if (score >= 60) return 'bg-[rgba(0,0,0,0.08)]';
  return 'bg-[rgba(0,0,0,0.04)]';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#0071e3';
  if (score >= 60) return 'rgba(0,0,0,0.15)';
  return 'rgba(0,0,0,0.08)';
}

function getDifficultyBadge(label: string): string {
  switch (label?.toLowerCase()) {
    case 'easy': return 'apple-badge apple-badge-blue';
    case 'medium': return 'apple-badge apple-badge-fill';
    case 'hard': return 'apple-badge apple-badge-orange';
    case 'very hard': return 'apple-badge apple-badge-red';
    default: return 'apple-badge apple-badge-fill';
  }
}

function getDifficultyDotColor(score: number): string {
  if (score < 30) return 'bg-[#0071e3]';
  if (score < 60) return 'bg-[#86868b]';
  return 'bg-[#ff9f0a]';
}

function getIssueBadge(type: 'error' | 'warning' | 'info') {
  switch (type) {
    case 'error': return <span className="apple-badge apple-badge-red"><XCircle className="mr-1 h-3 w-3" />Error</span>;
    case 'warning': return <span className="apple-badge apple-badge-orange"><AlertTriangle className="mr-1 h-3 w-3" />Warning</span>;
    case 'info': return <span className="apple-badge apple-badge-blue"><Info className="mr-1 h-3 w-3" />Info</span>;
  }
}

function getPriorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high': return <span className="apple-badge apple-badge-red">High</span>;
    case 'medium': return <span className="apple-badge apple-badge-orange">Medium</span>;
    case 'low': return <span className="apple-badge apple-badge-blue">Low</span>;
  }
}

function getResultTypeBadge(type: string) {
  const m: Record<string, string> = {
    blog: 'apple-badge apple-badge-blue', ecommerce: 'apple-badge apple-badge-fill', video: 'apple-badge apple-badge-orange',
    forum: 'apple-badge apple-badge-fill', news: 'apple-badge apple-badge-blue', web: 'apple-badge apple-badge-fill',
  };
  return <span className={m[type] || m.web}>{type}</span>;
}

function getSourceBadge(source: string) {
  const m: Record<string, string> = {
    'google-suggest': 'apple-badge apple-badge-blue', 'people-also-ask': 'apple-badge apple-badge-fill',
    'related-searches': 'apple-badge apple-badge-fill', 'expansion': 'apple-badge apple-badge-outline', 'questions': 'apple-badge apple-badge-blue',
  };
  return <span className={m[source] || 'apple-badge apple-badge-fill'}>{source}</span>;
}

// ─── Score Circle Component ────────────────────────────────────────────────────

function ScoreCircle({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = getScoreRingColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="8"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeLinecap="round"
            stroke={ringColor}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-2xl font-semibold tracking-tight', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="apple-caption">{label}</span>}
    </div>
  );
}

// ─── Category Score Bar ────────────────────────────────────────────────────────

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#6e6e73] capitalize">{label}</span>
        <span className={cn('text-sm font-semibold', getScoreColor(score))}>{score}%</span>
      </div>
      <div className="apple-progress-track">
        <motion.div
          className={cn('apple-progress-fill', score >= 80 ? '' : score >= 60 ? 'bg-[rgba(0,0,0,0.12)]' : 'bg-[rgba(0,0,0,0.06)]')}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Readiness Checklist ───────────────────────────────────────────────────────

function ReadinessChecklist({ items }: { items: Record<string, boolean> }) {
  return (
    <div className="space-y-2.5">
      {Object.entries(items).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2.5 text-sm">
          {value ? (
            <CheckCircle2 className="h-4 w-4 text-[#0071e3] shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-[#aeaeb2] shrink-0" />
          )}
          <span className={value ? 'text-[#1d1d1f]' : 'text-[#86868b]'}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Apple Checkbox ────────────────────────────────────────────────────────────

function AppleCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <div
        className={cn(
          'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-all duration-[240ms]',
          checked
            ? 'bg-[#0071e3] border-[#0071e3]'
            : 'bg-transparent border-[rgba(0,0,0,0.12)]'
        )}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm text-[#1d1d1f]">{label}</span>
    </label>
  );
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const pageVariants = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };
const pageTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };
const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, type: 'spring', stiffness: 260, damping: 25 },
  }),
};

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function SEOInsightApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mouse tracking for light effect
  const mouseLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseLightRef.current) {
        mouseLightRef.current.style.left = e.clientX + 'px';
        mouseLightRef.current.style.top = e.clientY + 'px';
        mouseLightRef.current.style.opacity = '1';
      }
    };
    const handleMouseLeave = () => {
      if (mouseLightRef.current) mouseLightRef.current.style.opacity = '0';
    };
    const handleMouseEnter = () => {
      if (mouseLightRef.current) mouseLightRef.current.style.opacity = '1';
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Keywords state
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordSources, setKeywordSources] = useState({
    'google-suggest': true,
    'people-also-ask': true,
    'related-searches': true,
    expansion: false,
    questions: true,
  });
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState('');
  const [keywordView, setKeywordView] = useState<'table' | 'cluster'>('table');

  // Audit state
  const [auditUrl, setAuditUrl] = useState('');
  const [maxPages, setMaxPages] = useState([20]);
  const [maxDepth, setMaxDepth] = useState([2]);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [auditResult, setAuditResult] = useState<{
    seo: SiteAuditResult;
    aeo: AeoResult[];
    geo: GeoResult[];
  } | null>(null);
  const [auditError, setAuditError] = useState('');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  // SERP state
  const [serpKeyword, setSerpKeyword] = useState('');
  const [serpLoading, setSerpLoading] = useState(false);
  const [serpResult, setSerpResult] = useState<SerpAnalysis | null>(null);
  const [serpError, setSerpError] = useState('');
  const [patternLoading, setPatternLoading] = useState(false);
  const [patternResult, setPatternResult] = useState<PatternAnalysis | null>(null);
  const [backlinkLoading, setBacklinkLoading] = useState(false);
  const [backlinkResult, setBacklinkResult] = useState<BacklinkStrategy | null>(null);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<number>>(new Set());
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);

  // ─── API Calls ────────────────────────────────────────────────────────────

  const discoverKeywords = useCallback(async () => {
    if (!keywordInput.trim()) return;
    setKeywordLoading(true);
    setKeywordError('');
    try {
      const selectedSources = Object.entries(keywordSources)
        .filter(([, checked]) => checked)
        .map(([source]) => source);
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keywordInput.trim(), options: { sources: selectedSources } }),
      });
      if (!res.ok) throw new Error('Failed to fetch keywords');
      const data = await res.json();
      setKeywordResults(data.results || []);
    } catch (err) {
      setKeywordError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setKeywordLoading(false);
    }
  }, [keywordInput, keywordSources]);

  const crawlAndAudit = useCallback(async () => {
    if (!auditUrl.trim()) return;
    setCrawlLoading(true);
    setAuditLoading(false);
    setAuditError('');
    setCrawlResult(null);
    setAuditResult(null);
    setCrawlProgress(10);

    try {
      // Step 1: Crawl
      const crawlRes = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: auditUrl.trim(),
          maxPages: maxPages[0],
          maxDepth: maxDepth[0],
        }),
      });
      if (!crawlRes.ok) throw new Error('Failed to crawl website');
      const crawlData: CrawlResult = await crawlRes.json();
      setCrawlResult(crawlData);
      setCrawlProgress(50);

      // Step 2: Audit
      setAuditLoading(true);
      setCrawlProgress(70);
      const auditRes = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: crawlData.pages }),
      });
      if (!auditRes.ok) throw new Error('Failed to audit website');
      const auditData = await auditRes.json();
      setAuditResult(auditData);
      setCrawlProgress(100);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCrawlLoading(false);
      setAuditLoading(false);
    }
  }, [auditUrl, maxPages, maxDepth]);

  const analyzeSerp = useCallback(async () => {
    if (!serpKeyword.trim()) return;
    setSerpLoading(true);
    setSerpError('');
    setSerpResult(null);
    setPatternResult(null);
    setBacklinkResult(null);
    try {
      const res = await fetch('/api/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: serpKeyword.trim() }),
      });
      if (!res.ok) throw new Error('Failed to analyze SERP');
      const data = await res.json();
      setSerpResult(data);
    } catch (err) {
      setSerpError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSerpLoading(false);
    }
  }, [serpKeyword]);

  const analyzePatterns = useCallback(async () => {
    if (!serpResult) return;
    setPatternLoading(true);
    try {
      const res = await fetch('/api/pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: serpKeyword.trim(),
          serpResults: serpResult.results,
        }),
      });
      if (!res.ok) throw new Error('Failed to analyze patterns');
      const data = await res.json();
      setPatternResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPatternLoading(false);
    }
  }, [serpResult, serpKeyword]);

  const generateBacklinks = useCallback(async () => {
    if (!serpResult) return;
    setBacklinkLoading(true);
    try {
      const res = await fetch('/api/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: serpKeyword.trim(),
          serpResults: serpResult.results,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate backlink strategy');
      const data = await res.json();
      setBacklinkResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBacklinkLoading(false);
    }
  }, [serpResult, serpKeyword]);

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const clusteredKeywords = useMemo(() => {
    const clusters: Record<string, KeywordResult[]> = {};
    keywordResults.forEach((kw) => {
      const cluster = kw.cluster || 'Ungrouped';
      if (!clusters[cluster]) clusters[cluster] = [];
      clusters[cluster].push(kw);
    });
    return clusters;
  }, [keywordResults]);

  const togglePageExpand = (url: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const toggleTemplate = (idx: number) => {
    setExpandedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(idx);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  // ─── Navigation Items ─────────────────────────────────────────────────────

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, shortLabel: 'Home' },
    { id: 'keywords', label: 'Keywords', icon: <KeyRound className="h-4 w-4" />, shortLabel: 'Keywords' },
    { id: 'audit', label: 'Site Audit', icon: <ClipboardCheck className="h-4 w-4" />, shortLabel: 'Audit' },
    { id: 'serp', label: 'SERP Analysis', icon: <LineChart className="h-4 w-4" />, shortLabel: 'SERP' },
  ];

  // ─── Dashboard Tab ────────────────────────────────────────────────────────

  const DashboardTab = () => (
    <div className="space-y-16">
      {/* Hero with hero-glow */}
      <div className="text-center py-12 md:py-20 relative">
        <div className="hero-glow" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        <motion.h1
          className="apple-headline"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
        >
          SEO Insight
        </motion.h1>
        <motion.p
          className="mt-4 apple-subheadline max-w-[600px] mx-auto"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.08 }}
        >
          Comprehensive SEO, AEO &amp; GEO analysis platform. Discover keywords, audit your site, analyze competitors, and build winning strategies.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...pageTransition, delay: 0.16 }}
        >
          <span className="apple-badge apple-badge-blue px-4 py-1.5 text-sm font-medium">
            <Zap className="mr-1.5 h-3.5 w-3.5" /> SEO Optimization
          </span>
          <span className="apple-badge apple-badge-blue px-4 py-1.5 text-sm font-medium">
            <Bot className="mr-1.5 h-3.5 w-3.5" /> AEO Readiness
          </span>
          <span className="apple-badge apple-badge-blue px-4 py-1.5 text-sm font-medium">
            <Brain className="mr-1.5 h-3.5 w-3.5" /> GEO Analysis
          </span>
        </motion.div>
      </div>

      {/* Feature Cards — Apple tile grid */}
      <div className="apple-grid-4">
        {[
          {
            title: 'Keyword Discovery',
            description: 'Find high-value keywords with difficulty scores and clustering across multiple sources.',
            icon: <KeyRound className="h-6 w-6" />,
            tab: 'keywords' as ActiveTab,
          },
          {
            title: 'SERP Analysis',
            description: 'Analyze search results, discover patterns, and understand competitor strategies.',
            icon: <LineChart className="h-6 w-6" />,
            tab: 'serp' as ActiveTab,
          },
          {
            title: 'Site Audit',
            description: 'Crawl and audit your site for SEO, AEO, and GEO issues with actionable fixes.',
            icon: <ClipboardCheck className="h-6 w-6" />,
            tab: 'audit' as ActiveTab,
          },
          {
            title: 'Backlink Strategy',
            description: 'Generate backlink opportunities and outreach templates for link building.',
            icon: <Link2 className="h-6 w-6" />,
            tab: 'serp' as ActiveTab,
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className="apple-tile cursor-pointer p-6 h-full"
              onClick={() => setActiveTab(feature.tab)}
            >
              <div className="glass-icon-bg flex h-11 w-11 items-center justify-center rounded-xl">
                <span className="text-[#2997ff]">{feature.icon}</span>
              </div>
              <h3 className="apple-callout mt-4">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-[#6e6e73] leading-relaxed">{feature.description}</p>
              <div className="mt-4">
                <span className="apple-link text-sm">
                  Learn more <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Start Guide — Apple tile */}
      <div className="apple-tile p-8 md:p-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="glass-icon-bg flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4 text-[#2997ff]" />
          </div>
          <h2 className="apple-headline-reduced">Quick Start Guide</h2>
        </div>
        <p className="text-[#6e6e73] mb-8">Follow these steps to get the most out of SEO Insight</p>
        <div className="apple-grid-4">
          {[
            {
              step: 1,
              title: 'Discover Keywords',
              description: 'Enter a seed keyword and discover related keywords across multiple sources with difficulty scores.',
              icon: <KeyRound className="h-5 w-5" />,
            },
            {
              step: 2,
              title: 'Analyze SERP',
              description: 'Search your keyword to see top results, featured snippets, and result type breakdowns.',
              icon: <Search className="h-5 w-5" />,
            },
            {
              step: 3,
              title: 'Audit Your Site',
              description: 'Crawl your website to get comprehensive SEO, AEO, and GEO scores with detailed issue reports.',
              icon: <Globe className="h-5 w-5" />,
            },
            {
              step: 4,
              title: 'Build Strategy',
              description: 'Generate pattern analysis, backlink opportunities, and outreach templates to outrank competitors.',
              icon: <Target className="h-5 w-5" />,
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="p-5 rounded-[18px] bg-[rgba(0,0,0,0.03)]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0071e3] text-white text-xs font-semibold mb-3">
                  {item.step}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#2997ff]">{item.icon}</span>
                  <span className="font-semibold text-sm text-[#1d1d1f]">{item.title}</span>
                </div>
                <p className="text-xs text-[#6e6e73] leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Cards — Apple tiles with large typography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            title: 'SEO',
            subtitle: 'Search Engine Optimization',
            description: 'Optimize titles, meta descriptions, headings, content, links, and technical aspects for better search rankings.',
            icon: <Shield className="h-6 w-6" />,
          },
          {
            title: 'AEO',
            subtitle: 'Answer Engine Optimization',
            description: 'Structure content for AI-powered answer engines with direct answers, FAQs, and concise paragraphs.',
            icon: <Bot className="h-6 w-6" />,
          },
          {
            title: 'GEO',
            subtitle: 'Generative Engine Optimization',
            description: 'Optimize for generative AI with entity-rich content, structured data, and trust signals.',
            icon: <Brain className="h-6 w-6" />,
          },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="apple-tile p-6 h-full">
              <div className="flex items-center gap-4">
                <div className="glass-icon-bg flex h-12 w-12 items-center justify-center rounded-xl">
                  <span className="text-[#2997ff]">{item.icon}</span>
                </div>
                <div>
                  <p className="apple-headline-reduced !text-[28px]">{item.title}</p>
                  <p className="text-sm text-[#6e6e73]">{item.subtitle}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#6e6e73] leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Keywords Tab ─────────────────────────────────────────────────────────

  const KeywordsTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="apple-headline-reduced">Keyword Discovery</h2>
        <p className="apple-body mt-1">Find high-value keywords with difficulty analysis and clustering</p>
      </div>

      <div className="apple-tile p-6 space-y-5">
                <div>
          <h3 className="apple-callout">Seed Keyword</h3>
          <p className="text-sm text-[#6e6e73] mt-1">Enter a keyword to discover related keywords across multiple sources</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Enter a seed keyword (e.g., 'seo tools')"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="apple-input w-full"
              onKeyDown={(e) => e.key === 'Enter' && discoverKeywords()}
            />
          </div>
          <button
            onClick={discoverKeywords}
            disabled={keywordLoading || !keywordInput.trim()}
            className="apple-btn apple-btn-primary px-6 h-10 shrink-0"
          >
            {keywordLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Discovering...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Discover
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-5">
          {Object.entries(keywordSources).map(([source, checked]) => (
            <AppleCheckbox
              key={source}
              id={`source-${source}`}
              checked={checked}
              onChange={(val) => setKeywordSources((prev) => ({ ...prev, [source]: val }))}
              label={source.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            />
          ))}
        </div>
      </div>

      {keywordError && (
        <div className="apple-tile p-6" style={{ borderLeft: '3px solid #ff3b30' }}>
                    <div className="flex items-center gap-2 text-[#1d1d1f]">
            <AlertCircle className="h-5 w-5 text-[#ff3b30]" />
            <p>{keywordError}</p>
          </div>
        </div>
      )}

      {keywordResults.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="apple-badge apple-badge-blue text-sm py-1.5 px-4 font-medium">
                {keywordResults.length} keywords found
              </span>
              <span className="apple-badge apple-badge-fill text-sm py-1.5 px-4 font-medium">
                {Object.keys(clusteredKeywords).length} clusters
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[rgba(0,0,0,0.04)] rounded-full p-1">
              <button
                onClick={() => setKeywordView('table')}
                className={cn(
                  'apple-btn text-sm px-4 py-1.5 min-h-0 h-8',
                  keywordView === 'table' ? 'bg-[#0071e3] text-white' : 'text-[#6e6e73] hover:bg-[rgba(0,0,0,0.04)]'
                )}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Table
              </button>
              <button
                onClick={() => setKeywordView('cluster')}
                className={cn(
                  'apple-btn text-sm px-4 py-1.5 min-h-0 h-8',
                  keywordView === 'cluster' ? 'bg-[#0071e3] text-white' : 'text-[#6e6e73] hover:bg-[rgba(0,0,0,0.04)]'
                )}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Clusters
              </button>
            </div>
          </div>

          {keywordView === 'table' ? (
            <div className="apple-tile overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto apple-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.06)]">
                      <th className="w-[40%] text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Keyword</th>
                      <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Source</th>
                      <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Difficulty</th>
                      <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Cluster</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordResults.map((kw, idx) => (
                      <tr key={idx} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-sm text-[#1d1d1f]">{kw.keyword}</td>
                        <td className="px-5 py-3.5">{getSourceBadge(kw.source)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', getDifficultyDotColor(kw.difficulty.score))} />
                            <span className={cn(getDifficultyBadge(kw.difficulty.label), 'font-medium')}>
                              {kw.difficulty.score} - {kw.difficulty.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {kw.cluster ? (
                            <span className="apple-badge apple-badge-outline">{kw.cluster}</span>
                          ) : (
                            <span className="text-[#86868b] text-sm">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(clusteredKeywords).map(([cluster, keywords]) => (
                <div key={cluster} className="apple-tile p-5">
                                    <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#1d1d1f]">{cluster}</h3>
                    <span className="apple-badge apple-badge-fill">{keywords.length} keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="apple-badge apple-badge-outline cursor-default py-1.5 px-3.5 hover:bg-[rgba(0,0,0,0.04)] transition-colors">
                              {kw.keyword}
                              <span className={cn(
                                'ml-2 inline-flex h-2 w-2 rounded-full',
                                getDifficultyDotColor(kw.difficulty.score)
                              )} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Source: {kw.source}</p>
                            <p>Difficulty: {kw.difficulty.score} ({kw.difficulty.label})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {keywordLoading && (
        <div className="apple-tile p-6">
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#2997ff]" />
            <p className="text-[#6e6e73]">Discovering keywords across sources...</p>
          </div>
        </div>
      )}

      {!keywordLoading && keywordResults.length === 0 && !keywordError && (
        <div className="apple-tile p-6 border-dashed" style={{ border: '1px dashed rgba(0,0,0,0.08)' }}>
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868b]">
            <KeyRound className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium text-[#1d1d1f]">No keywords discovered yet</p>
            <p className="text-sm">Enter a seed keyword and click &quot;Discover&quot; to get started</p>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Audit Tab ────────────────────────────────────────────────────────────

  const AuditTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="apple-headline-reduced">Site Audit</h2>
        <p className="apple-body mt-1">Crawl and audit your website for SEO, AEO, and GEO issues</p>
      </div>

      <div className="apple-tile p-6 space-y-6">
                        <div>
          <h3 className="apple-callout">Crawl Settings</h3>
          <p className="text-sm text-[#6e6e73] mt-1">Configure your website crawl parameters</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              className="apple-input w-full"
              onKeyDown={(e) => e.key === 'Enter' && crawlAndAudit()}
            />
          </div>
          <button
            onClick={crawlAndAudit}
            disabled={crawlLoading || auditLoading || !auditUrl.trim()}
            className="apple-btn apple-btn-primary px-6 h-10 shrink-0"
          >
            {crawlLoading || auditLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {crawlLoading ? 'Crawling...' : 'Auditing...'}
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" /> Crawl &amp; Audit
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1d1d1f]">Max Pages: {maxPages[0]}</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={maxPages[0]}
              onChange={(e) => setMaxPages([Number(e.target.value)])}
              className="w-full h-1 rounded-full appearance-none bg-[rgba(0,0,0,0.06)] accent-[#0071e3] cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0071e3] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#86868b]">
              <span>5</span>
              <span>50</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1d1d1f]">Max Depth: {maxDepth[0]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={maxDepth[0]}
              onChange={(e) => setMaxDepth([Number(e.target.value)])}
              className="w-full h-1 rounded-full appearance-none bg-[rgba(0,0,0,0.06)] accent-[#0071e3] cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0071e3] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#86868b]">
              <span>1</span>
              <span>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {(crawlLoading || auditLoading) && (
        <div className="apple-tile p-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
            <span className="text-[#6e6e73]">
              {crawlLoading ? 'Crawling website...' : 'Running audit analysis...'}
            </span>
            <span className="font-semibold text-[#1d1d1f]">{crawlProgress}%</span>
          </div>
          <div className="apple-progress-track h-1.5">
            <motion.div
              className="apple-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${crawlProgress}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.6, 1] }}
            />
          </div>
        </div>
      )}

      {auditError && (
        <div className="apple-tile p-6" style={{ borderLeft: '3px solid #ff3b30' }}>
                    <div className="flex items-center gap-2 text-[#1d1d1f]">
            <AlertCircle className="h-5 w-5 text-[#ff3b30]" />
            <p>{auditError}</p>
          </div>
        </div>
      )}

      {/* Audit Results */}
      {auditResult && (
        <>
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0 }}
            >
              <div className="apple-tile p-8 flex flex-col items-center">
                                <ScoreCircle score={auditResult.seo.averageScore} size={140} label="SEO Score" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0.08 }}
            >
              <div className="apple-tile p-8 flex flex-col items-center">
                                <ScoreCircle
                  score={Math.round(auditResult.aeo.reduce((s, a) => s + a.aeoScore, 0) / Math.max(auditResult.aeo.length, 1))}
                  size={140}
                  label="AEO Score"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0.16 }}
            >
              <div className="apple-tile p-8 flex flex-col items-center">
                                <ScoreCircle
                  score={Math.round(auditResult.geo.reduce((s, g) => s + g.geoScore, 0) / Math.max(auditResult.geo.length, 1))}
                  size={140}
                  label="GEO Score"
                />
              </div>
            </motion.div>
          </div>

          {/* Crawl Summary */}
          {crawlResult && (
            <div className="apple-tile p-6">
                            <h3 className="apple-callout flex items-center gap-2 mb-4">
                <div className="glass-icon-bg flex h-7 w-7 items-center justify-center rounded-lg">
                  <FileSearch className="h-4 w-4 text-[#2997ff]" />
                </div>
                Crawl Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="apple-stat">
                  <p className="apple-stat-value">{crawlResult.totalPages}</p>
                  <p className="apple-stat-label">Pages Crawled</p>
                </div>
                <div className="apple-stat">
                  <p className="apple-stat-value">{crawlResult.errors.length}</p>
                  <p className="apple-stat-label">Crawl Errors</p>
                </div>
                <div className="apple-stat" style={{ background: 'rgba(0,113,227,0.06)' }}>
                  <p className="apple-stat-value">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'error').length}</p>
                  <p className="apple-stat-label">SEO Errors</p>
                </div>
                <div className="apple-stat">
                  <p className="apple-stat-value">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'warning').length}</p>
                  <p className="apple-stat-label">SEO Warnings</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Issues */}
          {auditResult.seo.siteWideIssues.length > 0 && (
            <div className="apple-tile p-6">
                            <h3 className="apple-callout flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[#6e6e73]" />
                Top Site-Wide Issues
              </h3>
              <div className="max-h-64 overflow-y-auto apple-scrollbar">
                <div className="space-y-3">
                  {auditResult.seo.siteWideIssues.slice(0, 10).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(0,0,0,0.03)]">
                      <div className="mt-0.5 shrink-0">{getIssueBadge(issue.type)}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#1d1d1f]">{issue.message}</p>
                        <p className="text-xs text-[#6e6e73] mt-1">{issue.detail}</p>
                        <span className="apple-badge apple-badge-outline mt-1.5 text-xs">{issue.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Suggestions */}
          {auditResult.seo.topSuggestions.length > 0 && (
            <div className="apple-tile p-6">
                            <h3 className="apple-callout flex items-center gap-2 mb-4">
                <div className="glass-icon-bg flex h-7 w-7 items-center justify-center rounded-lg">
                  <Lightbulb className="h-4 w-4 text-[#2997ff]" />
                </div>
                Top Suggestions
              </h3>
              <div className="space-y-2.5">
                {auditResult.seo.topSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2">
                    <ChevronRight className="h-4 w-4 text-[#2997ff] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#1d1d1f]">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-Page Results */}
          <div className="apple-tile p-6">
                        <h3 className="apple-callout flex items-center gap-2 mb-1">
              <div className="glass-icon-bg flex h-7 w-7 items-center justify-center rounded-lg">
                <FileText className="h-4 w-4 text-[#2997ff]" />
              </div>
              Page-by-Page Results
            </h3>
            <p className="text-sm text-[#6e6e73] mb-4">Click on a page to see detailed analysis</p>
            <div className="space-y-3">
              {auditResult.seo.pageResults.map((page) => {
                const aeoData = auditResult.aeo.find((a) => a.url === page.url);
                const geoData = auditResult.geo.find((g) => g.url === page.url);
                const isExpanded = expandedPages.has(page.url);

                return (
                  <div key={page.url} className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
                    <button
                      onClick={() => togglePageExpand(page.url)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[rgba(0,0,0,0.03)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3 shrink-0">
                          <ScoreCircle score={page.seoScore} size={50} />
                          {aeoData && <ScoreCircle score={aeoData.aeoScore} size={50} />}
                          {geoData && <ScoreCircle score={geoData.geoScore} size={50} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate text-[#1d1d1f]">{page.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="apple-badge apple-badge-outline text-xs">SEO: {page.seoScore}</span>
                            {aeoData && <span className="apple-badge apple-badge-outline text-xs">AEO: {aeoData.aeoScore}</span>}
                            {geoData && <span className="apple-badge apple-badge-outline text-xs">GEO: {geoData.geoScore}</span>}
                            <span className="apple-badge apple-badge-fill text-xs">
                              {page.issues.length} issues
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-[#86868b] shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#86868b] shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[rgba(0,0,0,0.06)] p-5 space-y-6 bg-[rgba(0,0,0,0.015)]">
                        {/* Category Scores */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1d1d1f]">
                            <div className="glass-icon-bg flex h-6 w-6 items-center justify-center rounded-md">
                              <Gauge className="h-3.5 w-3.5 text-[#2997ff]" />
                            </div> SEO Category Scores
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(page.categoryScores).map(([cat, score]) => (
                              <CategoryScoreBar key={cat} label={cat} score={score} />
                            ))}
                          </div>
                        </div>

                        {/* Issues */}
                        {page.issues.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1d1d1f]">
                              <AlertTriangle className="h-4 w-4 text-[#6e6e73]" /> Issues ({page.issues.length})
                            </h4>
                            <div className="max-h-64 overflow-y-auto apple-scrollbar">
                              <div className="space-y-2">
                                {page.issues.map((issue, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(0,0,0,0.02)] text-sm">
                                    <div className="shrink-0 mt-0.5">{getIssueBadge(issue.type)}</div>
                                    <div>
                                      <p className="font-medium text-[#1d1d1f]">{issue.message}</p>
                                      <p className="text-xs text-[#6e6e73]">{issue.detail}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {page.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1d1d1f]">
                              <Lightbulb className="h-4 w-4 text-[#2997ff]" /> Suggestions
                            </h4>
                            <div className="space-y-1.5">
                              {page.suggestions.map((s, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 text-[#2997ff] mt-0.5 shrink-0" />
                                  <span className="text-[#1d1d1f]">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* AEO Details */}
                          {aeoData && (
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1d1d1f]">
                                <div className="glass-icon-bg flex h-6 w-6 items-center justify-center rounded-md">
                                  <Bot className="h-3.5 w-3.5 text-[#2997ff]" />
                                </div> AEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={aeoData.answerReadiness} />
                                {aeoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#2997ff] mb-1.5">Strengths</p>
                                    {aeoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0071e3] mt-0.5 shrink-0" />
                                        <span className="text-[#1d1d1f]">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {aeoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#6e6e73] mb-1.5">Recommendations</p>
                                    {aeoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-[#6e6e73] mt-0.5 shrink-0" />
                                        <span className="text-[#1d1d1f]">{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* GEO Details */}
                          {geoData && (
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1d1d1f]">
                                <div className="glass-icon-bg flex h-6 w-6 items-center justify-center rounded-md">
                                  <Brain className="h-3.5 w-3.5 text-[#2997ff]" />
                                </div> GEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={geoData.generativeReadiness} />
                                {geoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#2997ff] mb-1.5">Strengths</p>
                                    {geoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0071e3] mt-0.5 shrink-0" />
                                        <span className="text-[#1d1d1f]">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {geoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#6e6e73] mb-1.5">Recommendations</p>
                                    {geoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-[#6e6e73] mt-0.5 shrink-0" />
                                        <span className="text-[#1d1d1f]">{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!crawlLoading && !auditLoading && !auditResult && !auditError && (
        <div className="apple-tile p-6" style={{ border: '1px dashed rgba(0,0,0,0.08)' }}>
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868b]">
            <Globe className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium text-[#1d1d1f]">No audit results yet</p>
            <p className="text-sm">Enter a website URL and click &quot;Crawl &amp; Audit&quot; to get started</p>
          </div>
        </div>
      )}
    </div>
  );

  // ─── SERP Tab ─────────────────────────────────────────────────────────────

  const SerpTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="apple-headline-reduced">SERP &amp; Competitor Analysis</h2>
        <p className="apple-body mt-1">Analyze search results, discover patterns, and build backlink strategies</p>
      </div>

      <div className="apple-tile p-6">
                        <h3 className="apple-callout mb-1">SERP Analysis</h3>
        <p className="text-sm text-[#6e6e73] mb-4">Enter a keyword to analyze search engine results</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Enter a keyword (e.g., 'best seo tools')"
              value={serpKeyword}
              onChange={(e) => setSerpKeyword(e.target.value)}
              className="apple-input w-full"
              onKeyDown={(e) => e.key === 'Enter' && analyzeSerp()}
            />
          </div>
          <button
            onClick={analyzeSerp}
            disabled={serpLoading || !serpKeyword.trim()}
            className="apple-btn apple-btn-primary px-6 h-10 shrink-0"
          >
            {serpLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Analyze SERP
              </>
            )}
          </button>
        </div>
      </div>

      {serpError && (
        <div className="apple-tile p-6" style={{ borderLeft: '3px solid #ff3b30' }}>
                    <div className="flex items-center gap-2 text-[#1d1d1f]">
            <AlertCircle className="h-5 w-5 text-[#ff3b30]" />
            <p>{serpError}</p>
          </div>
        </div>
      )}

      {serpLoading && (
        <div className="apple-tile p-6">
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#2997ff]" />
            <p className="text-[#6e6e73]">Analyzing search results...</p>
          </div>
        </div>
      )}

      {serpResult && (
        <>
          {/* SERP Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Result Type Breakdown */}
            <div className="apple-tile p-5">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                <BarChart3 className="h-4 w-4 text-[#2997ff]" /> Result Types
              </h3>
              <div className="space-y-3">
                {Object.entries(serpResult.resultTypeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">{getResultTypeBadge(type)}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 apple-progress-track">
                        <motion.div
                          className="apple-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / serpResult.results.length) * 100}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        />
                      </div>
                      <span className="text-sm font-medium w-6 text-right text-[#1d1d1f]">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Snippet */}
            <div className="apple-tile p-5">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                <Eye className="h-4 w-4 text-[#2997ff]" /> Featured Snippet
              </h3>
              {serpResult.featuredSnippet ? (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-[#1d1d1f]">{serpResult.featuredSnippet.title}</p>
                  <p className="text-xs text-[#6e6e73] line-clamp-3">{serpResult.featuredSnippet.snippet}</p>
                  <a
                    href={serpResult.featuredSnippet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apple-link text-xs"
                  >
                    {serpResult.featuredSnippet.url.substring(0, 40)}...
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-[#6e6e73]">No featured snippet found for this query.</p>
              )}
            </div>

            {/* Common Words */}
            <div className="apple-tile p-5">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-1">
                <MessageSquare className="h-4 w-4 text-[#6e6e73]" /> Common Title Words
              </h3>
              <p className="text-xs text-[#6e6e73] mb-3">Avg title word count: {serpResult.avgWordCountInTitles}</p>
              <div className="flex flex-wrap gap-1.5">
                {serpResult.commonTitleWords.map((word) => (
                  <span key={word} className="apple-badge apple-badge-fill text-xs">{word}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results Table */}
          <div className="apple-tile overflow-hidden">
                        <div className="p-5 pb-3">
              <h3 className="apple-callout flex items-center gap-2">
                <div className="glass-icon-bg flex h-7 w-7 items-center justify-center rounded-lg">
                  <FileSearch className="h-4 w-4 text-[#2997ff]" />
                </div>
                Search Results
              </h3>
              <p className="text-sm text-[#6e6e73] mt-1">{serpResult.results.length} results found for &quot;{serpResult.keyword}&quot;</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto apple-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.06)]">
                    <th className="w-12 text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">#</th>
                    <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Title &amp; Snippet</th>
                    <th className="w-24 text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Type</th>
                    <th className="w-12 text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Feat.</th>
                  </tr>
                </thead>
                <tbody>
                  {serpResult.results.map((result) => (
                    <tr key={result.position} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-center text-[#2997ff]">{result.position}</td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-[#2997ff] hover:underline flex items-center gap-1"
                          >
                            {result.title}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                          <p className="text-xs text-[#86868b]">{result.url.substring(0, 60)}...</p>
                          <p className="text-xs text-[#6e6e73] line-clamp-2">{result.snippet}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">{getResultTypeBadge(result.resultType)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {result.isFeatured ? (
                          <CheckCircle2 className="h-4 w-4 text-[#0071e3] mx-auto" />
                        ) : (
                          <span className="text-[#aeaeb2]">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="apple-sep" />

          {/* Pattern & Backlink Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={analyzePatterns}
              disabled={patternLoading}
              className="apple-btn apple-btn-secondary px-6 h-10"
            >
              {patternLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing Patterns...</>
              ) : (
                <><Brain className="h-4 w-4" /> Analyze Patterns</>
              )}
            </button>
            <button
              onClick={generateBacklinks}
              disabled={backlinkLoading}
              className="apple-btn apple-btn-secondary px-6 h-10"
            >
              {backlinkLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating Strategy...</>
              ) : (
                <><Link2 className="h-4 w-4" /> Generate Backlink Strategy</>
              )}
            </button>
          </div>

          {/* Pattern Analysis Results */}
          {patternResult && (
            <div className="space-y-5">
              <h3 className="text-[22px] font-semibold tracking-[-0.01em] flex items-center gap-2 text-[#1d1d1f]">
                <div className="glass-icon-bg flex h-8 w-8 items-center justify-center rounded-lg">
                  <Brain className="h-4 w-4 text-[#2997ff]" />
                </div>
                Pattern Analysis
              </h3>

              {/* Insights Table */}
              <div className="apple-tile overflow-hidden">
                                <div className="p-5 pb-3">
                  <h4 className="text-base font-semibold text-[#1d1d1f]">Insights</h4>
                </div>
                <div className="max-h-64 overflow-y-auto apple-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.06)]">
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Metric</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Top Ranking Avg</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Your Value</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patternResult.insights.map((insight, idx) => (
                        <tr key={idx} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                          <td className="px-5 py-3 font-medium text-sm text-[#1d1d1f]">{insight.metric}</td>
                          <td className="px-5 py-3 text-sm text-[#1d1d1f]">{String(insight.topRankingAvg)}</td>
                          <td className="px-5 py-3 text-sm text-[#1d1d1f]">{String(insight.yourValue)}</td>
                          <td className="px-5 py-3">
                            <span className={insight.status === 'good' ? 'apple-badge apple-badge-blue' : insight.status === 'improve' ? 'apple-badge apple-badge-orange' : 'apple-badge apple-badge-red'}>
                              {insight.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#6e6e73] max-w-[200px]">{insight.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Must Add */}
                {patternResult.mustAdd.length > 0 && (
                  <div className="apple-tile p-5">
                                        <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                      <CheckCircle2 className="h-4 w-4 text-[#2997ff]" /> Must Add
                    </h4>
                    <div className="space-y-2">
                      {patternResult.mustAdd.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-[#2997ff] mt-0.5 shrink-0" />
                          <span className="text-[#1d1d1f]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Items */}
                {patternResult.youAreMissing.length > 0 && (
                  <div className="apple-tile p-5">
                                        <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                      <XCircle className="h-4 w-4 text-[#6e6e73]" /> You Are Missing
                    </h4>
                    <div className="space-y-2">
                      {patternResult.youAreMissing.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-[#aeaeb2] mt-0.5 shrink-0" />
                          <span className="text-[#1d1d1f]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Gaps */}
                {patternResult.contentGapAnalysis.length > 0 && (
                  <div className="apple-tile p-5">
                                        <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                      <Target className="h-4 w-4 text-[#6e6e73]" /> Content Gap Analysis
                    </h4>
                    <div className="space-y-2">
                      {patternResult.contentGapAnalysis.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-[#6e6e73] mt-0.5 shrink-0" />
                          <span className="text-[#1d1d1f]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competitive Advantage */}
                {patternResult.competitiveAdvantage.length > 0 && (
                  <div className="apple-tile p-5">
                                        <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                      <TrendingUp className="h-4 w-4 text-[#2997ff]" /> Competitive Advantage
                    </h4>
                    <div className="space-y-2">
                      {patternResult.competitiveAdvantage.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <ThumbsUp className="h-4 w-4 text-[#2997ff] mt-0.5 shrink-0" />
                          <span className="text-[#1d1d1f]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backlink Strategy Results */}
          {backlinkResult && (
            <div className="space-y-5">
              <h3 className="text-[22px] font-semibold tracking-[-0.01em] flex items-center gap-2 text-[#1d1d1f]">
                <div className="glass-icon-bg flex h-8 w-8 items-center justify-center rounded-lg">
                  <Link2 className="h-4 w-4 text-[#2997ff]" />
                </div>
                Backlink Strategy
              </h3>

              {/* Opportunities Table */}
              <div className="apple-tile overflow-hidden">
                                <div className="p-5 pb-3">
                  <h4 className="text-base font-semibold text-[#1d1d1f]">Opportunities ({backlinkResult.opportunities.length})</h4>
                </div>
                <div className="max-h-[400px] overflow-y-auto apple-scrollbar">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(0,0,0,0.06)]">
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Title</th>
                        <th className="w-24 text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Type</th>
                        <th className="w-24 text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Priority</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Strategy</th>
                        <th className="text-left text-xs font-medium text-[#6e6e73] uppercase tracking-wider px-5 py-3">Content Idea</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backlinkResult.opportunities.map((opp, idx) => (
                        <tr key={idx} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
                          <td className="px-5 py-3.5">
                            <div>
                              <a
                                href={opp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-[#2997ff] hover:underline flex items-center gap-1"
                              >
                                {opp.title}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                              <p className="text-xs text-[#86868b] truncate max-w-[200px]">{opp.url}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">{getResultTypeBadge(opp.type)}</td>
                          <td className="px-5 py-3.5">{getPriorityBadge(opp.priority)}</td>
                          <td className="px-5 py-3.5 text-xs text-[#6e6e73] max-w-[200px]">{opp.outreachStrategy}</td>
                          <td className="px-5 py-3.5 text-xs text-[#6e6e73] max-w-[200px]">{opp.contentIdea}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Content Suggestions */}
              {backlinkResult.contentSuggestions.length > 0 && (
                <div className="apple-tile p-5">
                                    <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                    <Lightbulb className="h-4 w-4 text-[#2997ff]" /> Content Suggestions
                  </h4>
                  <div className="space-y-2">
                    {backlinkResult.contentSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(0,0,0,0.02)] text-sm">
                        <FileText className="h-4 w-4 text-[#6e6e73] mt-0.5 shrink-0" />
                        <span className="text-[#1d1d1f]">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outreach Templates */}
              {backlinkResult.outreachTemplates.length > 0 && (
                <div className="apple-tile p-5">
                                    <h4 className="text-base font-semibold flex items-center gap-2 text-[#1d1d1f] mb-3">
                    <Mail className="h-4 w-4 text-[#2997ff]" /> Outreach Templates
                  </h4>
                  <div className="space-y-3">
                    {backlinkResult.outreachTemplates.map((template, idx) => (
                      <div key={idx} className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
                        <button
                          onClick={() => toggleTemplate(idx)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[rgba(0,0,0,0.03)] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="apple-badge apple-badge-outline">{template.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedTemplates.has(idx) && (
                              <button
                                className="apple-btn apple-btn-ghost text-xs min-h-0 h-7"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(template.template, idx); }}
                              >
                                {copiedTemplate === idx ? (
                                  <><Check className="h-3 w-3" /> Copied</>
                                ) : (
                                  <><Copy className="h-3 w-3" /> Copy</>
                                )}
                              </button>
                            )}
                            {expandedTemplates.has(idx) ? (
                              <ChevronUp className="h-4 w-4 text-[#86868b]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-[#86868b]" />
                            )}
                          </div>
                        </button>
                        {expandedTemplates.has(idx) && (
                          <div className="border-t border-[rgba(0,0,0,0.06)] p-4 bg-[rgba(0,0,0,0.015)]">
                            <pre className="whitespace-pre-wrap text-sm text-[#6e6e73] font-sans leading-relaxed">
                              {template.template}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!serpLoading && !serpResult && !serpError && (
        <div className="apple-tile p-6" style={{ border: '1px dashed rgba(0,0,0,0.08)' }}>
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868b]">
            <LineChart className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium text-[#1d1d1f]">No SERP analysis yet</p>
            <p className="text-sm">Enter a keyword and click &quot;Analyze SERP&quot; to get started</p>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const tabContent = (() => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'keywords': return <KeywordsTab />;
      case 'audit': return <AuditTab />;
      case 'serp': return <SerpTab />;
    }
  })();

  return (
    <div className="app-bg min-h-screen relative overflow-hidden flex flex-col">
      {/* Mouse-following light */}
      <div ref={mouseLightRef} className="mouse-light" style={{ opacity: 0 }} />

      {/* Content layer — above animated background mesh */}
      <div className="content-layer flex flex-col min-h-screen">

      {/* ─── Top Navigation — Apple frosted glass ─── */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="max-w-[980px] mx-auto flex items-center justify-between px-4 lg:px-6" style={{ height: 44 }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="glass-icon-bg flex h-7 w-7 items-center justify-center rounded-lg">
              <Search className="h-3.5 w-3.5 text-[#2997ff]" />
            </div>
            <span className="font-semibold text-[#1d1d1f] text-sm tracking-[-0.01em]">SEO Insight</span>
          </div>

          {/* Desktop Nav Tabs — Apple pill-style */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all duration-[240ms]',
                  activeTab === item.id
                    ? 'bg-[#0071e3] text-white'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.04)]'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-[#6e6e73] p-2">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#f5f5f7] border-[rgba(0,0,0,0.06)] w-64 p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-[#1d1d1f] text-sm">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#6e6e73] p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-[240ms]',
                      activeTab === item.id
                        ? 'bg-[#0071e3] text-white'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.04)]'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 relative z-[1]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {tabContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden glass-nav border-t border-[rgba(0,0,0,0.06)] sticky bottom-0 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 transition-colors duration-[240ms]',
                activeTab === item.id
                  ? 'text-[#0071e3]'
                  : 'text-[#86868b]'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Footer — Apple-style minimal ─── */}
      <footer className="border-t border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="glass-icon-bg flex h-5 w-5 items-center justify-center rounded-md">
                <Search className="h-2.5 w-2.5 text-[#2997ff]" />
              </div>
              <span className="text-xs font-semibold text-[#1d1d1f]">SEO Insight</span>
            </div>
            <p className="text-xs text-[#86868b]">
              Comprehensive SEO, AEO &amp; GEO analysis platform
            </p>
          </div>
        </div>
      </footer>
      </div>{/* end content-layer */}
    </div>
  );
}
