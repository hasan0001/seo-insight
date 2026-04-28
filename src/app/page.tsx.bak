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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Cpu,
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
  CircleDot,
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

const APPLE_BLUE = '#0071E3';
const APPLE_BLUE_HOVER = '#0077ED';
const APPLE_BLACK = '#1D1D1F';
const APPLE_GRAY = '#86868B';
const APPLE_LIGHT_GRAY = '#F5F5F7';
const APPLE_BORDER = '#D2D2D7';

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[#0071E3]';
  if (score >= 60) return 'text-[#1D1D1F]';
  if (score >= 40) return 'text-[#86868B]';
  return 'text-[#86868B]';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-[#0071E3]';
  if (score >= 60) return 'bg-[#86868B]';
  if (score >= 40) return 'bg-[#D2D2D7]';
  return 'bg-[#D2D2D7]';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return '#0071E3';
  if (score >= 60) return '#86868B';
  if (score >= 40) return '#D2D2D7';
  return '#D2D2D7';
}

function getDifficultyColor(label: string): string {
  switch (label?.toLowerCase()) {
    case 'easy':
      return 'bg-[#0071E3]/10 text-[#0071E3]';
    case 'medium':
      return 'bg-[#1D1D1F]/10 text-[#1D1D1F]';
    case 'hard':
      return 'bg-[#86868B]/15 text-[#86868B]';
    case 'very hard':
      return 'bg-[#1D1D1F]/15 text-[#1D1D1F]';
    default:
      return 'bg-[#F5F5F7] text-[#86868B]';
  }
}

function getDifficultyDotColor(score: number): string {
  if (score < 30) return 'bg-[#0071E3]';
  if (score < 60) return 'bg-[#86868B]';
  return 'bg-[#1D1D1F]';
}

function getIssueBadge(type: 'error' | 'warning' | 'info') {
  switch (type) {
    case 'error':
      return <Badge className="bg-[#1D1D1F]/10 text-[#1D1D1F] hover:bg-[#1D1D1F]/10 font-medium"><XCircle className="mr-1 h-3 w-3" />Error</Badge>;
    case 'warning':
      return <Badge className="bg-[#86868B]/10 text-[#86868B] hover:bg-[#86868B]/10 font-medium"><AlertTriangle className="mr-1 h-3 w-3" />Warning</Badge>;
    case 'info':
      return <Badge className="bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/10 font-medium"><Info className="mr-1 h-3 w-3" />Info</Badge>;
  }
}

function getPriorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return <Badge className="bg-[#1D1D1F]/10 text-[#1D1D1F] hover:bg-[#1D1D1F]/10 font-medium">High</Badge>;
    case 'medium':
      return <Badge className="bg-[#86868B]/10 text-[#86868B] hover:bg-[#86868B]/10 font-medium">Medium</Badge>;
    case 'low':
      return <Badge className="bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/10 font-medium">Low</Badge>;
  }
}

function getResultTypeBadge(type: string) {
  const styles: Record<string, string> = {
    blog: 'bg-[#0071E3]/10 text-[#0071E3]',
    ecommerce: 'bg-[#1D1D1F]/8 text-[#1D1D1F]',
    video: 'bg-[#86868B]/10 text-[#86868B]',
    forum: 'bg-[#D2D2D7]/50 text-[#1D1D1F]',
    news: 'bg-[#0071E3]/10 text-[#0071E3]',
    web: 'bg-[#F5F5F7] text-[#86868B]',
  };
  return (
    <Badge className={styles[type] || styles.web}>
      {type}
    </Badge>
  );
}

function getSourceBadge(source: string) {
  const styles: Record<string, string> = {
    'google-suggest': 'bg-[#0071E3]/10 text-[#0071E3]',
    'people-also-ask': 'bg-[#1D1D1F]/8 text-[#1D1D1F]',
    'related-searches': 'bg-[#86868B]/10 text-[#86868B]',
    'expansion': 'bg-[#D2D2D7]/50 text-[#1D1D1F]',
    'questions': 'bg-[#0071E3]/8 text-[#0071E3]',
  };
  return (
    <Badge className={styles[source] || 'bg-[#F5F5F7] text-[#86868B]'}>
      {source}
    </Badge>
  );
}

