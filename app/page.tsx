import { Suspense } from "react";
import { fetchTrendingData } from "@/lib/github";
import RepoCard from "@/components/RepoCard";
import LanguageChart from "@/components/LanguageChart";
import TopicsBar from "@/components/TopicsBar";

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

async function Dashboard() {
  const data = await fetchTrendingData();
  const fetchedAt = new Date(data.fetchedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Weekly Risers", value: data.weeklyRisers.length },
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

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <LanguageChart data={data.languageBreakdown} />
        <TopicsBar data={data.topTopics} />
      </div>

      {/* Repo lists */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="text-green-400">↑</span> Rising This Week
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

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 text-xs px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live GitHub Data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            AI GitHub Trends
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Real-time intelligence on the fastest-growing AI repositories on GitHub — trending this week and all-time leaders.
          </p>
        </div>

        <Suspense fallback={<Skeleton rows={6} />}>
          <Dashboard />
        </Suspense>
      </div>
    </main>
  );
}
