"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function VaultInsightsModal({ vaultName, fileName, onClose }: any) {
  const [context, setContext] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    toast.loading("Generating AI insights...");

    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultName, fileName, context }),
      });

      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
        toast.success("Insights generated successfully!");
      } else {
        toast.error("Failed to generate insights");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating insights");
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-lg text-white">
        <h2 className="text-xl font-semibold mb-2">AI Insights for {fileName}</h2>
        <textarea
          placeholder="Enter any notes or context..."
          className="w-full p-3 bg-transparent border border-white/20 rounded-md mb-3"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={generateInsights}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm"
        >
          {loading ? "Analyzing..." : "Generate Insights"}
        </button>

        {insights && (
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <h3 className="text-lg font-semibold mb-1">{insights.suggestedTitle}</h3>
            <p className="text-sm mb-2">{insights.summary}</p>
            <div className="flex flex-wrap gap-2 text-xs opacity-80">
              {insights.tags?.map((tag: string) => (
                <span key={tag} className="bg-white/10 px-2 py-1 rounded-md">#{tag}</span>
              ))}
            </div>
            <ul className="mt-3 text-sm list-disc list-inside opacity-80">
              {insights.recommendations?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-xs underline hover:text-white/70"
        >
          Close
        </button>
      </div>
    </div>
  );
}
