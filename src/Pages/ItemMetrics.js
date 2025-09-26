import React, { useEffect, useState } from "react";


const ItemMetrics = ({ sessionId }) => {
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/sessions/history/${sessionId}`
        );
        if (!res.ok) throw new Error(`Failed to fetch session history (${res.status})`);
        const data = await res.json();
        setTurns(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, [sessionId]);

  const formatLatency = (ms) => (ms != null ? (ms / 1000).toFixed(3) : "—");

  if (loading)
    return <div className="p-6 text-gray-600 text-center">Loading item metrics...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  if (!turns.length)
    return <div className="p-6 text-gray-600 text-center">No item metrics found.</div>;

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-[95%]">
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800 text-center">Item Metrics</h3>
          <p className="text-gray-500 mt-2 text-center text-sm">
            Detailed information about each conversation turn in this session.
          </p>
        </div>

        <div className="overflow-x-auto p-4 hidden sm:block">
          <table className="min-w-full table-auto border-collapse text-gray-700">
            <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
              <tr>
                {[
                  "Session ID",
                  "Turn ID",
                  "User Query",
                  "Bot Response",
                  "Summary",
                  "Intent Labels",
                  "Intent Confidence",
                  "Slots",
                  "Retrieval Type",
                  "Retrieval Strength",
                  "Embedding Latency (s)",
                  "Dense Retrieval Latency (s)",
                  "Sparse Retrieval Latency (s)",
                  "LLM Latency (s)",
                  "Total Latency (s)",
                  "Timestamp",
                ].map((col) => (
                  <th
                    key={col}
                    className="border-b px-4 py-3 text-left text-sm font-semibold tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turns.map((turn, idx) => (
                <tr
                  key={turn.turn_id}
                  className={`transition duration-150 hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="border px-3 py-2 truncate max-w-xs" title={turn.session_id}>
                    {turn.session_id}
                  </td>
                  <td className="border px-3 py-2 text-center">{turn.turn_id}</td>
                  <td className="border px-3 py-2 max-w-xs align-top">
                    <div className="overflow-x-auto whitespace-nowrap">{turn.user_query}</div>
                  </td>
                  <td className="border px-3 py-2 max-w-xs align-top">
                    <div className="overflow-x-auto whitespace-nowrap">{turn.bot_response}</div>
                  </td>
                  <td className="border px-3 py-2 max-w-xs align-top">
                    <div className="overflow-x-auto whitespace-nowrap">{turn.summary}</div>
                  </td>
                  <td className="border px-3 py-2 text-center">{turn.intent_labels}</td>
                  <td className="border px-3 py-2 text-center">{turn.intent_confidence}</td>
                  <td className="border px-3 py-2 truncate max-w-xs" title={turn.slots}>
                    {turn.slots}
                  </td>
                  <td className="border px-3 py-2 text-center">{turn.retrieval_type}</td>
                  <td className="border px-3 py-2 text-center">{turn.retrieval_strength}</td>
                  <td className="border px-3 py-2 text-center">{formatLatency(turn.embedding_latency_ms)}</td>
                  <td className="border px-3 py-2 text-center">{formatLatency(turn.dense_retrieval_latency_ms)}</td>
                  <td className="border px-3 py-2 text-center">{formatLatency(turn.sparse_retrieval_latency_ms)}</td>
                  <td className="border px-3 py-2 text-center">{formatLatency(turn.llm_latency_ms)}</td>
                  <td className="border px-3 py-2 text-center">{formatLatency(turn.total_latency_ms)}</td>
                  <td className="border px-3 py-2 text-center">{turn.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden p-4 grid gap-4">
          {turns.map((turn) => (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm" key={turn.turn_id}>
              <p className="text-sm font-medium text-gray-500">Session ID</p>
              <p className="text-base font-semibold text-gray-800">{turn.session_id}</p>

              <p className="text-sm font-medium text-gray-500">Turn ID</p>
              <p className="text-base font-semibold text-gray-800">{turn.turn_id}</p>

              <p className="text-sm font-medium text-gray-500">User Query</p>
              <p className="text-base font-semibold text-gray-800">{turn.user_query}</p>

              <p className="text-sm font-medium text-gray-500">Bot Response</p>
              <p className="text-base font-semibold text-gray-800">{turn.bot_response}</p>

              <p className="text-sm font-medium text-gray-500">Summary</p>
              <p className="text-base font-semibold text-gray-800">{turn.summary}</p>

              <p className="text-sm font-medium text-gray-500">Intent Labels</p>
              <p className="text-base font-semibold text-gray-800">{turn.intent_labels}</p>

              <p className="text-sm font-medium text-gray-500">Intent Confidence</p>
              <p className="text-base font-semibold text-gray-800">{turn.intent_confidence}</p>

              <p className="text-sm font-medium text-gray-500">Slots</p>
              <p className="text-base font-semibold text-gray-800">{turn.slots}</p>

              <p className="text-sm font-medium text-gray-500">Retrieval Type</p>
              <p className="text-base font-semibold text-gray-800">{turn.retrieval_type}</p>

              <p className="text-sm font-medium text-gray-500">Retrieval Strength</p>
              <p className="text-base font-semibold text-gray-800">{turn.retrieval_strength}</p>

              <p className="text-sm font-medium text-gray-500">Embedding Latency (s)</p>
              <p className="text-base font-semibold text-gray-800">{formatLatency(turn.embedding_latency_ms)}</p>

              <p className="text-sm font-medium text-gray-500">Dense Retrieval Latency (s)</p>
              <p className="text-base font-semibold text-gray-800">{formatLatency(turn.dense_retrieval_latency_ms)}</p>

              <p className="text-sm font-medium text-gray-500">Sparse Retrieval Latency (s)</p>
              <p className="text-base font-semibold text-gray-800">{formatLatency(turn.sparse_retrieval_latency_ms)}</p>

              <p className="text-sm font-medium text-gray-500">LLM Latency (s)</p>
              <p className="text-base font-semibold text-gray-800">{formatLatency(turn.llm_latency_ms)}</p>

              <p className="text-sm font-medium text-gray-500">Total Latency (s)</p>
              <p className="text-base font-semibold text-gray-800">{formatLatency(turn.total_latency_ms)}</p>

              <p className="text-sm font-medium text-gray-500">Timestamp</p>
              <p className="text-base font-semibold text-gray-800">{turn.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemMetrics;
