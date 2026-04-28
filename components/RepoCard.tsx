"use client";

import type { GithubRepo } from "@/lib/types";

const LANG_COLORS: Record<string, string> = {
  Python: "bg-blue-500",
  TypeScript: "bg-cyan-500",
  JavaScript: "bg-yellow-400",
  Rust: "bg-orange-500",
  Go: "bg-teal-400",
  Java: "bg-red-500",
  "C++": "bg-purple-500",
  "C#": "bg-green-500",
  Jupyter: "bg-orange-400",
};

export default function RepoCard({ repo, rank }: { repo: GithubRepo; rank: number }) {
  const langColor = repo.language ? (LANG_COLORS[repo.language] ?? "bg-gray-400") : null;
  const daysAgo = Math.floor(
    (Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl font-bold text-gray-700 group-hover:text-indigo-500 transition-colors w-8 shrink-0">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-gray-400 text-xs truncate">{repo.owner.login}</span>
          </div>
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
            {repo.name}
          </h3>
          {repo.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-yellow-400 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {repo.stargazers_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {repo.forks_count.toLocaleString()}
            </span>
            {langColor && (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <span className={`w-2 h-2 rounded-full ${langColor}`} />
                {repo.language}
              </span>
            )}
            <span className="text-gray-600 text-xs ml-auto">
              {daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`}
            </span>
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {repo.topics.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800/50"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
