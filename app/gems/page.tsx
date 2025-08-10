import { Metadata } from "next";
import GemCard from "../../components/GemCard";
import GemSuggestionButton from "../../components/GemSuggestionButton";
import PalestineButton from "../../components/PalestineButton";
import { PageHeader, SectionHeader } from "../../components/PalestineDesign";
import { getAllGems, getTotalCounts } from "../../lib/database";

export const metadata: Metadata = {
  title: "Gems - Essential Palestinian Resources | AskPalestine",
  description:
    "Discover essential resources, tools, and organizations for understanding Palestine and supporting Palestinian rights. Curated collection of websites, books, documentaries, and advocacy organizations.",
  keywords: [
    "Palestine",
    "resources",
    "advocacy",
    "organizations",
    "tools",
    "education",
  ],
};

export default async function GemsPage() {
  // Fetch data server-side
  const [allGems, counts] = await Promise.all([getAllGems(), getTotalCounts()]);

  // Group gems by type
  const gemsByType = allGems.reduce(
    (acc, gem) => {
      if (!acc[gem.type]) {
        acc[gem.type] = [];
      }
      acc[gem.type].push(gem);
      return acc;
    },
    {} as Record<string, typeof allGems>,
  );

  const typeOrder = [
    "Website",
    "Community",
    "App",
    "Book",
    "Documentary",
    "Organization",
    "Coalition",
  ];
  const sortedTypes = typeOrder.filter((type) => gemsByType[type]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gems"
        subtitle="Essential resources, tools, and organizations for understanding Palestine and supporting Palestinian rights."
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

        {/* Overview Stats */}
        <div className="mb-12">
          <div
            className="bg-white rounded-lg shadow-md border-t-4 p-6"
            style={{ borderTopColor: "#006234" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {counts.totalGems}
                </div>
                <div className="text-sm text-gray-600">Total Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(gemsByType).length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* All Gems Section */}
        {allGems.length > 0 ? (
          <>
            {sortedTypes.map((type) => (
              <section key={type} className="mb-16">
                <SectionHeader
                  title={`${
                    type === "Community" ? "Communities" : `${type}s`
                  } (${gemsByType[type].length})`}
                  subtitle={`${type} resources for Palestinian advocacy and education`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {gemsByType[type].map((gem) => (
                    <div key={gem.id} className="h-full">
                      <GemCard gem={gem} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Uncategorized gems (if any) */}
            {Object.keys(gemsByType).some(
              (type) => !typeOrder.includes(type),
            ) && (
              <section className="mb-16">
                <SectionHeader
                  title="Other Resources"
                  subtitle="Additional resources for Palestinian advocacy"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Object.keys(gemsByType)
                    .filter((type) => !typeOrder.includes(type))
                    .flatMap((type) => gemsByType[type])
                    .map((gem) => (
                      <div key={gem.id} className="h-full">
                        <GemCard gem={gem} />
                      </div>
                    ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div
            className="bg-white rounded-lg shadow-md border-t-4 p-8 text-center"
            style={{ borderTopColor: "#006234" }}
          >
            <div className="text-lg font-semibold text-gray-900 mb-2">
              No gems available yet
            </div>
            <div className="text-gray-600">
              We're working on adding essential resources for Palestinian
              advocacy.
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-green-50 to-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Know of other valuable resources?
            </h3>
            <p className="text-gray-600 mb-6">
              Help us expand this collection by suggesting websites, books,
              documentaries, organizations, or tools that support Palestinian
              advocacy and education.
            </p>
            <GemSuggestionButton />
          </div>
        </div>
      </main>
    </div>
  );
}
