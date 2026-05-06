"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, LANGUAGES, PERIODS, type CategoryKey, type Language, type Period } from "@/lib/categories";

export default function FilterBar({
  category,
  language,
  period,
}: {
  category: CategoryKey;
  language: Language;
  period: Period;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 flex-1">
        {(Object.entries(CATEGORIES) as [CategoryKey, { label: string }][]).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => update("category", key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              category === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-900 border border-gray-800 text-gray-400 hover:border-indigo-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Language picker */}
      <select
        value={language}
        onChange={(e) => update("language", e.target.value)}
        className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>{l === "Any" ? "Any Language" : l}</option>
        ))}
      </select>

      {/* Period toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-800">
        {(Object.entries(PERIODS) as [Period, { label: string }][]).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => update("period", key)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              period === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-900 text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
