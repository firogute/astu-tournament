import { useParams, Link } from "react-router-dom";
import { matches, players } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Trophy,
  Users,
  Target,
  BarChart3,
  Star,
  Zap,
  Crown,
} from "lucide-react";
import { LeagueTable } from "@/components/LeagueTable";
import { teams } from "@/lib/mockData";

const MatchDetails = () => {
  const { id } = useParams();
  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Match Not Found
          </h2>
          <Link to="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isLive =
    match.status === "live" ||
    match.status === "first_half" ||
    match.status === "second_half";
  const isFinished = match.status === "finished";
  const isUpcoming = match.status === "scheduled";

  // Safe access to match stats with fallbacks
  const stats = match.stats || {};
  const possession = stats.possession || [50, 50];
  const shots = stats.shots || [0, 0];
  const shotsOnTarget = stats.shotsOnTarget || [0, 0];
  const passes = stats.passes || [0, 0];
  const events = match.events || [];

  // Calculate match stats for progress bars with safe division
  const totalShots = shots[0] + shots[1] || 1;
  const totalShotsOnTarget = shotsOnTarget[0] + shotsOnTarget[1] || 1;
  const totalPasses = passes[0] + passes[1] || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-4">
      <div className="container mx-auto px-3 max-w-6xl">
        {/* Back Button */}
        <Link to="/">
          <Button
            variant="ghost"
            className="mb-4 gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 text-sm rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Button>
        </Link>

        {/* Match Header Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl border-0 rounded-3xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            {/* Match Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                <span>{match.date}</span>
              </div>
              {!isLive && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  <span>{match.time}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{match.venue}</span>
              </div>
            </div>

            {/* Status Badge */}
            {isLive && (
              <div className="flex justify-center mb-6">
                <Badge className="bg-red-500 text-white text-base px-6 py-2 rounded-full animate-pulse shadow-lg border-0">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE • {match.minute || "0"}'
                </Badge>
              </div>
            )}
            {isFinished && (
              <div className="flex justify-center mb-6">
                <Badge className="bg-green-500 text-white text-base px-6 py-2 rounded-full shadow-lg border-0">
                  <Trophy className="h-4 w-4 mr-2" />
                  MATCH ENDED
                </Badge>
              </div>
            )}
            {isUpcoming && (
              <div className="flex justify-center mb-6">
                <Badge className="bg-orange-500 text-white text-base px-6 py-2 rounded-full shadow-lg border-0">
                  <Clock className="h-4 w-4 mr-2" />
                  UPCOMING
                </Badge>
              </div>
            )}

            {/* Teams & Score */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center">
                <Link to={`/team/${match.homeTeam.id}`} className="group block">
                  <div className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    {match.homeTeam.logo}
                  </div>
                </Link>
                <Link to={`/team/${match.homeTeam.id}`}>
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors truncate max-w-[150px]">
                    {match.homeTeam.name}
                  </h2>
                </Link>
                <div className="mt-2 text-sm text-white/80">
                  {teams.find((t) => t.id === match.homeTeam.id)?.points || 0}{" "}
                  pts
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center justify-center gap-4 md:gap-6 mx-4">
                <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg bg-white/20 px-4 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-sm">
                  {match.homeScore ?? 0}
                </div>
                <div className="text-xl md:text-2xl font-bold text-white/60">
                  -
                </div>
                <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg bg-white/20 px-4 md:px-6 py-3 md:py-4 rounded-2xl backdrop-blur-sm">
                  {match.awayScore ?? 0}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center">
                <Link to={`/team/${match.awayTeam.id}`} className="group block">
                  <div className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    {match.awayTeam.logo}
                  </div>
                </Link>
                <Link to={`/team/${match.awayTeam.id}`}>
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors truncate max-w-[150px]">
                    {match.awayTeam.name}
                  </h2>
                </Link>
                <div className="mt-2 text-sm text-white/80">
                  {teams.find((t) => t.id === match.awayTeam.id)?.points || 0}{" "}
                  pts
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Navigation */}
        <Card className="p-2 mb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 gap-1">
              <TabsTrigger
                value="stats"
                className="flex items-center gap-2 py-3 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                Stats
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex items-center gap-2 py-3 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <Target className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="flex items-center gap-2 py-3 text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-xl transition-all"
              >
                <Trophy className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-6">
              <div className="grid gap-4">
                {/* Possession */}
                <Card className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {possession[0]}%
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Possession
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {possession[1]}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${possession[0]}%` }}
                    ></div>
                    <div
                      className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${possession[1]}%` }}
                    ></div>
                  </div>
                </Card>

                {/* Shots */}
                <Card className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {shots[0]}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Total Shots
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {shots[1]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(shots[0] / totalShots) * 100}%` }}
                    ></div>
                    <div
                      className="h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(shots[1] / totalShots) * 100}%` }}
                    ></div>
                  </div>
                </Card>

                {/* Shots on Target */}
                <Card className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {shotsOnTarget[0]}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Shots on Target
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {shotsOnTarget[1]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          (shotsOnTarget[0] / totalShotsOnTarget) * 100
                        }%`,
                      }}
                    ></div>
                    <div
                      className="h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          (shotsOnTarget[1] / totalShotsOnTarget) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="mt-6">
              <Card className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Match Events
                </h3>

                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 group hover:bg-white dark:hover:bg-slate-800 transition-all"
                      >
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-3 py-1 border-0 shadow-lg">
                          {event.minute}'
                        </Badge>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 dark:text-white capitalize text-sm">
                            {event.type?.replace("_", " ") || "Event"}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {event.playerName}
                            {event.assistName &&
                              ` • Assist: ${event.assistName}`}
                          </p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.type?.includes("goal")
                              ? "bg-green-500"
                              : event.type?.includes("card")
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No events recorded for this match</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Table Tab */}
            <TabsContent value="table" className="mt-6">
              <Card className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Tournament Standings
                  </h3>
                </div>
                <LeagueTable teams={teams} />
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MatchDetails;