// ─── Score Circle Component (Apple Blue Ring) ─────────────────────────────────

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
            stroke={APPLE_BORDER}
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
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-2xl font-bold tracking-tight', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-[#86868B] font-medium">{label}</span>}
    </div>
  );
}

// ─── Category Score Bar (Apple Blue) ───────────────────────────────────────────

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#86868B] capitalize">{label}</span>
        <span className={cn('font-semibold', getScoreColor(score))}>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', getScoreBgColor(score))}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Readiness Checklist (Apple Style) ─────────────────────────────────────────

function ReadinessChecklist({ items }: { items: Record<string, boolean> }) {
  return (
    <div className="space-y-2.5">
      {Object.entries(items).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2.5 text-sm">
          {value ? (
            <CheckCircle2 className="h-4 w-4 text-[#0071E3] shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-[#D2D2D7] shrink-0" />
          )}
          <span className={value ? 'text-[#1D1D1F]' : 'text-[#86868B]'}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
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
      {/* Apple Hero */}
      <div className="text-center py-12 md:py-20">
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-[#1D1D1F]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          SEO Insight
        </motion.h1>
        <motion.p
          className="mt-4 text-lg md:text-xl text-[#86868B] max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
          Comprehensive SEO, AEO &amp; GEO analysis platform. Discover keywords, audit your site, analyze competitors, and build winning strategies.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        >
          <Badge className="bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/15 px-4 py-1.5 text-sm font-medium rounded-full border-0">
            <Zap className="mr-1.5 h-3.5 w-3.5" /> SEO Optimization
          </Badge>
          <Badge className="bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/15 px-4 py-1.5 text-sm font-medium rounded-full border-0">
            <Bot className="mr-1.5 h-3.5 w-3.5" /> AEO Readiness
          </Badge>
          <Badge className="bg-[#0071E3]/10 text-[#0071E3] hover:bg-[#0071E3]/15 px-4 py-1.5 text-sm font-medium rounded-full border-0">
            <Brain className="mr-1.5 h-3.5 w-3.5" /> GEO Analysis
          </Badge>
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
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <Card
              className="cursor-pointer border-[#D2D2D7]/60 rounded-2xl bg-white h-full transition-shadow duration-300"
              onClick={() => setActiveTab(feature.tab)}
            >
              <CardHeader className="pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0071E3]/10">
                  <span className="text-[#0071E3]">{feature.icon}</span>
                </div>
                <CardTitle className="text-lg mt-3 font-semibold text-[#1D1D1F]">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-[#86868B]">{feature.description}</CardDescription>
                <div className="mt-4 flex items-center text-sm font-medium text-[#0071E3] group-hover:gap-2 transition-all">
                  Get started <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-[#F5F5F7] rounded-3xl p-8 md:p-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-[#0071E3]" />
          <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Quick Start Guide</h2>
        </div>
        <p className="text-[#86868B] mb-8">Follow these steps to get the most out of SEO Insight</p>
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
              <div className="relative p-5 rounded-2xl bg-white border border-[#D2D2D7]/60 hover:shadow-md transition-shadow duration-300">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0071E3] text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <div className="flex items-center gap-2 mb-2 text-[#0071E3]">
                  {item.icon}
                  <span className="font-semibold text-sm text-[#1D1D1F]">{item.title}</span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">{item.description}</p>
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
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            transition={{ type: 'tween', duration: 0.2 }}
          >
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/10">
                    <span className="text-[#0071E3]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1D1D1F]">{item.title}</p>
                    <p className="text-sm text-[#86868B]">{item.subtitle}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#86868B] leading-relaxed">{item.description}</p>
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
        <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Keyword Discovery</h2>
        <p className="text-[#86868B] mt-1">Find high-value keywords with difficulty analysis and clustering</p>
      </div>

      <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1D1D1F]">Seed Keyword</CardTitle>
          <CardDescription className="text-[#86868B]">Enter a keyword to discover related keywords across multiple sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
              <Input
                placeholder="Enter a seed keyword (e.g., 'seo tools')"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="pl-10 border-[#D2D2D7] focus-visible:ring-[#0071E3] rounded-xl h-11"
                onKeyDown={(e) => e.key === 'Enter' && discoverKeywords()}
              />
            </div>
            <Button
              onClick={discoverKeywords}
              disabled={keywordLoading || !keywordInput.trim()}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white shrink-0 rounded-full px-6 h-11"
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
                  className="data-[state=checked]:bg-[#0071E3] data-[state=checked]:border-[#0071E3]"
                />
                <Label htmlFor={`source-${source}`} className="text-sm cursor-pointer text-[#1D1D1F]">
                  {source.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {keywordError && (
        <Card className="border-[#1D1D1F]/20 bg-[#1D1D1F]/5 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[#1D1D1F]">
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
              <Badge className="text-sm py-1.5 px-4 rounded-full bg-[#0071E3]/10 text-[#0071E3] border-0 font-medium">
                {keywordResults.length} keywords found
              </Badge>
              <Badge className="text-sm py-1.5 px-4 rounded-full bg-[#F5F5F7] text-[#86868B] border-0 font-medium">
                {Object.keys(clusteredKeywords).length} clusters
              </Badge>
            </div>
            <div className="flex items-center gap-1 bg-[#F5F5F7] rounded-full p-1">
              <Button
                variant={keywordView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('table')}
                className={cn('rounded-full text-sm', keywordView === 'table' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B]')}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={keywordView === 'cluster' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('cluster')}
                className={cn('rounded-full text-sm', keywordView === 'cluster' ? 'bg-white shadow-sm text-[#1D1D1F]' : 'text-[#86868B]')}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Clusters
              </Button>
            </div>
          </div>

          {keywordView === 'table' ? (
            <Card className="border-[#D2D2D7]/60 rounded-2xl overflow-hidden bg-white">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F7] hover:bg-[#F5F5F7]">
                      <TableHead className="w-[40%] text-[#86868B] font-medium">Keyword</TableHead>
                      <TableHead className="text-[#86868B] font-medium">Source</TableHead>
                      <TableHead className="text-[#86868B] font-medium">Difficulty</TableHead>
                      <TableHead className="text-[#86868B] font-medium">Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordResults.map((kw, idx) => (
                      <TableRow key={idx} className="hover:bg-[#F5F5F7]/60 transition-colors border-[#D2D2D7]/40">
                        <TableCell className="font-medium text-[#1D1D1F]">{kw.keyword}</TableCell>
                        <TableCell>{getSourceBadge(kw.source)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', getDifficultyDotColor(kw.difficulty.score))} />
                            <Badge className={cn('font-medium', getDifficultyColor(kw.difficulty.label))}>
                              {kw.difficulty.score} - {kw.difficulty.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {kw.cluster ? (
                            <Badge variant="outline" className="border-[#D2D2D7] text-[#1D1D1F]">{kw.cluster}</Badge>
                          ) : (
                            <span className="text-[#86868B] text-sm">&mdash;</span>
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
                <Card key={cluster} className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-[#1D1D1F]">{cluster}</CardTitle>
                      <Badge className="bg-[#F5F5F7] text-[#86868B] border-0 rounded-full">{keywords.length} keywords</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="cursor-default py-1.5 px-3.5 border-[#D2D2D7] hover:bg-[#F5F5F7] transition-colors rounded-full text-[#1D1D1F]"
                              >
                                {kw.keyword}
                                <span className={cn(
                                  'ml-2 inline-flex h-2 w-2 rounded-full',
                                  getDifficultyDotColor(kw.difficulty.score)
                                )} />
                              </Badge>
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
        <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#0071E3]" />
              <p className="text-[#86868B]">Discovering keywords across sources...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!keywordLoading && keywordResults.length === 0 && !keywordError && (
        <Card className="border-[#D2D2D7]/40 rounded-2xl bg-white border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868B]">
              <KeyRound className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-[#1D1D1F]">No keywords discovered yet</p>
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
        <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">Site Audit</h2>
        <p className="text-[#86868B] mt-1">Crawl and audit your website for SEO, AEO, and GEO issues</p>
      </div>

      <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1D1D1F]">Crawl Settings</CardTitle>
          <CardDescription className="text-[#86868B]">Configure your website crawl parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
              <Input
                placeholder="Enter website URL (e.g., https://example.com)"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                className="pl-10 border-[#D2D2D7] focus-visible:ring-[#0071E3] rounded-xl h-11"
                onKeyDown={(e) => e.key === 'Enter' && crawlAndAudit()}
              />
            </div>
            <Button
              onClick={crawlAndAudit}
              disabled={crawlLoading || auditLoading || !auditUrl.trim()}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white shrink-0 rounded-full px-6 h-11"
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
                <Label className="text-[#1D1D1F] font-medium">Max Pages: {maxPages[0]}</Label>
              </div>
              <Slider
                value={maxPages}
                onValueChange={setMaxPages}
                min={5}
                max={50}
                step={5}
                className="w-full [&_[role=slider]]:bg-[#0071E3] [&_[role=slider]]:border-[#0071E3]"
              />
              <div className="flex justify-between text-xs text-[#86868B]">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#1D1D1F] font-medium">Max Depth: {maxDepth[0]}</Label>
              </div>
              <Slider
                value={maxDepth}
                onValueChange={setMaxDepth}
                min={1}
                max={3}
                step={1}
                className="w-full [&_[role=slider]]:bg-[#0071E3] [&_[role=slider]]:border-[#0071E3]"
              />
              <div className="flex justify-between text-xs text-[#86868B]">
                <span>1</span>
                <span>3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(crawlLoading || auditLoading) && (
        <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#86868B]">
                {crawlLoading ? 'Crawling website...' : 'Running audit analysis...'}
              </span>
              <span className="font-semibold text-[#1D1D1F]">{crawlProgress}%</span>
            </div>
            <Progress value={crawlProgress} className="h-1.5 [&>div]:bg-[#0071E3]" />
          </CardContent>
        </Card>
      )}

      {auditError && (
        <Card className="border-[#1D1D1F]/20 bg-[#1D1D1F]/5 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[#1D1D1F]">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                <CardContent className="pt-8 pb-8 flex flex-col items-center">
                  <ScoreCircle score={auditResult.seo.averageScore} size={140} label="SEO Score" />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
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
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <FileSearch className="h-5 w-5 text-[#0071E3]" />
                  Crawl Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F7]">
                    <p className="text-2xl font-bold text-[#1D1D1F]">{crawlResult.totalPages}</p>
                    <p className="text-xs text-[#86868B]">Pages Crawled</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F7]">
                    <p className="text-2xl font-bold text-[#1D1D1F]">{crawlResult.errors.length}</p>
                    <p className="text-xs text-[#86868B]">Crawl Errors</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F7]">
                    <p className="text-2xl font-bold text-[#1D1D1F]">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'error').length}</p>
                    <p className="text-xs text-[#86868B]">SEO Errors</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F7]">
                    <p className="text-2xl font-bold text-[#1D1D1F]">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'warning').length}</p>
                    <p className="text-xs text-[#86868B]">SEO Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Issues */}
          {auditResult.seo.siteWideIssues.length > 0 && (
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <AlertTriangle className="h-5 w-5 text-[#86868B]" />
                  Top Site-Wide Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {auditResult.seo.siteWideIssues.slice(0, 10).map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F5F7]">
                        <div className="mt-0.5 shrink-0">{getIssueBadge(issue.type)}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[#1D1D1F]">{issue.message}</p>
                          <p className="text-xs text-[#86868B] mt-1">{issue.detail}</p>
                          <Badge variant="outline" className="mt-1.5 text-xs border-[#D2D2D7] text-[#86868B]">{issue.category}</Badge>
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
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <Lightbulb className="h-5 w-5 text-[#0071E3]" />
                  Top Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {auditResult.seo.topSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2">
                      <ChevronRight className="h-4 w-4 text-[#0071E3] mt-0.5 shrink-0" />
                      <p className="text-sm text-[#1D1D1F]">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-Page Results */}
          <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1D1D1F]">
                <FileText className="h-5 w-5 text-[#0071E3]" />
                Page-by-Page Results
              </CardTitle>
              <CardDescription className="text-[#86868B]">Click on a page to see detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditResult.seo.pageResults.map((page) => {
                const aeoData = auditResult.aeo.find((a) => a.url === page.url);
                const geoData = auditResult.geo.find((g) => g.url === page.url);
                const isExpanded = expandedPages.has(page.url);

                return (
                  <div key={page.url} className="border border-[#D2D2D7]/60 rounded-xl overflow-hidden">
                    <button
                      onClick={() => togglePageExpand(page.url)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#F5F5F7]/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3 shrink-0">
                          <ScoreCircle score={page.seoScore} size={50} />
                          {aeoData && <ScoreCircle score={aeoData.aeoScore} size={50} />}
                          {geoData && <ScoreCircle score={geoData.geoScore} size={50} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate text-[#1D1D1F]">{page.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-[#D2D2D7] text-[#1D1D1F]">SEO: {page.seoScore}</Badge>
                            {aeoData && <Badge variant="outline" className="text-xs border-[#D2D2D7] text-[#1D1D1F]">AEO: {aeoData.aeoScore}</Badge>}
                            {geoData && <Badge variant="outline" className="text-xs border-[#D2D2D7] text-[#1D1D1F]">GEO: {geoData.geoScore}</Badge>}
                            <Badge className="text-xs bg-[#F5F5F7] text-[#86868B] border-0">
                              {page.issues.length} issues
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-[#86868B] shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#86868B] shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#D2D2D7]/60 p-5 space-y-6 bg-[#F5F5F7]/30">
                        {/* Category Scores */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1D1D1F]">
                            <Gauge className="h-4 w-4 text-[#0071E3]" /> SEO Category Scores
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
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1D1D1F]">
                              <AlertTriangle className="h-4 w-4 text-[#86868B]" /> Issues ({page.issues.length})
                            </h4>
                            <ScrollArea className="max-h-64">
                              <div className="space-y-2">
                                {page.issues.map((issue, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white text-sm">
                                    <div className="shrink-0 mt-0.5">{getIssueBadge(issue.type)}</div>
                                    <div>
                                      <p className="font-medium text-[#1D1D1F]">{issue.message}</p>
                                      <p className="text-xs text-[#86868B]">{issue.detail}</p>
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
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1D1D1F]">
                              <Lightbulb className="h-4 w-4 text-[#0071E3]" /> Suggestions
                            </h4>
                            <div className="space-y-1.5">
                              {page.suggestions.map((s, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 text-[#0071E3] mt-0.5 shrink-0" />
                                  <span className="text-[#1D1D1F]">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* AEO Details */}
                          {aeoData && (
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1D1D1F]">
                                <Bot className="h-4 w-4 text-[#0071E3]" /> AEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={aeoData.answerReadiness} />
                                {aeoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#0071E3] mb-1.5">Strengths</p>
                                    {aeoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0071E3] mt-0.5 shrink-0" />
                                        <span className="text-[#1D1D1F]">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {aeoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#86868B] mb-1.5">Recommendations</p>
                                    {aeoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-[#86868B] mt-0.5 shrink-0" />
                                        <span className="text-[#1D1D1F]">{r}</span>
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
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#1D1D1F]">
                                <Brain className="h-4 w-4 text-[#0071E3]" /> GEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={geoData.generativeReadiness} />
                                {geoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#0071E3] mb-1.5">Strengths</p>
                                    {geoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-[#0071E3] mt-0.5 shrink-0" />
                                        <span className="text-[#1D1D1F]">{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {geoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#86868B] mb-1.5">Recommendations</p>
                                    {geoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-[#86868B] mt-0.5 shrink-0" />
                                        <span className="text-[#1D1D1F]">{r}</span>
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
        <Card className="border-[#D2D2D7]/40 rounded-2xl bg-white border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868B]">
              <Globe className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-[#1D1D1F]">No audit results yet</p>
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
        <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">SERP &amp; Competitor Analysis</h2>
        <p className="text-[#86868B] mt-1">Analyze search results, discover patterns, and build backlink strategies</p>
      </div>

      <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1D1D1F]">SERP Analysis</CardTitle>
          <CardDescription className="text-[#86868B]">Enter a keyword to analyze search engine results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868B]" />
              <Input
                placeholder="Enter a keyword (e.g., 'best seo tools')"
                value={serpKeyword}
                onChange={(e) => setSerpKeyword(e.target.value)}
                className="pl-10 border-[#D2D2D7] focus-visible:ring-[#0071E3] rounded-xl h-11"
                onKeyDown={(e) => e.key === 'Enter' && analyzeSerp()}
              />
            </div>
            <Button
              onClick={analyzeSerp}
              disabled={serpLoading || !serpKeyword.trim()}
              className="bg-[#0071E3] hover:bg-[#0077ED] text-white shrink-0 rounded-full px-6 h-11"
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
        <Card className="border-[#1D1D1F]/20 bg-[#1D1D1F]/5 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[#1D1D1F]">
              <AlertCircle className="h-5 w-5" />
              <p>{serpError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpLoading && (
        <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#0071E3]" />
              <p className="text-[#86868B]">Analyzing search results...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpResult && (
        <>
          {/* SERP Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Result Type Breakdown */}
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <BarChart3 className="h-4 w-4 text-[#0071E3]" /> Result Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(serpResult.resultTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{getResultTypeBadge(type)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#0071E3]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / serpResult.results.length) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right text-[#1D1D1F]">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Snippet */}
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <Eye className="h-4 w-4 text-[#0071E3]" /> Featured Snippet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serpResult.featuredSnippet ? (
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-[#1D1D1F]">{serpResult.featuredSnippet.title}</p>
                    <p className="text-xs text-[#86868B] line-clamp-3">{serpResult.featuredSnippet.snippet}</p>
                    <a
                      href={serpResult.featuredSnippet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0071E3] hover:underline flex items-center gap-1"
                    >
                      {serpResult.featuredSnippet.url.substring(0, 40)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-[#86868B]">No featured snippet found for this query.</p>
                )}
              </CardContent>
            </Card>

            {/* Common Words */}
            <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                  <MessageSquare className="h-4 w-4 text-[#86868B]" /> Common Title Words
                </CardTitle>
                <CardDescription className="text-[#86868B]">Avg title word count: {serpResult.avgWordCountInTitles}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {serpResult.commonTitleWords.map((word) => (
                    <Badge key={word} className="bg-[#F5F5F7] text-[#1D1D1F] border-0 text-xs rounded-full">{word}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results Table */}
          <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#1D1D1F]">
                <FileSearch className="h-5 w-5 text-[#0071E3]" /> Search Results
              </CardTitle>
              <CardDescription className="text-[#86868B]">{serpResult.results.length} results found for &quot;{serpResult.keyword}&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F7] hover:bg-[#F5F5F7]">
                      <TableHead className="w-12 text-[#86868B] font-medium">#</TableHead>
                      <TableHead className="text-[#86868B] font-medium">Title &amp; Snippet</TableHead>
                      <TableHead className="w-24 text-[#86868B] font-medium">Type</TableHead>
                      <TableHead className="w-12 text-[#86868B] font-medium">Feat.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serpResult.results.map((result) => (
                      <TableRow key={result.position} className="hover:bg-[#F5F5F7]/60 transition-colors border-[#D2D2D7]/40">
                        <TableCell className="font-semibold text-center text-[#0071E3]">{result.position}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-[#0071E3] hover:underline flex items-center gap-1"
                            >
                              {result.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            <p className="text-xs text-[#86868B]">{result.url.substring(0, 60)}...</p>
                            <p className="text-xs text-[#86868B] line-clamp-2">{result.snippet}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getResultTypeBadge(result.resultType)}</TableCell>
                        <TableCell className="text-center">
                          {result.isFeatured ? (
                            <CheckCircle2 className="h-4 w-4 text-[#0071E3] mx-auto" />
                          ) : (
                            <span className="text-[#D2D2D7]">&mdash;</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator className="bg-[#D2D2D7]/40" />

          {/* Pattern & Backlink Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={analyzePatterns}
              disabled={patternLoading}
              variant="outline"
              className="border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-full px-6 h-11"
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
              className="border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-full px-6 h-11"
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
              <h3 className="text-xl font-semibold flex items-center gap-2 text-[#1D1D1F]">
                <Brain className="h-5 w-5 text-[#0071E3]" /> Pattern Analysis
              </h3>

              {/* Insights Table */}
              <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#1D1D1F]">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F5F5F7] hover:bg-[#F5F5F7]">
                          <TableHead className="text-[#86868B] font-medium">Metric</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Top Ranking Avg</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Your Value</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Status</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patternResult.insights.map((insight, idx) => (
                          <TableRow key={idx} className="hover:bg-[#F5F5F7]/60 transition-colors border-[#D2D2D7]/40">
                            <TableCell className="font-medium text-sm text-[#1D1D1F]">{insight.metric}</TableCell>
                            <TableCell className="text-sm text-[#1D1D1F]">{String(insight.topRankingAvg)}</TableCell>
                            <TableCell className="text-sm text-[#1D1D1F]">{String(insight.yourValue)}</TableCell>
                            <TableCell>
                              <Badge className={insight.status === 'good' ? 'bg-[#0071E3]/10 text-[#0071E3] border-0' : insight.status === 'improve' ? 'bg-[#86868B]/10 text-[#86868B] border-0' : 'bg-[#1D1D1F]/10 text-[#1D1D1F] border-0'}>
                                {insight.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-[#86868B] max-w-[200px]">{insight.recommendation}</TableCell>
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
                  <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                        <CheckCircle2 className="h-4 w-4 text-[#0071E3]" /> Must Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.mustAdd.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-[#0071E3] mt-0.5 shrink-0" />
                            <span className="text-[#1D1D1F]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Items */}
                {patternResult.youAreMissing.length > 0 && (
                  <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                        <XCircle className="h-4 w-4 text-[#86868B]" /> You Are Missing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.youAreMissing.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-[#D2D2D7] mt-0.5 shrink-0" />
                            <span className="text-[#1D1D1F]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Gaps */}
                {patternResult.contentGapAnalysis.length > 0 && (
                  <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                        <Target className="h-4 w-4 text-[#86868B]" /> Content Gap Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.contentGapAnalysis.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-[#86868B] mt-0.5 shrink-0" />
                            <span className="text-[#1D1D1F]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competitive Advantage */}
                {patternResult.competitiveAdvantage.length > 0 && (
                  <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                        <TrendingUp className="h-4 w-4 text-[#0071E3]" /> Competitive Advantage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.competitiveAdvantage.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ThumbsUp className="h-4 w-4 text-[#0071E3] mt-0.5 shrink-0" />
                            <span className="text-[#1D1D1F]">{item}</span>
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
              <h3 className="text-xl font-semibold flex items-center gap-2 text-[#1D1D1F]">
                <Link2 className="h-5 w-5 text-[#0071E3]" /> Backlink Strategy
              </h3>

              {/* Opportunities Table */}
              <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#1D1D1F]">Opportunities ({backlinkResult.opportunities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F5F5F7] hover:bg-[#F5F5F7]">
                          <TableHead className="text-[#86868B] font-medium">Title</TableHead>
                          <TableHead className="w-24 text-[#86868B] font-medium">Type</TableHead>
                          <TableHead className="w-24 text-[#86868B] font-medium">Priority</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Strategy</TableHead>
                          <TableHead className="text-[#86868B] font-medium">Content Idea</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backlinkResult.opportunities.map((opp, idx) => (
                          <TableRow key={idx} className="hover:bg-[#F5F5F7]/60 transition-colors border-[#D2D2D7]/40">
                            <TableCell>
                              <div>
                                <a
                                  href={opp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-sm text-[#0071E3] hover:underline flex items-center gap-1"
                                >
                                  {opp.title}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                                <p className="text-xs text-[#86868B] truncate max-w-[200px]">{opp.url}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getResultTypeBadge(opp.type)}</TableCell>
                            <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                            <TableCell className="text-xs text-[#86868B] max-w-[200px]">{opp.outreachStrategy}</TableCell>
                            <TableCell className="text-xs text-[#86868B] max-w-[200px]">{opp.contentIdea}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Content Suggestions */}
              {backlinkResult.contentSuggestions.length > 0 && (
                <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                      <Lightbulb className="h-4 w-4 text-[#0071E3]" /> Content Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {backlinkResult.contentSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-[#F5F5F7] text-sm">
                          <FileText className="h-4 w-4 text-[#86868B] mt-0.5 shrink-0" />
                          <span className="text-[#1D1D1F]">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Outreach Templates */}
              {backlinkResult.outreachTemplates.length > 0 && (
                <Card className="border-[#D2D2D7]/60 rounded-2xl bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-[#1D1D1F]">
                      <Mail className="h-4 w-4 text-[#0071E3]" /> Outreach Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {backlinkResult.outreachTemplates.map((template, idx) => (
                      <div key={idx} className="border border-[#D2D2D7]/60 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleTemplate(idx)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-[#F5F5F7]/60 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-[#D2D2D7] text-[#1D1D1F]">{template.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedTemplates.has(idx) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-[#0071E3] hover:text-[#0077ED]"
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
                              <ChevronUp className="h-4 w-4 text-[#86868B]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-[#86868B]" />
                            )}
                          </div>
                        </button>
                        {expandedTemplates.has(idx) && (
                          <div className="border-t border-[#D2D2D7]/40 p-4 bg-[#F5F5F7]/30">
                            <pre className="whitespace-pre-wrap text-sm text-[#86868B] font-sans leading-relaxed">
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
        <Card className="border-[#D2D2D7]/40 rounded-2xl bg-white border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#86868B]">
              <LineChart className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium text-[#1D1D1F]">No SERP analysis yet</p>
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* ─── Top Navigation (Frosted Glass) ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071E3]">
              <Search className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#1D1D1F] text-lg tracking-tight">SEO Insight</span>
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
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5 text-[#1D1D1F]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0 bg-white border-[#D2D2D7]/40">
              <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#D2D2D7]/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0071E3]">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-[#1D1D1F] text-lg tracking-tight">SEO Insight</span>
              </div>
              <div className="px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      activeTab === item.id
                        ? 'bg-[#0071E3] text-white'
                        : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-[#D2D2D7]/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0071E3]/10">
                    <Cpu className="h-4 w-4 text-[#0071E3]" />
                  </div>
                  <div>
                    <p className="text-[#1D1D1F] text-sm font-medium">AI Powered</p>
                    <p className="text-[#86868B] text-xs">Full Analysis Engine</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={pageVariants.initial}
              animate={pageVariants.animate}
              exit={pageVariants.exit}
              transition={pageTransition}
            >
              {tabContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#D2D2D7]/40 bg-[#F5F5F7] px-4 lg:px-6 py-5 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#86868B]">
          <p>SEO Insight &mdash; Comprehensive SEO, AEO &amp; GEO Analysis Platform</p>
          <p>Powered by AI</p>
        </div>
      </footer>

      {/* ─── Mobile Bottom Tab Bar (Frosted Glass) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-xl border-t border-[#D2D2D7]/40 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center py-1.5 text-xs transition-colors duration-200',
                activeTab === item.id
                  ? 'text-[#0071E3]'
                  : 'text-[#86868B]'
              )}
            >
              {item.icon}
              <span className="mt-0.5 font-medium">{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile bottom tab bar */}
      <div className="h-14 md:hidden" />
    </div>
  );
}
