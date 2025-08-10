"use client";

import { useState } from "react";
import { Question } from "../lib/database";
import QuestionCard from "./QuestionCard";
import QuestionWithAnswersCard from "./QuestionWithAnswersCard";
import PalestineButton from "./PalestineButton";
import { SectionHeader } from "./PalestineDesign";

type TabType = "latest-answered" | "most-answered" | "latest-unanswered";

interface TabbedQuestionsSectionProps {
  latestAnsweredQuestions: Array<
    Question & {
      answerCount: number;
      authors: Array<{
        id: string;
        name: string;
        professional_identity?: string;
      }>;
    }
  >;
  mostAnsweredQuestions: Array<
    Question & {
      answerCount: number;
      authors: Array<{
        id: string;
        name: string;
        professional_identity?: string;
      }>;
    }
  >;
  latestUnansweredQuestions: Question[];
  counts: {
    questionsWithAnswers: number;
    totalUnansweredQuestions: number;
  };
}

const tabConfig = {
  "latest-answered": {
    title: "Latest Answered Questions",
    subtitle: "Recently answered questions from Palestinian voices",
  },
  "most-answered": {
    title: "Most Answered Questions",
    subtitle: "Questions with the most expert responses",
  },
  "latest-unanswered": {
    title: "Latest Unanswered Questions",
    subtitle: "Help us find answers to these important questions",
  },
};

export default function TabbedQuestionsSection({
  latestAnsweredQuestions,
  mostAnsweredQuestions,
  latestUnansweredQuestions,
  counts,
}: TabbedQuestionsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("latest-answered");

  const getCurrentQuestions = () => {
    switch (activeTab) {
      case "latest-answered":
        return latestAnsweredQuestions;
      case "most-answered":
        return mostAnsweredQuestions;
      case "latest-unanswered":
        return latestUnansweredQuestions;
      default:
        return latestAnsweredQuestions;
    }
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case "latest-answered":
      case "most-answered":
        return counts.questionsWithAnswers;
      case "latest-unanswered":
        return counts.totalUnansweredQuestions;
      default:
        return 0;
    }
  };

  const currentQuestions = getCurrentQuestions();
  const config = tabConfig[activeTab];

  // Determine the href based on the active tab
  const getButtonHref = () => {
    return activeTab === "latest-unanswered"
      ? "/questions#unanswered"
      : "/questions";
  };

  return (
    <section className="mb-16">
      {/* Tab Headers */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(Object.keys(tabConfig) as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              const count = getTabCount(tab);

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isActive
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } transition-colors duration-200`}
                >
                  {tabConfig[tab].title} ({count})
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <SectionHeader
          title={`${config.title} (${getTabCount(activeTab)})`}
          subtitle={config.subtitle}
        />
        <div className="sm:ml-auto">
          <PalestineButton href={getButtonHref()}>
            See All Questions →
          </PalestineButton>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentQuestions.map((question: any, index: number) => (
          <div
            key={question.id}
            className={
              activeTab === "latest-unanswered" ? "border-t-4 h-full" : ""
            }
            style={{
              borderTopColor: index % 2 === 0 ? "#000000" : "#006234",
            }}
          >
            {activeTab === "latest-unanswered" ? (
              <QuestionCard question={question} />
            ) : (
              <QuestionWithAnswersCard question={question} />
            )}
          </div>
        ))}
      </div>

      {/* Empty State for Unanswered Questions */}
      {activeTab === "latest-unanswered" && currentQuestions.length === 0 && (
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
  );
}
