'use client';

import { useState } from 'react';

interface SuggestAnswerFormProps {
  questionId: string;
  questionText: string;
}

export default function SuggestAnswerForm({ questionId, questionText }: SuggestAnswerFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionId,
          answer: suggestedAnswer,
          feedback: '',
          interactionType: 'suggested_answer'
        }),
      });

      if (response.ok) {
        setSuggestedAnswer('');
        setShowForm(false);
        alert('Thank you for your suggestion! We will review it and add the answer if appropriate.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit suggestion');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow-md border-t-4 p-8" style={{borderTopColor: '#006234'}}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-palestine-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Suggest an Answer
          </h3>
          <p className="text-gray-600">
            Do you know of a good answer to this question from a Palestinian figure? 
            Please provide details about the answer and its source.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="suggested-answer" className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Answer Details
            </label>
            <textarea
              id="suggested-answer"
              value={suggestedAnswer}
              onChange={(e) => setSuggestedAnswer(e.target.value)}
              placeholder="Please provide:&#10;1. The answer content or summary&#10;2. Who said it (Palestinian figure's name)&#10;3. Source (video, interview, speech, etc.)&#10;4. Any additional context or links"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palestine-green focus:border-palestine-green focus:outline-none"
              rows={8}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !suggestedAnswer.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-md border-2 border-green-700"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Suggestion'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border-t-4 p-8" style={{borderTopColor: '#006234'}}>
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
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
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No answers yet
        </h3>
        <p className="text-gray-600 mb-6">
          This question hasn't been answered by any Palestinian figures yet.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
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
            <h4 className="text-lg font-semibold text-blue-800 mb-2">
              Help Us Find an Answer
            </h4>
            <p className="text-blue-700">
              Do you know of a good answer to this question from a Palestinian figure? 
              Please let us know about it and help us expand our knowledge base!
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md border-2 border-green-700"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Suggest an Answer
        </button>
      </div>
    </div>
  );
}
