import { Link, useLocation } from "react-router-dom";

const ChatuiSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: "Retrieval Metrics", path: "/retrieval-metrics" },
    { name: "Data Evaluation Metrics", path: "/data-metrics" },
    { name: "System Metrics", path: "/system-metrics" },
    { name: "Buffer Tab", path: "/buffer" },
    { name: "Items Tab", path: "/items" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl min-h-screen">
      <div className="p-5 text-xl font-bold border-b border-gray-700 tracking-wide">
        Dashboard
      </div>

      <div className="p-4 border-b border-gray-700">
        <Link
          to="/"
          className="block w-full text-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium shadow-md transition"
        >
          Back to Chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`block px-5 py-3 text-sm font-medium transition rounded-md mx-3 mb-1 ${
                isActive
                  ? "bg-gray-700 text-white shadow"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatuiSidebar;
