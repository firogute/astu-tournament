import { Link, useLocation } from "react-router-dom";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  X,
  Trophy,
  Users,
  TrendingUp,
  Target,
  Home,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/teams", label: "Teams", icon: Users },
    { path: "/table", label: "Table", icon: TrendingUp },
    { path: "/top-scorers", label: "Top Scorers", icon: Target },
    { path: "/top-assists", label: "Top Assists", icon: Trophy },
  ];

  const getNavIcon = (path: string) => {
    const link = navLinks.find((link) => link.path === path);
    return link?.icon || Home;
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group"
            onClick={handleNavClick}
          >
            <div className="relative">
              <img
                src={logo}
                alt="ASTU Tournament"
                className="h-12 w-auto sm:h-16 lg:h-20 object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border border-white dark:border-slate-900"></div>
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ASTU 4th Year
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Football Championship
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = getNavIcon(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl ${
                    isActive(link.path)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive(link.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700" />
              ) : (
                <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              )}
            </Button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 capitalize">
                    {user?.role}
                  </span>
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login?role=manager">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-semibold"
                  >
                    Manager
                  </Button>
                </Link>
                <Link to="/login?role=commentator">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-semibold"
                  >
                    Commentary
                  </Button>
                </Link>
                <Link to="/login?role=admin">
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-semibold border-0"
                  >
                    Admin
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
                    <img
                      src={logo}
                      alt="ASTU Tournament"
                      className="h-10 w-10"
                    />
                    <div>
                      <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ASTU 4th Year
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Football Championship
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 p-6 space-y-2">
                    {navLinks.map((link) => {
                      const Icon = getNavIcon(link.path);
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={handleNavClick}
                          className={`flex items-center gap-3 p-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                            isActive(link.path)
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Auth Actions */}
                  {!isAuthenticated && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <Link to="/login?role=manager" onClick={handleNavClick}>
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 justify-start gap-3 h-12"
                        >
                          <Users className="h-5 w-5" />
                          Manager Login
                        </Button>
                      </Link>
                      <Link
                        to="/login?role=commentator"
                        onClick={handleNavClick}
                      >
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 justify-start gap-3 h-12"
                        >
                          <Target className="h-5 w-5" />
                          Commentary Login
                        </Button>
                      </Link>
                      <Link to="/login?role=admin" onClick={handleNavClick}>
                        <Button
                          variant="default"
                          className="w-full rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg justify-start gap-3 h-12 border-0"
                        >
                          <User className="h-5 w-5" />
                          Admin Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
