import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  LogIn,
  Shield,
  Users,
  Mic,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    setIsSuccess(false);

    try {
      await login(email, password, role);
      setIsSuccess(true);
      toast.success(
        `Welcome ${role.charAt(0).toUpperCase() + role.slice(1)}!`,
        {
          description: "Login successful. Redirecting...",
        }
      );

      // Small delay to show success state
      setTimeout(() => {
        navigate(roleConfig.redirectPath);
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error("Authentication Failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: string) => {
    if (loading) return; // Prevent role switching during login
    navigate(`/login?role=${newRole}`);
  };

  const fillDemoCredentials = () => {
    setEmail(roleConfig.demoEmail);
    setPassword(roleConfig.demoPassword);
    toast.info("Demo credentials filled", {
      description: "Click Sign In to continue",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-3 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${roleConfig.bgGradient} px-4 sm:px-6 transition-all duration-500 ease-in-out`}
    >
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-2xl transform transition-all duration-300 hover:shadow-3xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4 transform transition-transform duration-300 hover:scale-105">
            <img
              src={logo}
              alt="ASTU"
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-lg border-2 border-white dark:border-slate-700"
            />
            <div
              className={`absolute -top-1 -right-1 bg-gradient-to-r ${roleConfig.gradient} rounded-full w-6 h-6 flex items-center justify-center shadow-lg border border-white dark:border-slate-800`}
            >
              <RoleIcon className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent mb-2`}
          >
            {roleConfig.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
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
            const config = getRoleConfig(r.key);
            return (
              <Button
                key={r.key}
                onClick={() => switchRole(r.key)}
                size="sm"
                disabled={loading}
                className={`flex items-center justify-center gap-1 text-xs sm:text-sm font-medium rounded-lg py-2 transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg transform scale-105`
                    : "bg-white dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-500 hover:scale-102"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {r.label}
              </Button>
            );
          })}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={`${role}@astu.edu.et`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || isSuccess}
              className="h-11 text-sm rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-gray-900 dark:text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
            >
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isSuccess}
                className="h-11 text-sm rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-gray-900 dark:text-white pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={togglePasswordVisibility}
                disabled={loading || isSuccess}
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || isSuccess || !email || !password}
            className={`w-full h-11 bg-gradient-to-r ${roleConfig.gradient} text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in as {role}...
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Success! Redirecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Demo Credentials
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fillDemoCredentials}
              disabled={loading || isSuccess}
              className="text-xs h-7 px-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-800/50"
            >
              Auto Fill
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-mono bg-amber-100 dark:bg-amber-800/30 px-2 py-1 rounded">
              <span className="font-semibold">Email:</span>{" "}
              {roleConfig.demoEmail}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-mono bg-amber-100 dark:bg-amber-800/30 px-2 py-1 rounded">
              <span className="font-semibold">Password:</span>{" "}
              {roleConfig.demoPassword}
            </p>
          </div>
        </div>

        {/* Back to Public Site */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 group transition-all duration-200"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            <ArrowLeft className="h-3 w-3 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Public Site
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
