import { useParams, Link } from "react-router-dom";
import { teams, matches, players } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Shield,
  Zap,
} from "lucide-react";
import { MatchCard } from "@/components/MatchCard";

const TeamProfile = () => {
  const { id } = useParams();
  const team = teams.find((t) => t.id === id);

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Team Not Found
          </h2>
          <Link to="/teams">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Back to Teams
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const teamPlayers = players.filter((p) => p.teamId === id);
  const teamMatches = matches.filter(
    (m) => m.homeTeam.id === id || m.awayTeam.id === id
  );
  const upcomingMatches = teamMatches.filter((m) => m.status === "scheduled");
  const recentMatches = teamMatches.filter((m) => m.status === "finished");

  const positions = {
    GK: "Goalkeepers",
    DF: "Defenders",
    MF: "Midfielders",
    FW: "Forwards",
  };

  const groupedPlayers = Object.fromEntries(
    Object.keys(positions).map((pos) => [
      pos,
      teamPlayers.filter((p) => p.position === pos),
    ])
  );

  const renderPlayer = (player) => (
    <Link key={player.id} to={`/player/${player.id}`}>
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
        <Badge
          variant="outline"
          className="w-10 sm:w-12 justify-center text-xs sm:text-sm font-bold bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
        >
          {player.jerseyNumber}
        </Badge>
        <div className="text-2xl sm:text-3xl">{player.photo}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {player.name}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{player.appearances} apps</span>
            <span>•</span>
            <span>{player.minutesPlayed}m</span>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="text-center">
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              Goals
            </div>
            <div className="font-bold text-orange-600 dark:text-orange-400">
              {player.goals}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-[10px] sm:text-xs">
              Assists
            </div>
            <div className="font-bold text-blue-600 dark:text-blue-400">
              {player.assists}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <Link to="/teams">
          <Button
            variant="ghost"
            className="mb-4 sm:mb-6 gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>

        <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl border-0 rounded-2xl sm:rounded-3xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-1">
              <div className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl drop-shadow-lg">
                {team.logo}
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 drop-shadow-md">
                  {team.name}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-sm sm:text-base lg:text-lg opacity-90 flex-wrap justify-center lg:justify-start">
                  <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                    Position: #{teams.findIndex((t) => t.id === id) + 1}
                  </span>
                  <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                    {team.points} Points
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 text-center">
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {team.played}
                </div>
                <div className="text-xs sm:text-sm opacity-90">Played</div>
              </div>
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {team.won}
                </div>
                <div className="text-xs sm:text-sm opacity-90">Won</div>
              </div>
              <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {team.goalsFor}
                </div>
                <div className="text-xs sm:text-sm opacity-90">Goals</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[
            {
              icon: Trophy,
              label: "Wins",
              value: team.won,
              color: "text-green-600 dark:text-green-400",
              bg: "from-green-500 to-emerald-500",
            },
            {
              icon: Shield,
              label: "Draws",
              value: team.drawn,
              color: "text-yellow-600 dark:text-yellow-400",
              bg: "from-yellow-500 to-amber-500",
            },
            {
              icon: TrendingUp,
              label: "Losses",
              value: team.lost,
              color: "text-red-600 dark:text-red-400",
              bg: "from-red-500 to-pink-500",
            },
            {
              icon: Target,
              label: "Goal Diff",
              value:
                team.goalDifference > 0
                  ? `+${team.goalDifference}`
                  : team.goalDifference,
              color:
                team.goalDifference > 0
                  ? "text-green-600 dark:text-green-400"
                  : team.goalDifference < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400",
              bg:
                team.goalDifference > 0
                  ? "from-green-500 to-emerald-500"
                  : team.goalDifference < 0
                  ? "from-red-500 to-pink-500"
                  : "from-yellow-500 to-amber-500",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="p-3 sm:p-4 lg:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl group hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${stat.bg}`}
                >
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl font-black ${stat.color}`}
                >
                  {stat.value}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-2">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                Full Squad
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {Object.entries(groupedPlayers).map(
                  ([pos, list]) =>
                    list.length > 0 && (
                      <div key={pos} className="space-y-3">
                        <h3 className="font-semibold text-base sm:text-lg text-muted-foreground border-b border-slate-200 dark:border-slate-700 pb-2">
                          {positions[pos]} ({list.length})
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {list.map(renderPlayer)}
                        </div>
                      </div>
                    )
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {upcomingMatches.length > 0 && (
              <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  Upcoming Fixtures
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {upcomingMatches.slice(0, 3).map((match) => (
                    <MatchCard key={match.id} match={match} compact />
                  ))}
                </div>
              </Card>
            )}

            {recentMatches.length > 0 && (
              <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  Recent Results
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {recentMatches.slice(0, 3).map((match) => (
                    <MatchCard key={match.id} match={match} compact />
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                Season Stats
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Total Goals
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {team.goalsFor}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Goals Conceded
                  </span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {team.goalsAgainst}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Win Rate
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {team.played > 0
                      ? Math.round((team.won / team.played) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Avg Goals/Game
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {team.played > 0
                      ? (team.goalsFor / team.played).toFixed(1)
                      : 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
