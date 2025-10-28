// components/MatchSelector.jsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, Users, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

const MatchSelector = ({
  liveMatches,
  selectedMatch,
  setSelectedMatch,
  selectedMatchData,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const getMatchStatusBadge = (match) => {
    if (!match?.status) return null;

    const statusConfig = {
      scheduled: {
        color: "bg-blue-500 hover:bg-blue-600",
        label: "SCHEDULED",
        icon: "⏰",
      },
      first_half: {
        color: "bg-green-500 hover:bg-green-600",
        label: "LIVE 1ST",
        icon: "⚽",
      },
      half_time: {
        color: "bg-orange-500 hover:bg-orange-600",
        label: "HALF TIME",
        icon: "⏸️",
      },
      second_half: {
        color: "bg-green-600 hover:bg-green-700",
        label: "LIVE 2ND",
        icon: "⚽",
      },
      extra_time: {
        color: "bg-purple-500 hover:bg-purple-600",
        label: "EXTRA TIME",
        icon: "➕",
      },
      full_time: {
        color: "bg-red-500 hover:bg-red-600",
        label: "FULL TIME",
        icon: "🎯",
      },
      postponed: {
        color: "bg-yellow-500 hover:bg-yellow-600",
        label: "POSTPONED",
        icon: "❌",
      },
      cancelled: {
        color: "bg-gray-700 hover:bg-gray-800",
        label: "CANCELLED",
        icon: "🚫",
      },
    };

    const config = statusConfig[match.status] || statusConfig.scheduled;

    return (
      <Badge
        className={`text-xs ${config.color} text-white transition-colors duration-200`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const formatMatchDate = (dateString, timeString) => {
    try {
      if (!dateString) return { date: "TBD", time: "", full: "TBD" };

      const date = new Date(`${dateString}T${timeString || "12:00"}`);
      if (isNaN(date.getTime())) {
        return {
          date: dateString,
          time: timeString,
          full: `${dateString} ${timeString}`,
        };
      }

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: timeString
          ? date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "",
        full: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch (error) {
      return {
        date: dateString || "TBD",
        time: timeString || "",
        full: `${dateString || "TBD"} ${timeString || ""}`,
      };
    }
  };

  const getScoreDisplay = (match) => {
    if (!match) return "VS";
    if (match.status === "scheduled") return "VS";
    if (match.home_score === undefined || match.away_score === undefined)
      return "VS";
    return `${match.home_score || 0} - ${match.away_score || 0}`;
  };

  // Safe venue display - handle both string and object
  const getVenueDisplay = (venue) => {
    if (!venue) return "TBD";
    if (typeof venue === "string") return venue;
    if (typeof venue === "object" && venue.name) return venue.name;
    return "Unknown Venue";
  };

  // Safe team name display
  const getTeamName = (team) => {
    if (!team) return "Unknown Team";
    if (typeof team === "string") return team;
    if (typeof team === "object" && team.name) return team.name;
    return "Unknown Team";
  };

  // Safe team short name display
  const getTeamShortName = (team) => {
    if (!team) return "UNK";
    if (typeof team === "string") return team.substring(0, 3).toUpperCase();
    if (typeof team === "object" && team.short_name) return team.short_name;
    if (typeof team === "object" && team.name)
      return team.name.substring(0, 3).toUpperCase();
    return "UNK";
  };

  if (!isMounted) {
    return (
      <Card className="p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center justify-between">
        {/* Left Section - Selector */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Select Match for Commentary
            </h2>
          </div>

          <Select value={selectedMatch} onValueChange={setSelectedMatch}>
            <SelectTrigger className="w-full h-12 md:h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors rounded-xl">
              <SelectValue
                placeholder={
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users className="h-4 w-4" />
                    <span>Choose a match to commentate...</span>
                  </div>
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-80 border-2 border-slate-200 dark:border-slate-600 rounded-xl">
              {liveMatches.map((match) => {
                const formattedDate = formatMatchDate(
                  match.match_date,
                  match.match_time
                );
                return (
                  <SelectItem
                    key={match.id}
                    value={match.id}
                    className="py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 w-full">
                      {/* Match Header */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {getTeamShortName(match.home_team)}
                            </span>
                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {getScoreDisplay(match)}
                            </span>
                            <span className="font-semibold text-sm truncate">
                              {getTeamShortName(match.away_team)}
                            </span>
                          </div>
                        </div>
                        {getMatchStatusBadge(match)}
                      </div>

                      {/* Match Details */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formattedDate.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formattedDate.time}</span>
                        </div>
                        {match.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-20">
                              {getVenueDisplay(match.venue)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Right Section - Selected Match Info */}
        {selectedMatchData && (
          <div className="w-full lg:w-auto lg:min-w-80">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-md">
              <div className="space-y-3">
                {/* Match Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMatchStatusBadge(selectedMatchData)}
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      {getTeamShortName(selectedMatchData.home_team)} vs{" "}
                      {getTeamShortName(selectedMatchData.away_team)}
                    </Badge>
                  </div>
                  {selectedMatchData.minute > 0 && (
                    <div className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold">
                      {selectedMatchData.minute}'
                    </div>
                  )}
                </div>

                {/* Team Names */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {getTeamName(selectedMatchData.home_team)} vs{" "}
                    {getTeamName(selectedMatchData.away_team)}
                  </div>
                </div>

                {/* Score Display */}
                {selectedMatchData.home_score !== undefined &&
                  selectedMatchData.away_score !== undefined && (
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {selectedMatchData.home_score || 0} -{" "}
                        {selectedMatchData.away_score || 0}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Current Score
                      </div>
                    </div>
                  )}

                {/* Match Details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Date</span>
                    </div>
                    <span className="font-medium">
                      {
                        formatMatchDate(
                          selectedMatchData.match_date,
                          selectedMatchData.match_time
                        ).full
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>Venue</span>
                    </div>
                    <span className="font-medium truncate max-w-32 text-right">
                      {getVenueDisplay(selectedMatchData.venue)}
                    </span>
                  </div>

                  {selectedMatchData.referee && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Referee</span>
                      </div>
                      <span className="font-medium truncate max-w-32 text-right">
                        {selectedMatchData.referee}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() =>
                      window.open(`/matches/${selectedMatchData.id}`, "_blank")
                    }
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const commentarySection =
                        document.getElementById("commentary-section");
                      if (commentarySection) {
                        commentarySection.scrollIntoView({
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    Start Commentating
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* No Matches State */}
      {liveMatches.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
            <Trophy className="h-12 w-12 opacity-50" />
            <div>
              <p className="font-semibold">No matches available</p>
              <p className="text-sm mt-1">
                There are no matches scheduled for commentary at this time.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MatchSelector;
