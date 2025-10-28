// Commentary.jsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Video, Play, Pause, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { GiWhistle } from "react-icons/gi";

// Import our components
import MatchSelector from "@/components/commentary/MatchSelector";
import MatchController from "@/components/commentary/MatchController";
import EventPanel from "@/components/commentary/EventPanel";
import CommentaryPanel from "@/components/commentary/CommentaryPanel";
import TimelineSidebar from "@/components/commentary/TimelineSidebar";
import EventModal from "@/components/commentary/EventModal";

const Commentary = () => {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [matchMinute, setMatchMinute] = useState(0);
  const [matchStatus, setMatchStatus] = useState("scheduled");
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set mounted state to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch ALL matches (past, present, future) for commentary
  const { data: availableMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["commentary", "matches", "available"],
    queryFn: async () => {
      const response = await apiClient.get("/matches/matches/available");
      return response.data;
    },
    enabled: isMounted,
  });

  // Fetch selected match details
  const { data: selectedMatchData } = useQuery({
    queryKey: ["commentary", "match", selectedMatch],
    queryFn: async () => {
      if (!selectedMatch) return null;
      const response = await apiClient.get(`/matches/${selectedMatch}`);
      return response.data;
    },
    enabled: !!selectedMatch && isMounted,
  });

  // Fetch match events and commentary
  const { data: matchData = {} } = useQuery({
    queryKey: ["commentary", "data", selectedMatch],
    queryFn: async () => {
      if (!selectedMatch) return { events: [], commentary: [] };
      const response = await apiClient.get(`/commentary/${selectedMatch}`);
      return response.data;
    },
    enabled: !!selectedMatch && isMounted,
    refetchInterval: 10000, // Reduced from 5000 to 10000
  });

  const { events: matchEvents = [], commentary: commentaryEntries = [] } =
    matchData;

  // Fetch players for selected team
  const { data: teamPlayers = [] } = useQuery({
    queryKey: ["commentary", "players", selectedTeam],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const response = await apiClient.get(`/teams/${selectedTeam}/players`);
      return response.data;
    },
    enabled: !!selectedTeam && isMounted,
  });

  // Set match data when a match is selected
  useEffect(() => {
    if (selectedMatch && selectedMatchData) {
      setMatchMinute(selectedMatchData.minute || 0);
      setMatchStatus(selectedMatchData.status || "scheduled");
    }
  }, [selectedMatch, selectedMatchData]);

  // Reset team/player selection when match changes
  useEffect(() => {
    setSelectedTeam("");
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
  }, [selectedMatch]);

  // Close sidebar when match is selected on mobile
  useEffect(() => {
    if (selectedMatch && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [selectedMatch]);

  const resetEventForm = () => {
    setSelectedPlayer("");
    setSelectedAssistPlayer("");
    setSubPlayerOut("");
    setGoalType("normal");
    setEventDescription("");
  };

  // Start commentary for a match
  const startCommentary = async () => {
    if (!selectedMatch) {
      toast.error("Please select a match first");
      return;
    }

    try {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/start`
      );
      const updatedMatch = response.data.match;

      setMatchStatus(updatedMatch.status);
      setMatchMinute(updatedMatch.minute);

      toast.success("Commentary started! Match is now live.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to start commentary");
    }
  };

  // Check if match can be started (is scheduled or in past)
  const canStartCommentary =
    selectedMatchData &&
    (selectedMatchData.status === "scheduled" ||
      new Date(selectedMatchData.match_date) < new Date());

  // Don't render until mounted to prevent SSR issues
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950 py-4 md:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-3 md:mb-4">
              <Video className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Live Commentary
              </h1>
              <GiWhistle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <Card className="p-8 text-center">
            <div className="animate-pulse">Loading commentary dashboard...</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-950 dark:to-green-950 py-4 md:py-6">
      <div className="container mx-auto px-3 sm:px-4 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-3 md:mb-4">
            <Video className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Live Commentary
            </h1>
            <GiWhistle className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Real-time match event logging with comprehensive database updates
          </p>
        </div>

        {/* Mobile Sidebar Toggle */}
        {selectedMatch && (
          <div className="lg:hidden flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2"
            >
              {sidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              {sidebarOpen ? "Close Timeline" : "Open Timeline"}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {matchStatus === "first_half"
                ? "1ST HALF"
                : matchStatus === "second_half"
                ? "2ND HALF"
                : matchStatus === "half_time"
                ? "HALF TIME"
                : matchStatus.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="flex gap-4 md:gap-6">
          {/* Main Content */}
          <div
            className={`flex-1 ${sidebarOpen ? "hidden lg:block" : "block"}`}
          >
            {/* Match Selection */}
            <MatchSelector
              liveMatches={availableMatches}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              selectedMatchData={selectedMatchData}
            />

            {selectedMatch ? (
              <div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
                {/* Start Commentary Button for scheduled/past matches */}
                {canStartCommentary && (
                  <Card className="p-4 md:p-6 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-left">
                        <h3 className="font-semibold text-sm md:text-base">
                          Ready to Start Commentary
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          This match is{" "}
                          {selectedMatchData.status === "scheduled"
                            ? "scheduled"
                            : "in the past"}
                          . Click start to begin live commentary.
                        </p>
                      </div>
                      <Button
                        onClick={startCommentary}
                        size="sm"
                        className="gap-2"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4" />
                        Start Commentary
                      </Button>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                  {/* Left Column - Match Controls & Events */}
                  <div className="xl:col-span-2 space-y-4 md:space-y-6">
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

                  {/* Right Column - Timeline Sidebar (Desktop) */}
                  <div className="hidden xl:block">
                    <TimelineSidebar
                      matchEvents={matchEvents}
                      commentaryEntries={commentaryEntries}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Card className="p-6 md:p-12 text-center mt-4 md:mt-6">
                <p className="text-base md:text-lg text-muted-foreground">
                  {availableMatches.length > 0
                    ? "Please select a match to begin commentary"
                    : "No matches available for commentary"}
                </p>
              </Card>
            )}
          </div>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden w-full max-w-sm">
              <TimelineSidebar
                matchEvents={matchEvents}
                commentaryEntries={commentaryEntries}
              />
            </div>
          )}
        </div>

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
