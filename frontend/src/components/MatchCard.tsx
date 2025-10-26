import { Link } from "react-router-dom";
import { FaUniversity } from "react-icons/fa";
import {
  Calendar,
  MapPin,
  Clock,
  Zap,
  Trophy,
  Play,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Team {
  id: string;
  name: string;
  logo?: string;
  color_primary?: string;
  short_name?: string;
  record?: string;
}

interface Match {
  id: string;
  tournament_id: string;
  match_date: string;
  match_time: string;
  status: "scheduled" | "first_half" | "second_half" | "live" | "finished";
  minute: number;
  home_score: number;
  away_score: number;
  home_penalty_score: number;
  away_penalty_score: number;
  referee?: string;
  attendance?: number;
  weather_conditions?: any;
  created_at: string;
  updated_at: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  venue: string;
}

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  // Safety check for team data
  if (!match.homeTeam || !match.awayTeam) {
    console.warn("Missing team data for match:", match.id);
    return (
      <Card className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
        <div className="text-center text-muted-foreground py-8">
          <p>Match data unavailable</p>
        </div>
      </Card>
    );
  }

  const isLive =
    match.status === "live" ||
    match.status === "first_half" ||
    match.status === "second_half";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";

  const getStatusColor = () => {
    if (isLive) return "from-red-500 to-pink-500";
    if (isFinished) return "from-green-500 to-emerald-500";
    return "from-blue-500 to-purple-500";
  };

  const getStatusIcon = () => {
    if (isLive) return <Zap className="h-3 w-3" />;
    if (isFinished) return <Trophy className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display (remove seconds if present)
  const formatTime = (timeString: string) => {
    return timeString.split(":").slice(0, 2).join(":");
  };

  if (compact) {
    return (
      <Link to={`/match/${match.id}`}>
        <Card className="group p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Home Team */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-2xl flex-shrink-0">
                  {match.homeTeam.logo ? (
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <FaUniversity
                      size={20}
                      color={match.homeTeam.color_primary || "#888"}
                    />
                  )}
                </div>
                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {match.homeTeam.short_name || match.homeTeam.name}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 mx-2">
                {isScheduled ? (
                  <span className="text-xs text-muted-foreground font-medium">
                    VS
                  </span>
                ) : (
                  <>
                    <span
                      className={`text-sm font-bold ${
                        isLive
                          ? "text-red-500 animate-pulse"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {match.home_score}
                    </span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span
                      className={`text-sm font-bold ${
                        isLive
                          ? "text-red-500 animate-pulse"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {match.away_score}
                    </span>
                  </>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {match.awayTeam.short_name || match.awayTeam.name}
                </span>
                <div className="text-2xl flex-shrink-0">
                  {match.awayTeam.logo ? (
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <FaUniversity
                      size={20}
                      color={match.awayTeam.color_primary || "#888"}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              className={`ml-3 bg-gradient-to-r ${getStatusColor()} text-white border-0 shadow-lg px-2 py-1 text-xs font-bold`}
            >
              {isLive ? "LIVE" : isFinished ? "FT" : "UP"}
            </Badge>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/match/${match.id}`}>
      <Card className="group relative p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Gradient Border Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        ></div>

        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {formatDate(match.match_date)}
              </span>
            </div>
            {!isLive && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span className="font-medium">
                  {formatTime(match.match_time)}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <Badge
            className={`bg-gradient-to-r ${getStatusColor()} text-white border-0 shadow-lg px-3 py-1 text-xs font-bold gap-1`}
          >
            {getStatusIcon()}
            {isLive ? (
              <>
                <span className="animate-pulse">LIVE</span>
                <span>{match.minute}'</span>
              </>
            ) : isFinished ? (
              "COMPLETED"
            ) : (
              "UPCOMING"
            )}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Home Team */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
              {match.homeTeam.logo ? (
                <img
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              ) : (
                <FaUniversity
                  size={48}
                  color={match.homeTeam.color_primary || "#3b82f6"}
                  className="opacity-80"
                />
              )}
            </div>
            <div className="w-full">
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {match.homeTeam.short_name || match.homeTeam.name}
              </div>
              {!isScheduled && (
                <div className="text-xs text-muted-foreground mt-1">
                  {match.homeTeam.record || "0-0-0"}
                </div>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center mx-2">
            {isScheduled ? (
              <div className="bg-gradient-to-r from-slate-400 to-slate-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                VS
              </div>
            ) : (
              <>
                <div
                  className={`text-3xl md:text-4xl font-black ${
                    isLive
                      ? "text-red-500 animate-pulse"
                      : "text-slate-900 dark:text-white"
                  } transition-all duration-300`}
                >
                  {match.home_score}
                </div>
                <div className="text-lg font-bold text-muted-foreground my-1">
                  -
                </div>
                <div
                  className={`text-3xl md:text-4xl font-black ${
                    isLive
                      ? "text-red-500 animate-pulse"
                      : "text-slate-900 dark:text-white"
                  } transition-all duration-300`}
                >
                  {match.away_score}
                </div>
              </>
            )}

            {/* Match Minute for Live Games */}
            {isLive && (
              <div className="mt-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE {match.minute}'
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center text-center flex-1 min-w-0">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
              {match.awayTeam.logo ? (
                <img
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                />
              ) : (
                <FaUniversity
                  size={48}
                  color={match.awayTeam.color_primary || "#3b82f6"}
                  className="opacity-80"
                />
              )}
            </div>
            <div className="w-full">
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {match.awayTeam.short_name || match.awayTeam.name}
              </div>
              {!isScheduled && (
                <div className="text-xs text-muted-foreground mt-1">
                  {match.awayTeam.record || "0-0-0"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Venue and Additional Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              <span className="font-medium truncate max-w-[120px]">
                {match.venue}
              </span>
            </div>
          </div>

          {/* View Match CTA */}
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform duration-300">
            {isLive ? (
              <>
                <Target className="h-3 w-3" />
                WATCH LIVE
              </>
            ) : isFinished ? (
              <>
                <Trophy className="h-3 w-3" />
                VIEW STATS
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                PREVIEW
              </>
            )}
          </div>
        </div>

        {/* Hover Effect Indicator */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
      </Card>
    </Link>
  );
}
