// components/EventPanel.jsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  CreditCard,
  ArrowLeftRight,
  CornerDownLeft,
  AlertCircle,
  Flag,
  Zap,
  Video,
  Stethoscope,
} from "lucide-react";
import { FaFootballBall } from "react-icons/fa";
import { eventCategories } from "@/constants/eventCategories";
import { useEventMutations } from "@/hooks/useEventMutations";
import { toast } from "sonner";

const EventPanel = ({
  selectedTeam,
  teamPlayers,
  matchMinute,
  selectedMatch,
  setCurrentEventType,
  setIsSubstitution,
  setShowEventModal,
  queryClient,
}) => {
  const { addEventMutation } = useEventMutations(selectedMatch, queryClient);

  const openEventModal = (eventType) => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }

    if (teamPlayers.length === 0) {
      toast.error("No players available for selected team");
      return;
    }

    setCurrentEventType(eventType);
    setIsSubstitution(eventType === "substitution_in");
    setShowEventModal(true);
  };

  const quickEvent = async (eventType) => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }

    // Get team name for description
    const teamName =
      selectedTeam === selectedMatchData?.homeTeam?.id
        ? selectedMatchData.homeTeam?.name
        : selectedMatchData?.awayTeam?.name;

    const eventData = {
      event_type: eventType,
      minute: matchMinute,
      team_id: selectedTeam,
      description: generateQuickEventDescription(
        eventType,
        teamName,
        matchMinute
      ),
      created_at: new Date().toISOString(),
    };

    try {
      await addEventMutation.mutateAsync(eventData);
      toast.success(`${formatEventType(eventType)} logged!`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to log event");
    }
  };

  const generateQuickEventDescription = (eventType, teamName, minute) => {
    const team = teamName || "Team";

    switch (eventType) {
      case "corner":
        return `${team} wins a corner`;
      case "free_kick":
        return `Free kick for ${team}`;
      case "offside":
        return `Offside against ${team}`;
      case "var_decision":
        return `VAR decision for ${team}`;
      case "injury":
        return `Player injury for ${team}`;
      default:
        return `${eventType.replace("_", " ")} at ${minute}'`;
    }
  };

  const formatEventType = (eventType) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderEventCategory = (category, title, Icon) => (
    <div>
      <h3 className="font-semibold mb-2 md:mb-3 flex items-center gap-1 md:gap-2 text-sm md:text-base">
        <Icon className="h-3 w-3 md:h-4 md:w-4" />
        {title}
      </h3>
      <div
        className={`grid grid-cols-2 ${
          category.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        } gap-1 md:gap-2`}
      >
        {category.map((event) => (
          <Button
            key={event.type}
            className={`h-12 md:h-16 flex flex-col gap-0.5 md:gap-1 text-xs ${event.color} text-white`}
            onClick={() =>
              event.type === "substitution_in" ||
              event.type === "goal" ||
              event.type.includes("card")
                ? openEventModal(event.type)
                : quickEvent(event.type)
            }
            disabled={!selectedTeam || addEventMutation.isLoading}
          >
            <event.icon className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-[10px] md:text-xs leading-tight">
              {event.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-3 md:space-y-4">
        {renderEventCategory(eventCategories.goals, "Goals & Scoring", Target)}
        {renderEventCategory(
          eventCategories.cards,
          "Cards & Discipline",
          CreditCard
        )}
        {renderEventCategory(
          eventCategories.substitutions,
          "Substitutions",
          ArrowLeftRight
        )}
        {renderEventCategory(
          eventCategories.other,
          "Other Events",
          AlertCircle
        )}
      </div>

      {!selectedTeam && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
            Select a team to log events
          </p>
        </div>
      )}
    </Card>
  );
};

export default EventPanel;
