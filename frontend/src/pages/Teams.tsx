import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import apiClient from "@/lib/api";

interface Team {
  id: string;
  name: string;
  short_name: string;
  logo: string;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  played: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Assuming you have a tournament ID - you might need to adjust this
        // based on your actual API structure
        const tournamentId = "10fc1f14-88d1-4549-a703-5186dad81d70"; // Example tournament ID
        const response = await apiClient.get(`/team/standings/${tournamentId}`);
        console.log(response.data);
        setTeams(response.data);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8">
              {[...Array(6)].map((_, index) => (
                <Card
                  key={index}
                  className="p-6 bg-white/80 dark:bg-slate-900/80 rounded-xl animate-pulse"
                >
                  <div className="h-16 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </Card>
              ))}
            </div>
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
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent mb-3 sm:mb-4">
            Competing Teams
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
            Meet the teams battling for the championship title
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {teams.map((team, index) => {
            const stats = [
              {
                label: "Points",
                value: team.points,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Wins",
                value: team.won,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Goals",
                value: team.goalsFor,
                color: "text-orange-600 dark:text-orange-400",
              },
            ];

            return (
              <Card
                key={team.id}
                className="p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                <div className="text-center">
                  <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {team.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 line-clamp-1">
                    {team.short_name}
                  </h2>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 text-center">
                    {stats.map((stat) => (
                      <div key={stat.label} className="space-y-1">
                        <div
                          className={`text-xl sm:text-2xl font-black ${stat.color}`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link to={`/team/${team.id}`}>
                    <Button className="w-full group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base">
                      View Team Details
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 sm:mt-12 lg:mt-16 p-6 sm:p-8 lg:p-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl text-center transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
          <Trophy className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-3 sm:mb-4 drop-shadow-lg" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-md">
            Championship Glory Awaits
          </h2>
          <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed">
            {teams.length} departments competing for ultimate bragging rights.
            Which team will be crowned the 4th Year Football Champions?
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Teams;
