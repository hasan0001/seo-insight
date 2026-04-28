'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const BLUE = '#0A84FF';
const BLUE_HOVER = '#409CFF';
const CYAN = '#64D2FF';
const RED = '#FF453A';
const ORANGE = '#FF9F0A';
const GREEN = '#30D158';

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[#64D2FF]';
  if (score >= 60) return 'text-white';
  return 'text-white/35';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-[#0A84FF]';
  if (score >= 60) return 'bg-white/25';
  return 'bg-white/12';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#0A84FF';
  if (score >= 60) return 'rgba(255,255,255,0.40)';
  return 'rgba(255,255,255,0.15)';
}

function getDifficultyColor(label: string): string {
  switch (label?.toLowerCase()) {
    case 'easy': return 'badge badge-blue';
    case 'medium': return 'badge badge-fill';
    case 'hard': return 'badge badge-orange';
    case 'very hard': return 'badge badge-red';
    default: return 'badge badge-fill';
  }
}

function getDifficultyDotColor(score: number): string {
  if (score < 30) return 'bg-[#0A84FF]';
  if (score < 60) return 'bg-white/50';
  return 'bg-[#FF9F0A]';
}

function getIssueBadge(type: 'error' | 'warning' | 'info') {
  switch (type) {
    case 'error': return <span className="badge badge-red"><XCircle className="mr-1 h-3 w-3" />Error</span>;
    case 'warning': return <span className="badge badge-orange"><AlertTriangle className="mr-1 h-3 w-3" />Warning</span>;
    case 'info': return <span className="badge badge-blue"><Info className="mr-1 h-3 w-3" />Info</span>;
  }
}

function getPriorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high': return <span className="badge badge-red">High</span>;
    case 'medium': return <span className="badge badge-orange">Medium</span>;
    case 'low': return <span className="badge badge-blue">Low</span>;
  }
}

function getResultTypeBadge(type: string) {
  const m: Record<string, string> = {
    blog: 'badge badge-blue', ecommerce: 'badge badge-fill', video: 'badge badge-orange',
    forum: 'badge badge-fill', news: 'badge badge-blue', web: 'badge badge-fill',
  };
  return <span className={m[type] || m.web}>{type}</span>;
}

