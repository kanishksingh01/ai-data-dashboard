export const CATEGORIES = {
  ai: {
    label: "AI / ML",
    topics: ["machine-learning", "llm", "artificial-intelligence", "deep-learning", "generative-ai", "langchain", "neural-network", "pytorch", "tensorflow"],
  },
  devops: {
    label: "DevOps",
    topics: ["devops", "kubernetes", "docker", "terraform", "infrastructure-as-code", "ansible", "helm", "prometheus", "gitops"],
  },
  web: {
    label: "Web",
    topics: ["react", "nextjs", "vue", "svelte", "typescript", "web-development", "frontend", "tailwindcss", "astro"],
  },
  cli: {
    label: "CLI / Tools",
    topics: ["cli", "terminal", "command-line", "developer-tools", "productivity", "shell", "tui", "neovim"],
  },
  security: {
    label: "Security",
    topics: ["security", "cybersecurity", "penetration-testing", "osint", "vulnerability", "devsecops", "cryptography"],
  },
  all: {
    label: "All",
    topics: [],
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export const LANGUAGES = [
  "Any", "Python", "TypeScript", "JavaScript", "Go", "Rust",
  "Java", "C++", "Shell", "C", "Kotlin", "Swift",
] as const;
export type Language = (typeof LANGUAGES)[number];

export const PERIODS = {
  week:    { label: "This Week",  days: 7 },
  month:   { label: "This Month", days: 30 },
  alltime: { label: "All Time",   days: null },
} as const;
export type Period = keyof typeof PERIODS;
