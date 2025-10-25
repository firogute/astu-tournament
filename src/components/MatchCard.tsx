import { Link } from "react-router-dom";
import { Match } from "@/lib/mockData";
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

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
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
              <span className="font-medium">{match.date}</span>
            </div>
            {!isLive && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{match.time}</span>
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
              {match.homeTeam.logo}
            </div>
            <div className="w-full">
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {match.homeTeam.name}
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
                  {match.homeScore}
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
                  {match.awayScore}
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
              {match.awayTeam.logo}
            </div>
            <div className="w-full">
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {match.awayTeam.name}
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