function getSourceBadge(source: string) {
  const m: Record<string, string> = {
    'google-suggest': 'badge badge-blue', 'people-also-ask': 'badge badge-fill',
    'related-searches': 'badge badge-fill', 'expansion': 'badge badge-outline', 'questions': 'badge badge-blue',
  };
  return <span className={m[source] || 'badge badge-fill'}>{source}</span>;
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
            stroke="rgba(255,255,255,0.06)"
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
          <span className={cn('text-2xl font-bold tracking-tight', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-white/55 font-medium">{label}</span>}
    </div>
  );
}

// ─── Category Score Bar ────────────────────────────────────────────────────────

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/55 capitalize">{label}</span>
        <span className={cn('font-semibold', getScoreColor(score))}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getScoreBgColor(score))}
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
            <CheckCircle2 className="h-4 w-4 text-[#0A84FF] shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-white/12 shrink-0" />
          )}
          <span className={value ? 'text-white' : 'text-white/55'}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
        </div>
      ))}
    </div>
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
      {/* Hero */}
      <div className="text-center py-12 md:py-20">
        <motion.h1
          className="text-[34px] md:text-[56px] font-bold tracking-[-0.02em] text-white"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pageTransition}
        >
          SEO Insight
        </motion.h1>
        <motion.p
          className="mt-4 text-lg md:text-xl text-white/55 max-w-2xl mx-auto"
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
          <span className="badge badge-blue px-4 py-1.5 text-sm font-medium">
            <Zap className="mr-1.5 h-3.5 w-3.5" /> SEO Optimization
          </span>
          <span className="badge badge-blue px-4 py-1.5 text-sm font-medium">
            <Bot className="mr-1.5 h-3.5 w-3.5" /> AEO Readiness
          </span>
          <span className="badge badge-blue px-4 py-1.5 text-sm font-medium">
            <Brain className="mr-1.5 h-3.5 w-3.5" /> GEO Analysis
          </span>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            whileHover={{ scale: 1.008, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
          >
            <Card
              className="cursor-pointer mat-card rounded-[20px] h-full transition-shadow duration-300"
              onClick={() => setActiveTab(feature.tab)}
            >
              <CardHeader className="pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] fill-blue-1">
                  <span className="text-[#64D2FF]">{feature.icon}</span>
                </div>
                <CardTitle className="text-lg mt-3 font-semibold text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-white/55">{feature.description}</CardDescription>
                <div className="mt-4 flex items-center text-sm font-medium text-[#64D2FF] group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="mat-subtle rounded-[24px] p-8 md:p-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-[#64D2FF]" />
          <h2 className="text-[28px] font-bold tracking-[-0.02em] text-white">Quick Start Guide</h2>
        </div>
        <p className="text-white/55 mb-8">Follow these steps to get the most out of SEO Insight</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
              <div className="relative p-5 rounded-[20px] mat-card hover:shadow-lg transition-shadow duration-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A84FF] text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <div className="flex items-center gap-2 mb-2 text-[#64D2FF]">
                  {item.icon}
                  <span className="font-semibold text-sm text-white">{item.title}</span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            whileHover={{ scale: 1.008, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
          >
            <Card className="mat-card rounded-[20px] h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] fill-blue-1">
                    <span className="text-[#64D2FF]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-[28px] font-bold text-white">{item.title}</p>
                    <p className="text-sm text-white/55">{item.subtitle}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/55 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Keywords Tab ─────────────────────────────────────────────────────────

  const KeywordsTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-white">Keyword Discovery</h2>
        <p className="text-white/55 mt-1">Find high-value keywords with difficulty analysis and clustering</p>
      </div>

      <Card className="mat-card rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[20px] font-semibold text-white">Seed Keyword</CardTitle>
          <CardDescription className="text-white/55">Enter a keyword to discover related keywords across multiple sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Enter a seed keyword (e.g., 'seo tools')"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="pl-10 app-input text-white placeholder:text-white/30 h-11"
                onKeyDown={(e) => e.key === 'Enter' && discoverKeywords()}
              />
            </div>
            <Button
              onClick={discoverKeywords}
              disabled={keywordLoading || !keywordInput.trim()}
              className="btn-primary shrink-0 px-6 h-11"
            >
              {keywordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Discover
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-5">
            {Object.entries(keywordSources).map(([source, checked]) => (
              <div key={source} className="flex items-center gap-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={checked}
                  onCheckedChange={(val) =>
                    setKeywordSources((prev) => ({ ...prev, [source]: !!val }))
                  }
                  className="data-[state=checked]:bg-[#0A84FF] data-[state=checked]:border-[#0A84FF]"
                />
                <Label htmlFor={`source-${source}`} className="text-sm cursor-pointer text-white">
                  {source.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {keywordError && (
        <Card className="mat-card border-[#FF453A]/12 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5" />
              <p>{keywordError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {keywordResults.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="badge badge-blue text-sm py-1.5 px-4 font-medium">
                {keywordResults.length} keywords found
              </span>
              <span className="badge badge-fill text-sm py-1.5 px-4 font-medium">
                {Object.keys(clusteredKeywords).length} clusters
              </span>
            </div>
            <div className="flex items-center gap-1 fill-2 rounded-full p-1">
              <Button
                variant={keywordView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('table')}
                className={cn('rounded-full text-sm', keywordView === 'table' ? 'bg-[#0A84FF] shadow-sm text-white' : 'text-white/55')}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={keywordView === 'cluster' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('cluster')}
                className={cn('rounded-full text-sm', keywordView === 'cluster' ? 'bg-[#0A84FF] shadow-sm text-white' : 'text-white/55')}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Clusters
              </Button>
            </div>
          </div>

          {keywordView === 'table' ? (
            <Card className="mat-card rounded-[20px] overflow-hidden">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="fill-3 hover:fill-3">
                      <TableHead className="w-[40%] text-white/55 font-medium">Keyword</TableHead>
                      <TableHead className="text-white/55 font-medium">Source</TableHead>
                      <TableHead className="text-white/55 font-medium">Difficulty</TableHead>
                      <TableHead className="text-white/55 font-medium">Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordResults.map((kw, idx) => (
                      <TableRow key={idx} className="hover:bg-white/5 transition-colors border-white/6">
                        <TableCell className="font-medium text-white">{kw.keyword}</TableCell>
                        <TableCell>{getSourceBadge(kw.source)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', getDifficultyDotColor(kw.difficulty.score))} />
                            <span className={cn(getDifficultyColor(kw.difficulty.label), 'font-medium')}>
                              {kw.difficulty.score} - {kw.difficulty.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {kw.cluster ? (
                            <span className="badge badge-outline">{kw.cluster}</span>
                          ) : (
                            <span className="text-white/55 text-sm">&mdash;</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(clusteredKeywords).map(([cluster, keywords]) => (
                <Card key={cluster} className="mat-card rounded-[20px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-white">{cluster}</CardTitle>
                      <span className="badge badge-fill rounded-full">{keywords.length} keywords</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="badge badge-outline cursor-default py-1.5 px-3.5 hover:bg-white/5 transition-colors"
                              >
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {keywordLoading && (
        <Card className="mat-card rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#64D2FF]" />
              <p className="text-white/55">Discovering keywords across sources...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!keywordLoading && keywordResults.length === 0 && !keywordError && (
        <Card className="mat-subtle border-dashed border-white/7 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/55">
              <KeyRound className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-white">No keywords discovered yet</p>
              <p className="text-sm">Enter a seed keyword and click &quot;Discover&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── Audit Tab ────────────────────────────────────────────────────────────

  const AuditTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-white">Site Audit</h2>
        <p className="text-white/55 mt-1">Crawl and audit your website for SEO, AEO, and GEO issues</p>
      </div>

      <Card className="mat-card rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[20px] font-semibold text-white">Crawl Settings</CardTitle>
          <CardDescription className="text-white/55">Configure your website crawl parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Enter website URL (e.g., https://example.com)"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                className="pl-10 app-input text-white placeholder:text-white/30 h-11"
                onKeyDown={(e) => e.key === 'Enter' && crawlAndAudit()}
              />
            </div>
            <Button
              onClick={crawlAndAudit}
              disabled={crawlLoading || auditLoading || !auditUrl.trim()}
              className="btn-primary shrink-0 px-6 h-11"
            >
              {crawlLoading || auditLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {crawlLoading ? 'Crawling...' : 'Auditing...'}
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" /> Crawl &amp; Audit
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Max Pages: {maxPages[0]}</Label>
              </div>
              <Slider
                value={maxPages}
                onValueChange={setMaxPages}
                min={5}
                max={50}
                step={5}
                className="w-full [&_[role=slider]]:bg-[#0A84FF] [&_[role=slider]]:border-[#0A84FF]"
              />
              <div className="flex justify-between text-xs text-white/55">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Max Depth: {maxDepth[0]}</Label>
              </div>
              <Slider
                value={maxDepth}
                onValueChange={setMaxDepth}
                min={1}
                max={3}
                step={1}
                className="w-full [&_[role=slider]]:bg-[#0A84FF] [&_[role=slider]]:border-[#0A84FF]"
              />
              <div className="flex justify-between text-xs text-white/55">
                <span>1</span>
                <span>3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(crawlLoading || auditLoading) && (
        <Card className="mat-card rounded-[20px]">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/55">
                {crawlLoading ? 'Crawling website...' : 'Running audit analysis...'}
              </span>
              <span className="font-semibold text-white">{crawlProgress}%</span>
            </div>
            <Progress value={crawlProgress} className="h-1.5 [&>div]:bg-[#0A84FF]" />
          </CardContent>
        </Card>
      )}

      {auditError && (
        <Card className="mat-card border-[#FF453A]/12 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5" />
              <p>{auditError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Results */}
      {auditResult && (
        <>
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0 }}
            >
              <Card className="mat-card rounded-[20px]">
                <CardContent className="pt-8 pb-8 flex flex-col items-center">
                  <ScoreCircle score={auditResult.seo.averageScore} size={140} label="SEO Score" />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0.08 }}
            >
              <Card className="mat-card rounded-[20px]">
                <CardContent className="pt-8 pb-8 flex flex-col items-center">
                  <ScoreCircle
                    score={Math.round(auditResult.aeo.reduce((s, a) => s + a.aeoScore, 0) / Math.max(auditResult.aeo.length, 1))}
                    size={140}
                    label="AEO Score"
                  />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...pageTransition, delay: 0.16 }}
            >
              <Card className="mat-card rounded-[20px]">
                <CardContent className="pt-8 pb-8 flex flex-col items-center">
                  <ScoreCircle
                    score={Math.round(auditResult.geo.reduce((s, g) => s + g.geoScore, 0) / Math.max(auditResult.geo.length, 1))}
                    size={140}
                    label="GEO Score"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Crawl Summary */}
          {crawlResult && (
            <Card className="mat-card rounded-[20px]">
              <CardHeader>
                <CardTitle className="text-[20px] font-semibold flex items-center gap-2 text-white">
                  <FileSearch className="h-5 w-5 text-[#64D2FF]" />
                  Crawl Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-[12px] fill-3">
                    <p className="text-2xl font-bold text-white">{crawlResult.totalPages}</p>
                    <p className="text-xs text-white/55">Pages Crawled</p>
                  </div>
                  <div className="text-center p-4 rounded-[12px] fill-3">
                    <p className="text-2xl font-bold text-white">{crawlResult.errors.length}</p>
                    <p className="text-xs text-white/55">Crawl Errors</p>
                  </div>
                  <div className="text-center p-4 rounded-[12px] fill-blue-3">
                    <p className="text-2xl font-bold text-white">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'error').length}</p>
                    <p className="text-xs text-white/55">SEO Errors</p>
                  </div>
                  <div className="text-center p-4 rounded-[12px] fill-3">
                    <p className="text-2xl font-bold text-white">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'warning').length}</p>
                    <p className="text-xs text-white/55">SEO Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Issues */}
          {auditResult.seo.siteWideIssues.length > 0 && (
            <Card className="mat-card rounded-[20px]">
              <CardHeader>
                <CardTitle className="text-[20px] font-semibold flex items-center gap-2 text-white">
                  <AlertTriangle className="h-5 w-5 text-white/55" />
                  Top Site-Wide Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {auditResult.seo.siteWideIssues.slice(0, 10).map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-[12px] fill-3">
                        <div className="mt-0.5 shrink-0">{getIssueBadge(issue.type)}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-white">{issue.message}</p>
                          <p className="text-xs text-white/55 mt-1">{issue.detail}</p>
                          <span className="badge badge-outline mt-1.5 text-xs">{issue.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Top Suggestions */}
          {auditResult.seo.topSuggestions.length > 0 && (
            <Card className="mat-card rounded-[20px]">
              <CardHeader>
                <CardTitle className="text-[20px] font-semibold flex items-center gap-2 text-white">
                  <Lightbulb className="h-5 w-5 text-[#64D2FF]" />
                  Top Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {auditResult.seo.topSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2">
                      <ChevronRight className="h-4 w-4 text-[#64D2FF] mt-0.5 shrink-0" />
                      <p className="text-sm text-white">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-Page Results */}
          <Card className="mat-card rounded-[20px]">
            <CardHeader>
              <CardTitle className="text-[20px] font-semibold flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-[#64D2FF]" />
                Page-by-Page Results
              </CardTitle>
              <CardDescription className="text-white/55">Click on a page to see detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditResult.seo.pageResults.map((page) => {
                const aeoData = auditResult.aeo.find((a) => a.url === page.url);
                const geoData = auditResult.geo.find((g) => g.url === page.url);
                const isExpanded = expandedPages.has(page.url);

                return (
                  <div key={page.url} className="border border-white/7 rounded-[12px] overflow-hidden">
                    <button
                      onClick={() => togglePageExpand(page.url)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3 shrink-0">
                          <ScoreCircle score={page.seoScore} size={50} />
                          {aeoData && <ScoreCircle score={aeoData.aeoScore} size={50} />}
                          {geoData && <ScoreCircle score={geoData.geoScore} size={50} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate text-white">{page.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-outline text-xs">SEO: {page.seoScore}</span>
                            {aeoData && <span className="badge badge-outline text-xs">AEO: {aeoData.aeoScore}</span>}
                            {geoData && <span className="badge badge-outline text-xs">GEO: {geoData.geoScore}</span>}
                            <span className="badge badge-fill text-xs">
                              {page.issues.length} issues
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-white/55 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-white/55 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/7 p-5 space-y-6 bg-white/3">
                        {/* Category Scores */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                            <Gauge className="h-4 w-4 text-[#64D2FF]" /> SEO Category Scores
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
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                              <AlertTriangle className="h-4 w-4 text-white/55" /> Issues ({page.issues.length})
                            </h4>
                            <ScrollArea className="max-h-64">
                              <div className="space-y-2">
                                {page.issues.map((issue, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-3 rounded-[12px] mat-subtle text-sm">
                                    <div className="shrink-0 mt-0.5">{getIssueBadge(issue.type)}</div>
                                    <div>
                                      <p className="font-medium text-white">{issue.message}</p>
                                      <p className="text-xs text-white/55">{issue.detail}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}

                        {/* Suggestions */}
                        {page.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                              <Lightbulb className="h-4 w-4 text-[#64D2FF]" /> Suggestions
                            </h4>
                            <div className="space-y-1.5">
                              {page.suggestions.map((s, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 text-[#64D2FF] mt-0.5 shrink-0" />
                                  <span className="text-white">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* AEO Details */}
                          {aeoData && (
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                                <Bot className="h-4 w-4 text-[#64D2FF]" /> AEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={aeoData.answerReadiness} />
                                {aeoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#64D2FF] mb-1.5">Strengths</p>
                                    {aeoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0A84FF] mt-0.5 shrink-0" />
                                        <span className="text-white">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {aeoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-white/55 mb-1.5">Recommendations</p>
                                    {aeoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-white/55 mt-0.5 shrink-0" />
                                        <span className="text-white">{r}</span>
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
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                                <Brain className="h-4 w-4 text-[#64D2FF]" /> GEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={geoData.generativeReadiness} />
                                {geoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#64D2FF] mb-1.5">Strengths</p>
                                    {geoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0A84FF] mt-0.5 shrink-0" />
                                        <span className="text-white">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {geoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-white/55 mb-1.5">Recommendations</p>
                                    {geoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-white/55 mt-0.5 shrink-0" />
                                        <span className="text-white">{r}</span>
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
            </CardContent>
          </Card>
        </>
      )}

      {!crawlLoading && !auditLoading && !auditResult && !auditError && (
        <Card className="mat-subtle border-dashed border-white/7 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/55">
              <Globe className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-white">No audit results yet</p>
              <p className="text-sm">Enter a website URL and click &quot;Crawl &amp; Audit&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── SERP Tab ─────────────────────────────────────────────────────────────

  const SerpTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-[28px] font-bold tracking-[-0.02em] text-white">SERP &amp; Competitor Analysis</h2>
        <p className="text-white/55 mt-1">Analyze search results, discover patterns, and build backlink strategies</p>
      </div>

      <Card className="mat-card rounded-[20px]">
        <CardHeader>
          <CardTitle className="text-[20px] font-semibold text-white">SERP Analysis</CardTitle>
          <CardDescription className="text-white/55">Enter a keyword to analyze search engine results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Enter a keyword (e.g., 'best seo tools')"
                value={serpKeyword}
                onChange={(e) => setSerpKeyword(e.target.value)}
                className="pl-10 app-input text-white placeholder:text-white/30 h-11"
                onKeyDown={(e) => e.key === 'Enter' && analyzeSerp()}
              />
            </div>
            <Button
              onClick={analyzeSerp}
              disabled={serpLoading || !serpKeyword.trim()}
              className="btn-primary shrink-0 px-6 h-11"
            >
              {serpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Analyze SERP
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {serpError && (
        <Card className="mat-card border-[#FF453A]/12 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5" />
              <p>{serpError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpLoading && (
        <Card className="mat-card rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#64D2FF]" />
              <p className="text-white/55">Analyzing search results...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpResult && (
        <>
          {/* SERP Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Result Type Breakdown */}
            <Card className="mat-card rounded-[20px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                  <BarChart3 className="h-4 w-4 text-[#64D2FF]" /> Result Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(serpResult.resultTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{getResultTypeBadge(type)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/6 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#0A84FF]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / serpResult.results.length) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right text-white">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Snippet */}
            <Card className="mat-card rounded-[20px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                  <Eye className="h-4 w-4 text-[#64D2FF]" /> Featured Snippet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serpResult.featuredSnippet ? (
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-white">{serpResult.featuredSnippet.title}</p>
                    <p className="text-xs text-white/55 line-clamp-3">{serpResult.featuredSnippet.snippet}</p>
                    <a
                      href={serpResult.featuredSnippet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#64D2FF] hover:underline flex items-center gap-1"
                    >
                      {serpResult.featuredSnippet.url.substring(0, 40)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-white/55">No featured snippet found for this query.</p>
                )}
              </CardContent>
            </Card>

            {/* Common Words */}
            <Card className="mat-card rounded-[20px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                  <MessageSquare className="h-4 w-4 text-white/55" /> Common Title Words
                </CardTitle>
                <CardDescription className="text-white/55">Avg title word count: {serpResult.avgWordCountInTitles}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {serpResult.commonTitleWords.map((word) => (
                    <span key={word} className="badge badge-fill text-xs">{word}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results Table */}
          <Card className="mat-card rounded-[20px]">
            <CardHeader>
              <CardTitle className="text-[20px] font-semibold flex items-center gap-2 text-white">
                <FileSearch className="h-5 w-5 text-[#64D2FF]" /> Search Results
              </CardTitle>
              <CardDescription className="text-white/55">{serpResult.results.length} results found for &quot;{serpResult.keyword}&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="fill-3 hover:fill-3">
                      <TableHead className="w-12 text-white/55 font-medium">#</TableHead>
                      <TableHead className="text-white/55 font-medium">Title &amp; Snippet</TableHead>
                      <TableHead className="w-24 text-white/55 font-medium">Type</TableHead>
                      <TableHead className="w-12 text-white/55 font-medium">Feat.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serpResult.results.map((result) => (
                      <TableRow key={result.position} className="hover:bg-white/5 transition-colors border-white/6">
                        <TableCell className="font-semibold text-center text-[#64D2FF]">{result.position}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-[#64D2FF] hover:underline flex items-center gap-1"
                            >
                              {result.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            <p className="text-xs text-white/55">{result.url.substring(0, 60)}...</p>
                            <p className="text-xs text-white/55 line-clamp-2">{result.snippet}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getResultTypeBadge(result.resultType)}</TableCell>
                        <TableCell className="text-center">
                          {result.isFeatured ? (
                            <CheckCircle2 className="h-4 w-4 text-[#0A84FF] mx-auto" />
                          ) : (
                            <span className="text-white/20">&mdash;</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="sep" />

          {/* Pattern & Backlink Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={analyzePatterns}
              disabled={patternLoading}
              variant="outline"
              className="btn-secondary px-6 h-11"
            >
              {patternLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Patterns...</>
              ) : (
                <><Brain className="mr-2 h-4 w-4" /> Analyze Patterns</>
              )}
            </Button>
            <Button
              onClick={generateBacklinks}
              disabled={backlinkLoading}
              variant="outline"
              className="btn-secondary px-6 h-11"
            >
              {backlinkLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Strategy...</>
              ) : (
                <><Link2 className="mr-2 h-4 w-4" /> Generate Backlink Strategy</>
              )}
            </Button>
          </div>

          {/* Pattern Analysis Results */}
          {patternResult && (
            <div className="space-y-5">
              <h3 className="text-[22px] font-bold tracking-[-0.01em] flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-[#64D2FF]" /> Pattern Analysis
              </h3>

              {/* Insights Table */}
              <Card className="mat-card rounded-[20px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow className="fill-3 hover:fill-3">
                          <TableHead className="text-white/55 font-medium">Metric</TableHead>
                          <TableHead className="text-white/55 font-medium">Top Ranking Avg</TableHead>
                          <TableHead className="text-white/55 font-medium">Your Value</TableHead>
                          <TableHead className="text-white/55 font-medium">Status</TableHead>
                          <TableHead className="text-white/55 font-medium">Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patternResult.insights.map((insight, idx) => (
                          <TableRow key={idx} className="hover:bg-white/5 transition-colors border-white/6">
                            <TableCell className="font-medium text-sm text-white">{insight.metric}</TableCell>
                            <TableCell className="text-sm text-white">{String(insight.topRankingAvg)}</TableCell>
                            <TableCell className="text-sm text-white">{String(insight.yourValue)}</TableCell>
                            <TableCell>
                              <span className={insight.status === 'good' ? 'badge badge-blue' : insight.status === 'improve' ? 'badge badge-orange' : 'badge badge-red'}>
                                {insight.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-white/55 max-w-[200px]">{insight.recommendation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Must Add */}
                {patternResult.mustAdd.length > 0 && (
                  <Card className="mat-card rounded-[20px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                        <CheckCircle2 className="h-4 w-4 text-[#64D2FF]" /> Must Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.mustAdd.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-[#64D2FF] mt-0.5 shrink-0" />
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Items */}
                {patternResult.youAreMissing.length > 0 && (
                  <Card className="mat-card rounded-[20px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                        <XCircle className="h-4 w-4 text-white/55" /> You Are Missing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.youAreMissing.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-white/12 mt-0.5 shrink-0" />
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Gaps */}
                {patternResult.contentGapAnalysis.length > 0 && (
                  <Card className="mat-card rounded-[20px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                        <Target className="h-4 w-4 text-white/55" /> Content Gap Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.contentGapAnalysis.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-white/55 mt-0.5 shrink-0" />
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competitive Advantage */}
                {patternResult.competitiveAdvantage.length > 0 && (
                  <Card className="mat-card rounded-[20px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                        <TrendingUp className="h-4 w-4 text-[#64D2FF]" /> Competitive Advantage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.competitiveAdvantage.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ThumbsUp className="h-4 w-4 text-[#64D2FF] mt-0.5 shrink-0" />
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Backlink Strategy Results */}
          {backlinkResult && (
            <div className="space-y-5">
              <h3 className="text-[22px] font-bold tracking-[-0.01em] flex items-center gap-2 text-white">
                <Link2 className="h-5 w-5 text-[#64D2FF]" /> Backlink Strategy
              </h3>

              {/* Opportunities Table */}
              <Card className="mat-card rounded-[20px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white">Opportunities ({backlinkResult.opportunities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="fill-3 hover:fill-3">
                          <TableHead className="text-white/55 font-medium">Title</TableHead>
                          <TableHead className="w-24 text-white/55 font-medium">Type</TableHead>
                          <TableHead className="w-24 text-white/55 font-medium">Priority</TableHead>
                          <TableHead className="text-white/55 font-medium">Strategy</TableHead>
                          <TableHead className="text-white/55 font-medium">Content Idea</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backlinkResult.opportunities.map((opp, idx) => (
                          <TableRow key={idx} className="hover:bg-white/5 transition-colors border-white/6">
                            <TableCell>
                              <div>
                                <a
                                  href={opp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-sm text-[#64D2FF] hover:underline flex items-center gap-1"
                                >
                                  {opp.title}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                                <p className="text-xs text-white/55 truncate max-w-[200px]">{opp.url}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getResultTypeBadge(opp.type)}</TableCell>
                            <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                            <TableCell className="text-xs text-white/55 max-w-[200px]">{opp.outreachStrategy}</TableCell>
                            <TableCell className="text-xs text-white/55 max-w-[200px]">{opp.contentIdea}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Content Suggestions */}
              {backlinkResult.contentSuggestions.length > 0 && (
                <Card className="mat-card rounded-[20px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                      <Lightbulb className="h-4 w-4 text-[#64D2FF]" /> Content Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {backlinkResult.contentSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-[12px] fill-3 text-sm">
                          <FileText className="h-4 w-4 text-white/55 mt-0.5 shrink-0" />
                          <span className="text-white">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Outreach Templates */}
              {backlinkResult.outreachTemplates.length > 0 && (
                <Card className="mat-card rounded-[20px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                      <Mail className="h-4 w-4 text-[#64D2FF]" /> Outreach Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {backlinkResult.outreachTemplates.map((template, idx) => (
                      <div key={idx} className="border border-white/7 rounded-[12px] overflow-hidden">
                        <button
                          onClick={() => toggleTemplate(idx)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="badge badge-outline">{template.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedTemplates.has(idx) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-[#64D2FF] hover:text-[#64D2FF]"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(template.template, idx); }}
                              >
                                {copiedTemplate === idx ? (
                                  <><Check className="mr-1 h-3 w-3" /> Copied</>
                                ) : (
                                  <><Copy className="mr-1 h-3 w-3" /> Copy</>
                                )}
                              </Button>
                            )}
                            {expandedTemplates.has(idx) ? (
                              <ChevronUp className="h-4 w-4 text-white/55" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-white/55" />
                            )}
                          </div>
                        </button>
                        {expandedTemplates.has(idx) && (
                          <div className="border-t border-white/7 p-4 bg-white/3">
                            <pre className="whitespace-pre-wrap text-sm text-white/55 font-sans leading-relaxed">
                              {template.template}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {!serpLoading && !serpResult && !serpError && (
        <Card className="mat-subtle border-dashed border-white/7 rounded-[20px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-white/55">
              <LineChart className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-white">No SERP analysis yet</p>
              <p className="text-sm">Enter a keyword and click &quot;Analyze SERP&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
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
    <div className="app-bg min-h-screen flex flex-col">
      {/* ─── Top Navigation ─── */}
      <header className="sticky top-0 z-50 mat-nav border-b border-white/7">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A84FF]">
              <Search className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">SEO Insight</span>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  activeTab === item.id
                    ? 'bg-[#0A84FF] text-white'
                    : 'text-white/55 hover:text-white hover:bg-white/6'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden text-white/55">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="mat-elevated border-white/7 w-64 p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-white text-lg">Menu</span>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="text-white/55">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium transition-all',
                      activeTab === item.id
                        ? 'bg-[#0A84FF] text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/6'
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
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 md:py-12">
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
      <nav className="md:hidden mat-nav border-t border-white/7 sticky bottom-0 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 transition-colors',
                activeTab === item.id
                  ? 'text-[#0A84FF]'
                  : 'text-white/35'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Footer ─── */}
      <footer className="mat-subtle border-t border-white/7">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0A84FF]">
                <Search className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">SEO Insight</span>
            </div>
            <p className="text-xs text-white/35">
              Comprehensive SEO, AEO &amp; GEO analysis platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
