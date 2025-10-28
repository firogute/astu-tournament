// In MatchController.jsx - Replace the entire component with this fixed version
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  FastForward,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { useMatchMutations } from "@/hooks/useMatchMutations";
import { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/api";

const MatchController = ({
  matchStatus,
  setMatchStatus,
  matchMinute,
  setMatchMinute,
  selectedMatch,
  selectedMatchData,
  selectedTeam,
  setSelectedTeam,
  selectedPlayer,
  setSelectedPlayer,
  teamPlayers,
  queryClient,
}) => {
  const { updateMatchMutation } = useMatchMutations(selectedMatch, queryClient);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(matchMinute * 60);
  const intervalRef = useRef(null);

  // Convert total seconds to minutes for display (MM:SS)
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  // Format time as MM:SS
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // CRITICAL FIX: Sync from parent to child properly
  useEffect(() => {
    console.log("Parent matchMinute changed:", matchMinute);
    setTotalSeconds(matchMinute * 60);
  }, [matchMinute]);

  // CRITICAL FIX: Real-time progression with PROPER auto-increment
  useEffect(() => {
    console.log(
      "Auto-increment effect - isRunning:",
      isRunning,
      "matchStatus:",
      matchStatus
    );

    if (
      isRunning &&
      (matchStatus === "first_half" || matchStatus === "second_half")
    ) {
      console.log("Starting auto-increment timer");

      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          const newTotalSeconds = prev + 1;
          const newMinutes = Math.floor(newTotalSeconds / 60);

          console.log("Auto-incrementing:", newMinutes, "minutes");

          // Auto half-time at 45 minutes
          if (matchStatus === "first_half" && newMinutes >= 45) {
            console.log("Auto half-time reached");
            handleHalfTime();
            return 45 * 60;
          }

          // Auto full-time at 90 minutes
          if (matchStatus === "second_half" && newMinutes >= 90) {
            console.log("Auto full-time reached");
            handleEndMatch();
            return 90 * 60;
          }

          // Update database every 30 seconds
          if (newTotalSeconds % 30 === 0) {
            console.log("Updating database with minute:", newMinutes);
            updateDatabaseTime(newMinutes);
          }

          // Update parent every minute for real-time display
          if (newTotalSeconds % 60 === 0) {
            setMatchMinute(newMinutes);
          }

          return newTotalSeconds;
        });
      }, 1000); // Real-time: 1 second = 1 second
    } else {
      console.log("Stopping auto-increment timer");
      clearInterval(intervalRef.current);
    }

    return () => {
      console.log("Cleaning up interval");
      clearInterval(intervalRef.current);
    };
  }, [isRunning, matchStatus]); // CRITICAL: Only depend on these two

  const updateDatabaseTime = async (currentMinutes = null) => {
    try {
      const minutesToUpdate =
        currentMinutes !== null
          ? currentMinutes
          : Math.floor(totalSeconds / 60);

      console.log("Updating database time to:", minutesToUpdate);

      await updateMatchMutation.mutateAsync({
        minute: minutesToUpdate,
        status: matchStatus,
      });

      // Update parent component after successful DB update
      setMatchMinute(minutesToUpdate);
    } catch (error) {
      console.error("Failed to update time in database:", error);
    }
  };

  // CRITICAL FIX: Start commentary - PROPER auto-increment start
  const handleStartCommentary = async () => {
    try {
      console.log("Starting commentary...");

      const response = await apiClient.post(
        `/commentary/${selectedMatch}/start`
      );
      const updatedMatch = response.data.match;

      console.log("Commentary started response:", updatedMatch);

      // CRITICAL: Update ALL states properly
      setMatchStatus(updatedMatch.status);
      setMatchMinute(updatedMatch.minute);
      setTotalSeconds(updatedMatch.minute * 60);
      setIsRunning(true); // THIS IS THE KEY - start auto progression

      console.log("Auto-increment should start now. isRunning:", true);

      toast.success("Commentary started! Match is now live.");
    } catch (error) {
      console.error("Start commentary error:", error);
      toast.error(error.response?.data?.error || "Failed to start commentary");
    }
  };

  // Pause commentary
  const handlePauseCommentary = async () => {
    try {
      const currentMinutes = Math.floor(totalSeconds / 60);
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/pause`,
        {
          minute: currentMinutes,
        }
      );
      const updatedMatch = response.data.match;

      setMatchStatus(updatedMatch.status);
      setIsRunning(false); // Stop auto progression
      toast.info("Commentary paused");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to pause commentary");
    }
  };

  // Resume commentary
  const handleResumeCommentary = async () => {
    try {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/resume`
      );
      const updatedMatch = response.data.match;

      setMatchStatus(updatedMatch.status);
      setIsRunning(true); // Start auto progression
      toast.success("Commentary resumed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resume commentary");
    }
  };

  const handleStartHalf = async (half) => {
    const status = half === "first_half" ? "first_half" : "second_half";
    const startMinutes = half === "first_half" ? 0 : 45;
    const startTotalSeconds = startMinutes * 60;

    try {
      await updateMatchMutation.mutateAsync({
        status,
        minute: startMinutes,
      });
      setMatchStatus(status);
      setTotalSeconds(startTotalSeconds);
      setMatchMinute(startMinutes);
      setIsRunning(true);
      toast.success(
        `${half === "first_half" ? "First" : "Second"} half started!`
      );
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleHalfTime = async () => {
    const halfTimeMinutes = 45;
    const halfTimeSeconds = halfTimeMinutes * 60;

    try {
      await updateMatchMutation.mutateAsync({
        status: "half_time",
        minute: halfTimeMinutes,
      });
      setMatchStatus("half_time");
      setTotalSeconds(halfTimeSeconds);
      setMatchMinute(halfTimeMinutes);
      setIsRunning(false);
      toast.success("Half time!");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleEndMatch = async () => {
    const fullTimeMinutes = 90;
    const fullTimeSeconds = fullTimeMinutes * 60;

    try {
      await updateMatchMutation.mutateAsync({
        status: "full_time",
        minute: fullTimeMinutes,
      });
      setMatchStatus("full_time");
      setTotalSeconds(fullTimeSeconds);
      setMatchMinute(fullTimeMinutes);
      setIsRunning(false);
      toast.success("Match ended - final whistle!");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleTimeUpdate = async (newTotalSeconds) => {
    const clampedSeconds = Math.max(0, Math.min(120 * 60, newTotalSeconds));
    const newMinutes = Math.floor(clampedSeconds / 60);

    setTotalSeconds(clampedSeconds);

    try {
      await updateMatchMutation.mutateAsync({
        minute: newMinutes,
        status: matchStatus,
      });
      setMatchMinute(newMinutes);
    } catch (error) {
      console.error("Failed to update time:", error);
    }
  };

  // Manual minute increment (for offline mode)
  const handleIncrementMinute = async (increment = 1) => {
    try {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/increment-minute`,
        {
          increment,
        }
      );
      const updatedMatch = response.data.match;

      setMatchMinute(updatedMatch.minute);
      setMatchStatus(updatedMatch.status);
      setTotalSeconds(updatedMatch.minute * 60);
      toast.success(`Minute updated to ${updatedMatch.minute}'`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update minute");
    }
  };

  const handleManualMinuteChange = (e) => {
    const minutes = parseInt(e.target.value) || 0;
    const newTotalSeconds = minutes * 60;
    setTotalSeconds(newTotalSeconds);
  };

  const handleManualMinuteSubmit = () => {
    handleTimeUpdate(totalSeconds);
  };

  const quickTimeJump = (minutes) => {
    handleTimeUpdate(totalSeconds + minutes * 60);
  };

  const quickSecondJump = (seconds) => {
    handleTimeUpdate(totalSeconds + seconds);
  };

  // Check if match can be started (is scheduled or in past)
  const canStartCommentary =
    selectedMatchData &&
    (selectedMatchData.status === "scheduled" ||
      new Date(selectedMatchData.match_date) < new Date());

  // Debug logging
  useEffect(() => {
    console.log(
      "MatchController State - isRunning:",
      isRunning,
      "matchStatus:",
      matchStatus,
      "matchMinute:",
      matchMinute
    );
  }, [isRunning, matchStatus, matchMinute]);

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold">Match Control</h2>
        <div className="flex items-center gap-2 md:gap-3">
          <Badge
            className={`text-xs md:text-sm px-2 md:px-3 py-1 ${
              isRunning
                ? "bg-green-500 pulse-live"
                : matchStatus === "half_time"
                ? "bg-orange-500"
                : matchStatus === "scheduled"
                ? "bg-blue-500"
                : "bg-gray-500"
            }`}
          >
            {matchStatus === "scheduled"
              ? "SCHEDULED"
              : matchStatus === "first_half"
              ? "LIVE 1ST"
              : matchStatus === "half_time"
              ? "HALF TIME"
              : matchStatus === "second_half"
              ? "LIVE 2ND"
              : "FULL TIME"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries();
              console.log("Refreshing data...");
            }}
            className="h-8 w-8 md:h-9 md:w-9 p-0"
          >
            <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {/* Start Commentary Button for scheduled/past matches */}
      {canStartCommentary && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm md:text-base">
                Ready to Start Commentary
              </h3>
              <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                Click start to begin live commentary
              </p>
            </div>
            <Button
              onClick={handleStartCommentary}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              Start Commentary
            </Button>
          </div>
        </div>
      )}

      {/* Match Time Control */}
      <div className="text-center p-4 md:p-6 bg-muted rounded-lg mb-4 md:mb-6">
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-primary mb-3 md:mb-4">
          {formatTime(displayMinutes, displaySeconds)}
        </div>

        <div className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
          {displayMinutes}' (Elapsed:{" "}
          {formatTime(displayMinutes, displaySeconds)}){isRunning && " ⚡ LIVE"}
        </div>

        {/* Manual Time Input */}
        <div className="flex gap-2 justify-center items-center mb-3 md:mb-4">
          <Input
            type="number"
            value={displayMinutes}
            onChange={handleManualMinuteChange}
            className="w-16 md:w-20 text-center text-sm md:text-base"
            min="0"
            max="120"
          />
          <Button
            size="sm"
            onClick={handleManualMinuteSubmit}
            disabled={updateMatchMutation.isLoading}
            className="text-xs md:text-sm"
          >
            Set Minute
          </Button>
        </div>

        {/* Quick Time Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 md:gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSecondJump(-30)}
              disabled={updateMatchMutation.isLoading || isRunning}
              className="text-xs h-8 md:h-9"
            >
              -30s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSecondJump(30)}
              disabled={updateMatchMutation.isLoading || isRunning}
              className="text-xs h-8 md:h-9"
            >
              +30s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrementMinute(1)}
              disabled={updateMatchMutation.isLoading || isRunning}
              className="text-xs h-8 md:h-9"
            >
              +1:00
            </Button>
          </div>
          <div className="flex gap-1 md:gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrementMinute(5)}
              disabled={updateMatchMutation.isLoading || isRunning}
              className="text-xs h-8 md:h-9"
            >
              <FastForward className="h-3 w-3 md:h-4 md:w-4" /> +5:00
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleIncrementMinute(10)}
              disabled={updateMatchMutation.isLoading || isRunning}
              className="text-xs h-8 md:h-9"
            >
              <SkipForward className="h-3 w-3 md:h-4 md:w-4" /> +10:00
            </Button>
          </div>
        </div>
      </div>

      {/* Match Control Buttons */}
      {matchStatus !== "scheduled" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <Button
            size="sm"
            onClick={() => handleStartHalf("first_half")}
            disabled={
              matchStatus === "first_half" ||
              matchStatus === "second_half" ||
              updateMatchMutation.isLoading ||
              isRunning
            }
            className="flex items-center justify-center gap-1 md:gap-2 h-10 md:h-11 text-xs md:text-sm"
          >
            <Play className="h-3 w-3 md:h-4 md:w-4" />
            1st Half
          </Button>

          <Button
            size="sm"
            onClick={() => handleStartHalf("second_half")}
            disabled={
              matchStatus === "second_half" ||
              matchStatus === "first_half" ||
              updateMatchMutation.isLoading ||
              isRunning
            }
            className="flex items-center justify-center gap-1 md:gap-2 h-10 md:h-11 text-xs md:text-sm"
          >
            <Play className="h-3 w-3 md:h-4 md:w-4" />
            2nd Half
          </Button>

          {isRunning ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePauseCommentary}
              disabled={updateMatchMutation.isLoading}
              className="flex items-center justify-center gap-1 md:gap-2 h-10 md:h-11 text-xs md:text-sm"
            >
              <Pause className="h-3 w-3 md:h-4 md:w-4" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResumeCommentary}
              disabled={
                updateMatchMutation.isLoading ||
                matchStatus === "paused" ||
                matchStatus === "scheduled"
              }
              className="flex items-center justify-center gap-1 md:gap-2 h-10 md:h-11 text-xs md:text-sm"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              Resume
            </Button>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={
              matchStatus === "first_half" ? handleHalfTime : handleEndMatch
            }
            disabled={updateMatchMutation.isLoading}
            className="flex items-center justify-center gap-1 md:gap-2 h-10 md:h-11 text-xs md:text-sm"
          >
            <Square className="h-3 w-3 md:h-4 md:w-4" />
            {matchStatus === "first_half" ? "Half Time" : "End Match"}
          </Button>
        </div>
      )}

      {/* Auto-progression status */}
      {isRunning && (
        <div className="text-center text-xs md:text-sm text-green-600 mb-3 md:mb-4">
          ⚡ LIVE: Real-time progression active
        </div>
      )}

      {/* Database sync status */}
      <div className="text-center text-xs text-muted-foreground mb-3 md:mb-4">
        {updateMatchMutation.isLoading
          ? "🔄 Updating database..."
          : "✅ Database synced"}
      </div>

      {/* Team Selection */}
      {selectedMatchData && matchStatus !== "scheduled" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label className="text-xs md:text-sm font-medium mb-1 md:mb-2">
              Select Team
            </Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
                <SelectValue placeholder="Choose team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={selectedMatchData.homeTeam?.id}
                  className="text-xs md:text-sm"
                >
                  {selectedMatchData.homeTeam?.name}
                </SelectItem>
                <SelectItem
                  value={selectedMatchData.awayTeam?.id}
                  className="text-xs md:text-sm"
                >
                  {selectedMatchData.awayTeam?.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && (
            <div>
              <Label className="text-xs md:text-sm font-medium mb-1 md:mb-2">
                Select Player
              </Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger className="text-xs md:text-sm h-9 md:h-10">
                  <SelectValue placeholder="Choose player" />
                </SelectTrigger>
                <SelectContent>
                  {teamPlayers.map((player) => (
                    <SelectItem
                      key={player.id}
                      value={player.id}
                      className="text-xs md:text-sm"
                    >
                      {player.jersey_number}. {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Debug Info (remove in production) */}
      <div className="text-center text-xs text-gray-500 mt-4">
        Status: {matchStatus} | Running: {isRunning.toString()} | Minute:{" "}
        {matchMinute}
      </div>
    </Card>
  );
};

export default MatchController;
