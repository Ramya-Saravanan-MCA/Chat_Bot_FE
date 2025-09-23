import React, { useEffect, useState } from "react";

const RetrievalMetrics = ({ sessionId, messages = [] }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/analytics/sessions/${sessionId}/metrics`
        );
        if (!res.ok) throw new Error("Failed to fetch metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetrics();
  }, [sessionId, messages]);

  if (!metrics) return <div className="text-gray-500">Loading metrics...</div>;

  const { latest_query, average_metrics, intent_distribution, rag_usage } =
    metrics;

  const componentLabels = {
    intent_routing_time: "Intent Routing",
    embedding_time: "Embedding",
    dense_search_time: "Dense",
    sparse_search_time: "Sparse",
    fusion_time: "Fusion",
    retrieval_time: "Retrieval",
    generation_time: "Generation",
    total_time: "Total",
  };

  const formatValue = (v) =>
    typeof v === "number" ? v.toFixed(3) : "—";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Retrieval Metrics
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 className="text-gray-700 font-medium mb-2">Session Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <p>
            <strong>Session ID:</strong> {sessionId}
          </p>
          <p>
            <strong>Total Queries:</strong> {metrics.total_queries}
          </p>
          <p>
            <strong>Throughput (QPS):</strong> {metrics.throughput_qps}
          </p>
        </div>
      </div>

      {latest_query && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h3 className="text-gray-700 font-medium mb-2">Latest Query (ms)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <p>
              <strong>Intent Labels:</strong>{" "}
              {latest_query.intent_labels?.length > 0
                ? latest_query.intent_labels.join(", ")
                : "—"}
            </p>
            <p>
              <strong>Intent Confidence:</strong>{" "}
              {formatValue(latest_query.intent_confidence)}
            </p>
            <p>
              <strong>Retrieval Strength:</strong>{" "}
              {formatValue(latest_query.retrieval_strength)}
            </p>
            <p>
              <strong>RAG Used:</strong>{" "}
              {latest_query.used_rag ? "Yes" : "No"}
            </p>
          </div>
        </div>
      )}

      {latest_query?.timing && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h3 className="text-gray-700 font-medium mb-3">
            Latest Query Timing (ms)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(latest_query.timing).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
              >
                <p className="text-xs text-gray-500">
                  {componentLabels[key] || key}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {average_metrics && Object.keys(average_metrics).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h3 className="text-gray-700 font-medium mb-3">
            Average Timing (All Queries)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(average_metrics).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
              >
                <p className="text-xs text-gray-500">
                  {componentLabels[key] || key}
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {intent_distribution &&
        Object.keys(intent_distribution).length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-gray-700 font-medium mb-2">
              Intent Distribution
            </h3>
            <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
              {JSON.stringify(intent_distribution, null, 2)}
            </pre>
          </div>
        )}

      {rag_usage && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <h3 className="text-gray-700 font-medium mb-2">RAG Usage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <p>
              <strong>Total RAG Queries:</strong>{" "}
              {rag_usage.total_rag_queries}
            </p>
            <p>
              <strong>RAG Percentage:</strong>{" "}
              {rag_usage.rag_percentage}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrievalMetrics;
