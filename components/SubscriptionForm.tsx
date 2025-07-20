"use client";

import { useState } from "react";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: "Email Subscription",
          feedback: email,
          interactionType: "email_subscription",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you for subscribing! We'll keep you updated.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
      <p className="text-gray-400 text-sm mb-4">
        Subscribe to get updates about new content and website improvements.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {status !== "idle" && (
        <div
          className={`mt-3 text-sm ${
            status === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
