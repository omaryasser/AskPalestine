import { notFound } from "next/navigation";
import {
  ProPalestinian,
  Answer,
  getProPalestinian,
  getAnswersByAuthor,
} from "../../../lib/database";
import PalestineButton from "../../../components/PalestineButton";
import ShareButton from "../../../components/ShareButton";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../../../components/PalestineDesign";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

// Force dynamic rendering to avoid database conflicts during build
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Commented out to prevent static generation conflicts with database
// export async function generateStaticParams() {
//   try {
//     const voicesDir = path.join(process.cwd(), "data", "voices");
//     const voiceDirs = fs
//       .readdirSync(voicesDir, { withFileTypes: true })
//       .filter((dirent) => dirent.isDirectory())
//       .map((dirent) => dirent.name);

//     return voiceDirs.map((personDir) => ({
//       username: personDir,
//     }));
//   } catch (error) {
//     console.error("Error generating static params:", error);
//     return [];
//   }
// }

export default async function ProPalestinianPage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const person = await getProPalestinian(decodedUsername);
  const answers = await getAnswersByAuthor(decodedUsername);

  if (!person) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={person.name}
        subtitle="Expert Palestinian perspective and analysis"
        showFlag={false}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <PalestineButton href="/voices">
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
            Back to All Voices
          </PalestineButton>
        </div>

        {/* Person Profile */}
        <div
          className="bg-white rounded-lg shadow-md border-t-4 p-8 mb-12"
          style={{ borderTopColor: "#006234" }}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="w-32 h-32 rounded-full object-cover flex-shrink-0 shadow-lg mx-auto md:mx-0"
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg mx-auto md:mx-0"
                style={{ backgroundColor: "#006234" }}
              >
                <span className="text-white text-3xl font-bold">
                  {person.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
            )}

            <div className="flex-1 w-full">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center md:text-left">
                {person.name}
              </h1>
              {person.professional_identity && (
                <p className="text-lg text-gray-600 mb-6 font-medium text-center md:text-left">
                  {person.professional_identity}
                </p>
              )}

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Disclaimer:</strong> AskPalestine features profiles
                  and answers attributed to various individuals and entities.
                  While the content originally stems from these sources, it has
                  not been directly submitted or curated by the individuals or
                  entities themselves on our platform. Instead, these profiles
                  and answers have been compiled and added by the AskPalestine
                  team.
                </p>
              </div>

              <div className="markdown-content">
                <ReactMarkdown>{person.bio}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12">
          <PalestineFlagStats
            count={answers.length}
            title="Questions Answered"
            subtitle="Expert responses from this voice"
          />
        </div>

        {/* Answers Section */}
        <div>
          <SectionHeader
            title={`Questions Answered (${answers.length})`}
            subtitle="Expert responses from this voice"
          />

          {answers.length > 0 ? (
            <div className="space-y-8">
              {answers.map(
                (answer: Answer & { question: string }, index: number) => (
                  <div
                    key={answer.id}
                    className="bg-white rounded-lg shadow-md border-t-4 p-6 transition-all duration-300 hover:shadow-lg"
                    style={{
                      borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                    }}
                  >
                    <div className="mb-4">
                      <a
                        href={`/questions/${encodeURIComponent(answer.question)}`}
                        className="text-lg font-semibold hover:underline transition-colors"
                        style={{ color: "#006234" }}
                      >
                        {answer.question}
                      </a>
                    </div>

                    <div className="markdown-content mb-4">
                      <ReactMarkdown>{answer.content}</ReactMarkdown>
                    </div>

                    {answer.metadata?.source &&
                      answer.metadata?.source_type === "YOUTUBE" && (
                        <div className="mt-4">
                          <iframe
                            src={answer.metadata.source}
                            title="YouTube video"
                            className="w-full h-64 rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                      <ShareButton
                        url={`${
                          process.env.NEXT_PUBLIC_BASE_URL ||
                          "http://localhost:3000"
                        }/questions/${encodeURIComponent(answer.question)}`}
                        text="Question link copied to clipboard!"
                        className="text-sm font-medium transition-colors hover:underline text-palestine-green"
                      >
                        Share Question
                      </ShareButton>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div
              className="bg-white rounded-lg shadow-md border-t-4 p-8 text-center"
              style={{ borderTopColor: "#006234" }}
            >
              <p className="text-gray-600">
                No answers available from this person yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
