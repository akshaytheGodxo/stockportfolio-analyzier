"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function AskAIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      console.log("Sending question to API:", question);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });
      console.log(res);
      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }
      const data = await res.json();
      setAnswer(data?.answer);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Ask AI</h1>

      {/* Input Section */}
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Ask something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
        />
        <Button onClick={handleAsk} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>

      {/* Error */}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Answer Section */}
      {answer && (
        <div className="prose prose-invert max-w-none rounded-xl border bg-[#1e1e1e] p-4">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
