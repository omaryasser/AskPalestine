"use client";

import { useState, useEffect } from "react";
import QuestionWithAnswersCard from "./QuestionWithAnswersCard";
import Pagination from "./Pagination";
import { SectionHeader } from "./PalestineDesign";

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

export default function AnsweredQuestions() {
  const [answeredQuestions, setAnsweredQuestions] =
    useState<PaginatedAnsweredQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/questions/answered?page=${page}&limit=12`)
      .then((res) => res.json())
      .then((data) => {
        setAnsweredQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  if (loading || !answeredQuestions) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading answered questions...
      </div>
    );
  }

  return (
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
        onPageChange={setPage}
        className="mb-8"
      />
    </section>
  );
}
