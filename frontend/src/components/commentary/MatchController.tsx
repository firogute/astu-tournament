// components/MatchController.jsx
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
  Plus,
  Minus,
  FastForward,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { useMatchMutations } from "@/hooks/useMatchMutations";
import { useState, useEffect, useRef } from "react";

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
  const [seconds, setSeconds] = useState(0); // Track seconds separately
  const [totalSeconds, setTotalSeconds] = useState(matchMinute * 60); // Total seconds elapsed
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

  // Update matchMinute in parent component when totalSeconds changes
  useEffect(() => {
    const newMinutes = Math.floor(totalSeconds / 60);
    if (newMinutes !== matchMinute) {
      setMatchMinute(newMinutes);
    }
  }, [totalSeconds, matchMinute, setMatchMinute]);

  // Initialize totalSeconds when matchMinute changes externally
  useEffect(() => {
    setTotalSeconds(matchMinute * 60);
  }, [matchMinute]);

  // Real-time progression with seconds
  useEffect(() => {
    if (
      isRunning &&
      (matchStatus === "first_half" || matchStatus === "second_half")
    ) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          const newTotalSeconds = prev + 1;
          const newMinutes = Math.floor(newTotalSeconds / 60);

          // Auto half-time at 45 minutes
          if (matchStatus === "first_half" && newMinutes >= 45) {
            handleHalfTime();
            return 45 * 60; // 45 minutes in seconds
          }

          // Auto full-time at 90 minutes
          if (matchStatus === "second_half" && newMinutes >= 90) {
            handleEndMatch();
            return 90 * 60; // 90 minutes in seconds
          }

          return newTotalSeconds;
        });
      }, 1000); // Real 1 second interval
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, matchStatus]);

  // Update database periodically and on important changes
  useEffect(() => {
    if (isRunning) {
      // Update database every 30 seconds during auto-progression
      const dbUpdateInterval = setInterval(() => {
        updateDatabaseTime();
      }, 30000); // Update DB every 30 seconds

      return () => clearInterval(dbUpdateInterval);
    }
  }, [isRunning, totalSeconds, matchStatus]);

  const updateDatabaseTime = async () => {
    try {
      await updateMatchMutation.mutateAsync({
        minute: Math.floor(totalSeconds / 60),
        status: matchStatus,
      });
    } catch (error) {
      console.error("Failed to update time in database:", error);
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
      setMatchMinute(startMinutes);
      setTotalSeconds(startTotalSeconds);
      setIsRunning(true);
      toast.success(
        `${half === "first_half" ? "First" : "Second"} half started!`
      );
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handlePause = async () => {
    try {
      // Update database with current time when pausing
      await updateMatchMutation.mutateAsync({
        status: "paused",
        minute: Math.floor(totalSeconds / 60),
      });
      setMatchStatus("paused");
      setIsRunning(false);
      toast.info("Match paused");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleResume = async () => {
    try {
      await updateMatchMutation.mutateAsync({
        status: matchStatus,
        minute: Math.floor(totalSeconds / 60),
      });
      setIsRunning(true);
      toast.success("Match resumed");
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
      setMatchMinute(halfTimeMinutes);
      setTotalSeconds(halfTimeSeconds);
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
      setMatchStatus("paused");
      setMatchMinute(fullTimeMinutes);
      setTotalSeconds(fullTimeSeconds);
      setIsRunning(false);
      toast.success("Match ended - final whistle!");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleTimeUpdate = async (newTotalSeconds) => {
    const clampedSeconds = Math.max(0, Math.min(120 * 60, newTotalSeconds)); // Max 120 minutes
    const newMinutes = Math.floor(clampedSeconds / 60);

    setTotalSeconds(clampedSeconds);
    setMatchMinute(newMinutes);

    try {
      await updateMatchMutation.mutateAsync({
        minute: newMinutes,
        status: matchStatus,
      });
    } catch (error) {
      console.error("Failed to update time:", error);
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

  const autoStartSecondHalf = async () => {
    if (matchStatus === "half_time") {
      await handleStartHalf("second_half");
      toast.info("Automatically started second half");
    }
  };

  // Auto-start second half if in halftime (after 15 minutes real time)
  useEffect(() => {
    if (matchStatus === "half_time") {
      const halftimeTimer = setTimeout(() => {
        autoStartSecondHalf();
      }, 15 * 60 * 1000); // 15 minutes real time

      return () => clearTimeout(halftimeTimer);
    }
  }, [matchStatus]);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold">Match Control</h2>
        <div className="flex items-center gap-3">
          <Badge
            className={`text-sm px-3 py-1 ${
              isRunning
                ? "bg-green-500 pulse-live"
                : matchStatus === "half_time"
                ? "bg-orange-500"
                : "bg-gray-500"
            }`}
          >
            {matchStatus === "paused"
              ? "PAUSED"
              : matchStatus === "first_half"
              ? "1ST HALF"
              : matchStatus === "half_time"
              ? "HALF TIME"
              : matchStatus === "second_half"
              ? "2ND HALF"
              : "FULL TIME"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match Time Control */}
      <div className="text-center p-6 bg-muted rounded-lg mb-6">
        <div className="text-5xl font-bold font-mono text-primary mb-4">
          {formatTime(displayMinutes, displaySeconds)}
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          {displayMinutes}' (Elapsed:{" "}
          {formatTime(displayMinutes, displaySeconds)})
        </div>

        {/* Manual Time Input */}
        <div className="flex gap-2 justify-center items-center mb-4">
          <Input
            type="number"
            value={displayMinutes}
            onChange={handleManualMinuteChange}
            className="w-20 text-center"
            min="0"
            max="120"
          />
          <Button
            size="sm"
            onClick={handleManualMinuteSubmit}
            disabled={updateMatchMutation.isLoading}
          >
            Set Minute
          </Button>
        </div>

        {/* Quick Time Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSecondJump(-30)}
              disabled={updateMatchMutation.isLoading}
            >
              -30s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickSecondJump(30)}
              disabled={updateMatchMutation.isLoading}
            >
              +30s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickTimeJump(1)}
              disabled={updateMatchMutation.isLoading}
            >
              +1:00
            </Button>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickTimeJump(5)}
              disabled={updateMatchMutation.isLoading}
            >
              <FastForward className="h-4 w-4" /> +5:00
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickTimeJump(10)}
              disabled={updateMatchMutation.isLoading}
            >
              <SkipForward className="h-4 w-4" /> +10:00
            </Button>
          </div>
        </div>
      </div>

      {/* Match Control Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button
          size="lg"
          onClick={() => handleStartHalf("first_half")}
          disabled={
            matchStatus === "first_half" ||
            matchStatus === "second_half" ||
            updateMatchMutation.isLoading
          }
          className="flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          1st Half
        </Button>

        <Button
          size="lg"
          onClick={() => handleStartHalf("second_half")}
          disabled={
            matchStatus === "second_half" ||
            matchStatus === "first_half" ||
            updateMatchMutation.isLoading
          }
          className="flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          2nd Half
        </Button>

        {isRunning ? (
          <Button
            size="lg"
            variant="outline"
            onClick={handlePause}
            disabled={updateMatchMutation.isLoading}
            className="flex items-center justify-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            onClick={handleResume}
            disabled={updateMatchMutation.isLoading || matchStatus === "paused"}
            className="flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            Resume
          </Button>
        )}

        <Button
          size="lg"
          variant="destructive"
          onClick={
            matchStatus === "first_half" ? handleHalfTime : handleEndMatch
          }
          disabled={updateMatchMutation.isLoading}
          className="flex items-center justify-center gap-2"
        >
          <Square className="h-4 w-4" />
          {matchStatus === "first_half" ? "Half Time" : "End Match"}
        </Button>
      </div>

      {/* Auto-progression status */}
      {isRunning && (
        <div className="text-center text-sm text-green-600 mb-4">
          ⚡ Live: Real-time progression{" "}
          {formatTime(displayMinutes, displaySeconds)}
        </div>
      )}

      {/* Database sync status */}
      <div className="text-center text-xs text-muted-foreground mb-4">
        {updateMatchMutation.isLoading
          ? "🔄 Updating database..."
          : "✅ Database synced"}
      </div>

      {/* Team Selection */}
      {selectedMatchData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium mb-2">Select Team</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Choose team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={selectedMatchData.home_team_id}>
                  {selectedMatchData.home_team?.name}
                </SelectItem>
                <SelectItem value={selectedMatchData.away_team_id}>
                  {selectedMatchData.away_team?.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTeam && (
            <div>
              <Label className="text-sm font-medium mb-2">Select Player</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose player" />
                </SelectTrigger>
                <SelectContent>
                  {teamPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.jersey_number}. {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MatchController;
