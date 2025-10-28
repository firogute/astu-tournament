// components/manager/ManagerDashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Play,
  Star,
  AlertTriangle,
  Clock,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Shield,
  Goal,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface DashboardStats {
  squadSize: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  form: string;
  winRate: number;
  avgGoals: number;
  cleanSheets: number;
  currentRank: number;
}

interface Match {
  id: string;
  match_date: string;
  match_time: string;
  venue: {
    id: string;
    name: string;
    location: string;
    capacity?: number;
  };
  opponent: {
    id: string;
    name: string;
    short_name: string;
    logo?: string;
  };
  isHome: boolean;
  tournament: {
    id: string;
    name: string;
    season: string;
  };
  status: string;
  home_score?: number;
  away_score?: number;
  home_team?: any;
  away_team?: any;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teamRes, statsRes, matchesRes, resultsRes] = await Promise.all([
        apiClient.get("/manager/my-team"),
        apiClient.get("/manager/team-stats"),
        apiClient.get("/manager/upcoming-matches"),
        apiClient.get("/manager/recent-results"),
      ]);

      setTeam(teamRes.data.team);
      setStats(statsRes.data.stats);

      // Transform matches data
      const transformMatches = (matches: any[]) => {
        return (matches || []).map((match) => ({
          ...match,
          date: match.match_date,
          time: match.match_time,
          isHome: match.home_team_id === teamRes.data.team?.id,
          opponent:
            match.home_team_id === teamRes.data.team?.id
              ? match.away_team
              : match.home_team,
        }));
      };

      setUpcomingMatches(transformMatches(matchesRes.data.matches));
      setRecentResults(transformMatches(resultsRes.data.matches));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const quickActions = [
    {
      title: "Set Lineup",
      description: "Prepare starting XI",
      icon: Play,
      href: "/manager/lineup",
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      title: "Manage Squad",
      description: "View player roster",
      icon: Users,
      href: "/manager/team",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "Tactics",
      description: "Set formations",
      icon: Target,
      href: "/manager/lineup",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "Analytics",
      description: "Match analysis",
      icon: TrendingUp,
      href: "/manager/matches",
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-r from-orange-500 to-red-500",
    },
  ];

  const getFormColor = (form: string) => {
    const wins = (form.match(/W/g) || []).length;
    if (wins >= 3) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (wins >= 1) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="text-center lg:text-left">
          <div className="flex items-center gap-3 mb-3">
            {team?.logo && (
              <img
                src={team.logo}
                alt={team.name}
                className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700"
              />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Manager Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.name || user?.email}
              </p>
            </div>
          </div>
          {stats?.form && (
            <div className="flex items-center gap-2">
              <Badge className={getFormColor(stats.form)}>
                Current Form: {stats.form}
              </Badge>
              {stats.currentRank && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  Rank #{stats.currentRank}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2 border-slate-300 dark:border-slate-700"
        >
          <Zap className={cn("w-4 h-4", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={Users}
          value={stats?.squadSize || 0}
          label="Squad Size"
          color="text-blue-600"
          trend="stable"
        />
        <StatCard
          icon={Calendar}
          value={stats?.matchesPlayed || 0}
          label="Matches"
          color="text-purple-600"
          trend="up"
        />
        <StatCard
          icon={Trophy}
          value={stats?.wins || 0}
          label="Wins"
          color="text-green-600"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          value={stats?.points || 0}
          label="Points"
          color="text-orange-600"
          trend="up"
        />
        <StatCard
          icon={Goal}
          value={stats?.goalsScored || 0}
          label="Goals For"
          color="text-emerald-600"
          trend="up"
        />
        <StatCard
          icon={Shield}
          value={stats?.goalsConceded || 0}
          label="Goals Against"
          color="text-red-600"
          trend="down"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Quick Actions
              </h2>
              <Badge variant="secondary" className="font-medium">
                Team Tools
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.href}>
                    <Card className="group p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:scale-105">
                      <CardContent className="p-0 flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                            action.gradient
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Upcoming Matches */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <Clock className="w-6 h-6" />
              Upcoming
            </h2>
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
            >
              {upcomingMatches.length} matches
            </Badge>
          </div>
          <div className="space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches
                .slice(0, 3)
                .map((match) => (
                  <MatchCard key={match.id} match={match} type="upcoming" />
                ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming matches scheduled</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Results & Performance */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Recent Results
          </h2>
          <div className="space-y-3">
            {recentResults.length > 0 ? (
              recentResults
                .slice(0, 5)
                .map((match) => (
                  <MatchCard key={match.id} match={match} type="result" />
                ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent matches played</p>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <h2 className="text-2xl font-bold mb-6">Team Performance</h2>
          <div className="grid gap-4">
            <PerformanceMetric
              title="Win Rate"
              value={stats?.winRate ? `${stats.winRate}%` : "0%"}
              change={stats?.winRate && stats.winRate > 60 ? "+5.2%" : "-2.1%"}
              positive={stats?.winRate && stats.winRate > 60}
            />
            <PerformanceMetric
              title="Avg Goals Per Game"
              value={stats?.avgGoals ? stats.avgGoals.toFixed(1) : "0.0"}
              change="+0.3"
              positive={true}
            />
            <PerformanceMetric
              title="Clean Sheets"
              value={stats?.cleanSheets?.toString() || "0"}
              change="+2"
              positive={true}
            />
            <PerformanceMetric
              title="Goal Difference"
              value={stats?.goalDifference ? `+${stats.goalDifference}` : "0"}
              change={
                stats?.goalDifference && stats.goalDifference > 0
                  ? "Excellent"
                  : "Needs Work"
              }
              positive={stats?.goalDifference && stats.goalDifference > 0}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color, trend }) => (
  <Card className="group p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800">
    <CardContent className="p-0 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className={cn("w-5 h-5", color)} />
        {trend === "up" && <ArrowUp className="w-3 h-3 text-green-500" />}
        {trend === "down" && <ArrowDown className="w-3 h-3 text-red-500" />}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </CardContent>
  </Card>
);

const MatchCard = ({ match, type = "upcoming" }) => (
  <div
    className={cn(
      "p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
      type === "result"
        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
        : "bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800/50"
    )}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold",
            type === "upcoming"
              ? "bg-gradient-to-r from-orange-500 to-amber-500"
              : "bg-gradient-to-r from-green-500 to-emerald-500"
          )}
        >
          {type === "upcoming" ? "VS" : "W"}
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">
            {match.isHome ? "vs " : "at "}
            {match.opponent?.short_name || match.opponent?.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(match.match_date).toLocaleDateString()} •{" "}
            {match.match_time}
          </div>
        </div>
      </div>
      <Badge variant={type === "upcoming" ? "default" : "secondary"}>
        {match.tournament?.name || "Tournament"}
      </Badge>
    </div>

    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        {match.venue?.name || "Venue TBD"}
        {match.venue?.location && `, ${match.venue.location}`}
      </div>
      <Button
        size="sm"
        className={cn(
          "gap-2",
          type === "upcoming"
            ? "bg-orange-500 hover:bg-orange-600"
            : "bg-slate-500 hover:bg-slate-600"
        )}
      >
        <Play className="w-3 h-3" />
        {type === "upcoming" ? "Prepare" : "Review"}
      </Button>
    </div>
  </div>
);

const PerformanceMetric = ({
  title,
  value,
  change,
  positive,
  isForm = false,
}) => (
  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
    <div>
      <div className="text-sm text-slate-300">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
    <div
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        positive
          ? "bg-green-500/20 text-green-300"
          : "bg-red-500/20 text-red-300"
      )}
    >
      {isForm ? change : positive ? `↑ ${change}` : `↓ ${change}`}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div>
        <Skeleton className="h-12 w-64 mb-3" />
        <Skeleton className="h-6 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4">
          <CardContent className="p-0 text-center space-y-2">
            <Skeleton className="h-5 w-5 mx-auto" />
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

export default ManagerDashboard;
