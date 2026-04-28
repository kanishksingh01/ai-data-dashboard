export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface TrendingData {
  weeklyRisers: GithubRepo[];
  allTimeLeaders: GithubRepo[];
  languageBreakdown: { name: string; value: number }[];
  topTopics: { topic: string; count: number }[];
  fetchedAt: string;
}
