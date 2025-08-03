import { getGenocidealVoice, getAllGenocidealVoices } from "../../../lib/database";
import PalestineButton from "../../../components/PalestineButton";
import {
  PageHeader,
  SectionHeader,
} from "../../../components/PalestineDesign";
import { notFound } from "next/navigation";

interface GenocidealVoiceDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const voices = await getAllGenocidealVoices();
  return voices.map((voice) => ({
    id: voice.id,
  }));
}

export default async function GenocidealVoiceDetailPage({
  params,
}: GenocidealVoiceDetailPageProps) {
  const voice = await getGenocidealVoice(decodeURIComponent(params.id));

  if (!voice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={voice.name}
        subtitle={voice.title}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <div className="mb-8 flex gap-4">
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
          <PalestineButton href="/genocidal-voices">
            ← All Genocidal Voices
          </PalestineButton>
        </div>

        {/* Voice Details */}
        <div className="bg-white rounded-lg shadow-md border-t-4 border-red-600 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{voice.name}</h1>
              <p className="text-xl text-red-600 font-medium">{voice.title}</p>
            </div>

            {/* Quotes */}
            <div className="mb-8">
              <SectionHeader
                title="Documented Statements"
                subtitle="Genocidal rhetoric from official sources"
              />
              <div className="space-y-6 mt-6">
                {voice.quotes.map((quoteData, index) => (
                  <div key={index} className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg">
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
        </div>
      </div>
    </div>
  );
}
