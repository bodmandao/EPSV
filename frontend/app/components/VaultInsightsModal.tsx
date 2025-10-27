"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Sparkles } from "lucide-react";

export default function VaultInsightsModal({ vaultName, fileName, onClose }: any) {
  const [context, setContext] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (!context.trim()) {
      toast.error("Please provide some context for analysis");
      return;
    }

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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Sparkles size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              <p className="text-sm text-gray-600">Analyzing: {fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Context Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provide context for analysis
            </label>
            <textarea
              placeholder="What would you like to know about this file? Provide details, questions, or context for the AI analysis..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              The more context you provide, the better the insights will be.
            </p>
          </div>

          {/* Generate Button */}
          <button
            disabled={loading || !context.trim()}
            onClick={generateInsights}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Insights
              </>
            )}
          </button>

          {/* Insights Results */}
          {insights && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                {insights.suggestedTitle}
              </h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 bg-white p-3 rounded-md border">
                  {insights.summary}
                </p>
              </div>

              {insights.tags && insights.tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="bg-green-100 p-1 rounded-full mt-0.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        </div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}