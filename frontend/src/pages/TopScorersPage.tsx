import { players } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Crown, Star, Award } from "lucide-react";

const TopScorersPage = () => {
  const sortedPlayers = [...players].sort((a, b) => b.goals - a.goals);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
          icon: Crown,
          text: "text-white",
        };
      case 1:
        return {
          bg: "bg-gradient-to-r from-gray-400 to-gray-600",
          icon: Trophy,
          text: "text-white",
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-amber-600 to-amber-800",
          icon: Award,
          text: "text-white",
        };
      default:
        return { bg: "bg-muted", icon: Star, text: "text-muted-foreground" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4 sm:mb-6">
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Top Scorers
            </h1>
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-500" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg lg:max-w-2xl mx-auto leading-relaxed px-4">
            Celebrating the tournament's most prolific goal scorers and their
            outstanding performances
          </p>
        </div>

        {sortedPlayers[0] && (
          <div className="relative mb-6 sm:mb-8 lg:mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <Card className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl transform group-hover:scale-[1.01] sm:group-hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 flex-1">
                  <div className="relative">
                    <Crown className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white text-orange-500 rounded-full w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center text-xs sm:text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xs sm:text-sm uppercase tracking-widest opacity-90 mb-1 sm:mb-2 font-semibold">
                      🏆 Golden Boot Leader
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl xl:text-5xl font-bold mb-1 sm:mb-2 drop-shadow-md">
                      {sortedPlayers[0].name}
                    </div>
                    <div className="text-sm sm:text-lg lg:text-xl opacity-90 font-medium">
                      {sortedPlayers[0].team}
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4 lg:mt-0">
                  <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-black drop-shadow-md">
                    {sortedPlayers[0].goals}
                  </div>
                  <div className="text-sm sm:text-lg lg:text-xl font-semibold opacity-90">
                    Goals Scored
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {sortedPlayers.map((player, index) => {
            const RankBadge = getRankBadge(index).icon;
            const rankStyle = getRankBadge(index);

            return (
              <div key={player.id} className="group">
                <Card className="relative p-3 sm:p-4 lg:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500" />

                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`relative flex-shrink-0 ${rankStyle.bg} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <RankBadge
                        className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${rankStyle.text}`}
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
                            {player.team}
                          </p>
                        </div>
                        <div className="text-right ml-2 sm:ml-3 lg:ml-4">
                          <div className="text-2xl sm:text-3xl lg:text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            {player.goals}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                            Goals
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          {player.assists} assists
                        </span>
                        <span className="font-medium hidden xs:inline">
                          {player.appearances} apps
                        </span>
                        <span className="font-medium hidden sm:inline">
                          {player.minutesPlayed}m
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 xs:hidden">
                        <span className="text-xs text-muted-foreground font-medium">
                          {player.appearances} apps
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {player.minutesPlayed}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {index < 3 && (
                    <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-white/50 dark:bg-slate-900/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-slate-200 dark:border-slate-700">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            Updated in real-time • {sortedPlayers.length} players ranked
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopScorersPage;
