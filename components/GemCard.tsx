import { Gem } from "../lib/database";

interface GemCardProps {
  gem: Gem;
}

export default function GemCard({ gem }: GemCardProps) {
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Website: "#3B82F6", // blue
      Community: "#10B981", // emerald
      Book: "#8B5CF6", // violet
      App: "#F59E0B", // amber
      Documentary: "#EF4444", // red
      Organization: "#06B6D4", // cyan
      Coalition: "#84CC16", // lime
    };
    return colors[type] || "#6B7280"; // default gray
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl border-t-4 transition-all duration-300 overflow-hidden h-full">
      <div
        className="h-1"
        style={{ backgroundColor: getTypeColor(gem.type) }}
      />

      <div className="p-6">
        {/* Header with photo and type badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {gem.photo ? (
              <img
                src={gem.photo}
                alt={gem.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-200"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: getTypeColor(gem.type) }}
              >
                {gem.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {gem.name}
              </h3>
              <span
                className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full"
                style={{ backgroundColor: getTypeColor(gem.type) }}
              >
                {gem.type}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">{gem.description}</p>

        {/* Sources */}
        {gem.sources && gem.sources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Sources:</h4>
            <div className="space-y-1">
              {gem.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  {source.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
