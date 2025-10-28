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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
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
  defenders: number;
  midfielders: number;
  forwards: number;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const res = await apiClient.get("/manager/my-players");
      setAvailablePlayers(res.data.players || []);
    } catch (err) {
      console.error("Failed to fetch players:", err);
    }
  };

  const handlePlayerSelect = (pos: string, player: Player) => {
    setSelectedPlayers((prev) => ({ ...prev, [pos]: player }));
  };

  const clearLineup = () => setSelectedPlayers({});

  const saveLineup = () => {
    const lineup = {
      id: Date.now().toString(),
      name: `${
        formations.find((f) => f.id === selectedFormation)?.name
      } Lineup`,
      formation: formations.find((f) => f.id === selectedFormation),
      players: selectedPlayers,
      created: new Date().toISOString(),
    };
    setSavedLineups((prev) => [lineup, ...prev.slice(0, 4)]);
  };

  const currentFormation = formations.find((f) => f.id === selectedFormation)!;

  const lineupPlayers = Object.values(selectedPlayers).map((p) => ({
    id: p.id,
    name: showNames ? p.name : "",
    number: p.jersey_number,
    position: p.position,
  }));

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lineup Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Build your perfect starting XI
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNames(!showNames)}>
            {showNames ? (
              <>
                <EyeOff /> Hide Names
              </>
            ) : (
              <>
                <Eye /> Show Names
              </>
            )}
          </Button>
          <Button onClick={clearLineup}>
            <RotateCcw /> Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Formation Selector */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="p-4 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Target /> Formations
            </h3>
            <Tabs defaultValue="popular">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="attacking">Attacking</TabsTrigger>
                <TabsTrigger value="defensive">Defensive</TabsTrigger>
              </TabsList>
              <TabsContent value="popular" className="mt-3 space-y-2">
                {formations.map((f) => (
                  <Card
                    key={f.id}
                    className={`p-2 cursor-pointer border ${
                      f.id === selectedFormation
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedFormation(f.id)}
                  >
                    <CardContent className="text-center">{f.name}</CardContent>
                    <Badge className={getDifficultyColor(f.difficulty)}>
                      {f.difficulty}
                    </Badge>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Pitch */}
        <div className="lg:col-span-3">
          <Card className="p-4 shadow-xl">
            <SoccerLineup
              formation={currentFormation.structure}
              players={lineupPlayers}
              showNumbers
              responsive
            />
          </Card>
        </div>
      </div>

      {/* Selected Players & Saved Lineups */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Card className="p-4 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Users /> Starting XI
            </h3>
            {Object.keys(selectedPlayers).length === 0 ? (
              <p className="text-center text-muted-foreground">
                No players selected
              </p>
            ) : (
              Object.entries(selectedPlayers).map(([pos, p]) => (
                <div
                  key={pos}
                  className="flex items-center justify-between p-2 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <span>{p.jersey_number}</span>
                  <span>{p.name}</span>
                  <Badge>{p.rating}</Badge>
                </div>
              ))
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {savedLineups.length > 0 && (
            <Card className="p-4 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Zap /> Saved Lineups
              </h3>
              {savedLineups.map((l) => (
                <div
                  key={l.id}
                  className="p-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-xs flex justify-between">
                    {l.formation.structure}
                    <span>{new Date(l.created).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white flex-1"
          onClick={saveLineup}
        >
          <Save /> Save Lineup
        </Button>
        <Button className="flex-1">
          <Play /> Simulate Match
        </Button>
      </div>
    </div>
  );
};

export default LineupBuilder;
