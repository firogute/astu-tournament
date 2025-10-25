import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Teams from "./pages/Teams";
import TablePage from "./pages/TablePage";
import TopScorersPage from "./pages/TopScorersPage";
import TopAssistsPage from "./pages/TopAssistsPage";
import MatchDetails from "./pages/MatchDetails";
import TeamProfile from "./pages/TeamProfile";
import PlayerProfile from "./pages/PlayerProfile";
import Manager from "./pages/Manager";
import Admin from "./pages/Admin";
import Commentary from "./pages/Commentary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pt-24">
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/team/:id" element={<TeamProfile />} />
                <Route path="/table" element={<TablePage />} />
                <Route path="/top-scorers" element={<TopScorersPage />} />
                <Route path="/top-assists" element={<TopAssistsPage />} />
                <Route path="/match/:id" element={<MatchDetails />} />
                <Route path="/player/:id" element={<PlayerProfile />} />
                <Route 
                  path="/manager" 
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <Manager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/commentary" 
                  element={
                    <ProtectedRoute allowedRoles={['commentator', 'admin']}>
                      <Commentary />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
