import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/teams', label: 'Teams' },
    { path: '/table', label: 'Table' },
    { path: '/top-scorers', label: 'Top Scorers' },
    { path: '/top-assists', label: 'Top Assists' },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover-scale">
            <img src={logo} alt="ASTU Tournament" className="h-10 w-10" />
            <div className="hidden md:block">
              <div className="font-display text-lg font-bold text-primary">ASTU 4th Year</div>
              <div className="text-xs text-muted-foreground">Football Championship</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`link-underline px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{user?.role}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="rounded-full hover:bg-destructive/10"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login?role=manager">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Manager
                  </Button>
                </Link>
                <Link to="/login?role=commentator">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Commentary
                  </Button>
                </Link>
                <Link to="/login?role=admin">
                  <Button variant="default" size="sm" className="rounded-full">
                    Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
