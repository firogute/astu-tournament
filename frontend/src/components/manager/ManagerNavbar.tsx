// components/manager/ManagerNavbar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shirt,
  Calendar,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ManagerNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "Team Management", href: "/manager/team", icon: Users },
    { name: "Lineup Builder", href: "/manager/lineup", icon: Shirt },
    { name: "Match Center", href: "/manager/matches", icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg border-b",
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-white/80 dark:bg-slate-900/80 border-slate-200/30 dark:border-slate-800/30"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link
              to="/manager/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Team Manager
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {user?.team?.name || "ASTU Championship"}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={cn(
                      "gap-2 relative transition-all duration-300 font-medium",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {active && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Info and Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 border-0"></Badge>
            </Button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || user?.email}
                </div>
                <div className="text-xs text-muted-foreground capitalize font-medium">
                  {user?.role} • {user?.team?.short_name}
                </div>
              </div>

              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {(user?.name || user?.email)?.[0]?.toUpperCase()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-2 border-slate-300 dark:border-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={active ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-medium",
                        active
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "text-slate-600 dark:text-slate-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile User Info */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(user?.name || user?.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name || user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ManagerNavbar;
