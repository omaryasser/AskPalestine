"use client";
import { useState, useEffect } from "react";
import UnansweredQuestionCard from "./UnansweredQuestionCard";
import Pagination from "./Pagination";
import { SectionHeader } from "./PalestineDesign";

interface Question {
  id: string;
  question: string;
  question_forms?: string[];
  created_at?: string;
}

interface PaginatedQuestions {
  questions: Question[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export default function UnansweredQuestions() {
  const [unansweredQuestions, setUnansweredQuestions] =
    useState<PaginatedQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/questions/unanswered?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        setUnansweredQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (!loading && window.location.hash === "#unanswered") {
      const unansweredSection = document.getElementById("unanswered");
      if (unansweredSection) {
        unansweredSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [loading]);

  if (loading || !unansweredQuestions) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading unanswered questions...
      </div>
    );
  }

  return (
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
              These questions don't have answers yet. If you know of a good
              answer from a pro-Palestinian figure, please use the feedback
              feature to let us know!
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 items-stretch">
        {unansweredQuestions.questions.map((question) => {
          const questionForms = question.question_forms || [question.question];
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
        onPageChange={setPage}
      />
    </section>
  );
}
