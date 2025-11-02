import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  BookOpen,
  BrainCircuit,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDark, theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs for dropdown and button
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // ✅ Detect clicks outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="fixed w-full top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur bg-background/60 text-foreground border-b border-border">
      <Link
        to="/"
        className="flex items-center space-x-2 text-2xl font-bold hover:opacity-80 transition-opacity"
      >
        <div
          className="h-10 w-10 rounded-full bg-card p-1 shadow-lg"
          style={{ boxShadow: "0 10px 30px hsl(var(--primary) / 0.3)" }}
        >
          {/* ✅ CHANGED: Corrected the image path */}
          <img
            src="/assests/logo.webp"
            alt="EduAI Logo"
            className="h-full w-full object-cover rounded-full"
          />
        </div>
        <span>SuperNova</span>
      </Link>

      {user && (
        <div className="hidden md:flex items-center space-x-6 mx-auto text-sm font-medium">
          {user.role === "admin" ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Shield size={18} />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/my-courses"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <BookOpen size={18} />
                <span>My Courses</span>
              </Link>
              <Link
                to="/CourseSetup"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <BrainCircuit size={18} />
                <span>Create Course</span>
              </Link>
            </>
          )}
        </div>
      )}

      <div className="relative">
        {!user ? (
          <div className="space-x-4">
            <Link to="/login">
              <button className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg transition">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-secondary hover:opacity-90 text-secondary-foreground px-4 py-2 rounded-lg transition">
                Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Profile Button */}
            <button
              ref={buttonRef}
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
            >
              {/* ✅ CHANGED: Corrected the image path */}
              <img
                src="/assests/s.jpg"
                alt="User Avatar"
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
              />
              <span className="hidden md:inline font-medium">{user.name}</span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-4 w-80 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border backdrop-blur-md p-6 z-50 animate-fade-in transition-all duration-300 space-y-5"
              >
                {/* User Info */}
                <div className="flex items-center gap-4">
                  {/* ✅ CHANGED: Corrected the image path */}
                  <img
                    src="/assests/s.jpg"
                    alt="User Avatar"
                    className="w-14 h-14 rounded-full border-2"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      boxShadow:
                        "0 10px 30px hsl(var(--primary) / 0.35)",
                    }}
                  />
                  <div>
                    <p className="font-bold text-xl leading-5">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-400 break-words">
                      {user.email}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-700" />

                {/* Navigation Links */}
                <div className="flex flex-col gap-3 text-base font-medium">
                  {user.role === "admin" ? (
                    <>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Shield size={18} /> Admin Panel
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={18} /> Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={18} /> Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard size={18} /> Dashboard
                      </Link>
                      <Link
                        to="/my-courses"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <BookOpen size={18} /> My Courses
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 hover:text-primary transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={18} /> Settings
                      </Link>
                    </>
                  )}
                  <ThemeSwitcher />
                </div>

                <hr className="border-gray-700" />

                {/* Logout + Help */}
                <div className="flex flex-col gap-2 text-base">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 text-left text-red-500 hover:text-red-400 transition"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                  {user.role !== "admin" && (
                    <Link
                      to="/help"
                      className="flex items-center gap-3 text-left text-primary hover:opacity-80 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HelpCircle size={18} /> Help & Support
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;