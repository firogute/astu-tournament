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

  const handleEventSubmit = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    if (
      (currentEventType === "goal" || currentEventType === "substitution_in") &&
      !selectedPlayer
    ) {
      toast.error("Please select a player");
      return;
    }

    if (currentEventType === "substitution_in" && !subPlayerOut) {
      toast.error("Please select player coming out");
      return;
    }

    const eventData = {
      event_type: currentEventType,
      minute: matchMinute,
      team_id: selectedTeam,
      description:
        eventDescription ||
        `${currentEventType.replace("_", " ")} at ${matchMinute}'`,
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
        }
        break;

      case "penalty_goal":
      case "penalty_miss":
        eventData.is_penalty_scored = currentEventType === "penalty_goal";
        break;

      case "substitution_in":
        eventData.related_player_id = subPlayerOut;
        break;

      default:
        break;
    }

    try {
      await addEventMutation.mutateAsync(eventData);
      setShowEventModal(false);
      resetEventForm();
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            Log {formatEventType(currentEventType)}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEventModal(false)}
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
              <Label>Player</Label>
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
              <Label>Player Coming Out</Label>
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
              placeholder="Add additional details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEventModal(false)}
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
