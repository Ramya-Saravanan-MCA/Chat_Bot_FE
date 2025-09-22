import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import SessionSetup from "./Pages/SessionSetup";
import ChatUI from "./Pages/ChatUi";
import RetrievalMetrics from "./Pages/RetrievalMetrics";
import DataEvalMetrics from "./Pages/DataEvalMetrics";
import SystemMetrics from "./Pages/SystemMetrics";
import Sidebar from "./Pages/ChatuiSidebar";
import BufferMetrics from "./Pages/BufferMetrics";
import ItemMetrics from "./Pages/ItemMetrics";

const Logs = () => <div className="text-gray-800">Logs Page</div>;
const Sessions = () => <div className="text-gray-800">Sessions Page</div>;

const App = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  if (!sessionId) {
    return <SessionSetup onProceed={(id) => setSessionId(id)} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-100 p-6 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ChatUI
                  sessionId={sessionId}
                  messages={messages}
                  setMessages={setMessages}
                />
              }
            />
            <Route
              path="/retrieval-metrics"
              element={<RetrievalMetrics sessionId={sessionId} messages={messages} />}
            />
            <Route path="/data-metrics" element={<DataEvalMetrics />} />
            <Route path="/system-metrics" element={<SystemMetrics />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/buffer" element={<BufferMetrics sessionId={sessionId} />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/items" element={<ItemMetrics sessionId={sessionId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
