"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchFormProps {
  defaultValue?: string;
  placeholder?: string;
}

export default function SearchForm({
  defaultValue = "",
  placeholder = "Ask any question about Palestine...",
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);

    // Send tracking data to interactions API
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query.trim(),
          answer: "EMPTY_BECAUSE_OF_QUESTION_SEARCH",
          feedback: "EMPTY_BECAUSE_OF_QUESTION_SEARCH",
          interactionType: "search",
        }),
      });
    } catch (error) {
      console.error("Error tracking search:", error);
      // Continue with search even if tracking fails
    }

    // Navigate to search results
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setIsSearching(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-12 pr-32 py-4 border-2 border-gray-300 rounded-lg text-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-600 focus:border-green-600"
            disabled={isSearching}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-6 py-2 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#006234" }}
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
