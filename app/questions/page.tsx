import React from "react";
import AnsweredQuestions from "../../components/AnsweredQuestions";
import UnansweredQuestions from "../../components/UnansweredQuestions";
import PalestineButton from "../../components/PalestineButton";
import { PageHeader } from "../../components/PalestineDesign";

export const metadata = {
  title: "Questions & Answers | AskPalestine",
  description:
    "Browse and explore questions about Palestine with expert answers from pro-Palestinian voices. Get informed and advocate for justice.",
  keywords: [
    "Palestine",
    "questions",
    "answers",
    "expert",
    "advocacy",
    "justice",
  ],
};

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="All Questions"
        subtitle="Browse all questions about Palestine with expert answers from pro-Palestinian voices."
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <AnsweredQuestions />
        {/* Unanswered Questions */}
        <UnansweredQuestions />
      </main>
    </div>
  );
}
