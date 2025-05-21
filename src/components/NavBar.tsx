import React from "react";
import { FaCog, FaRegIdBadge, FaRegListAlt } from "react-icons/fa";
import { NameListView } from "./NameListView";

interface NavBarProps {
  currentView: 'main' | 'lists' | 'settings';
  setView: (view: 'main' | 'lists' | 'settings') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  return (
    <>
      <nav
        className="max-w-lg mx-auto w-full flex justify-between items-center px-4 py-2 bg-white/70 shadow border border-gray-200 border-t-0"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      >
        <button
          aria-label="Settings"
          className={`p-2 rounded-full transition-colors duration-150 ${
            currentView === "settings"
              ? "bg-sky-100"
              : "hover:bg-sky-50"
          }`}
          onClick={() => setView("settings")}
        >
          <FaCog size={24} className={currentView === "settings" ? "text-sky-600" : "text-sky-400"} />
        </button>
        <button
          aria-label="Main"
          className={`p-2 rounded-full transition-colors duration-150 ${
            currentView === "main"
              ? "bg-fuchsia-100"
              : "hover:bg-fuchsia-50"
          }`}
          onClick={() => setView("main")}
        >
          <FaRegIdBadge size={24} className={currentView === "main" ? "text-fuchsia-600" : "text-fuchsia-400"} />
        </button>
        <button
          aria-label="Lists"
          className={`p-2 rounded-full transition-colors duration-150 ${
            currentView === "lists"
              ? "bg-amber-100"
              : "hover:bg-amber-50"
          }`}
          onClick={() => setView("lists")}
        >
          <FaRegListAlt size={24} className={currentView === "lists" ? "text-amber-600" : "text-amber-400"} />
        </button>
      </nav>
      {/* Render the new styled list view component when in 'lists' mode */}
      {currentView === 'lists' && <StyledNameListView />}
    </>
  );
};

// New component for a styled list view
const StyledNameListView: React.FC = () => {
  // You can add custom layout, filters, or styling here
  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-6">
      <NameListView />
      {/* Add more custom controls or filters here if needed */}
    </div>
  );
};

export default NavBar;
