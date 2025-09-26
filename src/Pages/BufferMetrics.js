import React, { useEffect, useState } from "react";

const BufferMetrics = ({ sessionId }) => {
  const [latestTurn, setLatestTurn] = useState(null);
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
      <div className="flex justify-center items-center h-screen text-gray-600 px-4">
        Loading latest chat...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 px-4 text-center">
        Error: {error}
      </div>
    );

  if (!latestTurn)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 px-4 text-center">
        No chat history found.
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md sm:max-w-lg">
        <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-gray-800">
          Latest Session Turn
        </h3>

        <div className="mb-4">
          <p className="text-sm sm:text-base font-medium text-gray-700">Session ID</p>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800 break-words">
            {latestTurn.session_id}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm sm:text-base font-medium text-gray-700">Timestamp</p>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800 break-words">
            {new Date(latestTurn.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm sm:text-base font-medium text-gray-700">Up-to-Date Intent Query</p>
          <p className="p-2 bg-gray-100 rounded-lg mt-1 text-gray-800 break-words">
            {latestTurn.user_query}
          </p>
        </div>

        <div className="mb-2">
          <p className="text-sm sm:text-base font-medium text-gray-700">Up-to-Date Answer</p>
          <p className="p-2 bg-gray-50 rounded-lg mt-1 text-gray-800 break-words">
            {latestTurn.bot_response}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BufferMetrics;
