// components/manager/PlayerManagement.tsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Search,
  Filter,
  Shirt,
  Star,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
  rating: number;
  form: number;
  goals: number;
  assists: number;
  is_active: boolean;
  photo?: string;
  nationality?: string;
  date_of_birth?: string;
}

const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/manager/my-players");
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    { value: "all", label: "All Players" },
    { value: "GK", label: "Goalkeepers" },
    { value: "DF", label: "Defenders" },
    { value: "MF", label: "Midfielders" },
    { value: "FW", label: "Forwards" },
  ];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || player.position === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getPositionColor = (position: string) => {
    const colors = {
      GK: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300",
      DF: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300",
      MF: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300",
      FW: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300",
    };
    return (
      colors[position as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (rating >= 75) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    if (rating >= 65)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Player Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your squad, player profiles, and team selection
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600">
            <Plus className="w-4 h-4" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search players by name or position..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {positions.map((position) => (
              <Button
                key={position.value}
                variant={
                  activeFilter === position.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setActiveFilter(position.value)}
                className="whitespace-nowrap"
              >
                {position.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Players Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="starters">Starting XI</TabsTrigger>
          <TabsTrigger value="reserves">Reserves</TabsTrigger>
          <TabsTrigger value="youth">Youth</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              getPositionColor={getPositionColor}
              getRatingColor={getRatingColor}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Squad Summary */}
      <Card className="mt-8 p-6 border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <h3 className="text-xl font-bold mb-6">Squad Overview</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <SummaryCard
            icon={Users}
            title="Total Players"
            value={players.length.toString()}
            color="text-blue-400"
          />
          <SummaryCard
            icon={Star}
            title="Average Rating"
            value={(
              players.reduce((acc, p) => acc + p.rating, 0) / players.length ||
              0
            ).toFixed(1)}
            color="text-yellow-400"
          />
          <SummaryCard
            icon={TrendingUp}
            title="Team Value"
            value="€25.8M"
            color="text-green-400"
          />
          <SummaryCard
            icon={Calendar}
            title="Avg Age"
            value="24.3"
            color="text-purple-400"
          />
        </div>
      </Card>
    </div>
  );
};

const PlayerCard = ({ player, getPositionColor, getRatingColor }) => (
  <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center gap-6">
        {/* Player Number and Photo */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {player.jersey_number}
          </div>
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
              <Shirt className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-semibold text-xl text-slate-900 dark:text-white truncate">
              {player.name}
            </h3>
            <Badge
              variant="outline"
              className={cn(
                "font-medium border-2",
                getPositionColor(player.position)
              )}
            >
              {player.position}
            </Badge>
            <Badge className={cn("font-medium", getRatingColor(player.rating))}>
              <Star className="w-3 h-3 mr-1 fill-current" />
              {player.rating}
            </Badge>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Form:
              </span>
              <span className="text-sm font-semibold">{player.form}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Goals:
              </span>
              <span className="text-sm font-semibold text-green-600">
                {player.goals || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Assists:
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {player.assists || 0}
              </span>
            </div>
            {player.nationality && (
              <div className="text-sm text-muted-foreground">
                {player.nationality}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SummaryCard = ({ icon: Icon, title, value, color }) => (
  <Card className="bg-white/10 backdrop-blur-sm border-0">
    <CardContent className="p-4 text-center">
      <Icon className={cn("w-8 h-8 mx-auto mb-2", color)} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-300">{title}</div>
    </CardContent>
  </Card>
);

export default PlayerManagement;
