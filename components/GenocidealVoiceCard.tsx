import Link from "next/link";
import { GenocidealVoice } from "../lib/database";

interface GenocidealVoiceCardProps {
  voice: GenocidealVoice;
}

export default function GenocidealVoiceCard({ voice }: GenocidealVoiceCardProps) {
  // Get the first quote for preview
  const firstQuote = voice.quotes && voice.quotes.length > 0 ? voice.quotes[0] : null;
  
  const getQuotePreview = (quote: string): string => {
    if (quote.length > 150) {
      return quote.substring(0, 150) + "...";
    }
    return quote;
  };

  const quotePreview = firstQuote ? getQuotePreview(firstQuote.quote) : "No quotes available";
  const totalSources = voice.quotes?.reduce((total, q) => total + (q.sources?.length || 0), 0) || 0;

  return (
    <Link href={`/genocidal-voices/${encodeURIComponent(voice.id)}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full border-t-4 border-red-600">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{voice.name}</h3>
            <p className="text-sm text-red-600 font-medium">{voice.title}</p>
          </div>

          {/* Quote Preview */}
          <div className="mb-4">
            <blockquote className="text-gray-700 text-sm italic border-l-4 border-red-200 pl-4">
              "{quotePreview}"
            </blockquote>
          </div>

          {/* Source Count */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{totalSources} sources</span>
            <span className="text-red-600 font-medium hover:text-red-700">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
