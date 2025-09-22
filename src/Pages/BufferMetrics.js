import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const BufferMetrics = ({ sessionId }) => {
  const [latestTurn, setLatestTurn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/sessions/history/${sessionId}`);
        if (!res.ok) throw new Error(`Failed to fetch session history (${res.status})`);
        const data = await res.json();
        const lastTurn =
          Array.isArray(data?.buffer) && data.buffer.length > 0
            ? data.buffer[data.buffer.length - 1]
            : null;
        setLatestTurn(lastTurn);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, [sessionId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading latest chat...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  if (!latestTurn)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No chat history found.
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-6 text-center text-gray-800">
          Latest Session Turn
        </h3>

        <div className="mb-4">
          <strong className="text-gray-700">Session ID:</strong>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800">
            {latestTurn.session_id}
          </p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-700">Timestamp:</strong>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800">
            {new Date(latestTurn.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <strong className="text-gray-700">Latest Intent Query:</strong>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800">
            {latestTurn.user_query}
          </p>
        </div>

        <div className="mb-2">
          <strong className="text-gray-700">Latest Answer:</strong>
          <p className="p-2 bg-gray-50 rounded-lg mt-1 text-gray-800">
            {latestTurn.bot_response}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BufferMetrics;
