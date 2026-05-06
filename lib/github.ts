import { CATEGORIES, PERIODS, type CategoryKey, type Language, type Period } from "./categories";
import type { GithubRepo, TrendingData } from "./types";

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function searchRepos(query: string, sort: string, perPage = 20): Promise<GithubRepo[]> {
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(perPage));
  const res = await fetch(url.toString(), { headers: githubHeaders(), next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.items as GithubRepo[];
}

function buildLanguageBreakdown(repos: GithubRepo[]) {
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));
}

function buildTopTopics(repos: GithubRepo[]) {
  const counts: Record<string, number> = {};
  for (const repo of repos) {
    for (const t of repo.topics) counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([topic, count]) => ({ topic, count }));
}

function dedup(repos: GithubRepo[]): GithubRepo[] {
  const seen = new Set<number>();
  return repos.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export async function fetchTrendingData(
  category: CategoryKey = "ai",
  language: Language = "Any",
  period: Period = "week"
): Promise<TrendingData> {
  const topics = CATEGORIES[category].topics as readonly string[];
  const langFilter = language !== "Any" ? ` language:${language}` : "";

  const days = PERIODS[period].days;
  const dateFilter = days
    ? ` created:>${new Date(Date.now() - days * 864e5).toISOString().split("T")[0]}`
    : "";

  let weeklyRisers: GithubRepo[];
  let allTimeLeaders: GithubRepo[];

  if (topics.length === 0) {
    // "All" category — broad search without topic filter
    const [rising, leaders] = await Promise.all([
      searchRepos(`stars:>20${langFilter}${dateFilter}`, "stars", 25),
      searchRepos(`stars:>5000${langFilter}`, "stars", 25),
    ]);
    weeklyRisers = rising;
    allTimeLeaders = leaders;
  } else {
    const [weeklyResults, leaderResults] = await Promise.all([
      Promise.all(
        topics.map((t) => searchRepos(`topic:${t}${langFilter}${dateFilter}`, "stars", 8))
      ),
      Promise.all(
        topics.map((t) => searchRepos(`stars:>500 topic:${t}${langFilter}`, "stars", 8))
      ),
    ]);
    weeklyRisers = dedup(weeklyResults.flat())
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 20);
    allTimeLeaders = dedup(leaderResults.flat())
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 20);
  }

  const allRepos = dedup([...weeklyRisers, ...allTimeLeaders]);

  return {
    weeklyRisers: weeklyRisers.slice(0, 20),
    allTimeLeaders: allTimeLeaders.slice(0, 20),
    languageBreakdown: buildLanguageBreakdown(allRepos),
    topTopics: buildTopTopics(allRepos),
    fetchedAt: new Date().toISOString(),
  };
}
