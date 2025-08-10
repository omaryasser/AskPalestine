"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchForm from "../../components/SearchForm";
import Pagination from "../../components/Pagination";
import PalestineButton from "../../components/PalestineButton";
import QuestionWithAnswersCard from "../../components/QuestionWithAnswersCard";
import {
  PageHeader,
  PalestineFlagStats,
  SectionHeader,
} from "../../components/PalestineDesign";

interface Question {
  id: string;
  question: string;
  question_forms?: string[];
  created_at?: string;
}

interface QuestionWithAnswers extends Question {
  answerCount: number;
  authors: Array<{
    id: string;
    name: string;
    photo?: string;
    professional_identity?: string;
  }>;
}

interface PaginatedAnsweredQuestions {
  questions: QuestionWithAnswers[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

interface PaginatedQuestions {
  questions: Question[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

function UnansweredQuestionCard({
  question,
  alternativeQuestions,
}: {
  question: Question;
  alternativeQuestions: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Link
      href={`/questions/${encodeURIComponent(question.question)}`}
      className="block h-full"
    >
      <div
        className="bg-white rounded-lg shadow-md hover:shadow-xl border-t-4 transition-all duration-300 overflow-hidden p-6 h-full flex flex-col"
        style={{
          borderTopColor: "#d1d5db", // gray border for unanswered
        }}
      >
        <div className="flex items-start justify-between mb-3 flex-grow">
          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium leading-tight mb-2">
              {question.question}
            </p>

            {/* Alternative question forms */}
            {alternativeQuestions.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-medium">
                    Also asked as:
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-xs underline text-palestine-green hover:text-gray-700 transition-colors"
                  >
                    {isExpanded
                      ? "Show less"
                      : `Show ${alternativeQuestions.length} more`}
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-1">
                    {alternativeQuestions.map(
                      (altQuestion: string, index: number) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 italic pl-2 border-l-2 border-gray-200"
                        >
                          "{altQuestion}"
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-auto">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          Needs Answer
        </div>
      </div>
    </Link>
  );
}

export default function QuestionsPage() {
  const [answeredQuestions, setAnsweredQuestions] =
    useState<PaginatedAnsweredQuestions | null>(null);
  const [unansweredQuestions, setUnansweredQuestions] =
    useState<PaginatedQuestions | null>(null);
  const [totalAnswers, setTotalAnswers] = useState<number>(0);
  const [answeredPage, setAnsweredPage] = useState(1);
  const [unansweredPage, setUnansweredPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadAnsweredQuestions = async (page: number) => {
    try {
      const response = await fetch(
        `/api/questions/answered?page=${page}&limit=12`,
      );
      const data = await response.json();
      setAnsweredQuestions(data);
    } catch (error) {
      console.error("Error loading answered questions:", error);
    }
  };

  const loadUnansweredQuestions = async (page: number) => {
    try {
      const response = await fetch(
        `/api/questions/unanswered?page=${page}&limit=12`,
      );
      const data = await response.json();
      setUnansweredQuestions(data);
    } catch (error) {
      console.error("Error loading unanswered questions:", error);
    }
  };

  const loadTotalAnswers = async () => {
    try {
      const response = await fetch("/api/questions/stats");
      const data = await response.json();
      setTotalAnswers(data.totalAnswers || 0);
    } catch (error) {
      console.error("Error loading total answers:", error);
    }
  };

  useEffect(() => {
    console.log("Loading questions data...");
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadAnsweredQuestions(answeredPage),
        loadUnansweredQuestions(unansweredPage),
        loadTotalAnswers(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [answeredPage, unansweredPage]);

  // Handle hash navigation
  useEffect(() => {
    if (!loading && window.location.hash === "#unanswered") {
      const unansweredSection = document.getElementById("unanswered");
      if (unansweredSection) {
        unansweredSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [loading]);

  const handleAnsweredPageChange = (page: number) => {
    setAnsweredPage(page);
    loadAnsweredQuestions(page);
  };

  const handleUnansweredPageChange = (page: number) => {
    setUnansweredPage(page);
    loadUnansweredQuestions(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="All Questions"
          subtitle="Browse all questions about Palestine with expert answers from pro-Palestinian voices."
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: "#006234" }}
            ></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="All Questions"
        subtitle="Browse all questions about Palestine with expert answers from pro-Palestinian voices."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Home */}
        <div className="mb-8">
          <PalestineButton href="/">
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
            Back to Home
          </PalestineButton>
        </div>

        {/* Answered Questions */}
        {answeredQuestions && answeredQuestions.questions.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title={`Answered Questions (${answeredQuestions.totalCount})`}
              subtitle="Questions with expert responses from pro-Palestinian voices"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 items-stretch">
              {answeredQuestions.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="h-full"
                  style={{
                    borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
                  }}
                >
                  <QuestionWithAnswersCard question={question} />
                </div>
              ))}
            </div>

            <Pagination
              currentPage={answeredQuestions.currentPage}
              totalPages={answeredQuestions.totalPages}
              onPageChange={handleAnsweredPageChange}
              className="mb-8"
            />
          </section>
        )}

        {/* Unanswered Questions */}
        {unansweredQuestions && unansweredQuestions.questions.length > 0 && (
          <section id="unanswered">
            <SectionHeader
              title={`Unanswered Questions (${unansweredQuestions.totalCount})`}
              subtitle="Help us find expert answers for these questions"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Help Us Answer These Questions
                  </h3>
                  <p className="text-blue-700">
                    These questions don't have answers yet. If you know of a
                    good answer from a pro-Palestinian figure, please use the
                    feedback feature to let us know!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 items-stretch">
              {unansweredQuestions.questions.map((question, index) => {
                // Parse question forms array
                const questionForms = question.question_forms || [
                  question.question,
                ];
                const alternativeQuestions = questionForms.slice(1);

                return (
                  <UnansweredQuestionCard
                    key={question.id}
                    question={question}
                    alternativeQuestions={alternativeQuestions}
                  />
                );
              })}
            </div>

            <Pagination
              currentPage={unansweredQuestions.currentPage}
              totalPages={unansweredQuestions.totalPages}
              onPageChange={handleUnansweredPageChange}
            />
          </section>
        )}
      </main>
    </div>
  );
}
