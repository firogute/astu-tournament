// components/manager/LineupBuilder.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Target,
  Shield,
  Users,
  Zap,
  Play,
  Shirt,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import SoccerLineup from "react-soccer-lineup";

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  rating: number;
  photo?: string;
}

interface Formation {
  id: string;
  name: string;
  structure: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Match {
  id: string;
  match_date: string;
  match_time: string;
  home_team: any;
  away_team: any;
  tournament: any;
}

const formations: Formation[] = [
  {
    id: "4-3-3-attacking",
    name: "4-3-3 Attacking",
    structure: "4-3-3",
    description: "Balanced attack with wing play",
    difficulty: "Medium",
  },
  {
    id: "4-4-2-flat",
    name: "4-4-2 Classic",
    structure: "4-4-2",
    description: "Traditional balanced formation",
    difficulty: "Easy",
  },
  {
    id: "3-5-2",
    name: "3-5-2",
    structure: "3-5-2",
    description: "Midfield dominance",
    difficulty: "Hard",
  },
  {
    id: "5-3-2",
    name: "5-3-2 Defensive",
    structure: "5-3-2",
    description: "Solid defensive structure",
    difficulty: "Easy",
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1",
    structure: "4-2-3-1",
    description: "Strong midfield control",
    difficulty: "Medium",
  },
];

// Position mapping for different formations according to react-soccer-lineup structure
const formationPositions: Record<string, any> = {
  "4-3-3": {
    df: ["DF1", "DF2", "DF3", "DF4"],
    cm: ["MF1", "MF2", "MF3"],
    fw: ["FW1", "FW2", "FW3"],
  },
  "4-4-2": {
    df: ["DF1", "DF2", "DF3", "DF4"],
    cm: ["MF1", "MF2", "MF3", "MF4"],
    fw: ["FW1", "FW2"],
  },
  "3-5-2": {
    df: ["DF1", "DF2", "DF3"],
    cm: ["MF1", "MF2", "MF3", "MF4", "MF5"],
    fw: ["FW1", "FW2"],
  },
  "5-3-2": {
    df: ["DF1", "DF2", "DF3", "DF4", "DF5"],
    cm: ["MF1", "MF2", "MF3"],
    fw: ["FW1", "FW2"],
  },
  "4-2-3-1": {
    df: ["DF1", "DF2", "DF3", "DF4"],
    cdm: ["MF1", "MF2"],
    cam: ["MF3", "MF4", "MF5"],
    fw: ["FW1"],
  },
};

const LineupBuilder = () => {
  const { user } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, Player>
  >({});
  const [selectedFormation, setSelectedFormation] = useState("4-3-3-attacking");
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [showNames, setShowNames] = useState(true);
  const [savedLineups, setSavedLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playersRes, matchesRes, lineupsRes] = await Promise.all([
        apiClient.get("/manager/my-players"),
        apiClient.get("/manager/upcoming-matches"),
        apiClient.get("/manager/lineups"),
      ]);

      setAvailablePlayers(playersRes.data.players || []);
      setUpcomingMatches(matchesRes.data.matches || []);
      setSavedLineups(lineupsRes.data.lineups || []);

      // Auto-select first match if available
      if (matchesRes.data.matches?.length > 0) {
        setSelectedMatch(matchesRes.data.matches[0].id);
      }

      autoSelectBestPlayers(playersRes.data.players || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const autoSelectBestPlayers = (players: Player[]) => {
    const bestPlayers: Record<string, Player> = {};
    const formation = formations.find((f) => f.id === selectedFormation);
    if (!formation) return;

    const positions = formationPositions[formation.structure];
    if (!positions) return;

    // Goalkeeper
    const goalkeepers = players
      .filter((p) => p.position === "GK")
      .sort((a, b) => b.rating - a.rating);
    if (goalkeepers.length > 0) {
      bestPlayers["GK"] = goalkeepers[0];
    }

    // Defenders
    positions.df?.forEach((pos: string, index: number) => {
      const defenders = players
        .filter((p) => p.position === "DF")
        .sort((a, b) => b.rating - a.rating);
      if (defenders.length > index) {
        bestPlayers[pos] = defenders[index];
      }
    });

    // Midfielders - handle different types based on formation
    positions.cm?.forEach((pos: string, index: number) => {
      const midfielders = players
        .filter((p) => p.position === "MF")
        .sort((a, b) => b.rating - a.rating);
      if (midfielders.length > index) {
        bestPlayers[pos] = midfielders[index];
      }
    });

    positions.cdm?.forEach((pos: string, index: number) => {
      const midfielders = players
        .filter((p) => p.position === "MF")
        .sort((a, b) => b.rating - a.rating);
      if (midfielders.length > index) {
        bestPlayers[pos] = midfielders[index];
      }
    });

    positions.cam?.forEach((pos: string, index: number) => {
      const midfielders = players
        .filter((p) => p.position === "MF")
        .sort((a, b) => b.rating - a.rating);
      if (midfielders.length > index) {
        bestPlayers[pos] = midfielders[index];
      }
    });

    // Forwards
    positions.fw?.forEach((pos: string, index: number) => {
      const forwards = players
        .filter((p) => p.position === "FW")
        .sort((a, b) => b.rating - a.rating);
      if (forwards.length > index) {
        bestPlayers[pos] = forwards[index];
      }
    });

    setSelectedPlayers(bestPlayers);
  };

  const handlePlayerSelect = (position: string) => {
    const posType = position.substring(0, 2); // GK, DF, MF, FW
    const availableForPosition = availablePlayers.filter(
      (p) => p.position === posType
    );

    if (availableForPosition.length > 0) {
      const currentPlayer = selectedPlayers[position];
      const currentIndex = availableForPosition.findIndex(
        (p) => p.id === currentPlayer?.id
      );
      const nextIndex = (currentIndex + 1) % availableForPosition.length;
      const nextPlayer = availableForPosition[nextIndex];

      setSelectedPlayers((prev) => ({
        ...prev,
        [position]: nextPlayer,
      }));
    }
  };

  const clearLineup = () => setSelectedPlayers({});

  const saveLineup = async () => {
    if (!selectedMatch) {
      alert("Please select a match first");
      return;
    }

    try {
      const lineupData = {
        match_id: selectedMatch,
        formation_id: selectedFormation,
        formation_structure: currentFormation.structure,
        players: Object.entries(selectedPlayers).map(([position, player]) => ({
          id: player.id,
          position: position,
          jersey_number: player.jersey_number,
        })),
      };

      const response = await apiClient.post("/manager/lineups", lineupData);

      // Refresh saved lineups
      const lineupsRes = await apiClient.get("/manager/lineups");
      setSavedLineups(lineupsRes.data.lineups || []);

      console.log("Lineup saved successfully:", response.data);
      alert("Lineup saved successfully!");
    } catch (error: any) {
      console.error("Failed to save lineup:", error);
      alert(
        `Failed to save lineup: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const currentFormation =
    formations.find((f) => f.id === selectedFormation) || formations[0];
  const selectedMatchData = upcomingMatches.find((m) => m.id === selectedMatch);

  // Prepare data for SoccerLineup component according to library API
  const getLineupData = () => {
    const positions = formationPositions[currentFormation.structure];
    if (!positions) return { homeTeam: undefined, awayTeam: undefined };

    const squad: any = {};

    // Goalkeeper
    if (selectedPlayers["GK"]) {
      squad.gk = {
        name: showNames ? selectedPlayers["GK"].name : "",
        number: selectedPlayers["GK"].jersey_number,
        onClick: () => handlePlayerSelect("GK"),
      };
    }

    // Defenders
    if (positions.df) {
      squad.df = positions.df
        .map((pos: string) => {
          const player = selectedPlayers[pos];
          return player
            ? {
                name: showNames ? player.name : "",
                number: player.jersey_number,
                onClick: () => handlePlayerSelect(pos),
              }
            : undefined;
        })
        .filter(Boolean);
    }

    // Midfielders
    if (positions.cm) {
      squad.cm = positions.cm
        .map((pos: string) => {
          const player = selectedPlayers[pos];
          return player
            ? {
                name: showNames ? player.name : "",
                number: player.jersey_number,
                onClick: () => handlePlayerSelect(pos),
              }
            : undefined;
        })
        .filter(Boolean);
    }

    if (positions.cdm) {
      squad.cdm = positions.cdm
        .map((pos: string) => {
          const player = selectedPlayers[pos];
          return player
            ? {
                name: showNames ? player.name : "",
                number: player.jersey_number,
                onClick: () => handlePlayerSelect(pos),
              }
            : undefined;
        })
        .filter(Boolean);
    }

    if (positions.cam) {
      squad.cam = positions.cam
        .map((pos: string) => {
          const player = selectedPlayers[pos];
          return player
            ? {
                name: showNames ? player.name : "",
                number: player.jersey_number,
                onClick: () => handlePlayerSelect(pos),
              }
            : undefined;
        })
        .filter(Boolean);
    }

    // Forwards
    if (positions.fw) {
      squad.fw = positions.fw
        .map((pos: string) => {
          const player = selectedPlayers[pos];
          return player
            ? {
                name: showNames ? player.name : "",
                number: player.jersey_number,
                onClick: () => handlePlayerSelect(pos),
              }
            : undefined;
        })
        .filter(Boolean);
    }

    return {
      homeTeam: {
        squad: squad,
        style: {
          color: "#3b82f6", // Blue color for home team
          numberColor: "#ffffff",
          nameColor: "#ffffff",
        },
      },
      awayTeam: {
        squad: {},
        style: {
          color: "#ef4444", // Red color for away team (empty)
          numberColor: "#ffffff",
          nameColor: "#ffffff",
        },
      },
    };
  };

  const lineupData = getLineupData();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPositionColor = (position: string) => {
    const colors = {
      GK: "bg-yellow-100 text-yellow-800 border-yellow-300",
      DF: "bg-blue-100 text-blue-800 border-blue-300",
      MF: "bg-green-100 text-green-800 border-green-300",
      FW: "bg-red-100 text-red-800 border-red-300",
    };
    return (
      colors[position as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="grid lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-64 bg-slate-200 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lineup Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Build your perfect starting XI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNames(!showNames)}
            className="gap-2"
          >
            {showNames ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {showNames ? "Hide Names" : "Show Names"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLineup}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Match Selection */}
      {upcomingMatches.length > 0 && (
        <Card className="p-4 border-0 shadow-lg">
          <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
            <Calendar className="w-4 h-4" />
            Select Match
          </h3>
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800"
          >
            {upcomingMatches.map((match) => (
              <option key={match.id} value={match.id}>
                {new Date(match.match_date).toLocaleDateString()} -{" "}
                {match.home_team?.name} vs {match.away_team?.name}
              </option>
            ))}
          </select>
          {selectedMatchData && (
            <div className="mt-2 text-sm text-muted-foreground">
              {selectedMatchData.tournament?.name} •{" "}
              {selectedMatchData.tournament?.season}
            </div>
          )}
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Formation Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 border-0 shadow-lg">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
              <Target className="w-4 h-4" />
              Formations
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formations.map((formation) => (
                <Card
                  key={formation.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all duration-300 border-2",
                    formation.id === selectedFormation
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                  onClick={() => {
                    setSelectedFormation(formation.id);
                    setTimeout(
                      () => autoSelectBestPlayers(availablePlayers),
                      100
                    );
                  }}
                >
                  <CardContent className="p-0 text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {formation.structure}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2 truncate">
                      {formation.name}
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        getDifficultyColor(formation.difficulty)
                      )}
                    >
                      {formation.difficulty}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>

          {/* Formation Details */}
          <Card className="p-4 border-0 shadow-lg">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
              <Shield className="w-4 h-4" />
              Formation Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Structure:</span>
                <Badge variant="secondary">{currentFormation.structure}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <Badge
                  className={getDifficultyColor(currentFormation.difficulty)}
                >
                  {currentFormation.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Players Selected:</span>
                <span className="font-semibold">
                  {Object.keys(selectedPlayers).length}/11
                </span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
              {currentFormation.description}
            </div>
          </Card>
        </div>

        {/* Pitch */}
        <div className="lg:col-span-3">
          <Card className="p-4 border-0 shadow-xl">
            <div className="bg-white rounded-lg p-4 border">
              <SoccerLineup
                size="responsive"
                color="#22c55e" // Green pitch
                pattern="lines"
                homeTeam={lineupData.homeTeam}
                awayTeam={lineupData.awayTeam}
              />
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Click on player positions to cycle through available players
            </div>
          </Card>
        </div>
      </div>

      {/* Players & Actions */}
      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Selected Players */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-0 shadow-lg">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
              <Users className="w-4 h-4" />
              Starting XI ({Object.keys(selectedPlayers).length}/11)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(selectedPlayers).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No players selected</p>
                  <p className="text-xs">
                    Select a formation to auto-fill players
                  </p>
                </div>
              ) : (
                Object.entries(selectedPlayers).map(([position, player]) => (
                  <div
                    key={position}
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => handlePlayerSelect(position)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {player.jersey_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {player.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getPositionColor(player.position)
                          )}
                        >
                          {position}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {player.rating}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Saved Lineups & Actions */}
        <div className="lg:col-span-2 space-y-4">
          {savedLineups.length > 0 && (
            <Card className="p-4 border-0 shadow-lg">
              <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
                <Zap className="w-4 h-4" />
                Saved Lineups
              </h3>
              <div className="space-y-2">
                {savedLineups.slice(0, 3).map((lineup) => (
                  <div
                    key={lineup.id}
                    className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-medium text-sm">
                      {lineup.formation?.formation_name || "Lineup"}
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{lineup.formation_structure}</span>
                      <span>
                        {new Date(lineup.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={saveLineup}
              disabled={
                !selectedMatch || Object.keys(selectedPlayers).length === 0
              }
              className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Save Lineup
            </Button>
            <Button variant="outline" className="flex-1 gap-2" size="lg">
              <Play className="w-4 h-4" />
              Simulate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupBuilder;
