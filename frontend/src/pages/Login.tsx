import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LogIn, Shield, Users, Mic } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Login = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as
    | "admin"
    | "manager"
    | "commentator"
    | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const role = roleParam || "admin";

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirectPaths = {
        admin: "/admin/dashboard",
        manager: "/manager/dashboard",
        commentator: "/commentary/dashboard",
      };
      navigate(redirectPaths[user.role]);
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const getRoleConfig = (role: string) => {
    const configs = {
      admin: {
        title: "Admin Portal",
        description: "System administration and management",
        icon: Shield,
        gradient: "from-red-600 to-orange-600",
        bgGradient:
          "from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-900",
        demoEmail: "admin@astu.edu.et",
        demoPassword: "Admin123!",
        redirectPath: "/admin/dashboard",
      },
      manager: {
        title: "Team Manager",
        description: "Team management and match coordination",
        icon: Users,
        gradient: "from-blue-600 to-cyan-600",
        bgGradient:
          "from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900",
        demoEmail: "manager@astu.edu.et",
        demoPassword: "Manager123!",
        redirectPath: "/manager/dashboard",
      },
      commentator: {
        title: "Commentator",
        description: "Live match commentary and updates",
        icon: Mic,
        gradient: "from-green-600 to-emerald-600",
        bgGradient:
          "from-slate-50 to-green-50 dark:from-slate-900 dark:to-green-900",
        demoEmail: "commentator@astu.edu.et",
        demoPassword: "Commentator123!",
        redirectPath: "/commentary/dashboard",
      },
    };
    return configs[role as keyof typeof configs] || configs.admin;
  };

  const roleConfig = getRoleConfig(role);
  const RoleIcon = roleConfig.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await login(email, password, role);
      toast.success(`Login successful! Welcome ${role}.`);
      navigate(roleConfig.redirectPath);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: string) => {
    navigate(`/login?role=${newRole}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${roleConfig.bgGradient} px-4 sm:px-6 transition-colors duration-300`}
    >
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-800 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <img
              src={logo}
              alt="ASTU"
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-md"
            />
            <div
              className={`absolute -top-1 -right-1 bg-gradient-to-r ${roleConfig.gradient} rounded-full w-6 h-6 flex items-center justify-center`}
            >
              <RoleIcon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}
          >
            {roleConfig.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
            {roleConfig.description}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
          {[
            { key: "admin", label: "Admin", icon: Shield },
            { key: "manager", label: "Manager", icon: Users },
            { key: "commentator", label: "Commentator", icon: Mic },
          ].map((r) => {
            const Icon = r.icon;
            const isActive = role === r.key;
            return (
              <Button
                key={r.key}
                onClick={() => switchRole(r.key)}
                size="sm"
                className={`flex items-center justify-center gap-1 text-xs sm:text-sm font-medium rounded-lg py-2 transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-sm`
                    : "bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-500"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {r.label}
              </Button>
            );
          })}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={`${role}@astu.edu.et`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 text-sm rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 text-sm rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-gray-900 dark:text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-11 bg-gradient-to-r ${roleConfig.gradient} text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:opacity-90 transition`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              </>
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
            Demo Credentials
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Email:</strong> {roleConfig.demoEmail}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Password:</strong> {roleConfig.demoPassword}
          </p>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => navigate("/")}
          >
            ← Back to Public Site
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
