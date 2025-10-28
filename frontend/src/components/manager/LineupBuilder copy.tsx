// components/manager/LineupBuilder.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Save,
  RotateCcw,
  Shirt,
  Users,
  Target,
  Zap,
  Shield,
  Crosshair,
  Play,
  Settings,
  Eye,
  EyeOff,
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
  form: number;
  photo?: string;
}

interface Formation {
  id: string;
  name: string;
  structure: string;
  defenders: number;
  midfielders: number;
  forwards: number;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const LineupBuilder = () => {
  const { user } = useAuth();
  const [selectedFormation, setSelectedFormation] = useState("4-3-3-attacking");
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, Player>
  >({});
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [savedLineups, setSavedLineups] = useState([]);
  const [showPlayerNames, setShowPlayerNames] = useState(true);
  const [loading, setLoading] = useState(true);

  const formations: Formation[] = [
    {
      id: "4-3-3-attacking",
      name: "4-3-3 Attacking",
      structure: "4-3-3",
      defenders: 4,
      midfielders: 3,
      forwards: 3,
      description: "Balanced attack with wing play",
      difficulty: "Medium",
    },
    {
      id: "4-4-2-flat",
      name: "4-4-2 Classic",
      structure: "4-4-2",
      defenders: 4,
      midfielders: 4,
      forwards: 2,
      description: "Traditional balanced formation",
      difficulty: "Easy",
    },
    {
      id: "4-2-3-1",
      name: "4-2-3-1",
      structure: "4-2-3-1",
      defenders: 4,
      midfielders: 5,
      forwards: 1,
      description: "Strong midfield control",
      difficulty: "Medium",
    },
    {
      id: "3-5-2",
      name: "3-5-2",
      structure: "3-5-2",
      defenders: 3,
      midfielders: 5,
      forwards: 2,
      description: "Midfield dominance",
      difficulty: "Hard",
    },
    {
      id: "5-3-2",
      name: "5-3-2 Defensive",
      structure: "5-3-2",
      defenders: 5,
      midfielders: 3,
      forwards: 2,
      description: "Solid defensive structure",
      difficulty: "Easy",
    },
    {
      id: "3-4-3",
      name: "3-4-3 Attacking",
      structure: "3-4-3",
      defenders: 3,
      midfielders: 4,
      forwards: 3,
      description: "All-out attack",
      difficulty: "Hard",
    },
    {
      id: "4-1-2-1-2",
      name: "Diamond 4-1-2-1-2",
      structure: "4-1-2-1-2",
      defenders: 4,
      midfielders: 4,
      forwards: 2,
      description: "Narrow diamond midfield",
      difficulty: "Hard",
    },
    {
      id: "4-3-1-2",
      name: "4-3-1-2",
      structure: "4-3-1-2",
      defenders: 4,
      midfielders: 4,
      forwards: 2,
      description: "Attacking with CAM",
      difficulty: "Medium",
    },
  ];

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/manager/my-players");
      setAvailablePlayers(response.data.players || []);

      // Auto-select best players by position
      autoSelectBestPlayers(response.data.players || []);
    } catch (error) {
      console.error("Failed to fetch players:", error);
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

  const currentFormation =
    formations.find((f) => f.id === selectedFormation) || formations[0];

  const handlePlayerSelect = (position: string, player: Player) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [position]: player,
    }));
  };

  const clearLineup = () => {
    setSelectedPlayers({});
  };

  const saveLineup = () => {
    const lineup = {
      id: Date.now().toString(),
      name: `${currentFormation.name} Lineup`,
      formation: currentFormation,
      players: selectedPlayers,
      created: new Date().toISOString(),
    };
    setSavedLineups((prev) => [lineup, ...prev.slice(0, 4)]);
    // In real app, save to backend
  };

  const FootballPitch = () => (
    <div className="relative bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-4 md:p-6 mb-6 overflow-hidden border-4 border-green-600 shadow-2xl">
      {/* Pitch Markings */}
      <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full opacity-40"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white opacity-40"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-white opacity-40"></div>

      {/* Center Line */}
      <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white opacity-40"></div>

      {/* Player Positions based on Formation */}
      <div className="relative z-10 h-80 md:h-96">
        {renderFormationPositions()}
      </div>

      {/* Tactical Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-mono">
        {currentFormation.structure}
      </div>
    </div>
  );

  const renderFormationPositions = () => {
    const formation = currentFormation;
    const positions = [];

    // Goalkeeper - Always at bottom center
    positions.push(
      <div
        key="gk"
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <PlayerSpot
          position="GK"
          player={selectedPlayers["GK"]}
          onSelect={(player) => handlePlayerSelect("GK", player)}
          availablePlayers={availablePlayers.filter((p) => p.position === "GK")}
          showName={showPlayerNames}
        />
      </div>
    );

    // Defenders
    const defenderCount = formation.defenders;
    for (let i = 0; i < defenderCount; i++) {
      const left = 20 + i * (60 / (defenderCount - 1 || 1));
      positions.push(
        <div
          key={`df-${i}`}
          className="absolute bottom-20"
          style={{ left: `${left}%` }}
        >
          <PlayerSpot
            position={`DF${i + 1}`}
            player={selectedPlayers[`DF${i + 1}`]}
            onSelect={(player) => handlePlayerSelect(`DF${i + 1}`, player)}
            availablePlayers={availablePlayers.filter(
              (p) => p.position === "DF"
            )}
            showName={showPlayerNames}
          />
        </div>
      );
    }

    // Midfielders
    const midfielderCount = formation.midfielders;
    for (let i = 0; i < midfielderCount; i++) {
      const left = 15 + i * (70 / (midfielderCount - 1 || 1));
      positions.push(
        <div
          key={`mf-${i}`}
          className="absolute bottom-40"
          style={{ left: `${left}%` }}
        >
          <PlayerSpot
            position={`MF${i + 1}`}
            player={selectedPlayers[`MF${i + 1}`]}
            onSelect={(player) => handlePlayerSelect(`MF${i + 1}`, player)}
            availablePlayers={availablePlayers.filter(
              (p) => p.position === "MF"
            )}
            showName={showPlayerNames}
          />
        </div>
      );
    }

    // Forwards
    const forwardCount = formation.forwards;
    for (let i = 0; i < forwardCount; i++) {
      const left = 10 + i * (80 / (forwardCount - 1 || 1));
      positions.push(
        <div
          key={`fw-${i}`}
          className="absolute bottom-60"
          style={{ left: `${left}%` }}
        >
          <PlayerSpot
            position={`FW${i + 1}`}
            player={selectedPlayers[`FW${i + 1}`]}
            onSelect={(player) => handlePlayerSelect(`FW${i + 1}`, player)}
            availablePlayers={availablePlayers.filter(
              (p) => p.position === "FW"
            )}
            showName={showPlayerNames}
          />
        </div>
      );
    }

    return positions;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "Hard":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Lineup Builder
          </h1>
          <p className="text-lg text-muted-foreground">
            Create your perfect starting XI with professional formations
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPlayerNames(!showPlayerNames)}
            className="gap-2"
          >
            {showPlayerNames ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showPlayerNames ? "Hide Names" : "Show Names"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLineup}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Formation Selector */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Select Formation
              </h3>
              <Badge variant="secondary" className="font-medium">
                {currentFormation.structure}
              </Badge>
            </div>

            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="attacking">Attacking</TabsTrigger>
                <TabsTrigger value="defensive">Defensive</TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formations.slice(0, 4).map((formation) => (
                    <FormationCard
                      key={formation.id}
                      formation={formation}
                      isSelected={selectedFormation === formation.id}
                      onSelect={setSelectedFormation}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="attacking" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formations
                    .filter((f) => f.difficulty !== "Easy")
                    .map((formation) => (
                      <FormationCard
                        key={formation.id}
                        formation={formation}
                        isSelected={selectedFormation === formation.id}
                        onSelect={setSelectedFormation}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="defensive" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formations
                    .filter((f) => f.difficulty === "Easy")
                    .map((formation) => (
                      <FormationCard
                        key={formation.id}
                        formation={formation}
                        isSelected={selectedFormation === formation.id}
                        onSelect={setSelectedFormation}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Football Pitch */}
          <FootballPitch />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={saveLineup}
              className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              size="lg"
            >
              <Save className="w-5 h-5" />
              Save Lineup
            </Button>
            <Button variant="outline" className="gap-2" size="lg">
              <Play className="w-5 h-5" />
              Simulate Match
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Formation Info */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Formation Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Formation:
                </span>
                <Badge variant="secondary">{currentFormation.structure}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Difficulty:
                </span>
                <Badge
                  className={getDifficultyColor(currentFormation.difficulty)}
                >
                  {currentFormation.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Defenders:
                </span>
                <span className="font-semibold">
                  {currentFormation.defenders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Midfielders:
                </span>
                <span className="font-semibold">
                  {currentFormation.midfielders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Forwards:</span>
                <span className="font-semibold">
                  {currentFormation.forwards}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {currentFormation.description}
              </p>
            </div>
          </Card>

          {/* Selected Players */}
          <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Starting XI
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(selectedPlayers).map(([position, player]) => (
                <div
                  key={position}
                  className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {player.jersey_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {position}
                      <Badge variant="outline" className="text-xs h-4">
                        {player.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(selectedPlayers).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">
                  <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No players selected</p>
                  <p className="text-xs">Drag players to positions</p>
                </div>
              )}
            </div>
          </Card>

          {/* Saved Lineups */}
          {savedLineups.length > 0 && (
            <Card className="p-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
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
        </div>
      </div>
    </div>
  );
};

const FormationCard = ({ formation, isSelected, onSelect }) => (
  <Card
    className={cn(
      "p-4 cursor-pointer transition-all duration-300 border-2",
      isSelected
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105"
        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
    )}
    onClick={() => onSelect(formation.id)}
  >
    <CardContent className="p-0 text-center">
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {formation.structure}
      </div>
      <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {formation.description}
      </div>
      <Badge
        variant="secondary"
        className={cn(
          "text-xs",
          formation.difficulty === "Easy" &&
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          formation.difficulty === "Medium" &&
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          formation.difficulty === "Hard" &&
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        )}
      >
        {formation.difficulty}
      </Badge>
    </CardContent>
  </Card>
);

const PlayerSpot = ({
  position,
  player,
  onSelect,
  availablePlayers,
  showName,
}) => (
  <div className="text-center group">
    <div
      className={cn(
        "w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-2xl transition-all duration-300 mx-auto mb-1 relative",
        player ? "shadow-lg scale-110" : "hover:scale-110"
      )}
      onClick={() => {
        if (availablePlayers.length > 0 && !player) {
          // Auto-select best available player for this position
          const bestPlayer = availablePlayers.sort(
            (a, b) => b.rating - a.rating
          )[0];
          if (bestPlayer) onSelect(bestPlayer);
        }
      }}
    >
      {player ? (
        <>
          <div className="text-xs md:text-sm font-bold text-blue-600">
            {player.jersey_number}
          </div>
          {player.rating >= 85 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
          )}
        </>
      ) : (
        <Shirt className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground opacity-60" />
      )}
    </div>

    {showName && player && (
      <div className="text-xs font-medium bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-full shadow-sm backdrop-blur-sm max-w-20 truncate">
        {player.name.split(" ")[0]}
      </div>
    )}

    {!player && (
      <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        {position}
      </div>
    )}
  </div>
);

export default LineupBuilder;
