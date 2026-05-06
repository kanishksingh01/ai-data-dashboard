import { Suspense } from "react";
import { fetchTrendingData } from "@/lib/github";
import { CATEGORIES, PERIODS, type CategoryKey, type Language, type Period } from "@/lib/categories";
import RepoCard from "@/components/RepoCard";
import LanguageChart from "@/components/LanguageChart";
import TopicsBar from "@/components/TopicsBar";
import FilterBar from "@/components/FilterBar";

function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function Dashboard({
  category,
  language,
  period,
}: {
  category: CategoryKey;
  language: Language;
  period: Period;
}) {
  const data = await fetchTrendingData(category, language, period);
  const fetchedAt = new Date(data.fetchedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryLabel = CATEGORIES[category].label;
  const periodLabel = PERIODS[period].label;
  const riserLabel = period === "alltime" ? "Top Repos" : "Rising " + periodLabel;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: riserLabel, value: data.weeklyRisers.length },
          { label: "All-Time Leaders", value: data.allTimeLeaders.length },
          { label: "Languages", value: data.languageBreakdown.length },
          { label: "Hot Topics", value: data.topTopics.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{value}</div>
            <div className="text-gray-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <LanguageChart data={data.languageBreakdown} />
        <TopicsBar data={data.topTopics} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-green-400">↑</span> {riserLabel}
            <span className="text-gray-600 text-sm font-normal">· {categoryLabel}</span>
          </h2>
          <div className="space-y-3">
            {data.weeklyRisers.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} rank={i + 1} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-yellow-400">★</span> All-Time Leaders
            <span className="text-gray-600 text-sm font-normal">· {categoryLabel}</span>
          </h2>
          <div className="space-y-3">
            {data.allTimeLeaders.map((repo, i) => (
              <RepoCard key={repo.id} repo={repo} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        Data from GitHub API · Refreshes every 5 min · Last fetched {fetchedAt}
      </p>
    </>
  );
}

const VALID_CATEGORIES = ["ai", "devops", "web", "cli", "security", "all"] as const;
const VALID_PERIODS = ["week", "month", "alltime"] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const rawCategory = typeof params.category === "string" ? params.category : "ai";
  const rawPeriod = typeof params.period === "string" ? params.period : "week";
  const rawLanguage = typeof params.language === "string" ? params.language : "Any";

  const category = (VALID_CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as CategoryKey)
    : "ai";
  const period = (VALID_PERIODS as readonly string[]).includes(rawPeriod)
    ? (rawPeriod as Period)
    : "week";
  const language = rawLanguage as Language;

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 text-xs px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live · Refreshes every 5 min
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            GitHub Trending Radar
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Filter trending GitHub repos by category, language, and time period. Data aggregated across multiple topic searches and deduplicated.
          </p>
        </div>

        <Suspense fallback={<div className="h-12 bg-gray-900 rounded-xl animate-pulse mb-8" />}>
          <FilterBar category={category} language={language} period={period} />
        </Suspense>

        <Suspense key={`${category}-${language}-${period}`} fallback={<Skeleton rows={6} />}>
          <Dashboard category={category} language={language} period={period} />
        </Suspense>
      </div>
    </main>
  );
}
