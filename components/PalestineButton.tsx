'use client';

interface PalestineButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function PalestineButton({ href, children, className = "" }: PalestineButtonProps) {
  return (
    <a
      href={href}
      className={`group flex items-center gap-3 px-6 py-3 bg-white border-2 rounded-lg transition-all duration-300 w-fit shadow-sm hover:shadow-md ${className}`}
      style={{
        borderColor: '#006234',
        color: '#006234'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#006234';
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#006234';
      }}
    >
      {children}
    </a>
  );
}
