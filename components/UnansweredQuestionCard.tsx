"use client";
import { useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  question_forms?: string[];
  created_at?: string;
}

export default function UnansweredQuestionCard({
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
        style={{ borderTopColor: "#d1d5db" }}
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
                    {alternativeQuestions.map((altQuestion, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-600 italic pl-2 border-l-2 border-gray-200"
                      >
                        "{altQuestion}"
                      </div>
                    ))}
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
