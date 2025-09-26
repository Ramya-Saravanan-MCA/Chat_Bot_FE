import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const ChatuiSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Retrieval Metrics", path: "/retrieval-metrics" },
    { name: "Data Evaluation Metrics", path: "/data-metrics" },
    { name: "System Metrics", path: "/system-metrics" },
    { name: "Buffer Tab", path: "/buffer" },
    { name: "Items Tab", path: "/items" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-gray-900 text-white flex flex-col shadow-xl transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:relative sm:shadow-none min-h-screen`}
      >

        {/* Sidebar Header */}
        <div className="p-5 text-2xl font-semibold border-b border-gray-700 tracking-wide">
          Dashboard
        </div>

        {/* Back to Chat Button */}
        <div className="p-4 border-b border-gray-700">
          <Link
            to="/"
            className="block w-full text-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white font-medium shadow-md transition"
            onClick={toggleSidebar}
          >
            Back to Chat
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto mt-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={toggleSidebar}
                className={`block px-5 py-3 text-sm font-medium transition rounded-md mx-3 mb-1
                  ${
                    isActive
                      ? "bg-gray-700 text-white shadow"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 w-screen h-screen bg-black bg-opacity-40 z-30 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default ChatuiSidebar;
