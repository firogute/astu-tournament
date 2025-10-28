// components/manager/MatchPreparation.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Play,
  Users,
  Target,
  BarChart3,
  Video,
  Download,
  Upload,
  Shield,
  Zap,
  Clock,
  MapPin,
  Trophy,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface Match {
  id: string;
  date: string;
  time: string;
  venue: string;
  opponent: {
    id: string;
    name: string;
    short_name: string;
    logo?: string;
  };
  isHome: boolean;
  tournament: string;
  status: string;
  home_score?: number;
  away_score?: number;
}

interface OpponentAnalysis {
  formation: string;
  strengths: string[];
  weaknesses: string[];
  keyPlayers: any[];
  recentForm: string;
}

const MatchPreparation = () => {
  const { user } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [opponentAnalysis, setOpponentAnalysis] =
    useState<OpponentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const [upcomingRes, recentRes] = await Promise.all([
        apiClient.get("/manager/upcoming-matches"),
        apiClient.get("/manager/recent-results"),
      ]);

      setUpcomingMatches(upcomingRes.data.matches || []);
      setRecentMatches(recentRes.data.matches || []);

      // Auto-select first upcoming match
      if (upcomingRes.data.matches?.length > 0) {
        setSelectedMatch(upcomingRes.data.matches[0]);
        fetchOpponentAnalysis(upcomingRes.data.matches[0].opponent.id);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpponentAnalysis = async (opponentId: string) => {
    // In a real app, this would fetch actual opponent data
    setTimeout(() => {
      setOpponentAnalysis({
        formation: "4-2-3-1",
        strengths: ["Counter attacks", "Set pieces", "Midfield pressure"],
        weaknesses: [
          "High defensive line",
          "Vulnerable to crosses",
          "Slow center backs",
        ],
        keyPlayers: [
          { name: "John Smith", position: "FW", rating: 86 },
          { name: "Mike Johnson", position: "MF", rating: 84 },
          { name: "David Brown", position: "DF", rating: 82 },
        ],
        recentForm: "WWLWD",
      });
    }, 1000);
  };

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    fetchOpponentAnalysis(match.opponent.id);
  };

  const getMatchResult = (match: Match) => {
    if (!match.home_score && !match.away_score) return null;

    const isWin =
      (match.isHome && match.home_score > match.away_score) ||
      (!match.isHome && match.away_score > match.home_score);
    const isDraw = match.home_score === match.away_score;

    return { isWin, isDraw, score: `${match.home_score}-${match.away_score}` };
  };

  if (loading) {
    return <MatchPreparationSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Match Preparation
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze opponents and prepare your team strategy
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600">
            <Video className="w-4 h-4" />
            Video Analysis
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match Selector */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Select Match
            </h2>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
                <TabsTrigger value="recent">Recent Matches</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4 space-y-3">
                {upcomingMatches.map((match) => (
                  <MatchSelectorCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatch?.id === match.id}
                    onSelect={() => handleMatchSelect(match)}
                    type="upcoming"
                  />
                ))}

                {upcomingMatches.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming matches scheduled</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-4 space-y-3">
                {recentMatches.map((match) => (
                  <MatchSelectorCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatch?.id === match.id}
                    onSelect={() => handleMatchSelect(match)}
                    type="recent"
                  />
                ))}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Opponent Analysis */}
          {selectedMatch && opponentAnalysis && (
            <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Opponent Analysis: {selectedMatch.opponent.short_name}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Formation & Tactics */}
                <div>
                  <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                    Formation & Style
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Preferred Formation
                      </span>
                      <Badge variant="secondary">
                        {opponentAnalysis.formation}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-sm font-medium">Recent Form</span>
                      <Badge
                        className={cn(
                          "font-mono",
                          opponentAnalysis.recentForm.includes("W")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {opponentAnalysis.recentForm}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Key Players */}
                <div>
                  <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
                    Key Players
                  </h3>
                  <div className="space-y-2">
                    {opponentAnalysis.keyPlayers.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {player.rating}
                          </div>
                          <span className="text-sm font-medium">
                            {player.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {player.position}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {opponentAnalysis.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Weaknesses
                  </h3>
                  <div className="space-y-2">
                    {opponentAnalysis.weaknesses.map((weakness, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tactical Recommendations */}
          {selectedMatch && (
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Target className="w-5 h-5" />
                Tactical Recommendations
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Recommended Approach
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Press high when they build from the back
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Exploit spaces behind their full-backs
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Target set-piece opportunities
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Formation Suggestions
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {["4-3-3", "4-2-3-1", "3-5-2"].map((formation) => (
                      <Badge
                        key={formation}
                        variant="outline"
                        className="bg-white/50 text-blue-700 border-blue-300"
                      >
                        {formation}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Match Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full gap-2 justify-start" asChild>
                <Link to="/manager/lineup">
                  <Users className="w-4 h-4" />
                  Set Starting Lineup
                </Link>
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-start">
                <BarChart3 className="w-4 h-4" />
                View Match Stats
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Video className="w-4 h-4" />
                Opposition Videos
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </Card>

          {/* Selected Match Details */}
          {selectedMatch && (
            <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <Eye className="w-5 h-5" />
                Match Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">
                    {selectedMatch.tournament}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">
                    {new Date(selectedMatch.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">{selectedMatch.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">{selectedMatch.venue}</span>
                </div>
                <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      {selectedMatch.isHome ? "HOME" : "AWAY"} MATCH
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      vs {selectedMatch.opponent.name}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Preparation Checklist */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold mb-4">Preparation Checklist</h3>
            <div className="space-y-2">
              {[
                "Set starting lineup",
                "Review opponent tactics",
                "Plan set-piece strategies",
                "Prepare substitutions",
                "Brief players on roles",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-300 rounded-sm"></div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MatchSelectorCard = ({ match, isSelected, onSelect, type }) => {
  const result = getMatchResult(match);

  function getMatchResult(match: Match) {
    if (!match.home_score && !match.away_score) return null;

    const isWin =
      (match.isHome && match.home_score > match.away_score) ||
      (!match.isHome && match.away_score > match.home_score);
    const isDraw = match.home_score === match.away_score;

    return { isWin, isDraw, score: `${match.home_score}-${match.away_score}` };
  }

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-300 border-2",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold",
                type === "upcoming"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : result?.isWin
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : result?.isDraw
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              )}
            >
              {type === "upcoming"
                ? "VS"
                : result?.isWin
                ? "W"
                : result?.isDraw
                ? "D"
                : "L"}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {match.isHome ? "vs " : "at "}
                {match.opponent.short_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(match.date).toLocaleDateString()} • {match.time}
              </div>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {match.tournament}
            </Badge>
            {result && (
              <div className="text-sm font-semibold">{result.score}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MatchPreparationSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  </div>
);

export default MatchPreparation;
