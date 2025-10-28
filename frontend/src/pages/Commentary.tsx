// Commentary.jsx
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Video } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { GiWhistle } from "react-icons/gi";

// Import our new components
import MatchSelector from "@/components/commentary/MatchSelector";
import MatchController from "@/components/commentary/MatchController";
import EventPanel from "@/components/commentary/EventPanel";
import CommentaryPanel from "@/components/commentary/CommentaryPanel";
import TimelineSidebar from "@/components/commentary/TimelineSidebar";
import EventModal from "@/components/commentary/EventModal";

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

  // Fetch live matches
  const { data: liveMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["commentary", "matches"],
    queryFn: async () => {
      const response = await apiClient.get("/commentary/matches/live");
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Fetch selected match details
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

  // Fetch match events and commentary
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

  // Fetch players for selected team
  const { data: teamPlayers = [] } = useQuery({
    queryKey: ["commentary", "players", selectedTeam],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const response = await apiClient.get(`/players/team/${selectedTeam}`);
      return response.data;
    },
    enabled: !!selectedTeam,
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

  const resetEventForm = () => {
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
    setSubPlayerOut("");
    setGoalType("normal");
    setEventDescription("");
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
        <MatchSelector
          liveMatches={liveMatches}
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
          selectedMatchData={selectedMatchData}
        />

        {selectedMatch ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Commentary Panel */}
            <div className="lg:col-span-2 space-y-6">
              <MatchController
                matchStatus={matchStatus}
                setMatchStatus={setMatchStatus}
                matchMinute={matchMinute}
                setMatchMinute={setMatchMinute}
                selectedMatch={selectedMatch}
                selectedMatchData={selectedMatchData}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                selectedPlayer={selectedPlayer}
                setSelectedPlayer={setSelectedPlayer}
                teamPlayers={teamPlayers}
                queryClient={queryClient}
              />

              <EventPanel
                selectedTeam={selectedTeam}
                teamPlayers={teamPlayers}
                matchMinute={matchMinute}
                selectedMatch={selectedMatch}
                setCurrentEventType={setCurrentEventType}
                setIsSubstitution={setIsSubstitution}
                setShowEventModal={setShowEventModal}
                queryClient={queryClient}
              />

              <CommentaryPanel
                commentary={commentary}
                setCommentary={setCommentary}
                matchMinute={matchMinute}
                selectedMatch={selectedMatch}
                user={user}
                queryClient={queryClient}
              />
            </div>

            {/* Timeline Sidebar */}
            <TimelineSidebar
              matchEvents={matchEvents}
              commentaryEntries={commentaryEntries}
            />
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
          <EventModal
            currentEventType={currentEventType}
            isSubstitution={isSubstitution}
            selectedTeam={selectedTeam}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            selectedAssistPlayer={selectedAssistPlayer}
            setSelectedAssistPlayer={setSelectedAssistPlayer}
            goalType={goalType}
            setGoalType={setGoalType}
            subPlayerOut={subPlayerOut}
            setSubPlayerOut={setSubPlayerOut}
            eventDescription={eventDescription}
            setEventDescription={setEventDescription}
            matchMinute={matchMinute}
            teamPlayers={teamPlayers}
            showEventModal={showEventModal}
            setShowEventModal={setShowEventModal}
            selectedMatch={selectedMatch}
            resetEventForm={resetEventForm}
            queryClient={queryClient}
          />
        )}
      </div>
    </div>
  );
};

export default Commentary;
