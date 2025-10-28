// components/TimelineSidebar.jsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { FaFootballBall } from "react-icons/fa";
import {
  Target,
  CreditCard,
  ArrowLeftRight,
  CornerDownLeft,
  Zap,
  Flag,
  Stethoscope,
  Video,
  AlertCircle,
} from "lucide-react";

const TimelineSidebar = ({ matchEvents, commentaryEntries }) => {
  const getEventIcon = (eventType) => {
    const icons = {
      goal: <Target className="h-4 w-4 text-green-500" />,
      own_goal: <Target className="h-4 w-4 text-red-500" />,
      penalty_goal: <FaFootballBall className="h-4 w-4 text-green-500" />,
      penalty_miss: <FaFootballBall className="h-4 w-4 text-red-500" />,
      yellow_card: <CreditCard className="h-4 w-4 text-yellow-500" />,
      red_card: <CreditCard className="h-4 w-4 text-red-500" />,
      second_yellow: <CreditCard className="h-4 w-4 text-orange-500" />,
      substitution_in: <ArrowLeftRight className="h-4 w-4 text-blue-500" />,
      substitution_out: <ArrowLeftRight className="h-4 w-4 text-gray-500" />,
      corner: <CornerDownLeft className="h-4 w-4 text-purple-500" />,
      free_kick: <Zap className="h-4 w-4 text-yellow-500" />,
      offside: <Flag className="h-4 w-4 text-orange-500" />,
      injury: <Stethoscope className="h-4 w-4 text-red-500" />,
      var_decision: <Video className="h-4 w-4 text-blue-500" />,
    };
    return icons[eventType] || <AlertCircle className="h-4 w-4" />;
  };

  const formatEventType = (eventType) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Events Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Match Events
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {matchEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No events recorded yet
            </p>
          ) : (
            matchEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-muted rounded-lg"
              >
                <Badge variant="secondary" className="mt-1 flex-shrink-0">
                  {event.minute}'
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {getEventIcon(event.event_type)}
                    {formatEventType(event.event_type)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.player?.name}{" "}
                    {event.team && `- ${event.team.short_name}`}
                  </p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Commentary Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Live Commentary</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {commentaryEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No commentary yet
            </p>
          ) : (
            commentaryEntries.map((entry) => (
              <div key={entry.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-xs">
                    {entry.minute}'
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.user?.email}
                  </span>
                </div>
                <p className="text-sm">{entry.commentary_text}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TimelineSidebar;
