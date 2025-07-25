"use client";

import { useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  question_forms?: string[];
  created_at?: string;
}

interface Author {
  id: string;
  name: string;
  photo?: string;
  professional_identity?: string;
}

interface QuestionWithAnswersCardProps {
  question: Question & {
    answerCount: number;
    authors: Author[];
  };
}

export default function QuestionWithAnswersCard({
  question,
}: QuestionWithAnswersCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const questionSlug = encodeURIComponent(question.id);

  // Parse question forms array
  const questionForms = question.question_forms || [
    question.question,
  ];
  const alternativeQuestions = questionForms.slice(1); // Get all except the first one

  return (
    <div
      className="bg-white rounded-lg shadow-md border-t-4 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
      style={{ borderTopColor: "#006234" }}
    >
      <div className="p-6 flex-grow flex flex-col">
        <Link href={`/questions/${questionSlug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-palestine-green cursor-pointer mb-3 transition-colors">
            {question.question}
          </h3>
        </Link>

        {/* Alternative question forms */}
        {alternativeQuestions.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 font-medium">
                Also asked as:
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
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
                      className="text-sm text-gray-600 italic pl-2 border-l-2 border-gray-200"
                    >
                      "{altQuestion}"
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {/* Answer count and authors */}
        <div className="mb-4 flex-grow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-palestine-green">
                {question.answerCount}
              </span>
              {question.answerCount === 1 ? " answer" : " answers"}
            </div>
          </div>
        </div>

        <div className="flex-col items-center justify-between mt-auto">
          {/* Author photos */}
          {question.authors.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 mr-2">Answered by:</span>
              <div className="flex -space-x-2">
                {question.authors.slice(0, 4).map((author, index) => (
                  <div
                    key={author.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                    style={{ zIndex: question.authors.length - index }}
                    title={author.name}
                  >
                    {author.photo ? (
                      <img
                        src={author.photo}
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: "#006234" }}
                      >
                        {author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                ))}
                {question.authors.length > 4 && (
                  <div
                    className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600"
                    style={{ zIndex: 1 }}
                  >
                    +{question.authors.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
          <Link
            href={`/questions/${questionSlug}`}
            className="inline-flex items-center text-palestine-green hover:text-gray-700 font-medium transition-colors"
          >
            Read Answers
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
