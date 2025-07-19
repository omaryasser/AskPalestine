# AskPalestine

A comprehensive Q&A platform featuring well-known pro-Palestinian perspectives.

## 🎯 Mission

AskPalestine aims at making it easy for any pro-palestinian to answer Palestine-related questions.

## 🏗️ Architecture

### Database Design

- **SQLite** for data storage
- **Three main tables**: `voices`, `questions`, `answers`
- **AI Embeddings**: Vector search capabilities for semantic question matching

### API Structure (`/app/api/`)

- **`/questions/`**: Question management and search
- **`/voices/`**: Voice profiles and their answers
- **`/search/`**: Semantic search functionality
- **`/interactions/`**: User interaction tracking (search, reports, suggestions)

### Page Structure (`/app/`)

- Question pages and voice profiles
- Search and pagination functionality
- Interactive forms and components

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/omaryasser/AskPalestine/
cd AskPalestine

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables (Optional)

```bash
# For AI-powered search (optional - falls back to mock embeddings)
OPENAI_API_KEY=your_openai_api_key
```

## 📂 Project Structure

```
askpalestine/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── questions/         # Question pages
│   ├── voices/           # Voice profile pages
│   └── search/           # Search functionality
├── components/           # Reusable React components
├── lib/                 # Database and utility functions
├── data/               # Content data (questions & voices)
│   ├── questions/      # Question directories with answers
│   └── voices/        # Voice profile data
└── public/            # Static assets
```

## 🤝 Contributing

We welcome contributions in two main areas:

### 🖥️ Code Contributions

- Bug fixes and improvements
- New features and components
- Performance optimizations
- UI/UX enhancements

### 📚 Content Contributions

**Important Guidelines:**

- **Sources Required**: All content must include verifiable sources
- **Pro-Palestinian Voices Only**: We only feature answers from well-known pro-Palestinian figures
- **No Individual Opinions**: Personal opinions without established credibility are not accepted
- **Documentation**: Include metadata about the source (interviews, articles, speeches, etc.)

#### Adding New Questions

1. Create a directory in `data/questions/[Question Text]/`
2. Add `metadata.json` with question details
3. Include alternative question forms if applicable

#### Adding New Answers

1. Create answer directory: `data/questions/[Question]/answers/[Voice Name]/`
2. Add `text.md` with the answer content
3. Add `metadata.json` with source information (YouTube links, article URLs, etc.)
4. Ensure the voice exists in `data/voices/`

#### Adding New Voices

1. Create directory: `data/voices/[Voice Name]/`
2. Add `bio.md` with biographical information
3. Add `metadata.json` with profile details
4. Include photo and professional identity

## 🙏 Acknowledgments

This platform showcases the voices and expertise of numerous pro-Palestinian figures who contribute to public understanding of Palestinian issues.

---

**Disclaimer**: AskPalestine features content attributed to various individuals and organizations. While content originates from these sources, it has been compiled and curated by the AskPalestine team rather than being directly submitted by the featured voices themselves.
