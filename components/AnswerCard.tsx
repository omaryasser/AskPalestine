"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Answer {
  id: string;
  authorId?: string;
  authorName?: string;
  authorPhoto?: string;
  authorProfessionalIdentity?: string;
  content: string;
  source?: string;
  source_type?: string;
  source_name?: string;
  created_at?: string;
}

interface AnswerCardProps {
  answer: Answer;
  questionId: string;
}

export default function AnswerCard({ answer, questionId }: AnswerCardProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;

    try {
      // Handle both YYYY-MM-DD and DD-MM-YYYY formats
      const parts = dateString.split("-");
      if (parts.length === 3) {
        let year, month, day;

        // Check if it's YYYY-MM-DD format (year will be 4 digits and > 1000)
        if (parts[0].length === 4 && parseInt(parts[0]) > 1000) {
          [year, month, day] = parts;
        } else {
          // Assume DD-MM-YYYY format
          [day, month, year] = parts;
        }

        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    return null;
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: questionId,
          answer: `${answer.authorName || answer.authorId}: ${answer.content.substring(0, 100)}...`,
          feedback: feedback,
          interactionType: "report",
        }),
      });

      if (response.ok) {
        setFeedback("");
        setShowReportForm(false);
        alert("Thank you for your report! We will review this report.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAnswerLink = () => {
    const url = `${window.location.href}#${answer.id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link
            href={`/voices/${encodeURIComponent(answer.authorName || "")}`}
            className="cursor-pointer"
          >
            {answer.authorPhoto ? (
              <img
                src={answer.authorPhoto}
                alt={answer.authorName || answer.authorId}
                className="h-10 w-10 rounded-full object-cover hover:ring-2 hover:ring-palestine-green transition-all"
              />
            ) : (
              <div className="h-10 w-10 bg-palestine-green rounded-full flex items-center justify-center hover:bg-palestine-green-dark transition-colors">
                <span className="text-white font-semibold text-sm">
                  {(answer.authorName || answer.authorId || "Anonymous")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
            )}
          </Link>
          <div>
            <Link
              href={`/voices/${encodeURIComponent(answer.authorName || "")}`}
              className="font-semibold text-gray-900 hover:text-palestine-green transition-colors cursor-pointer"
            >
              {answer.authorName || answer.authorId}
            </Link>
            <Link
              href={`/voices/${encodeURIComponent(answer.authorName || "")}`}
              className="text-sm text-gray-500 hover:text-palestine-green transition-colors cursor-pointer block"
            >
              {answer.authorProfessionalIdentity || "Palestinian Voice"}
            </Link>
            {answer.created_at && (
              <p className="text-xs text-gray-400">
                Added on {formatDate(answer.created_at)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyAnswerLink}
            className="p-2 text-gray-400 hover:text-palestine-green rounded transition-colors"
            title="Copy answer link"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </button>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className={`px-3 py-1 text-sm rounded-full transition-colors border ${
              showReportForm
                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-red-600 hover:border-red-300"
            }`}
            title="Report this answer"
          >
            <svg
              className="h-3 w-3 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            {showReportForm ? "Cancel" : "Report"}
          </button>
        </div>
      </div>

      <div className="markdown-content mb-4">
        <ReactMarkdown>{answer.content}</ReactMarkdown>
      </div>

      {answer.source_type === "YOUTUBE" && answer.source && (
        <div className="mt-4">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={answer.source}
              title="YouTube video"
              className="w-full h-64 rounded-lg"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {answer.source_type === "WEB_ARTICLE" && answer.source && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Source</span>
          </div>
          <a
            href={answer.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-palestine-green hover:text-palestine-green-dark transition-colors group"
          >
            <span className="font-medium">
              {answer.source_name || "Web Article"}
            </span>
            <svg
              className="h-4 w-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}

      {showReportForm && (
        <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-lg">
          <form onSubmit={handleReport}>
            <h5 className="font-semibold text-red-800 mb-3 flex items-center">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Report this answer
            </h5>
            <p className="text-sm text-red-700 mb-3">
              Please describe the issue with this answer. We take all reports
              seriously and will review them promptly.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe the issue (e.g., factual inaccuracy, inappropriate content, etc.)..."
              className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none bg-white"
              rows={4}
              required
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
