interface PalestineFlagAccentProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function PalestineFlagAccent({
  size = "medium",
  className = "",
}: PalestineFlagAccentProps) {
  const dimensions = {
    small: { stripe: "w-12 h-2", triangle: "4px" },
    medium: { stripe: "w-16 h-3", triangle: "6px" },
    large: { stripe: "w-20 h-4", triangle: "8px" },
  };

  const { stripe, triangle } = dimensions[size];

  return (
    <div className={`flex justify-center items-center gap-1 ${className}`}>
      <div
        className="w-0 h-0 mr-1"
        style={{
          borderTop: `${triangle} solid transparent`,
          borderBottom: `${triangle} solid transparent`,
          borderLeft: `calc(${triangle} * 2) solid #fe3233`,
        }}
      ></div>
      <div className={`${stripe}`} style={{ backgroundColor: "#000000" }}></div>
      <div className={`${stripe} bg-white border border-gray-300`}></div>
      <div className={`${stripe}`} style={{ backgroundColor: "#006234" }}></div>
    </div>
  );
}

interface PalestineFlagStatsProps {
  count: number;
  title: string;
  subtitle: string;
  className?: string;
}

export function PalestineFlagStats({
  count,
  title,
  subtitle,
  className = "",
}: PalestineFlagStatsProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}
      style={{ height: "200px" }}
    >
      {/* Palestinian Flag Background */}
      <div className="absolute inset-0">
        {/* Flag stripes */}
        <div className="h-1/3" style={{ backgroundColor: "#000000" }}></div>
        <div className="h-1/3 bg-white"></div>
        <div className="h-1/3" style={{ backgroundColor: "#006234" }}></div>
      </div>

      {/* Red triangle on the left */}
      <div
        className="absolute inset-y-0 left-0 w-0 h-0"
        style={{
          borderTop: "100px solid transparent",
          borderBottom: "100px solid transparent",
          borderLeft: "120px solid #fe3233",
        }}
      ></div>

      {/* Content overlay */}
      <div className="relative h-full flex items-center justify-center p-8">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-8 shadow-lg mx-auto text-center">
          <div className="text-5xl font-bold mb-3" style={{ color: "#006234" }}>
            {count}
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-1">
            {title}
          </div>
          <div className="text-sm text-gray-700">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  showFlag?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  showFlag = true,
}: PageHeaderProps) {
  return (
    <div
      className="bg-white border-b-4"
      style={{ borderBottomColor: "#006234" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: "#000000" }}>
            {title}
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          {showFlag && <PalestineFlagAccent className="mt-8" />}
        </div>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
      <div className="flex justify-center items-center gap-2">
        <div className="w-12 h-1" style={{ backgroundColor: "#000000" }}></div>
        <div className="w-12 h-1" style={{ backgroundColor: "#006234" }}></div>
        <div className="w-12 h-1" style={{ backgroundColor: "#000000" }}></div>
      </div>
    </div>
  );
}
