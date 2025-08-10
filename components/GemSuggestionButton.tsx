"use client";

import { useState } from "react";
import GemSuggestionForm from "./GemSuggestionForm";

export default function GemSuggestionButton() {
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowSuggestionForm(true)}
        className="px-6 py-2 rounded-md text-white font-semibold transition-colors"
        style={{ backgroundColor: "#006234" }}
      >
        Suggest a Resource
      </button>

      {/* Gem Suggestion Form Modal */}
      {showSuggestionForm && (
        <GemSuggestionForm onClose={() => setShowSuggestionForm(false)} />
      )}
    </>
  );
}
