import { Suspense } from "react";
import QuestionCard from "../../components/QuestionCard";
import SearchForm from "../../components/SearchForm";
import PalestineButton from "../../components/PalestineButton";
import { PageHeader, SectionHeader } from "../../components/PalestineDesign";
import { searchQuestions } from "../../lib/database";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchQuestions(query);

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.058 0-3.9.748-5.332 1.968A6.008 6.008 0 016 15a6 6 0 1112 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-500 mb-6">
          No questions found for &quot;{query}&quot;. Try a different search
          term.
        </p>
        <PalestineButton href="/questions">
          Browse All Questions
        </PalestineButton>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title={`Search Results for "${query}"`}
        subtitle={`Found ${results.length} ${results.length === 1 ? "question" : "questions"}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((question, index) => (
          <div
            key={question.id}
            className="border-t-4 h-full"
            style={{
              borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
            }}
          >
            <QuestionCard question={question} />
          </div>
        ))}
      </div>
    </>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-md border-t-4 border-gray-300 p-6 h-full"
        >
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Search Questions"
        subtitle="Find questions about Palestine with expert answers from pro-Palestinian voices."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Home */}
        <div className="mb-8">
          <PalestineButton href="/">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </PalestineButton>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <SearchForm defaultValue={query} />
        </div>

        {query ? (
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-12">
            <SectionHeader
              title="Start Your Search"
              subtitle="Enter a search term to find questions about Palestine."
            />
            <div className="mt-8">
              <PalestineButton href="/questions">
                Browse All Questions
              </PalestineButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
