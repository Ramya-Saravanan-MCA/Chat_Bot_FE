import React, { useEffect, useState } from "react";

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/analytics/system`);
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

  if (loading) return <p className="p-6 text-gray-600">Loading metrics...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!metrics) return null;

  const metricsArray = Object.entries(metrics).map(([key, value]) => ({
    metric: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value:
      typeof value === "number"
        ? key.includes("percent")
          ? `${value}%`
          : key.includes("gb")
          ? `${value} GB`
          : key.includes("mhz")
          ? `${value} MHz`
          : value
        : String(value),
  }));

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Metrics</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200 text-sm sm:text-base min-w-[500px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Metric</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {metricsArray.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                    {item.metric}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 break-words">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:hidden mt-6">
          {metricsArray.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500">{item.metric}</p>
              <p className="text-base font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
