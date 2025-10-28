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
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

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
  formation: number[]; // [defenders, midfielders, forwards]
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const formations: Formation[] = [
  {
    id: "4-3-3-attacking",
    name: "4-3-3 Attacking",
    structure: "4-3-3",
    formation: [4, 3, 3],
    description: "Balanced attack with wing play",
    difficulty: "Medium",
  },
  {
    id: "4-4-2-flat",
    name: "4-4-2 Classic",
    structure: "4-4-2",
    formation: [4, 4, 2],
    description: "Traditional balanced formation",
    difficulty: "Easy",
  },
  {
    id: "3-5-2",
    name: "3-5-2",
    structure: "3-5-2",
    formation: [3, 5, 2],
    description: "Midfield dominance",
    difficulty: "Hard",
  },
  {
    id: "5-3-2",
    name: "5-3-2 Defensive",
    structure: "5-3-2",
    formation: [5, 3, 2],
    description: "Solid defensive structure",
    difficulty: "Easy",
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1",
    structure: "4-2-3-1",
    formation: [4, 5, 1],
    description: "Strong midfield control",
    difficulty: "Medium",
  },
  {
    id: "3-4-3",
    name: "3-4-3 Attacking",
    structure: "3-4-3",
    formation: [3, 4, 3],
    description: "All-out attack",
    difficulty: "Hard",
  },
];

const LineupBuilder = () => {
  const { user } = useAuth();
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, Player>
  >({});
  const [selectedFormation, setSelectedFormation] = useState("4-3-3-attacking");
  const [showNames, setShowNames] = useState(true);
  const [savedLineups, setSavedLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/manager/my-players");
      setAvailablePlayers(res.data.players || []);
      autoSelectBestPlayers(res.data.players || []);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    } finally {
      setLoading(false);
    }
  };

  const autoSelectBestPlayers = (players: Player[]) => {
    const bestPlayers: Record<string, Player> = {};
    const positions = ["GK", "DF", "MF", "FW"];

    positions.forEach((pos) => {
      const positionPlayers = players
        .filter((p) => p.position === pos)
        .sort((a, b) => b.rating - a.rating);
      if (positionPlayers.length > 0) {
        bestPlayers[pos] = positionPlayers[0];
      }
    });

    setSelectedPlayers(bestPlayers);
  };

  const handlePlayerSelect = (position: string, player: Player) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [position]: player,
    }));
  };

  const clearLineup = () => setSelectedPlayers({});

  const saveLineup = async () => {
    try {
      const lineupData = {
        formation_id: selectedFormation,
        formation_structure: currentFormation.structure,
        players: Object.entries(selectedPlayers).map(([position, player]) => ({
          id: player.id,
          position: position,
          jersey_number: player.jersey_number,
        })),
      };

      // Save to backend
      const response = await apiClient.post("/manager/lineups", lineupData);

      // Also save locally
      const lineup = {
        id: Date.now().toString(),
        name: `${currentFormation.name} Lineup`,
        formation: currentFormation,
        players: selectedPlayers,
        created: new Date().toISOString(),
      };
      setSavedLineups((prev) => [lineup, ...prev.slice(0, 4)]);

      console.log("Lineup saved successfully:", response.data);
    } catch (error) {
      console.error("Failed to save lineup:", error);
    }
  };

  const currentFormation =
    formations.find((f) => f.id === selectedFormation) || formations[0];

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

  // Football Pitch Component
  const FootballPitch = () => {
    const [defenders, midfielders, forwards] = currentFormation.formation;

    const renderPlayerSpot = (
      position: string,
      row: number,
      index: number,
      total: number
    ) => {
      const player = selectedPlayers[position];
      const availableForPosition = availablePlayers.filter(
        (p) => p.position === position.substring(0, 2) // GK, DF, MF, FW
      );

      return (
        <div
          key={position}
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => {
            if (availableForPosition.length > 0) {
              const bestPlayer = availableForPosition.sort(
                (a, b) => b.rating - a.rating
              )[0];
              handlePlayerSelect(position, bestPlayer);
            }
          }}
        >
          <div
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              player
                ? "bg-white border-blue-500 shadow-lg scale-110"
                : "bg-white/20 border-white/40 hover:border-white hover:scale-110"
            )}
          >
            {player ? (
              <span className="font-bold text-blue-600 text-sm">
                {player.jersey_number}
              </span>
            ) : (
              <Plus className="w-4 h-4 text-white/60" />
            )}
          </div>
          {showNames && player && (
            <div className="mt-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full max-w-20 truncate">
              {player.name.split(" ")[0]}
            </div>
          )}
          {!player && (
            <div className="mt-1 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {position}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="w-full bg-green-600 rounded-xl p-4 sm:p-6 border-4 border-green-700 relative overflow-hidden">
        {/* Pitch Markings */}
        <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/30 rounded-full"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white/30"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white/30"></div>
        <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white/30"></div>

        {/* Player Rows */}
        <div className="relative z-10 h-64 sm:h-80 flex flex-col justify-between">
          {/* Forwards */}
          <div className="flex justify-around">
            {Array.from({ length: forwards }, (_, i) =>
              renderPlayerSpot(`FW${i + 1}`, 1, i, forwards)
            )}
          </div>

          {/* Midfielders */}
          <div className="flex justify-around">
            {Array.from({ length: midfielders }, (_, i) =>
              renderPlayerSpot(`MF${i + 1}`, 2, i, midfielders)
            )}
          </div>

          {/* Defenders */}
          <div className="flex justify-around">
            {Array.from({ length: defenders }, (_, i) =>
              renderPlayerSpot(`DF${i + 1}`, 3, i, defenders)
            )}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center">
            {renderPlayerSpot("GK", 4, 0, 1)}
          </div>
        </div>

        {/* Formation Badge */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono">
          {currentFormation.structure}
        </div>
      </div>
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

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Formation Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 border-0 shadow-lg">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base">
              <Target className="w-4 h-4" />
              Formations
            </h3>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-2 w-full h-9">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="popular" className="text-xs">
                  Popular
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-3 space-y-2">
                {formations.map((formation) => (
                  <Card
                    key={formation.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-300 border-2",
                      formation.id === selectedFormation
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                    onClick={() => setSelectedFormation(formation.id)}
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
              </TabsContent>
            </Tabs>
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
                <span className="text-muted-foreground">Defenders:</span>
                <span className="font-semibold">
                  {currentFormation.formation[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Midfielders:</span>
                <span className="font-semibold">
                  {currentFormation.formation[1]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forwards:</span>
                <span className="font-semibold">
                  {currentFormation.formation[2]}
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
            <FootballPitch />
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
                </div>
              ) : (
                Object.entries(selectedPlayers).map(([position, player]) => (
                  <div
                    key={position}
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border"
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
                {savedLineups.map((lineup) => (
                  <div
                    key={lineup.id}
                    className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-medium text-sm">{lineup.name}</div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{lineup.formation.structure}</span>
                      <span>
                        {new Date(lineup.created).toLocaleDateString()}
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
