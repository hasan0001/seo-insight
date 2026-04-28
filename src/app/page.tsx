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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

function getDifficultyColor(label: string): string {
  switch (label?.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'hard':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'very hard':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
}

function getIssueBadge(type: 'error' | 'warning' | 'info') {
  switch (type) {
    case 'error':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100"><XCircle className="mr-1 h-3 w-3" />Error</Badge>;
    case 'warning':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100"><AlertTriangle className="mr-1 h-3 w-3" />Warning</Badge>;
    case 'info':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100"><Info className="mr-1 h-3 w-3" />Info</Badge>;
  }
}

function getPriorityBadge(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100">High</Badge>;
    case 'medium':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">Medium</Badge>;
    case 'low':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">Low</Badge>;
  }
}

function getResultTypeBadge(type: string) {
  const styles: Record<string, string> = {
    blog: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    ecommerce: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    video: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    forum: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    web: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <Badge className={styles[type] || styles.web}>
      {type}
    </Badge>
  );
}

function getSourceBadge(source: string) {
  const styles: Record<string, string> = {
    'google-suggest': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'people-also-ask': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'related-searches': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'expansion': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'questions': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  return (
    <Badge className={styles[source] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}>
      {source}
    </Badge>
  );
}

// ─── Score Circle Component ───────────────────────────────────────────────────

function ScoreCircle({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={getScoreRingColor(score)}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-2xl font-bold', getScoreColor(score))}>
            {score}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}

// ─── Category Score Bar ───────────────────────────────────────────────────────

function CategoryScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground capitalize">{label}</span>
        <span className={cn('font-semibold', getScoreColor(score))}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', getScoreBgColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Readiness Checklist ──────────────────────────────────────────────────────

function ReadinessChecklist({ items }: { items: Record<string, boolean> }) {
  return (
    <div className="space-y-2">
      {Object.entries(items).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2 text-sm">
          {value ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </span>
        </div>
      ))}
    </div>
  );
}

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

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'keywords', label: 'Keywords', icon: <KeyRound className="h-4 w-4" /> },
    { id: 'audit', label: 'Site Audit', icon: <ClipboardCheck className="h-4 w-4" /> },
    { id: 'serp', label: 'SERP Analysis', icon: <LineChart className="h-4 w-4" /> },
  ];

  // ─── Dashboard Tab ────────────────────────────────────────────────────────

  const DashboardTab = () => (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJILTEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SEO Insight</h1>
          </div>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6">
            Comprehensive SEO, AEO & GEO analysis platform. Discover keywords, audit your site, analyze competitors, and build winning strategies.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20">
              <Zap className="mr-1 h-3 w-3" /> SEO Optimization
            </Badge>
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20">
              <Bot className="mr-1 h-3 w-3" /> AEO Readiness
            </Badge>
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20">
              <Brain className="mr-1 h-3 w-3" /> GEO Analysis
            </Badge>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Keyword Discovery',
            description: 'Find high-value keywords with difficulty scores and clustering across multiple sources.',
            icon: <KeyRound className="h-6 w-6" />,
            color: 'from-blue-500 to-blue-600',
            tab: 'keywords' as ActiveTab,
          },
          {
            title: 'SERP Analysis',
            description: 'Analyze search results, discover patterns, and understand competitor strategies.',
            icon: <LineChart className="h-6 w-6" />,
            color: 'from-violet-500 to-purple-600',
            tab: 'serp' as ActiveTab,
          },
          {
            title: 'Site Audit',
            description: 'Crawl and audit your site for SEO, AEO, and GEO issues with actionable fixes.',
            icon: <ClipboardCheck className="h-6 w-6" />,
            color: 'from-emerald-500 to-teal-600',
            tab: 'audit' as ActiveTab,
          },
          {
            title: 'Backlink Strategy',
            description: 'Generate backlink opportunities and outreach templates for link building.',
            icon: <Link2 className="h-6 w-6" />,
            color: 'from-amber-500 to-orange-600',
            tab: 'serp' as ActiveTab,
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50"
            onClick={() => setActiveTab(feature.tab)}
          >
            <CardHeader className="pb-3">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm', feature.color)}>
                {feature.icon}
              </div>
              <CardTitle className="text-lg mt-3 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <CardTitle>Quick Start Guide</CardTitle>
          </div>
          <CardDescription>Follow these steps to get the most out of SEO Insight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            ].map((item) => (
              <div key={item.step} className="relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm">
                  {item.step}
                </div>
                <div className="flex items-center gap-2 mb-2 mt-1 text-emerald-600 dark:text-emerald-400">
                  {item.icon}
                  <span className="font-semibold text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">SEO</p>
                <p className="text-sm text-muted-foreground">Search Engine Optimization</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Optimize titles, meta descriptions, headings, content, links, and technical aspects for better search rankings.</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">AEO</p>
                <p className="text-sm text-muted-foreground">Answer Engine Optimization</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Structure content for AI-powered answer engines with direct answers, FAQs, and concise paragraphs.</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">GEO</p>
                <p className="text-sm text-muted-foreground">Generative Engine Optimization</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Optimize for generative AI with entity-rich content, structured data, and trust signals.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ─── Keywords Tab ─────────────────────────────────────────────────────────

  const KeywordsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Keyword Discovery</h2>
        <p className="text-muted-foreground">Find high-value keywords with difficulty analysis and clustering</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Seed Keyword</CardTitle>
          <CardDescription>Enter a keyword to discover related keywords across multiple sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter a seed keyword (e.g., 'seo tools')"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && discoverKeywords()}
              />
            </div>
            <Button
              onClick={discoverKeywords}
              disabled={keywordLoading || !keywordInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              {keywordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Discover Keywords
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            {Object.entries(keywordSources).map(([source, checked]) => (
              <div key={source} className="flex items-center gap-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={checked}
                  onCheckedChange={(val) =>
                    setKeywordSources((prev) => ({ ...prev, [source]: !!val }))
                  }
                />
                <Label htmlFor={`source-${source}`} className="text-sm cursor-pointer">
                  {source.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {keywordError && (
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{keywordError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {keywordResults.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm py-1 px-3">
                {keywordResults.length} keywords found
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">
                {Object.keys(clusteredKeywords).length} clusters
              </Badge>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={keywordView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('table')}
                className={keywordView === 'table' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}
              >
                <FileText className="mr-1 h-3.5 w-3.5" /> Table
              </Button>
              <Button
                variant={keywordView === 'cluster' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setKeywordView('cluster')}
                className={keywordView === 'cluster' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}
              >
                <Layers className="mr-1 h-3.5 w-3.5" /> Clusters
              </Button>
            </div>
          </div>

          {keywordView === 'table' ? (
            <Card className="border-border/50 overflow-hidden">
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40%]">Keyword</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Cluster</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordResults.map((kw, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>{getSourceBadge(kw.source)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', kw.difficulty.score < 30 ? 'bg-emerald-500' : kw.difficulty.score < 60 ? 'bg-amber-500' : 'bg-red-500')} />
                            <Badge className={getDifficultyColor(kw.difficulty.label)}>
                              {kw.difficulty.score} - {kw.difficulty.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {kw.cluster ? (
                            <Badge variant="outline">{kw.cluster}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
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
                <Card key={cluster} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{cluster}</CardTitle>
                      <Badge variant="secondary">{keywords.length} keywords</Badge>
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
                                className="cursor-default py-1.5 px-3 hover:bg-accent transition-colors"
                              >
                                {kw.keyword}
                                <span className={cn(
                                  'ml-2 inline-flex h-2 w-2 rounded-full',
                                  kw.difficulty.score < 30 ? 'bg-emerald-500' : kw.difficulty.score < 60 ? 'bg-amber-500' : 'bg-red-500'
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
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-muted-foreground">Discovering keywords across sources...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!keywordLoading && keywordResults.length === 0 && !keywordError && (
        <Card className="border-border/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <KeyRound className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No keywords discovered yet</p>
              <p className="text-sm">Enter a seed keyword and click &quot;Discover Keywords&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── Audit Tab ────────────────────────────────────────────────────────────

  const AuditTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Audit</h2>
        <p className="text-muted-foreground">Crawl and audit your website for SEO, AEO, and GEO issues</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Crawl Settings</CardTitle>
          <CardDescription>Configure your website crawl parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter website URL (e.g., https://example.com)"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && crawlAndAudit()}
              />
            </div>
            <Button
              onClick={crawlAndAudit}
              disabled={crawlLoading || auditLoading || !auditUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max Pages: {maxPages[0]}</Label>
              </div>
              <Slider
                value={maxPages}
                onValueChange={setMaxPages}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Max Depth: {maxDepth[0]}</Label>
              </div>
              <Slider
                value={maxDepth}
                onValueChange={setMaxDepth}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {(crawlLoading || auditLoading) && (
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {crawlLoading ? 'Crawling website...' : 'Running audit analysis...'}
              </span>
              <span className="font-medium">{crawlProgress}%</span>
            </div>
            <Progress value={crawlProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {auditError && (
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6 flex flex-col items-center">
                <ScoreCircle score={auditResult.seo.averageScore} size={140} label="SEO Score" />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6 flex flex-col items-center">
                <ScoreCircle
                  score={Math.round(auditResult.aeo.reduce((s, a) => s + a.aeoScore, 0) / Math.max(auditResult.aeo.length, 1))}
                  size={140}
                  label="AEO Score"
                />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6 flex flex-col items-center">
                <ScoreCircle
                  score={Math.round(auditResult.geo.reduce((s, g) => s + g.geoScore, 0) / Math.max(auditResult.geo.length, 1))}
                  size={140}
                  label="GEO Score"
                />
              </CardContent>
            </Card>
          </div>

          {/* Crawl Summary */}
          {crawlResult && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-emerald-500" />
                  Crawl Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{crawlResult.totalPages}</p>
                    <p className="text-xs text-muted-foreground">Pages Crawled</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{crawlResult.errors.length}</p>
                    <p className="text-xs text-muted-foreground">Crawl Errors</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'error').length}</p>
                    <p className="text-xs text-muted-foreground">SEO Errors</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{auditResult.seo.siteWideIssues.filter((i) => i.type === 'warning').length}</p>
                    <p className="text-xs text-muted-foreground">SEO Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Issues */}
          {auditResult.seo.siteWideIssues.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Top Site-Wide Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-3">
                    {auditResult.seo.siteWideIssues.slice(0, 10).map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="mt-0.5 shrink-0">{getIssueBadge(issue.type)}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{issue.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{issue.detail}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{issue.category}</Badge>
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
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Top Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditResult.seo.topSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2">
                      <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-Page Results */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Page-by-Page Results
              </CardTitle>
              <CardDescription>Click on a page to see detailed analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditResult.seo.pageResults.map((page) => {
                const aeoData = auditResult.aeo.find((a) => a.url === page.url);
                const geoData = auditResult.geo.find((g) => g.url === page.url);
                const isExpanded = expandedPages.has(page.url);

                return (
                  <div key={page.url} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => togglePageExpand(page.url)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-3 shrink-0">
                          <ScoreCircle score={page.seoScore} size={50} />
                          {aeoData && <ScoreCircle score={aeoData.aeoScore} size={50} />}
                          {geoData && <ScoreCircle score={geoData.geoScore} size={50} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{page.url}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">SEO: {page.seoScore}</Badge>
                            {aeoData && <Badge variant="outline" className="text-xs">AEO: {aeoData.aeoScore}</Badge>}
                            {geoData && <Badge variant="outline" className="text-xs">GEO: {geoData.geoScore}</Badge>}
                            <Badge variant="secondary" className="text-xs">
                              {page.issues.length} issues
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t p-4 space-y-6 bg-muted/10">
                        {/* Category Scores */}
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-emerald-500" /> SEO Category Scores
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
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" /> Issues ({page.issues.length})
                            </h4>
                            <ScrollArea className="max-h-64">
                              <div className="space-y-2">
                                {page.issues.map((issue, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-muted/30 text-sm">
                                    <div className="shrink-0 mt-0.5">{getIssueBadge(issue.type)}</div>
                                    <div>
                                      <p className="font-medium">{issue.message}</p>
                                      <p className="text-xs text-muted-foreground">{issue.detail}</p>
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
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-500" /> Suggestions
                            </h4>
                            <div className="space-y-1.5">
                              {page.suggestions.map((s, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                  <span>{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* AEO Details */}
                          {aeoData && (
                            <div>
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Bot className="h-4 w-4 text-violet-500" /> AEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={aeoData.answerReadiness} />
                                {aeoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Strengths</p>
                                    {aeoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {aeoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Recommendations</p>
                                    {aeoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                        <span>{r}</span>
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
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Brain className="h-4 w-4 text-amber-500" /> GEO Analysis
                              </h4>
                              <div className="space-y-3">
                                <ReadinessChecklist items={geoData.generativeReadiness} />
                                {geoData.strengths.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Strengths</p>
                                    {geoData.strengths.map((s, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {geoData.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Recommendations</p>
                                    {geoData.recommendations.map((r, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <ArrowUpRight className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                        <span>{r}</span>
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
        <Card className="border-border/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Globe className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No audit results yet</p>
              <p className="text-sm">Enter a website URL and click &quot;Crawl &amp; Audit&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── SERP Tab ─────────────────────────────────────────────────────────────

  const SerpTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SERP &amp; Competitor Analysis</h2>
        <p className="text-muted-foreground">Analyze search results, discover patterns, and build backlink strategies</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">SERP Analysis</CardTitle>
          <CardDescription>Enter a keyword to analyze search engine results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter a keyword (e.g., 'best seo tools')"
                value={serpKeyword}
                onChange={(e) => setSerpKeyword(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && analyzeSerp()}
              />
            </div>
            <Button
              onClick={analyzeSerp}
              disabled={serpLoading || !serpKeyword.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
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
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{serpError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpLoading && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-muted-foreground">Analyzing search results...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {serpResult && (
        <>
          {/* SERP Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Result Type Breakdown */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" /> Result Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(serpResult.resultTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">{getResultTypeBadge(type)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${(count / serpResult.results.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Snippet */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-violet-500" /> Featured Snippet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serpResult.featuredSnippet ? (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{serpResult.featuredSnippet.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{serpResult.featuredSnippet.snippet}</p>
                    <a
                      href={serpResult.featuredSnippet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      {serpResult.featuredSnippet.url.substring(0, 40)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No featured snippet found for this query.</p>
                )}
              </CardContent>
            </Card>

            {/* Common Words */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-500" /> Common Title Words
                </CardTitle>
                <CardDescription>Avg title word count: {serpResult.avgWordCountInTitles}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {serpResult.commonTitleWords.map((word) => (
                    <Badge key={word} variant="secondary" className="text-xs">{word}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-emerald-500" /> Search Results
              </CardTitle>
              <CardDescription>{serpResult.results.length} results found for &quot;{serpResult.keyword}&quot;</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Title &amp; Snippet</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="w-12">Feat.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serpResult.results.map((result) => (
                      <TableRow key={result.position} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-center">{result.position}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              {result.title}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            <p className="text-xs text-muted-foreground">{result.url.substring(0, 60)}...</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{result.snippet}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getResultTypeBadge(result.resultType)}</TableCell>
                        <TableCell className="text-center">
                          {result.isFeatured ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator />

          {/* Pattern & Backlink Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={analyzePatterns}
              disabled={patternLoading}
              variant="outline"
              className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
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
              className="border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-500" /> Pattern Analysis
              </h3>

              {/* Insights Table */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Metric</TableHead>
                          <TableHead>Top Ranking Avg</TableHead>
                          <TableHead>Your Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patternResult.insights.map((insight, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium text-sm">{insight.metric}</TableCell>
                            <TableCell className="text-sm">{String(insight.topRankingAvg)}</TableCell>
                            <TableCell className="text-sm">{String(insight.yourValue)}</TableCell>
                            <TableCell>
                              <Badge className={insight.status === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : insight.status === 'improve' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                {insight.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px]">{insight.recommendation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Must Add */}
                {patternResult.mustAdd.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Must Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.mustAdd.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Items */}
                {patternResult.youAreMissing.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" /> You Are Missing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.youAreMissing.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Gaps */}
                {patternResult.contentGapAnalysis.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-amber-500" /> Content Gap Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.contentGapAnalysis.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competitive Advantage */}
                {patternResult.competitiveAdvantage.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" /> Competitive Advantage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patternResult.competitiveAdvantage.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ThumbsUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Link2 className="h-5 w-5 text-amber-500" /> Backlink Strategy
              </h3>

              {/* Opportunities Table */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Opportunities ({backlinkResult.opportunities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Title</TableHead>
                          <TableHead className="w-24">Type</TableHead>
                          <TableHead className="w-24">Priority</TableHead>
                          <TableHead>Strategy</TableHead>
                          <TableHead>Content Idea</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backlinkResult.opportunities.map((opp, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                              <div>
                                <a
                                  href={opp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                  {opp.title}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{opp.url}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getResultTypeBadge(opp.type)}</TableCell>
                            <TableCell>{getPriorityBadge(opp.priority)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px]">{opp.outreachStrategy}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px]">{opp.contentIdea}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Content Suggestions */}
              {backlinkResult.contentSuggestions.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Content Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {backlinkResult.contentSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded bg-muted/30 text-sm">
                          <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Outreach Templates */}
              {backlinkResult.outreachTemplates.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-violet-500" /> Outreach Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {backlinkResult.outreachTemplates.map((template, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleTemplate(idx)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{template.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {expandedTemplates.has(idx) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
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
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        {expandedTemplates.has(idx) && (
                          <div className="border-t p-4 bg-muted/10">
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
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
        <Card className="border-border/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <LineChart className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No SERP analysis yet</p>
              <p className="text-sm">Enter a keyword and click &quot;Analyze SERP&quot; to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ─── Sidebar Navigation ──────────────────────────────────────────────────

  const SidebarNav = () => (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            setMobileMenuOpen(false);
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === item.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 dark:bg-slate-950">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">SEO Insight</h1>
            <p className="text-slate-400 text-xs">SEO + AEO + GEO</p>
          </div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Navigation</p>
          <SidebarNav />
        </div>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI Powered</p>
              <p className="text-slate-400 text-xs">Full Analysis Engine</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-60">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-slate-900 dark:bg-slate-950 border-white/10">
                  <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-white font-bold text-lg leading-tight">SEO Insight</h1>
                      <p className="text-slate-400 text-xs">SEO + AEO + GEO</p>
                    </div>
                  </div>
                  <div className="px-3 py-4">
                    <SidebarNav />
                  </div>
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <Search className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">SEO Insight</span>
              </div>
            </div>

            {/* Mobile Tab Bar */}
            <div className="hidden sm:flex items-center gap-1 lg:hidden">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className={activeTab === item.id ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                >
                  {item.icon}
                  <span className="ml-1.5 hidden md:inline">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Badge variant="outline" className="text-xs">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'keywords' ? 'Keywords' : activeTab === 'audit' ? 'Audit' : 'SERP'}
              </Badge>
            </div>
          </div>

          {/* Mobile Bottom Nav - shown on small screens only when sm: tabs are hidden */}
          <div className="flex sm:hidden border-t bg-background">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex-1 flex flex-col items-center py-2 text-xs transition-colors',
                  activeTab === item.id
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                )}
              >
                {item.icon}
                <span className="mt-0.5">{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'keywords' && <KeywordsTab />}
          {activeTab === 'audit' && <AuditTab />}
          {activeTab === 'serp' && <SerpTab />}
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t bg-muted/30 px-4 lg:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
            <p>SEO Insight — Comprehensive SEO, AEO &amp; GEO Analysis Platform</p>
            <p>Powered by AI</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
