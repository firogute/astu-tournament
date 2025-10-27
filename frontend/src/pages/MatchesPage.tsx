// pages/Matches.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
  Filter,
  Zap,
  Trophy,
  Users,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedLeagues, setExpandedLeagues] = useState(new Set());
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/matches");
      setMatches(response.data || []);
      // Auto-expand first few leagues
      const leagues = [...new Set(response.data.map((match) => match.league))];
      setExpandedLeagues(new Set(leagues));
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = useMemo(() => {
    let filtered = [...matches];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (match) =>
          match.homeTeam?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          match.awayTeam?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          match.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab === "favorites") {
      filtered = filtered.filter(
        (match) => match.homeTeam?.isFavorite || match.awayTeam?.isFavorite
      );
    }

    if (activeTab === "live") {
      filtered = filtered.filter(
        (match) =>
          match.status === "live" ||
          match.status === "first_half" ||
          match.status === "second_half"
      );
    }

    // Sort: live matches first, then by date
    filtered.sort((a, b) => {
      const aIsLive =
        a.status === "live" ||
        a.status === "first_half" ||
        a.status === "second_half";
      const bIsLive =
        b.status === "live" ||
        b.status === "first_half" ||
        b.status === "second_half";

      if (aIsLive && !bIsLive) return -1;
      if (!aIsLive && bIsLive) return 1;

      return new Date(a.match_date) - new Date(b.match_date);
    });

    return filtered;
  }, [matches, searchTerm, activeTab]);

  // Group matches by league and then by date - MOVED AFTER filteredMatches definition
  const matchesByLeague = useMemo(() => {
    const leagues = {};

    filteredMatches.forEach((match) => {
      const league = match.league || "Other";
      if (!leagues[league]) {
        leagues[league] = {
          country: match.country,
          matches: {},
        };
      }

      const date = new Date(match.match_date).toDateString();
      if (!leagues[league].matches[date]) {
        leagues[league].matches[date] = [];
      }

      leagues[league].matches[date].push(match);
    });

    return leagues;
  }, [filteredMatches]);

  const toggleLeague = (league) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLeagues(newExpanded);
  };

  const getStatusBadge = (match) => {
    const isLive =
      match.status === "live" ||
      match.status === "first_half" ||
      match.status === "second_half";
    const isFinished = match.status === "finished";

    if (isLive) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-red-400">
            LIVE {match.minute}'
          </span>
        </div>
      );
    }

    if (isFinished) {
      return (
        <div className="px-2 py-1 bg-green-500/20 rounded-full">
          <span className="text-xs font-semibold text-green-400">FT</span>
        </div>
      );
    }

    return (
      <div className="px-2 py-1 bg-blue-500/20 rounded-full">
        <span className="text-xs font-semibold text-blue-400">
          {new Date(match.match_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    );
  };

  const SearchModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 p-4">
      <div className="max-w-md mx-auto bg-slate-900 rounded-2xl border border-slate-700 max-h-[80vh] overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search teams, competitions..."
              className="pl-10 bg-slate-800 border-slate-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {/* Recent Searches */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                RECENT SEARCHES
              </h3>
              {["Manchester United", "Premier League", "Champions League"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSearchTerm(item);
                      setShowSearchModal(false);
                    }}
                  >
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-white">{item}</span>
                  </div>
                )
              )}
            </div>

            {/* Popular Teams */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                POPULAR TEAMS
              </h3>
              {[
                { name: "Manchester United", country: "England" },
                { name: "Real Madrid", country: "Spain" },
                { name: "Liverpool", country: "England" },
                { name: "Barcelona", country: "Spain" },
              ].map((team) => (
                <div
                  key={team.name}
                  className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer"
                  onClick={() => {
                    setSearchTerm(team.name);
                    setShowSearchModal(false);
                  }}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="text-white">{team.name}</div>
                    <div className="text-xs text-slate-400">{team.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Close Button */}
        <div className="p-4 border-t border-slate-700">
          <Button
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            onClick={() => setShowSearchModal(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );

  const MatchRow = ({ match }) => {
    const isLive =
      match.status === "live" ||
      match.status === "first_half" ||
      match.status === "second_half";
    const isFinished = match.status === "finished";

    return (
      <div
        className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border-b border-slate-800 last:border-b-0"
        onClick={() => navigate(`/match/${match.id}`)}
      >
        {/* Team Logos and Names */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                {match.homeTeam?.logo ? (
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="w-4 h-4"
                  />
                ) : (
                  <Users className="w-3 h-3 text-slate-500" />
                )}
              </div>
              <span className="text-sm text-white truncate">
                {match.homeTeam?.short_name || "TBD"}
              </span>
            </div>

            {isFinished || isLive ? (
              <div className="text-sm font-bold text-white mx-2 min-w-12 text-center">
                {match.home_score} - {match.away_score}
              </div>
            ) : (
              <div className="text-xs text-slate-400 mx-2 min-w-12 text-center">
                VS
              </div>
            )}

            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm text-white truncate">
                {match.awayTeam?.short_name || "TBD"}
              </span>
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                {match.awayTeam?.logo ? (
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="w-4 h-4"
                  />
                ) : (
                  <Users className="w-3 h-3 text-slate-500" />
                )}
              </div>
            </div>
          </div>

          {/* Match Meta */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">
                {match.venue || "TBD"}
              </span>
            </div>
            {match.viewers && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{match.viewers}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">{getStatusBadge(match)}</div>
      </div>
    );
  };

  const LeagueSection = ({ league, data }) => {
    const isExpanded = true;

    return (
      <Card className="bg-slate-900/50 border-slate-700/50 mb-3">
        <CardContent className="p-0">
          {/* League Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
            onClick={() => toggleLeague(league)}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              <div>
                <div className="text-white font-semibold text-sm">{league}</div>
                <div className="text-slate-400 text-xs">{data.country}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-slate-800/50 text-slate-300 text-xs"
              >
                {Object.values(data.matches).flat().length}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Matches */}
          {isExpanded && (
            <div className="border-t border-slate-700/50">
              {Object.entries(data.matches).map(([date, dateMatches]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/30">
                    <div className="text-xs font-semibold text-slate-400">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Match Rows */}
                  {dateMatches.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <Card className="bg-slate-900/50 border-slate-700/50 mb-3">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-2 h-8 bg-slate-700 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 bg-slate-700 mb-1" />
              <Skeleton className="h-3 w-20 bg-slate-700" />
            </div>
          </div>
          <Skeleton className="h-6 w-8 bg-slate-700 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-blue-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Football</h1>
              <p className="text-xs text-slate-400">Live scores & matches</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3 w-full bg-slate-800/50 p-1 rounded-lg">
              <TabsTrigger
                value="all"
                className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-md py-2"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-md py-2"
              >
                Live
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-md py-2"
              >
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 pb-20">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {
                  filteredMatches.filter(
                    (match) =>
                      match.status === "live" ||
                      match.status === "first_half" ||
                      match.status === "second_half"
                  ).length
                }
              </div>
              <div className="text-xs text-blue-300">Live</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-400">
                {
                  filteredMatches.filter((match) => {
                    const matchDate = new Date(match.match_date);
                    const today = new Date();
                    return matchDate.toDateString() === today.toDateString();
                  }).length
                }
              </div>
              <div className="text-xs text-green-300">Today</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filteredMatches.length}
              </div>
              <div className="text-xs text-purple-300">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Matches by League */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {loading ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : Object.keys(matchesByLeague).length > 0 ? (
              Object.entries(matchesByLeague).map(([league, data]) => (
                <LeagueSection key={league} league={league} data={data} />
              ))
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">
                    No matches found
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {searchTerm
                      ? "Try adjusting your search"
                      : "No matches scheduled"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Search Modal */}
      {showSearchModal && <SearchModal />}
    </div>
  );
};

export default Matches;
