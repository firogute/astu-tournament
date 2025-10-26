import { useParams, Link } from "react-router-dom";
import { players } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Award,
  AlertCircle,
  Clock,
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Shield,
  Save,
  Crosshair,
} from "lucide-react";

const PlayerProfile = () => {
  const { id } = useParams();
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Player Not Found
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

  const avgMinutesPerGame =
    player.appearances > 0
      ? Math.round(player.minutesPlayed / player.appearances)
      : 0;
  const goalsPerGame =
    player.appearances > 0
      ? (player.goals / player.appearances).toFixed(2)
      : "0.00";
  const assistsPerGame =
    player.appearances > 0
      ? (player.assists / player.appearances).toFixed(2)
      : "0.00";

  // Position-based performance analysis
  const getPerformanceStats = () => {
    const baseStats = {
      GK: [
        {
          label: "Shot Stopping",
          percent: Math.min(
            100,
            Math.round((player.saves / player.appearances) * 10 + 70)
          ),
          color: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: Save,
        },
        {
          label: "Clean Sheets",
          percent: Math.min(
            100,
            Math.round((player.cleanSheets / player.appearances) * 100)
          ),
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: Shield,
        },
        {
          label: "Distribution",
          percent: Math.min(100, Math.round((player.passAccuracy || 75) + 15)),
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          icon: Crosshair,
        },
        {
          label: "Command Area",
          percent: Math.min(100, Math.round((avgMinutesPerGame / 90) * 100)),
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          icon: Trophy,
        },
      ],
      DF: [
        {
          label: "Tackling",
          percent: Math.min(
            100,
            Math.round((player.tackles / player.appearances) * 5 + 70)
          ),
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: Shield,
        },
        {
          label: "Interceptions",
          percent: Math.min(
            100,
            Math.round((player.interceptions / player.appearances) * 4 + 65)
          ),
          color: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: Zap,
        },
        {
          label: "Clearances",
          percent: Math.min(
            100,
            Math.round((player.clearances / player.appearances) * 3 + 60)
          ),
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          icon: Target,
        },
        {
          label: "Aerial Duels",
          percent: Math.min(
            100,
            Math.round((player.aerialWins / player.appearances) * 6 + 55)
          ),
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          icon: TrendingUp,
        },
      ],
      MF: [
        {
          label: "Pass Accuracy",
          percent: Math.min(100, Math.round((player.passAccuracy || 80) + 10)),
          color: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: Crosshair,
        },
        {
          label: "Key Passes",
          percent: Math.min(
            100,
            Math.round((player.keyPasses / player.appearances) * 8 + 60)
          ),
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          icon: Award,
        },
        {
          label: "Ball Recovery",
          percent: Math.min(
            100,
            Math.round((player.recoveries / player.appearances) * 4 + 65)
          ),
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: Zap,
        },
        {
          label: "Creativity",
          percent: Math.min(
            100,
            Math.round((player.assists / player.appearances) * 25 + 50)
          ),
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          icon: TrendingUp,
        },
      ],
      FW: [
        {
          label: "Finishing",
          percent: Math.min(
            100,
            Math.round((player.goals / player.appearances) * 30 + 40)
          ),
          color: "bg-gradient-to-r from-orange-500 to-red-500",
          icon: Target,
        },
        {
          label: "Chances Created",
          percent: Math.min(
            100,
            Math.round((player.assists / player.appearances) * 20 + 50)
          ),
          color: "bg-gradient-to-r from-purple-500 to-pink-500",
          icon: Award,
        },
        {
          label: "Offensive Duels",
          percent: Math.min(
            100,
            Math.round((player.dribbles / player.appearances) * 6 + 60)
          ),
          color: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: Zap,
        },
        {
          label: "Positioning",
          percent: Math.min(
            100,
            Math.round((player.shots / player.appearances) * 8 + 55)
          ),
          color: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: Crosshair,
        },
      ],
    };

    return baseStats[player.position] || baseStats.MF;
  };

  const performanceStats = getPerformanceStats();

  const matchLog = [
    {
      id: "m1",
      date: "10/25",
      opponent: "CS",
      result: "W 2-1",
      goals: 2,
      assists: 0,
      cards: 0,
      minutes: 90,
    },
    {
      id: "m2",
      date: "10/22",
      opponent: "IS",
      result: "W 3-1",
      goals: 1,
      assists: 1,
      cards: 0,
      minutes: 90,
    },
    {
      id: "m3",
      date: "10/19",
      opponent: "NET",
      result: "D 1-1",
      goals: 1,
      assists: 0,
      cards: 1,
      minutes: 85,
    },
    {
      id: "m4",
      date: "10/15",
      opponent: "IT",
      result: "W 2-0",
      goals: 0,
      assists: 1,
      cards: 0,
      minutes: 78,
    },
    {
      id: "m5",
      date: "10/12",
      opponent: "CYBER",
      result: "W 4-0",
      goals: 2,
      assists: 1,
      cards: 0,
      minutes: 90,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4">
      <div className="container mx-auto px-3">
        {/* Back Button */}
        <Link to={`/team/${player.teamId}`}>
          <Button
            variant="ghost"
            className="mb-4 gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Button>
        </Link>

        {/* Hero Section */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl border-0 rounded-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl mb-4 drop-shadow-lg">{player.photo}</div>

            <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
              <Badge className="text-base px-3 py-1 bg-white text-orange-600 font-bold">
                #{player.jerseyNumber}
              </Badge>
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 border-white/50 text-white/90"
              >
                {player.position}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold drop-shadow-md mb-2 break-words">
              {player.name}
            </h1>

            <Link to={`/team/${player.teamId}`}>
              <p className="text-base opacity-90 hover:opacity-100 transition-opacity font-medium mb-4">
                {player.team}
              </p>
            </Link>

            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-2xl font-black drop-shadow-md">
                  {player.goals}
                </div>
                <div className="text-xs opacity-90 font-medium">Goals</div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-2xl font-black drop-shadow-md">
                  {player.assists}
                </div>
                <div className="text-xs opacity-90 font-medium">Assists</div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <div className="text-2xl font-black drop-shadow-md">
                  {player.appearances}
                </div>
                <div className="text-xs opacity-90 font-medium">Apps</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              icon: Target,
              label: "G/Game",
              value: goalsPerGame,
              color: "text-orange-600 dark:text-orange-400",
              bg: "from-orange-500 to-red-500",
            },
            {
              icon: Award,
              label: "A/Game",
              value: assistsPerGame,
              color: "text-blue-600 dark:text-blue-400",
              bg: "from-blue-500 to-purple-500",
            },
            {
              icon: Clock,
              label: "Avg Min",
              value: avgMinutesPerGame,
              color: "text-green-600 dark:text-green-400",
              bg: "from-green-500 to-emerald-500",
            },
            {
              icon: AlertCircle,
              label: "Yellows",
              value: player.yellowCards,
              color: "text-yellow-600 dark:text-yellow-400",
              bg: "from-yellow-500 to-amber-500",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.bg}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <div className={`text-lg font-black ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Performance Analysis */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            {player.position} Performance
          </h2>
          <div className="space-y-4">
            {performanceStats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`p-1.5 rounded-lg bg-gradient-to-r ${stat.color}`}
                    >
                      <StatIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {stat.label}
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {stat.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Match Log */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Recent Matches
          </h2>
          <div className="space-y-3">
            {matchLog.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-medium">
                      {match.date}
                    </span>
                    <Badge
                      variant={
                        match.result.startsWith("W")
                          ? "default"
                          : match.result.startsWith("D")
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {match.result}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    vs {match.opponent}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {match.goals > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-orange-600">⚽</div>
                      <div className="text-muted-foreground">{match.goals}</div>
                    </div>
                  )}
                  {match.assists > 0 && (
                    <div className="text-center">
                      <div className="font-bold text-blue-600">🎯</div>
                      <div className="text-muted-foreground">
                        {match.assists}
                      </div>
                    </div>
                  )}
                  {match.cards > 0 && (
                    <div className="text-center">
                      <div className="text-yellow-500">🟨</div>
                      <div className="text-muted-foreground">{match.cards}</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-muted-foreground">⏱️</div>
                    <div className="text-muted-foreground">
                      {match.minutes}'
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Season Statistics */}
        <Card className="p-4 mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Season Stats
          </h3>
          <div className="space-y-3">
            {[
              ["Apps", player.appearances, ""],
              [
                "Minutes",
                `${player.minutesPlayed}'`,
                "text-blue-600 dark:text-blue-400",
              ],
              ["Goals", player.goals, "text-orange-600 dark:text-orange-400"],
              [
                "Assists",
                player.assists,
                "text-purple-600 dark:text-purple-400",
              ],
              [
                "Yellows",
                player.yellowCards,
                "text-yellow-600 dark:text-yellow-400",
              ],
              ["Reds", player.redCards, "text-red-600 dark:text-red-400"],
              [
                "Contributions",
                player.goals + player.assists,
                "text-green-600 dark:text-green-400",
              ],
            ].map(([label, value, color], i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <span className="text-muted-foreground text-sm">{label}</span>
                <span className={`font-bold text-base ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tournament Rankings */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl border-0 rounded-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Rankings
          </h3>
          <div className="space-y-3">
            {[
              ["Goals", (a, b) => b.goals - a.goals],
              ["Assists", (a, b) => b.assists - a.assists],
              ["Minutes", (a, b) => b.minutesPlayed - a.minutesPlayed],
            ].map(([label, sortFn]) => (
              <div
                key={label}
                className="flex justify-between items-center py-1"
              >
                <span className="opacity-90 text-sm">{label}</span>
                <Badge className="bg-white text-orange-600 font-bold text-xs">
                  #
                  {players.sort(sortFn).findIndex((p) => p.id === player.id) +
                    1}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Button */}
        <Card className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Team
          </h3>
          <Link to={`/team/${player.teamId}`}>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 py-2 text-sm">
              View {player.team} Profile
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default PlayerProfile;
