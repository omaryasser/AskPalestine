import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface ProPalestinian {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  professional_identity?: string;
}

interface ProPalestinianCardProps {
  person: ProPalestinian;
}

// Custom markdown renderer that strips links to avoid nested anchor tags
const MarkdownRenderer = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      components={{
        // Replace links with just their text content to avoid nested <a> tags
        a: ({ children }) => <span className="font-medium">{children}</span>,
        // Ensure paragraphs don't add extra spacing
        p: ({ children }) => <span>{children}</span>,
        // Handle other elements normally
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default function ProPalestinianCard({ person }: ProPalestinianCardProps) {
  const personSlug = encodeURIComponent(person.id);
  const bioPreview = person.bio.substring(0, 200) + (person.bio.length > 200 ? '...' : '');

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 bg-palestine-green rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-500">
            {person.professional_identity || 'Palestinian Voice'}
          </p>
        </div>
      </div>
      
      <div className="text-gray-600 mb-4 line-clamp-3 markdown-content">
        <MarkdownRenderer>{bioPreview}</MarkdownRenderer>
      </div>
      
      <Link 
        href={`/voices/${personSlug}`}
        className="inline-flex items-center text-palestine-green hover:text-gray-700 font-medium transition-colors"
      >
        View Profile & Answers
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
