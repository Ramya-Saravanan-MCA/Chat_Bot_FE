import React, { useState, useRef, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const SessionSetup = ({ onProceed }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [document, setDocument] = useState("");
  const [documents, setDocuments] = useState([]);
  const [llmModel, setLlmModel] = useState("groq");
  const [retrievalMode, setRetrievalMode] = useState("hybrid");
  const [topKDense, setTopKDense] = useState(10);
  const [topKSparse, setTopKSparse] = useState(10);
  const [rrfK, setRrfK] = useState(60);
  const [topKFinal, setTopKFinal] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sessionTables, setSessionTables] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSessionTables = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/lancedb/session-tables`);
        const data = await res.json();
        setSessionTables(data.tables || []);
      } catch (err) {
        console.error("Error fetching session tables:", err);
      }
    };
    fetchSessionTables();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/documents`);
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };
    fetchDocuments();
  }, []);

  const handleOptionSelect = (docName) => {
    setSelectedOption(docName);
    setDocument(docName);
  };

  const handleDelete = (docName) => {
    if (window.confirm(`Delete document "${docName}"?`)) {
      setDocuments((prev) => prev.filter((d) => d.name !== docName));
      if (document === docName) {
        setDocument("");
        setSelectedOption("");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return alert("Please select a PDF file");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("files", uploadFile);

      const uploadRes = await fetch(`${process.env.REACT_APP_API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      setRawResponse(uploadData);

      let uploadedFile =
        uploadData.filename || uploadData.filenames?.[0] || uploadData.file;

      if (
        !uploadedFile &&
        uploadData.detail?.toLowerCase().includes("already exist")
      ) {
        uploadedFile = uploadFile.name;
      }

      if (!uploadedFile) {
        alert("Upload already exist or failed!");
        console.warn("Upload response:", uploadData);
        return;
      }

      await fetch(`${process.env.REACT_APP_API_URL}/documents/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_name: uploadedFile, force_reindex: true }),
      });

      const res = await fetch(`${process.env.REACT_APP_API_URL}/documents`);
      const data = await res.json();
      setDocuments(data.documents || []);

      setDocument(uploadedFile);
      setSelectedOption("upload");
      setUploadFile(null);

      alert("Document ready (uploaded or already exists)!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (!document) return alert("Please select or upload a document!");
    setLoading(true);
    const payload = {
      document_name: document,
      llm_model: llmModel,
      retrieval_mode: retrievalMode,
      top_k_dense: topKDense,
      top_k_sparse: topKSparse,
      rrf_k: rrfK,
      top_k_final: topKFinal,
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setRawResponse(data);

      if (data.session_id) {
        setSessionId(data.session_id);
        setSessionInfo(data);
        console.log("Session created successfully!");
        console.log("Session ID:", data.session_id);
        console.log("Session Details:", data);
        onProceed && onProceed(data.session_id);
      } else {
        alert("Failed to create session");
        console.warn("Session creation failed. Response:", data);
      }
    } catch (err) {
      console.error("Session error:", err);
      alert("Error creating session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-600">
        Hybrid RAG Chatbot
      </h1>

      {sessionId && sessionInfo && (
        <div className="mb-8 p-6 border border-gray-400 rounded-lg shadow bg-gray-50">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Session Info
          </h2>
          <p>
            <strong>Session ID:</strong> {sessionId}
          </p>
          <p>
            <strong>Document:</strong> {sessionInfo.document_name}
          </p>
          <p>
            <strong>Table:</strong> {sessionInfo.table_name}
          </p>
          <p>
            <strong>LLM:</strong> {sessionInfo.configuration.llm_model}
          </p>
          <p>
            <strong>Retrieval Mode:</strong>{" "}
            {sessionInfo.configuration.retrieval_mode}
          </p>
        </div>
      )}

      {rawResponse && (
        <div className="mb-6 p-4 bg-gray-100 border rounded">
          <h3 className="font-bold">Raw API Response</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-6">
        <label className="block font-semibold mb-2">Choose Document</label>
        <div className="space-y-3">
          <div
            className={`p-3 border rounded cursor-pointer transition ${
              selectedOption === "entire"
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100"
            }`}
            onClick={() => {
              setSelectedOption("entire");
              setDocument("ENTIRE_KB");
            }}
          >
            <input
              type="radio"
              checked={selectedOption === "entire"}
              readOnly
              className="mr-2"
            />
            Use Entire Knowledge Base ({documents.length} documents)
          </div>

          <div
            className={`p-3 border rounded cursor-pointer transition ${
              selectedOption === "specific"
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100"
            }`}
            onClick={() => {
              setSelectedOption("specific");
              setDocument("");
            }}
          >
            <input
              type="radio"
              checked={selectedOption === "specific"}
              readOnly
              className="mr-2"
            />
            Select Specific Document
          </div>

          {selectedOption === "specific" && (
            <div className="ml-6 mt-3 space-y-2">
              {documents.length === 0 && (
                <p className="text-gray-500 italic">No documents available</p>
              )}
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className={`flex justify-between items-center p-2 border rounded shadow-sm cursor-pointer transition ${
                    document === doc.name
                      ? "bg-green-100 border-green-400"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setDocument(doc.name)}
                >
                  <span className="font-medium text-gray-800">{doc.name}</span>
                  <FaTrash
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.name);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div
            className={`p-3 border rounded cursor-pointer transition ${
              selectedOption === "upload"
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedOption("upload")}
          >
            <input
              type="radio"
              checked={selectedOption === "upload"}
              readOnly
              className="mr-2"
            />
            Upload New Document
          </div>
        </div>
      </div>

      {selectedOption === "upload" && (
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setUploadFile(e.target.files[0])}
          />
          <div
            className="border-2 border-dashed p-6 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            {uploadFile ? uploadFile.name : "Click to upload PDF"}
          </div>
          <button
            onClick={handleUpload}
            disabled={loading || !uploadFile}
            className="bg-gray-500 text-white px-4 py-2 mt-4 rounded disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="block font-semibold">LLM Model</label>
        <select
          value={llmModel}
          onChange={(e) => setLlmModel(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="groq">Groq</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Retrieval Mode</label>
        <select
          value={retrievalMode}
          onChange={(e) => setRetrievalMode(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="hybrid">Hybrid</option>
          <option value="dense">Dense</option>
          <option value="sparse">Sparse</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {retrievalMode === "dense" && (
          <div>
            <label className="block font-semibold">Top-K Dense</label>
            <input
              type="number"
              value={topKDense}
              onChange={(e) => setTopKDense(Number(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
        )}

        {retrievalMode === "sparse" && (
          <div>
            <label className="block font-semibold">Top-K Sparse</label>
            <input
              type="number"
              value={topKSparse}
              onChange={(e) => setTopKSparse(Number(e.target.value))}
              className="border p-2 w-full"
            />
          </div>
        )}

        {retrievalMode === "hybrid" && (
          <>
            <div>
              <label className="block font-semibold">Top-K Dense</label>
              <input
                type="number"
                value={topKDense}
                onChange={(e) => setTopKDense(Number(e.target.value))}
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Top-K Sparse</label>
              <input
                type="number"
                value={topKSparse}
                onChange={(e) => setTopKSparse(Number(e.target.value))}
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">RRF Fusion (k)</label>
              <input
                type="number"
                value={rrfK}
                onChange={(e) => setRrfK(Number(e.target.value))}
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Final Top-K Results</label>
              <input
                type="number"
                value={topKFinal}
                onChange={(e) => setTopKFinal(Number(e.target.value))}
                className="border p-2 w-full"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleProceed}
        className="bg-gray-700 hover:bg-gray-900 text-white font-semibold px-4 py-2 mt-6 rounded"
        disabled={loading}
      >
        {loading ? "Processing ..." : "Proceed to Chat"}
      </button>
    </div>
  );
};

export default SessionSetup;
