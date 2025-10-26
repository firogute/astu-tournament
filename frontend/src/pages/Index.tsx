import { useEffect, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { LeagueTable } from "@/components/LeagueTable";
import { TopScorers } from "@/components/TopScorers";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Trophy, Calendar, Star } from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";
import apiClient from "@/lib/api";

// Loading Placeholder Components
const LoadingMatchCard = () => (
  <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-24"></div>
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-20"></div>
    </div>
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex flex-col items-center flex-1">
        <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-full mb-2"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-20 mb-1"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-16"></div>
      </div>
      <div className="flex flex-col items-center mx-2">
        <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-12 mb-1"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-4 mb-1"></div>
        <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-12"></div>
      </div>
      <div className="flex flex-col items-center flex-1">
        <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-full mb-2"></div>
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-20 mb-1"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-16"></div>
      </div>
    </div>
    <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32"></div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-16"></div>
    </div>
  </div>
);

const LoadingTableRow = () => (
  <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="w-8 h-6 bg-slate-300 dark:bg-slate-700 rounded mr-4"></div>
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32"></div>
    </div>
    <div className="grid grid-cols-7 gap-4">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-6 h-4 bg-slate-300 dark:bg-slate-700 rounded"
        ></div>
      ))}
    </div>
  </div>
);

const LoadingPlayerCard = () => (
  <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-24"></div>
      </div>
      <div className="text-right">
        <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-8 mb-1"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-12"></div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using Axios - much cleaner!
        const [matchesRes, teamsRes, playersRes, standingsRes] =
          await Promise.all([
            apiClient.get("matches"),
            apiClient.get("teams"),
            apiClient.get("players"),
            apiClient.get(
              "team/standings/10fc1f14-88d1-4549-a703-5186dad81d70"
            ),
          ]);

        setMatches(matchesRes.data || []);
        setTeams(teamsRes.data.teams || []);
        setPlayers(playersRes.data.players || []);
        setStandings(standingsRes.data || []);
      } catch (err) {
        console.error("API Error:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const liveMatches = matches.filter(
    (m) =>
      m.status === "live" ||
      m.status === "first_half" ||
      m.status === "second_half"
  );
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .slice(0, 3);
  const recentMatches = matches
    .filter((m) => m.status === "finished")
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        {/* Hero Section */}
        <section
          className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] flex items-center justify-center bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto w-full">
            <div className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
              <div className="h-12 bg-white/20 rounded-xl w-3/4 mx-auto mb-6 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded-lg w-1/2 mx-auto mb-8 animate-pulse"></div>
              <div className="h-12 bg-white/20 rounded-full w-48 mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Main Content with Loading Placeholders */}
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Live Matches Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">LIVE NOW</span>
              </div>
              <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <LoadingMatchCard key={i} />
              ))}
            </div>
          </section>

          {/* Upcoming Matches Section */}
          <section>
            <div className="flex justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <LoadingMatchCard key={i} />
              ))}
            </div>
          </section>

          {/* League Table and Top Scorers */}
          <section className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-12 gap-4">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                </div>
                {[...Array(6)].map((_, i) => (
                  <LoadingTableRow key={i} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <LoadingPlayerCard key={i} />
                  ))}
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <LoadingPlayerCard key={i} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 border border-white/20 shadow-2xl">
            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-6">
              The Final Year Showdown
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              ASTU 4th Year Football Championship 2025
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 shadow-2xl"
            >
              View Full Schedule
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">LIVE NOW</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Live Matches
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section>
          <div className="flex justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Upcoming Matches
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* Recent Results */}
        {recentMatches.length > 0 && (
          <section>
            <div className="flex justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Recent Results
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* League Table and Top Scorers */}
        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                League Standings
              </h2>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <LeagueTable teams={standings} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <TopScorers players={players} type="goals" />
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <TopScorers players={players} type="assists" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
