import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  Square,
  Target,
  CreditCard,
  ArrowLeftRight,
  CornerDownLeft,
  AlertCircle,
  Flag,
  Users,
  RefreshCw,
  Clock,
  Shirt,
  Zap,
  Video,
  Stethoscope,
  Plus,
  Minus,
  Save,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { FaFootballBall } from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";

const Commentary = () => {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [matchMinute, setMatchMinute] = useState(0);
  const [matchStatus, setMatchStatus] = useState("paused");
  const [commentary, setCommentary] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState("");
  const [goalType, setGoalType] = useState("normal");
  const [eventDescription, setEventDescription] = useState("");
  const [isSubstitution, setIsSubstitution] = useState(false);
  const [subPlayerOut, setSubPlayerOut] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEventType, setCurrentEventType] = useState("");

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch live matches using commentary route only
  const { data: liveMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["commentary", "matches"],
    queryFn: async () => {
      const response = await apiClient.get("/commentary/matches/live");
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch selected match details using commentary route
  const { data: selectedMatchData } = useQuery({
    queryKey: ["commentary", "match", selectedMatch],
    queryFn: async () => {
      if (!selectedMatch) return null;
      const response = await apiClient.get(
        `/commentary/${selectedMatch}/summary`
      );
      return response.data.match;
    },
    enabled: !!selectedMatch,
  });

  // Fetch match events and commentary using commentary route
  const { data: matchData = {} } = useQuery({
    queryKey: ["commentary", "data", selectedMatch],
    queryFn: async () => {
      if (!selectedMatch) return { events: [], commentary: [] };
      const response = await apiClient.get(`/commentary/${selectedMatch}`);
      return response.data;
    },
    enabled: !!selectedMatch,
    refetchInterval: 5000,
  });

  const { events: matchEvents = [], commentary: commentaryEntries = [] } =
    matchData;

  // Fetch lineup for selected team using commentary route
  const { data: lineupData = {} } = useQuery({
    queryKey: ["commentary", "lineup", selectedMatch, selectedTeam],
    queryFn: async () => {
      if (!selectedMatch || !selectedTeam)
        return { starters: [], substitutes: [] };
      const response = await apiClient.get(
        `/commentary/${selectedMatch}/lineup/${selectedTeam}`
      );
      return response.data;
    },
    enabled: !!selectedMatch && !!selectedTeam,
  });

  const { starters = [], substitutes = [] } = lineupData.lineup || {};

  // Mutation for adding events using commentary route
  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/event`,
        eventData
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["commentary", "data"]);
      queryClient.invalidateQueries(["commentary", "match"]);
      toast.success("Event logged successfully!");
      if (data.autoCommentary) {
        toast.info("Auto-commentary generated");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add event");
    },
  });

  // Mutation for adding commentary using commentary route
  const addCommentaryMutation = useMutation({
    mutationFn: async (commentaryData) => {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/comment`,
        commentaryData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commentary", "data"]);
      toast.success("Commentary added!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add commentary");
    },
  });

  // Mutation for updating match status using commentary route
  const updateMatchMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await apiClient.patch(
        `/commentary/${selectedMatch}/status`,
        {
          matchId: selectedMatch,
          ...updates,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commentary", "matches"]);
      queryClient.invalidateQueries(["commentary", "match"]);
      queryClient.invalidateQueries(["commentary", "data"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update match");
    },
  });

  // Set match data when a match is selected
  useEffect(() => {
    if (selectedMatch && selectedMatchData) {
      setMatchMinute(selectedMatchData.minute || 0);
      setMatchStatus(selectedMatchData.status || "paused");
    }
  }, [selectedMatch, selectedMatchData]);

  // Reset team/player selection when match changes
  useEffect(() => {
    setSelectedTeam("");
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
  }, [selectedMatch]);

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

  const openEventModal = (eventType) => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }

    setCurrentEventType(eventType);
    setIsSubstitution(eventType === "substitution_in");
    setEventDescription("");
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
    setSubPlayerOut("");
    setGoalType("normal");
    setShowEventModal(true);
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

  const resetEventForm = () => {
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
    setSubPlayerOut("");
    setGoalType("normal");
    setEventDescription("");
  };

  const handleAddCommentary = async () => {
    if (!commentary.trim()) {
      toast.error("Please enter commentary text");
      return;
    }

    const commentaryData = {
      minute: matchMinute,
      commentary_text: commentary,
      is_important: false,
      created_by: user?.id,
    };

    try {
      await addCommentaryMutation.mutateAsync(commentaryData);
      setCommentary("");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const quickEvent = async (eventType) => {
    if (!selectedTeam) {
      toast.error("Please select a team first");
      return;
    }

    const eventData = {
      event_type: eventType,
      minute: matchMinute,
      team_id: selectedTeam,
      description: `${eventType.replace("_", " ")} at ${matchMinute}'`,
      created_at: new Date().toISOString(),
    };

    try {
      await addEventMutation.mutateAsync(eventData);
    } catch (error) {
      // Error handled in mutation
    }
  };

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

  const eventCategories = {
    goals: [
      {
        type: "goal",
        label: "Goal",
        icon: Target,
        color: "bg-green-500 hover:bg-green-600",
      },
      {
        type: "penalty_goal",
        label: "Penalty Goal",
        icon: FaFootballBall,
        color: "bg-green-500 hover:bg-green-600",
      },
      {
        type: "own_goal",
        label: "Own Goal",
        icon: Target,
        color: "bg-red-500 hover:bg-red-600",
      },
    ],
    cards: [
      {
        type: "yellow_card",
        label: "Yellow Card",
        icon: CreditCard,
        color: "bg-yellow-500 hover:bg-yellow-600",
      },
      {
        type: "red_card",
        label: "Red Card",
        icon: CreditCard,
        color: "bg-red-500 hover:bg-red-600",
      },
      {
        type: "second_yellow",
        label: "2nd Yellow",
        icon: CreditCard,
        color: "bg-orange-500 hover:bg-orange-600",
      },
    ],
    substitutions: [
      {
        type: "substitution_in",
        label: "Substitution",
        icon: ArrowLeftRight,
        color: "bg-blue-500 hover:bg-blue-600",
      },
    ],
    other: [
      {
        type: "corner",
        label: "Corner",
        icon: CornerDownLeft,
        color: "bg-purple-500 hover:bg-purple-600",
      },
      {
        type: "free_kick",
        label: "Free Kick",
        icon: Zap,
        color: "bg-yellow-500 hover:bg-yellow-600",
      },
      {
        type: "offside",
        label: "Offside",
        icon: Flag,
        color: "bg-orange-500 hover:bg-orange-600",
      },
      {
        type: "injury",
        label: "Injury",
        icon: Stethoscope,
        color: "bg-red-500 hover:bg-red-600",
      },
      {
        type: "var_decision",
        label: "VAR Decision",
        icon: Video,
        color: "bg-blue-500 hover:bg-blue-600",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950 py-6">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4">
            <Video className="h-8 w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Live Commentary Dashboard
            </h1>
            <GiWhistle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time match event logging with comprehensive database updates
          </p>
        </div>

        {/* Match Selection */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Select Active Match</h2>
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a match to commentate" />
                </SelectTrigger>
                <SelectContent>
                  {liveMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.home_team?.name} vs {match.away_team?.name} -{" "}
                      {new Date(match.match_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMatchData && (
              <div className="text-center sm:text-right">
                <Badge variant="secondary" className="text-sm">
                  {selectedMatchData.home_team?.name} vs{" "}
                  {selectedMatchData.away_team?.name}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMatchData.venue?.name}
                </p>
              </div>
            )}
          </div>
        </Card>

        {selectedMatch ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Commentary Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Match Control */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold">Match Control</h2>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-sm px-3 py-1 ${
                        matchStatus === "first_half" ||
                        matchStatus === "second_half"
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
                      matchStatus === "first_half" ||
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
                      updateMatchMutation.isLoading
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
                      <Label className="text-sm font-medium mb-2">
                        Select Team
                      </Label>
                      <Select
                        value={selectedTeam}
                        onValueChange={setSelectedTeam}
                      >
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
                        <Label className="text-sm font-medium mb-2">
                          Select Player
                        </Label>
                        <Select
                          value={selectedPlayer}
                          onValueChange={setSelectedPlayer}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose player" />
                          </SelectTrigger>
                          <SelectContent>
                            {starters.map((player) => (
                              <SelectItem
                                key={player.player_id}
                                value={player.player_id}
                              >
                                {player.player?.jersey_number}.{" "}
                                {player.player?.name}
                              </SelectItem>
                            ))}
                            {substitutes.map((player) => (
                              <SelectItem
                                key={player.player_id}
                                value={player.player_id}
                              >
                                {player.player?.jersey_number}.{" "}
                                {player.player?.name} (Sub)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Event Categories */}
                <div className="space-y-4">
                  {/* Goals */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Goals & Scoring
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {eventCategories.goals.map((event) => (
                        <Button
                          key={event.type}
                          className={`h-16 flex flex-col gap-1 text-xs ${event.color} text-white`}
                          onClick={() => openEventModal(event.type)}
                          disabled={!selectedTeam || addEventMutation.isLoading}
                        >
                          <event.icon className="h-4 w-4" />
                          <span>{event.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cards */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-yellow-500" />
                      Cards & Discipline
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {eventCategories.cards.map((event) => (
                        <Button
                          key={event.type}
                          className={`h-16 flex flex-col gap-1 text-xs ${event.color} text-white`}
                          onClick={() => openEventModal(event.type)}
                          disabled={!selectedTeam || addEventMutation.isLoading}
                        >
                          <event.icon className="h-4 w-4" />
                          <span>{event.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Substitutions */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                      Substitutions
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {eventCategories.substitutions.map((event) => (
                        <Button
                          key={event.type}
                          className={`h-16 flex flex-col gap-1 text-xs ${event.color} text-white`}
                          onClick={() => openEventModal(event.type)}
                          disabled={!selectedTeam || addEventMutation.isLoading}
                        >
                          <event.icon className="h-4 w-4" />
                          <span>{event.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Other Events */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      Other Events
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {eventCategories.other.map((event) => (
                        <Button
                          key={event.type}
                          variant="outline"
                          className="h-16 flex flex-col gap-1 text-xs"
                          onClick={() => quickEvent(event.type)}
                          disabled={!selectedTeam || addEventMutation.isLoading}
                        >
                          <event.icon className="h-4 w-4" />
                          <span>{event.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Commentary Input */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Add Text Commentary</h3>
                  <Textarea
                    value={commentary}
                    onChange={(e) => setCommentary(e.target.value)}
                    placeholder={`Type live commentary for minute ${matchMinute}...`}
                    rows={3}
                    className="mb-3"
                    disabled={addCommentaryMutation.isLoading}
                  />
                  <Button
                    onClick={handleAddCommentary}
                    className="w-full"
                    disabled={
                      addCommentaryMutation.isLoading || !commentary.trim()
                    }
                  >
                    {addCommentaryMutation.isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Post Commentary
                  </Button>
                </div>
              </Card>
            </div>

            {/* Timeline Sidebar */}
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
                        <Badge
                          variant="secondary"
                          className="mt-1 flex-shrink-0"
                        >
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
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Please select a match to begin commentary
            </p>
          </Card>
        )}

        {/* Event Modal */}
        {showEventModal && (
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
                    <Select
                      value={selectedPlayer}
                      onValueChange={setSelectedPlayer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {starters.map((player) => (
                          <SelectItem
                            key={player.player_id}
                            value={player.player_id}
                          >
                            {player.player?.jersey_number}.{" "}
                            {player.player?.name}
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
                          {starters.map((player) => (
                            <SelectItem
                              key={player.player_id}
                              value={player.player_id}
                            >
                              {player.player?.jersey_number}.{" "}
                              {player.player?.name}
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
                    <Select
                      value={subPlayerOut}
                      onValueChange={setSubPlayerOut}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player coming out" />
                      </SelectTrigger>
                      <SelectContent>
                        {starters.map((player) => (
                          <SelectItem
                            key={player.player_id}
                            value={player.player_id}
                          >
                            {player.player?.jersey_number}.{" "}
                            {player.player?.name}
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
        )}
      </div>
    </div>
  );
};

export default Commentary;
