import { notFound } from "next/navigation";
import AnswerCard from "../../../components/AnswerCard";
import PalestineButton from "../../../components/PalestineButton";
import SuggestAnswerForm from "../../../components/SuggestAnswerForm";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../../../components/PalestineDesign";
import {
  getQuestion,
  getAnswersForQuestion,
  initDatabase,
} from "../../../lib/database";
import fs from "fs";
import path from "path";

interface PageProps {
  params: Promise<{ question: string }>;
}

export async function generateStaticParams() {
  try {
    const questionsDir = path.join(process.cwd(), "data", "questions");
    const questionDirs = fs
      .readdirSync(questionsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    return questionDirs.map((questionDirName) => ({
      question: questionDirName,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { question: questionId } = await params;
  const decodedQuestionId = decodeURIComponent(questionId);

  initDatabase();

  const question = getQuestion(decodedQuestionId);
  const answers = getAnswersForQuestion(decodedQuestionId);

  if (!question) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={question.question}
        subtitle="Expert answers from Palestinian voices"
        showFlag={false}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <PalestineButton href="/questions">
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
            Back to Questions
          </PalestineButton>
        </div>

        {/* Alternative Question Forms */}
        {question.metadata?.question_forms &&
          question.metadata.question_forms.length > 1 && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md border-t-4 border-palestine-green p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-palestine-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Alternative Question Forms
                </h3>
                <div className="space-y-2">
                  {question.metadata.question_forms
                    .slice(1)
                    .map((altQuestion: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="text-palestine-green mr-2 mt-1">
                          •
                        </span>
                        <span className="text-gray-700">{altQuestion}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        {/* Stats */}
        <div className="mb-12">
          <PalestineFlagStats
            count={answers.length}
            title="Expert Answers"
            subtitle="Palestinian perspectives on this question"
          />
        </div>

        {/* Answers Section */}
        <div>
          <SectionHeader
            title={`Answers (${answers.length})`}
            subtitle="Expert perspectives from Palestinian voices"
          />

          {answers.length > 0 ? (
            <div className="space-y-8">
              {answers.map((answer, index) => (
                <div
                  key={answer.id}
                  id={answer.id}
                  className="bg-white rounded-lg shadow-md border-t-4 transition-all duration-300 hover:shadow-lg scroll-mt-4"
                  style={{
                    borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                  }}
                >
                  <AnswerCard answer={answer as any} questionId={question.id} />
                </div>
              ))}
            </div>
          ) : (
            <SuggestAnswerForm
              questionId={question.id}
              questionText={question.question}
            />
          )}
        </div>
      </div>
    </div>
  );
}
