// pages/Manager.tsx
import { Routes, Route } from "react-router-dom";
import ManagerDashboard from "@/components/manager/ManagerDashboard";
import TeamManagement from "@/components/manager/TeamManagement";
import LineupBuilder from "@/components/manager/LineupBuilder";
import MatchPreparation from "@/components/manager/MatchPreparation";
import PlayerManagement from "@/components/manager/PlayerManagement";
import ManagerNavbar from "@/components/manager/ManagerNavbar";

const Manager = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <ManagerNavbar />

      <div className="pt-16">
        <Routes>
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="players" element={<PlayerManagement />} />
          <Route path="lineup" element={<LineupBuilder />} />
          <Route path="matches" element={<MatchPreparation />} />
        </Routes>
      </div>
    </div>
  );
};

export default Manager;
