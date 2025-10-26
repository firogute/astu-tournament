import { useState, useEffect } from "react";
import { LeagueTable } from "@/components/LeagueTable";
import { Card } from "@/components/ui/card";
import { TrendingUp, Award, Crown, Target, Trophy } from "lucide-react";
import apiClient from "@/lib/api";
import { Team } from "@/lib/mockData";

const TablePage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const tournamentId = "10fc1f14-88d1-4549-a703-5186dad81d70"; // Example tournament ID
        const response = await apiClient.get(`/team/standings/${tournamentId}`);
        setTeams(response.data);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load league standings");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const leader = sortedTeams[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          {/* Loading leader card */}
          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <Card className="p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl animate-pulse">
              <div className="h-32 bg-gray-300 rounded"></div>
            </Card>
          </div>

          {/* Loading table */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <Card className="p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl animate-pulse">
              <div className="h-64 bg-gray-300 rounded"></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
            <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              League Standings
            </h1>
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg lg:max-w-2xl mx-auto px-4">
            Current tournament table and team rankings
          </p>
        </div>

        {leader && (
          <div className="relative mb-6 sm:mb-8 lg:mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <Card className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl transform group-hover:scale-[1.01] sm:group-hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1">
                  <div className="relative">
                    <Crown className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-white drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white text-orange-500 rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xs sm:text-sm uppercase tracking-widest opacity-90 mb-1 sm:mb-2 font-semibold">
                      🏆 Current Leader
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      {leader.logo ? (
                        <img
                          src={leader.logo}
                          alt={leader.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {leader.name.charAt(0)}
                        </div>
                      )}
                      <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold drop-shadow-md">
                        {leader.name}
                      </div>
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg opacity-90 font-medium">
                      Leading the championship race
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mt-4 lg:mt-0">
                  <div className="text-center bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm min-w-20">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black drop-shadow-md">
                      {leader.points}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90 font-medium">
                      Points
                    </div>
                  </div>
                  <div className="text-center bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm min-w-20">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black drop-shadow-md">
                      {leader.goalDifference > 0 ? "+" : ""}
                      {leader.goalDifference}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90 font-medium">
                      GD
                    </div>
                  </div>
                  <div className="text-center bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm min-w-20">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black drop-shadow-md">
                      {leader.won}
                    </div>
                    <div className="text-xs sm:text-sm opacity-90 font-medium">
                      Wins
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="mb-6 sm:mb-8 lg:mb-12 overflow-x-scroll">
          <LeagueTable teams={teams} />
        </div>

        <Card className="p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
            Table Legend
          </h3>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            {[
              ["P", "Played"],
              ["W", "Won"],
              ["D", "Drawn"],
              ["L", "Lost"],
              ["GF", "Goals For"],
              ["GA", "Goals Against"],
              ["GD", "Goal Difference"],
              ["Pts", "Points"],
            ].map(([abbr, label]) => (
              <div
                key={abbr}
                className="flex items-center gap-2 p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
              >
                <span className="font-bold text-slate-900 dark:text-white min-w-6">
                  {abbr}
                </span>
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TablePage;
