import apiClient from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  email: string;
  role: "admin" | "manager" | "commentator";
  team_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    role?: User["role"]
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Verify token is still valid
          const isValid = await verifyToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            apiClient.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storedToken}`;
          } else {
            // Token is invalid, clear storage
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete apiClient.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await apiClient.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.valid === true;
    } catch (error) {
      return false;
    }
  };

  const login = async (
    email: string,
    password: string,
    role?: User["role"]
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post("/auth/login", {
        email,
        password,
        role,
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Store auth data
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setToken(newToken);
        setUser(userData);

        // Set default authorization header
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        return response.data;
      } else {
        throw new Error(response.data.error || "Login failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || "Login failed";
      setError(errorMessage);
      clearAuthData();
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setError(null);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) return false;

      const isValid = await verifyToken(currentToken);
      if (isValid) {
        return true;
      } else {
        // Token refresh logic can be added here if you implement refresh tokens
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuthData();
      return false;
    }
  };

  const clearError = () => setError(null);

  // Auto-logout on token expiration check (optional)
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (token) {
        const isValid = await verifyToken(token);
        if (!isValid) {
          clearAuthData();
          setError("Session expired. Please login again.");
        }
      }
    };

    // Check token validity every 5 minutes
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    clearError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
