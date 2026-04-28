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

export async function fetchTrendingData(): Promise<TrendingData> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const aiTopics = [
    "machine-learning",
    "llm",
    "artificial-intelligence",
    "deep-learning",
    "generative-ai",
    "langchain",
  ];

  const [weeklyResults, leaderResults] = await Promise.all([
    Promise.all(
      aiTopics.map((t) => searchRepos(`created:>${sevenDaysAgo} topic:${t}`, "stars", 10))
    ),
    Promise.all(
      aiTopics.map((t) => searchRepos(`stars:>1000 topic:${t}`, "stars", 10))
    ),
  ]);

  const weeklyRisers = dedup(weeklyResults.flat())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20);

  const allTimeLeaders = dedup(leaderResults.flat())
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20);

  const allRepos = [...weeklyRisers, ...allTimeLeaders];

  return {
    weeklyRisers,
    allTimeLeaders,
    languageBreakdown: buildLanguageBreakdown(allRepos),
    topTopics: buildTopTopics(allRepos),
    fetchedAt: new Date().toISOString(),
  };
}
