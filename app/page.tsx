import QuestionCard from "../components/QuestionCard";
import QuestionWithAnswersCard from "../components/QuestionWithAnswersCard";
import ProPalestinianCard from "../components/ProPalestinianCard";
import GenocidealVoiceCard from "../components/GenocidealVoiceCard";
import GemCard from "../components/GemCard";
import PalestineButton from "../components/PalestineButton";
import SearchForm from "../components/SearchForm";
import TabbedQuestionsSection from "../components/TabbedQuestionsSection";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../components/PalestineDesign";
import {
  Question,
  ProPalestinian,
  Gem,
  getTotalCounts,
  getQuestionsWithMostAnswers,
  getLatestAnsweredQuestions,
  getLatestUnansweredQuestions,
  getAllProPalestinians,
  getRandomGenocidealVoices,
  getRandomGems,
} from "../lib/database";
import Link from "next/link";
import { Metadata } from "next";

async function getHomePageData() {
  console.log("🏠 Home page data loading started...");
  // Get actual counts from database
  const counts = await getTotalCounts();
  console.log("📊 Counts retrieved:", counts);

  // Get questions with most answers
  const questionsWithMostAnswers = await getQuestionsWithMostAnswers(6);

  // Get latest answered questions
  const latestAnsweredQuestions = await getLatestAnsweredQuestions(6);

  // Get latest unanswered questions instead of random
  const latestUnansweredQuestions = await getLatestUnansweredQuestions(6);

  // Get all voices for the sliding row
  const allProPalestinians = await getAllProPalestinians();

  // Get random genocidal voices
  const genocidealVoices = await getRandomGenocidealVoices(6);

  // Get random gems
  const gems = await getRandomGems(6);

  return {
    counts,
    questionsWithMostAnswers,
    latestAnsweredQuestions,
    latestUnansweredQuestions,
    allProPalestinians,
    genocidealVoices,
    gems,
  };
}

export const metadata: Metadata = {
  title: "AskPalestine - Truth through Pro-Palestinian Voices",
  description:
    "Get clarity and confidence to speak up for Palestinian rights. Explore expert answers, resources, and documented voices for Palestine.",
  keywords: [
    "Palestine",
    "Pro-Palestinian",
    "questions",
    "answers",
    "resources",
    "voices",
    "advocacy",
    "human rights",
  ],
};

export default async function Home() {
  const {
    counts,
    questionsWithMostAnswers,
    latestAnsweredQuestions,
    latestUnansweredQuestions,
    allProPalestinians,
    genocidealVoices,
    gems,
  } = await getHomePageData();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="AskPalestine"
        subtitle="Truth through Pro-Palestinian Voices. Get clarity and confidence to speak up for Palestinian rights."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <SearchForm />
        </div>

        {/* Tabbed Questions Section with Flag Stats */}
        <div className="mb-16">
          {/* Main Hero Stat */}
          <div className="mb-8">
            <PalestineFlagStats
              count={counts.totalAnswers}
              title="Total Answers"
              subtitle="Expert responses from Pro-Palestinian voices worldwide"
            />
          </div>

          <TabbedQuestionsSection
            latestAnsweredQuestions={latestAnsweredQuestions}
            mostAnsweredQuestions={questionsWithMostAnswers}
            latestUnansweredQuestions={latestUnansweredQuestions}
            counts={{
              questionsWithAnswers: counts.questionsWithAnswers,
              totalUnansweredQuestions: counts.totalUnansweredQuestions,
            }}
          />
        </div>

        {/* Palestinian Voices Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={
                <span>
                  <span className="text-green-700 font-extrabold text-3xl mr-2">
                    {counts.totalProPalestinians}
                  </span>
                  Pro-Palestinian Voices
                </span>
              }
              subtitle="Expert perspectives from around the world"
            />
            <div className="sm:ml-auto">
              <PalestineButton href="/voices">View All →</PalestineButton>
            </div>
          </div>

          {/* Clean Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProPalestinians
              .slice(0, 8)
              .map((person: ProPalestinian, index: number) => (
                <div key={person.id} className="group">
                  <div
                    className="bg-white rounded-lg shadow-md hover:shadow-xl border-t-4 transition-all duration-300 overflow-hidden"
                    style={{
                      borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                    }}
                  >
                    <Link href={`/voices/${encodeURIComponent(person.name)}`}>
                      <div className="p-6 text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: "#006234" }}
                            >
                              {person.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                          {person.name}
                        </p>
                        {person.professional_identity && (
                          <p className="text-xs text-gray-500 mt-1">
                            {person.professional_identity}
                          </p>
                        )}
                        {person.bio && (
                          <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {person.bio
                              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                              .substring(0, 100) + "..."}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Zionist Genocidal Voices Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={
                <span>
                  <span className="text-red-600 font-extrabold text-3xl mr-2">
                    {counts.totalGenocidealVoices}
                  </span>
                  Zionist Genocidal Voices
                </span>
              }
              subtitle="Documented genocidal statements from Israelis"
            />
            <div className="sm:ml-auto">
              <PalestineButton
                href="/genocidal-voices"
                className="!text-red-600 !border-red-600 hover:!bg-red-600 hover:!text-white hover:!border-red-600"
              >
                View All →
              </PalestineButton>
            </div>
          </div>

          {genocidealVoices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {genocidealVoices.map((voice, index: number) => (
                <div
                  key={voice.id}
                  style={{
                    borderTopColor: "#dc2626", // red-600
                  }}
                >
                  <GenocidealVoiceCard voice={voice} />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="bg-white rounded-lg shadow-md border-t-4 p-8 text-center"
              style={{ borderTopColor: "#dc2626" }}
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">
                Loading genocidal voices documentation...
              </div>
              <div className="text-gray-600">
                Documenting statements of genocidal intent from Israelis.
              </div>
            </div>
          )}

          {/* Credit */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Quotes sourced from{" "}
              <a
                href="https://crimesbyisrael.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 font-medium underline"
              >
                CrimesByIsrael.com
              </a>
            </p>
          </div>
        </section>

        {/* Gems Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={
                <span>
                  <span className="text-green-700 font-extrabold text-3xl mr-2">
                    {counts.totalGems}
                  </span>
                  Gems
                </span>
              }
              subtitle="Essential resources for understanding Palestine"
            />
            <div className="sm:ml-auto">
              <PalestineButton href="/gems">View All →</PalestineButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gems.map((gem: Gem, index: number) => (
              <div key={gem.id} className="h-full">
                <GemCard gem={gem} />
              </div>
            ))}
          </div>

          {gems.length === 0 && (
            <div
              className="bg-white rounded-lg shadow-md border-t-4 p-8 text-center"
              style={{ borderTopColor: "#006234" }}
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">
                No gems available yet
              </div>
              <div className="text-gray-600">
                We're working on adding more essential resources.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
