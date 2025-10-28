// components/MatchController.jsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, RefreshCw, Plus, Minus } from "lucide-react";
import { useMatchMutations } from "../hooks/useMatchMutations";

const MatchController = ({
  matchStatus,
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

  const handleStartHalf = async (half) => {
    const status = half === "first_half" ? "first_half" : "second_half";
    try {
      await updateMatchMutation.mutateAsync({
        status,
        minute: 0,
      });
      setMatchStatus(status);
      setMatchMinute(0);
      toast.success(
        `${half === "first_half" ? "First" : "Second"} half started!`
      );
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handlePause = async () => {
    try {
      await updateMatchMutation.mutateAsync({ status: "paused" });
      setMatchStatus("paused");
      toast.info("Match paused");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleEndMatch = async () => {
    try {
      await updateMatchMutation.mutateAsync({
        status: "full_time",
        minute: 90,
      });
      setMatchStatus("paused");
      setMatchMinute(90);
      toast.success("Match ended - final whistle!");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleMinuteUpdate = async (newMinute) => {
    const clampedMinute = Math.max(0, Math.min(120, newMinute));
    setMatchMinute(clampedMinute);

    if (matchStatus !== "paused") {
      try {
        await updateMatchMutation.mutateAsync({ minute: clampedMinute });
      } catch (error) {
        console.error("Failed to update minute:", error);
      }
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold">Match Control</h2>
        <div className="flex items-center gap-3">
          <Badge
            className={`text-sm px-3 py-1 ${
              matchStatus === "first_half" || matchStatus === "second_half"
                ? "bg-green-500 pulse-live"
                : "bg-gray-500"
            }`}
          >
            {matchStatus === "paused"
              ? "PAUSED"
              : matchStatus === "first_half"
              ? "1ST HALF"
              : "2ND HALF"}
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

      {/* Match Minute Control */}
      <div className="text-center p-6 bg-muted rounded-lg mb-6">
        <div className="text-5xl font-bold font-mono text-primary mb-4">
          {matchMinute}'
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMinuteUpdate(matchMinute - 1)}
            disabled={updateMatchMutation.isLoading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMinuteUpdate(matchMinute + 1)}
            disabled={updateMatchMutation.isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMinuteUpdate(matchMinute + 5)}
            disabled={updateMatchMutation.isLoading}
          >
            +5
          </Button>
        </div>
      </div>

      {/* Match Control Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Button
          size="lg"
          onClick={() => handleStartHalf("first_half")}
          disabled={
            matchStatus === "first_half" || updateMatchMutation.isLoading
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
            matchStatus === "second_half" || updateMatchMutation.isLoading
          }
          className="flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          2nd Half
        </Button>
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
        <Button
          size="lg"
          variant="destructive"
          onClick={handleEndMatch}
          disabled={updateMatchMutation.isLoading}
          className="flex items-center justify-center gap-2"
        >
          <Square className="h-4 w-4" />
          End Match
        </Button>
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
