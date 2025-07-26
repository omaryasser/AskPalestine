import QuestionCard from "../components/QuestionCard";
import QuestionWithAnswersCard from "../components/QuestionWithAnswersCard";
import ProPalestinianCard from "../components/ProPalestinianCard";
import PalestineButton from "../components/PalestineButton";
import SearchForm from "../components/SearchForm";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../components/PalestineDesign";
import {
  Question,
  ProPalestinian,
  getTotalCounts,
  getQuestionsWithMostAnswers,
  getLatestAnsweredQuestions,
  getUnansweredQuestions,
  getLatestUnansweredQuestions,
  getAllProPalestinians,
} from "../lib/database";
import Link from "next/link";

async function getHomePageData() {
  // Get actual counts from database
  const counts = await getTotalCounts();

  // Get questions with most answers
  const questionsWithMostAnswers = await getQuestionsWithMostAnswers(6);

  // Get latest answered questions
  const latestAnsweredQuestions = await getLatestAnsweredQuestions(6);

  // Get latest unanswered questions instead of random
  const latestUnansweredQuestions = await getLatestUnansweredQuestions(6);

  // Get all voices for the sliding row
  const allProPalestinians = await getAllProPalestinians();

  return {
    counts,
    questionsWithMostAnswers,
    latestAnsweredQuestions,
    latestUnansweredQuestions,
    allProPalestinians,
  };
}

export default async function Home() {
  const {
    counts,
    questionsWithMostAnswers,
    latestAnsweredQuestions,
    latestUnansweredQuestions,
    allProPalestinians,
  } = await getHomePageData();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="AskPalestine"
        subtitle="Truth through Palestinian Voices. Get clarity and confidence to speak up for Palestinian rights."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <SearchForm />
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          {/* Main Hero Stat */}
          <div className="mb-8">
            <PalestineFlagStats
              count={counts.totalAnswers}
              title="Total Answers"
              subtitle="Expert responses from Palestinian voices worldwide"
            />
          </div>
        </div>
        {/* Palestinian Voices Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={`Palestinian Voices (${counts.totalProPalestinians})`}
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

        {/* Most Answered Questions */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={`Most Answered Questions (${counts.questionsWithAnswers})`}
              subtitle="Popular questions with comprehensive expert responses"
            />
            <div className="sm:ml-auto">
              <PalestineButton href="/questions">Browse All →</PalestineButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {questionsWithMostAnswers.map((question: any, index: number) => (
              <div
                key={question.id}
                style={{
                  borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                }}
              >
                <QuestionWithAnswersCard question={question} />
              </div>
            ))}
          </div>
        </section>

        {/* Latest Answered Questions */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={`Latest Answered Questions`}
              subtitle="Recently answered questions from Palestinian voices"
            />
            <div className="sm:ml-auto">
              <PalestineButton href="/questions">Browse All →</PalestineButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestAnsweredQuestions.map((question: any, index: number) => (
              <div
                key={question.id}
                style={{
                  borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                }}
              >
                <QuestionWithAnswersCard question={question} />
              </div>
            ))}
          </div>
        </section>

        {/* Latest Unanswered Questions */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <SectionHeader
              title={`Latest Unanswered Questions (${latestUnansweredQuestions.length})`}
              subtitle="Recently asked questions seeking expert responses"
            />
            <div className="sm:ml-auto">
              <PalestineButton href="/questions">
                See All Questions →
              </PalestineButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestUnansweredQuestions.map((question: Question, index: number) => (
              <div
                key={question.id}
                className="border-t-4 h-full"
                style={{
                  borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                }}
              >
                <QuestionCard question={question} />
              </div>
            ))}
          </div>

          {latestUnansweredQuestions.length === 0 && (
            <div
              className="bg-white rounded-lg shadow-md border-t-4 p-8 text-center"
              style={{ borderTopColor: "#006234" }}
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">
                All questions have been answered!
              </div>
              <div className="text-gray-600">
                Every question in our database has at least one expert response.
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
