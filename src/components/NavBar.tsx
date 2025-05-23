import React from "react";
import { FaCog, FaRegIdBadge, FaRegListAlt } from "react-icons/fa";

interface NavBarProps {
  currentView: 'main' | 'lists' | 'settings';
  setView: (view: 'main' | 'lists' | 'settings') => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  // Helper for underline style
  const underlineStyle = (isActive: boolean) =>
    isActive
      ? {
          position: 'relative' as const,
        }
      : {};

  const handleSetView = (view: 'main' | 'lists' | 'settings') => {
    console.log('[NavBar] Tab changed to', view);
    setView(view);
  };

  return (
    <nav className="w-full max-w-[430px] mx-auto bg-white/80 backdrop-blur-sm shadow-lg border border-white/40" style={{ borderRadius: 0 }}>
      <div className="flex justify-between items-center px-0 py-1">
        {/* Settings - Left */}
        <button
          aria-label="Settings"
          className={`flex-1 flex flex-col items-center justify-center space-y-1 h-14 rounded-none border-none bg-transparent hover:bg-sky-50 active:bg-sky-100 focus:outline-none focus:ring-0 transition-none${currentView === "settings" ? " text-sky-600" : " text-sky-400 hover:text-sky-600"}`}
          onClick={() => handleSetView("settings")}
          style={underlineStyle(currentView === "settings")}
        >
          <FaCog size={20} color={currentView === "settings" ? "#0ea5e9" : undefined} />
          <span className="text-xs font-semibold">Settings</span>
          {currentView === "settings" && (
            <span
              style={{
                display: 'block',
                position: 'absolute',
                left: '50%',
                bottom: 0,
                transform: 'translateX(-50%)',
                width: 28,
                height: 3,
                borderRadius: 2,
                background: '#0ea5e9',
                marginTop: 2,
              }}
            />
          )}
        </button>

        {/* Card Stack - Center */}
        <button
          aria-label="Swipe Cards"
          className={`flex-1 flex flex-col items-center justify-center space-y-1 h-14 rounded-none border-none bg-transparent hover:bg-fuchsia-50 active:bg-fuchsia-100 focus:outline-none focus:ring-0 transition-none${currentView === "main" ? " text-fuchsia-600" : " text-fuchsia-400 hover:text-fuchsia-600"}`}
          onClick={() => handleSetView("main")}
          style={underlineStyle(currentView === "main")}
        >
          <FaRegIdBadge size={20} color={currentView === "main" ? "#e879f9" : undefined} />
          <span className="text-xs font-semibold">Swipe</span>
          {currentView === "main" && (
            <span
              style={{
                display: 'block',
                position: 'absolute',
                left: '50%',
                bottom: 0,
                transform: 'translateX(-50%)',
                width: 28,
                height: 3,
                borderRadius: 2,
                background: '#e879f9',
                marginTop: 2,
              }}
            />
          )}
        </button>

        {/* Lists - Right */}
        <button
          aria-label="Name Lists"
          className={`flex-1 flex flex-col items-center justify-center space-y-1 h-14 rounded-none border-none bg-transparent hover:bg-amber-50 active:bg-amber-100 focus:outline-none focus:ring-0 transition-none${currentView === "lists" ? " text-amber-600" : " text-amber-400 hover:text-amber-600"}`}
          onClick={() => handleSetView("lists")}
          style={underlineStyle(currentView === "lists")}
        >
          <FaRegListAlt size={20} color={currentView === "lists" ? "#fbbf24" : undefined} />
          <span className="text-xs font-semibold">Lists</span>
          {currentView === "lists" && (
            <span
              style={{
                display: 'block',
                position: 'absolute',
                left: '50%',
                bottom: 0,
                transform: 'translateX(-50%)',
                width: 28,
                height: 3,
                borderRadius: 2,
                background: '#fbbf24',
                marginTop: 2,
              }}
            />
          )}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
