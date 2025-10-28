// components/EventModal.jsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { useEventMutations } from "@/hooks/useEventMutations";

const EventModal = ({
  currentEventType,
  isSubstitution,
  selectedTeam,
  selectedPlayer,
  setSelectedPlayer,
  selectedAssistPlayer,
  setSelectedAssistPlayer,
  goalType,
  setGoalType,
  subPlayerOut,
  setSubPlayerOut,
  eventDescription,
  setEventDescription,
  matchMinute,
  teamPlayers,
  showEventModal,
  setShowEventModal,
  selectedMatch,
  resetEventForm,
  queryClient,
}) => {
  const { addEventMutation } = useEventMutations(selectedMatch, queryClient);

  const formatEventType = (eventType) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Generate better event descriptions
  const generateEventDescription = (
    eventType,
    playerName,
    teamName,
    minute,
    goalType = null
  ) => {
    const player = playerName || "Player";
    const team = teamName || "Team";

    switch (eventType) {
      case "goal":
        const goalTypeText = goalType ? ` (${goalType.replace("_", " ")})` : "";
        return `${player} scores for ${team}${goalTypeText}`;
      case "own_goal":
        return `OWN GOAL! ${player} scores for the opposition`;
      case "penalty_goal":
        return `${player} converts the penalty for ${team}`;
      case "penalty_miss":
        return `${player} misses the penalty for ${team}`;
      case "yellow_card":
        return `${player} receives a yellow card`;
      case "red_card":
        return `${player} receives a red card`;
      case "second_yellow":
        return `${player} receives a second yellow card and is sent off`;
      case "substitution_in":
        return `Substitution: ${player} comes on`;
      case "substitution_out":
        return `Substitution: ${player} goes off`;
      case "corner":
        return `${team} wins a corner`;
      case "free_kick":
        return `Free kick for ${team}`;
      case "offside":
        return `Offside against ${team}`;
      case "injury":
        return `${player} is injured`;
      case "var_decision":
        return `VAR decision for ${team}`;
      default:
        return `${eventType.replace("_", " ")} at ${minute}'`;
    }
  };

  const handleEventSubmit = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }

    if (
      (currentEventType === "goal" ||
        currentEventType === "substitution_in" ||
        currentEventType.includes("card")) &&
      !selectedPlayer
    ) {
      toast.error("Please select a player");
      return;
    }

    if (currentEventType === "substitution_in" && !subPlayerOut) {
      toast.error("Please select player coming out");
      return;
    }

    // Get the actual player objects for better descriptions
    const selectedPlayerObj = teamPlayers.find((p) => p.id === selectedPlayer);
    const assistPlayerObj = teamPlayers.find(
      (p) => p.id === selectedAssistPlayer
    );
    const subOutPlayerObj = teamPlayers.find((p) => p.id === subPlayerOut);

    // Get team name from selected match data
    const teamName =
      selectedTeam === selectedMatchData?.homeTeam?.id
        ? selectedMatchData.homeTeam?.name
        : selectedMatchData?.awayTeam?.name;

    const eventData = {
      event_type: currentEventType,
      minute: matchMinute,
      team_id: selectedTeam,
      description:
        eventDescription ||
        generateEventDescription(
          currentEventType,
          selectedPlayerObj?.name,
          teamName,
          matchMinute,
          goalType
        ),
      created_at: new Date().toISOString(),
    };

    // Add player-specific data
    if (selectedPlayer) {
      eventData.player_id = selectedPlayer;
    }

    // Handle specific event types
    switch (currentEventType) {
      case "goal":
        eventData.goal_type = goalType;
        if (selectedAssistPlayer) {
          eventData.related_player_id = selectedAssistPlayer;
          // Update description to include assist
          if (!eventDescription) {
            eventData.description = `${selectedPlayerObj?.name} scores for ${teamName} (Assist: ${assistPlayerObj?.name})`;
          }
        }
        break;

      case "penalty_goal":
      case "penalty_miss":
        eventData.is_penalty_scored = currentEventType === "penalty_goal";
        break;

      case "substitution_in":
        eventData.related_player_id = subPlayerOut;
        // Update description for substitution
        if (!eventDescription) {
          eventData.description = `Substitution: ${selectedPlayerObj?.name} replaces ${subOutPlayerObj?.name}`;
        }
        break;

      default:
        break;
    }

    console.log("Submitting event:", eventData);

    try {
      await addEventMutation.mutateAsync(eventData);
      setShowEventModal(false);
      resetEventForm();
      toast.success(
        `${formatEventType(currentEventType)} logged successfully!`
      );
    } catch (error) {
      console.error("Error submitting event:", error);
      toast.error(error.response?.data?.error || "Failed to log event");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            Log {formatEventType(currentEventType)}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowEventModal(false);
              resetEventForm();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Player Selection */}
          {(currentEventType === "goal" ||
            currentEventType === "substitution_in" ||
            currentEventType.includes("card")) && (
            <div>
              <Label>Player *</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
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

          {/* Goal Specific Fields */}
          {currentEventType === "goal" && (
            <>
              <div>
                <Label>Goal Type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal Goal</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                    <SelectItem value="free_kick">Free Kick</SelectItem>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="volley">Volley</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assist Player (Optional)</Label>
                <Select
                  value={selectedAssistPlayer}
                  onValueChange={setSelectedAssistPlayer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assist player" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.jersey_number}. {player.name} -{" "}
                        {player.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Substitution Specific Fields */}
          {currentEventType === "substitution_in" && (
            <div>
              <Label>Player Coming Out *</Label>
              <Select value={subPlayerOut} onValueChange={setSubPlayerOut}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player coming out" />
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

          {/* Description */}
          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Add additional details or custom description..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for auto-generated description
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEventModal(false);
                resetEventForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEventSubmit}
              disabled={addEventMutation.isLoading}
              className="flex-1"
            >
              {addEventMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Log Event
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventModal;
