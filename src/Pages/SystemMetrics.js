import React, { useEffect, useState } from "react";

const API_BASE = "/api";

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const flattenMetrics = (data) => {
    const flat = {};
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          flat[subKey] = subValue;
        });
      } else {
        flat[key] = value;
      }
    });
    return flat;
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/analytics/system`);
        if (!response.ok) throw new Error("Failed to fetch system metrics");
        const data = await response.json();
        setMetrics(flattenMetrics(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!metrics) return null;

  const metricsArray = Object.entries(metrics).map(([key, value]) => ({
    metric: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    value:
      typeof value === "number"
        ? key.includes("percent")
          ? `${value}%`
          : key.includes("gb")
          ? `${value} GB`
          : key.includes("mhz")
          ? `${value} MHz`
          : value
        : String(value)
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow rounded p-4">
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 text-left">Metric</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {metricsArray.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-200 px-4 py-2">{item.metric}</td>
                <td className="border border-gray-200 px-4 py-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemMetrics;
