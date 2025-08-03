import { getAllGenocidealVoices } from "../../lib/database";
import PalestineButton from "../../components/PalestineButton";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../../components/PalestineDesign";

export default async function GenocidealVoicesPage() {
  const genocidealVoices = await getAllGenocidealVoices();
  const totalQuotes = genocidealVoices.reduce((total, voice) => total + voice.quotes.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Zionist Genocidal Voices"
        subtitle="Documented statements of genocidal intent from Israeli officials, providing evidence of systematic dehumanization and calls for destruction of Palestinian people."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        {/* Credit */}
        <div className="mb-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Source Attribution</h3>
            <p className="text-gray-600 mb-2">
              The genocidal statements documented below are sourced from comprehensive research compiled by
            </p>
            <a
              href="https://crimesbyisrael.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-lg underline"
            >
              CrimesByIsrael.com
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Each quote includes original source links for verification
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PalestineFlagStats
            count={genocidealVoices.length}
            title="Israeli Officials Documented"
            subtitle="Individuals Making Genocidal Statements"
          />
          <PalestineFlagStats
            count={totalQuotes}
            title="Total Genocidal Statements"
            subtitle="Documented Quotes with Sources"
          />
        </div>

        {/* Voices List */}
        {genocidealVoices.length > 0 ? (
          <div className="space-y-8">
            <SectionHeader
              title="Voices of Hatred and Genocide"
              subtitle="Documented statements revealing systematic dehumanization"
            />

            <div className="space-y-8">
              {genocidealVoices.map((voice, index: number) => (
                <div key={voice.id} className="bg-white rounded-lg shadow-md border-t-4 border-red-600 overflow-hidden">
                  <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{voice.name}</h2>
                      <p className="text-lg text-red-600 font-medium">{voice.title}</p>
                    </div>

                    {/* All Quotes */}
                    <div className="space-y-6">
                      {voice.quotes.map((quoteData, quoteIndex) => (
                        <div key={quoteIndex} className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
                          {quoteData.context && (
                            <h3 className="text-lg font-bold text-red-800 mb-3">{quoteData.context}</h3>
                          )}
                          <blockquote className="text-xl italic text-red-800 font-medium border-l-4 border-red-300 pl-6 my-4">
                            "{quoteData.quote}"
                          </blockquote>
                          
                          {/* Sources for this specific quote */}
                          {quoteData.sources && quoteData.sources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-red-200">
                              <h4 className="text-sm font-medium text-red-700 mb-2">Sources:</h4>
                              <div className="space-y-2">
                                {quoteData.sources.map((source, sourceIndex) => (
                                  <div key={sourceIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700">{source.name}</p>
                                      {source.date && (
                                        <p className="text-xs text-gray-500">{source.date}</p>
                                      )}
                                    </div>
                                    <a
                                      href={source.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                                    >
                                      View
                                      <svg
                                        className="ml-1 w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-md border-t-4 p-12 text-center"
            style={{ borderTopColor: "#dc2626" }}
          >
            <div className="text-lg font-semibold mb-2 text-gray-900">
              No genocidal voices documented yet.
            </div>
            <div className="text-gray-600">
              Documentation is being compiled from official sources.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
