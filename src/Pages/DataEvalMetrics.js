import React, { useEffect, useState } from "react";


const DataEvalMetrics = ({ query, sessionId }) => {
  const [data, setData] = useState(null);
  const [chunkSummary, setChunkSummary] = useState(null);
  const [chatResponse, setChatResponse] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDocs = await fetch(`${process.env.REACT_APP_API_URL}/knowledge-base`);
        if (!resDocs.ok) throw new Error(`Failed with status ${resDocs.status}`);
        const docsData = await resDocs.json();
        setData(docsData);

        const resChunks = await fetch(`${process.env.REACT_APP_API_URL}/documents/chunks?limit=1`);
        if (!resChunks.ok) throw new Error(`Failed with status ${resChunks.status}`);
        const chunkData = await resChunks.json();
        setChunkSummary(chunkData.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      if (!query || !sessionId) return;
      setLoadingChat(true);
      try {
        const resChat = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, query }),
        });
        if (!resChat.ok) {
          const text = await resChat.text();
          throw new Error(`Chat fetch failed: ${resChat.status} - ${text}`);
        }
        const chatData = await resChat.json();
        setChatResponse(chatData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingChat(false);
      }
    };
    fetchChat();
  }, [query, sessionId]);

  if (loadingData) return <div className="p-4 sm:p-6 text-gray-600">Loading knowledge base...</div>;
  if (error) return <div className="p-4 sm:p-6 text-red-500">Error: {error}</div>;
  if (data?.status === "empty") return <div className="p-4 sm:p-6 text-gray-600">Knowledge base is empty.</div>;

  const relevantChunks = chatResponse?.retrieved_chunks ?? [];

  return (
    <div className="p-4 sm:p-6 text-gray-800 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Data Evaluation Metrics</h2>

      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Knowledge Base Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 text-center text-sm sm:text-base">
          <div>
            <p className="text-xl sm:text-2xl font-bold">{data.total_chunks}</p>
            <p>Total Chunks</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{data.total_documents}</p>
            <p>Total Documents</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 className="text-base sm:text-lg font-semibold mb-3">Documents in Knowledge Base</h3>
        <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm min-w-[500px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 sm:px-3 py-2">Document</th>
              <th className="border px-2 sm:px-3 py-2">Chunks</th>
              <th className="border px-2 sm:px-3 py-2">Pages</th>
              <th className="border px-2 sm:px-3 py-2">Version</th>
            </tr>
          </thead>
          <tbody>
            {data.documents.map((doc, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 sm:px-3 py-2 break-all">{doc.doc_id}</td>
                <td className="border px-2 sm:px-3 py-2 text-center">{doc.chunk_count}</td>
                <td className="border px-2 sm:px-3 py-2 text-center">{doc.max_page}</td>
                <td className="border px-2 sm:px-3 py-2 text-center">{doc.doc_version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chunkSummary && (
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Overall Chunk Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div><strong>Total Chunks:</strong> {chunkSummary.total_chunks}</div>
            <div><strong>Unique Documents:</strong> {chunkSummary.unique_documents ?? "-"}</div>
            <div><strong>Average Length:</strong> {chunkSummary.avg_length}</div>
            <div><strong>Chunk Size:</strong> {chunkSummary.chunk_size}</div>
            <div><strong>Chunk Overlap:</strong> {chunkSummary.chunk_overlap}</div>
            <div><strong>Chunk Overlap Ratio:</strong> {chunkSummary.chunk_overlap_ratio}</div>
            <div><strong>Max Chunk Length:</strong> {chunkSummary.max_length}</div>
            <div><strong>Min Chunk Length:</strong> {chunkSummary.min_length}</div>
          </div>
        </div>
      )}

      {query && (
        <div className="bg-white shadow rounded-xl p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Answer & Relevant Chunks</h3>
          {loadingChat ? (
            <p className="text-gray-600">Fetching answer...</p>
          ) : chatResponse ? (
            <div className="space-y-4">
              <p className="text-gray-700"><strong>Answer:</strong> {chatResponse.answer}</p>
              {relevantChunks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm min-w-[600px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-2 sm:px-3 py-2">Chunk ID</th>
                        <th className="border px-2 sm:px-3 py-2">Document</th>
                        <th className="border px-2 sm:px-3 py-2">Content</th>
                        <th className="border px-2 sm:px-3 py-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relevantChunks.map((chunk) => (
                        <tr key={chunk.chunk_id} className="hover:bg-gray-50">
                          <td className="border px-2 sm:px-3 py-2 text-center">{chunk.chunk_id}</td>
                          <td className="border px-2 sm:px-3 py-2 text-center">{chunk.doc_id}</td>
                          <td className="border px-2 sm:px-3 py-2">{chunk.text}</td>
                          <td className="border px-2 sm:px-3 py-2 text-center">{chunk.final_score?.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No relevant chunks found for this query.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No query submitted yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DataEvalMetrics;
