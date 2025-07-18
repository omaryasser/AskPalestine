'use client';

interface ShareButtonProps {
  url?: string;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

export default function ShareButton({ url, text = 'Link copied to clipboard!', className = '', children }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = url || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert(text);
  };

  return (
    <button onClick={handleShare} className={className}>
      {children}
    </button>
  );
}
