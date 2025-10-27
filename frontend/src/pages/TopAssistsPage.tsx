import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Share2, Users, Zap, Target, TrendingUp } from "lucide-react";
import apiClient from "@/lib/api";

interface Player {
  player_id: string;
  name: string;
  team_id: string;
  team?: string;
  goals: number;
  assists: number;
  minutes_played?: number;
  appearances?: number;
}

const TopAssistsPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopAssists = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get("/players/top-assists?limit=20");

        if (response.data && Array.isArray(response.data.topAssists)) {
          setPlayers(response.data.topAssists);
        } else if (Array.isArray(response.data)) {
          setPlayers(response.data);
        } else {
          console.error("Unexpected API response:", response.data);
          setError("Invalid data format received from server");
        }
      } catch (err: any) {
        console.error("Error fetching top assists:", err);
        setError(
          err.response?.data?.error || "Failed to load top assists data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTopAssists();
  }, []);

  const getPlaymakerBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-gradient-to-r from-purple-500 to-blue-500",
          icon: Share2,
          text: "text-white",
        };
      case 1:
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: Users,
          text: "text-white",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: Zap,
          text: "text-white",
        };
      default:
        return {
          bg: "bg-muted",
          icon: TrendingUp,
          text: "text-muted-foreground",
        };
    }
  };

  const getEfficiency = (player: Player) => {
    if (!player.minutes_played || player.minutes_played === 0) return "0.00";
    return ((player.assists / player.minutes_played) * 90).toFixed(2);
  };

  const topPlayer = players.length > 0 ? players[0] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          <div className="relative mb-6 sm:mb-8 lg:mb-12">
            <Card className="p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl animate-pulse">
              <div className="h-32 bg-gray-300 rounded"></div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(6)].map((_, index) => (
              <Card
                key={index}
                className="p-6 bg-white/80 dark:bg-slate-900/80 rounded-2xl animate-pulse"
              >
                <div className="h-20 bg-gray-300 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-4 sm:py-6 lg:py-8">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
            <Share2 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Top Assists
            </h1>
            <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-500" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-4">
            Celebrating the tournament's most creative playmakers and their
            vision on the field
          </p>
        </div>

        {topPlayer && (
          <div className="relative mb-6 sm:mb-8 lg:mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <Card className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl transform group-hover:scale-[1.01] sm:group-hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1">
                  <div className="relative">
                    <Share2 className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white text-purple-500 rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xs sm:text-sm uppercase tracking-widest opacity-90 mb-1 sm:mb-2 font-semibold">
                      🎯 Playmaker Supreme
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-1 sm:mb-2 drop-shadow-md">
                      {topPlayer.name}
                    </div>
                    <div className="text-sm sm:text-lg lg:text-xl opacity-90 font-medium">
                      {topPlayer.team || `Team ${topPlayer.team_id}`}
                    </div>
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-4 lg:gap-6 mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{getEfficiency(topPlayer)} assists/90min</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{topPlayer.goals} goals</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4 lg:mt-0">
                  <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-black drop-shadow-md">
                    {topPlayer.assists}
                  </div>
                  <div className="text-sm sm:text-lg lg:text-xl font-semibold opacity-90">
                    Assists Provided
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {players.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              No top assists data available
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {players.map((player, index) => {
              const PlaymakerBadge = getPlaymakerBadge(index).icon;
              const badgeStyle = getPlaymakerBadge(index);

              return (
                <div key={player.player_id} className="group">
                  <Card className="relative p-3 sm:p-4 lg:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`relative flex-shrink-0 ${badgeStyle.bg} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        <PlaymakerBadge
                          className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${badgeStyle.text}`}
                        />
                        <div className="absolute -top-1 -right-1 bg-white text-slate-900 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">
                              {player.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                              {player.team || `Team ${player.team_id}`}
                            </p>
                          </div>
                          <div className="text-right ml-2 sm:ml-3 lg:ml-4">
                            <div className="text-2xl sm:text-3xl lg:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              {player.assists}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                              Assists
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-2 sm:mt-3 text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-2 w-2 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {getEfficiency(player)}/90min
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-orange-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {player.goals} goals
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {player.appearances || 0} apps
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {player.minutes_played || 0}m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < 3 && (
                      <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-white/50 dark:bg-slate-900/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-slate-200 dark:border-slate-700">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Assist leaders ranked by creativity and vision • {
              players.length
            }{" "}
            playmakers
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopAssistsPage;
