"use client";

import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function Header({ showSearch = true, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-palestine-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/favicon.png" alt="AskPalestine" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-white">AskPalestine</h1>
              <p className="text-green-100 text-sm">Truth through Knowledge</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-green-100 font-medium"
            >
              Home
            </Link>
            <Link
              href="/questions"
              className="text-white hover:text-green-100 font-medium"
            >
              All Questions
            </Link>
            <Link
              href="/voices"
              className="text-white hover:text-green-100 font-medium"
            >
              Voices
            </Link>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.facebook.com/askpalestineinfo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-green-100"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://x.com/askpalestine_qa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-green-100"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/askpalestineinfo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-green-100"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.896 5.686a.598.598 0 10-.849.848L12.35 7.83a3.019 3.019 0 00-4.681 0l-1.696-1.296a.598.598 0 10-.849-.848l1.696 1.296a3.019 3.019 0 000 4.681l-1.696 1.296a.598.598 0 10.849.848L7.669 12.17a3.019 3.019 0 004.681 0l1.696 1.296a.598.598 0 10.849-.848L12.599 11.322a3.019 3.019 0 000-4.681l1.296-1.696zm-4.896 7.15A2.836 2.836 0 117.164 10 2.836 2.836 0 0110 12.836z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </nav>
        </div>

        {showSearch && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask any question about Palestine..."
                  className="w-full px-4 py-3 pr-12 text-gray-900 bg-white border-0 rounded-lg shadow-sm focus:ring-2 focus:ring-palestine-red focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-palestine-green hover:text-palestine-red transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
