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
  Upload,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Calendar,
  Shirt,
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
    { value: "all", label: "All" },
    { value: "GK", label: "GK" },
    { value: "DF", label: "DF" },
    { value: "MF", label: "MF" },
    { value: "FW", label: "FW" },
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header - Fixed for mobile */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Player Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your squad and player profiles
          </p>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Player</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters - Improved mobile layout */}
      <Card className="p-3 sm:p-4 border-0 shadow-lg">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search players..."
              className="pl-10 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Buttons - Horizontal scroll on mobile */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {positions.map((position) => (
              <Button
                key={position.value}
                variant={
                  activeFilter === position.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setActiveFilter(position.value)}
                className="whitespace-nowrap flex-shrink-0 text-xs px-3"
              >
                {position.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Players Grid - Single column on mobile */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full h-10">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="starters" className="text-xs sm:text-sm">
            Starters
          </TabsTrigger>
          <TabsTrigger value="reserves" className="text-xs sm:text-sm">
            Reserves
          </TabsTrigger>
          <TabsTrigger value="youth" className="text-xs sm:text-sm">
            Youth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                getPositionColor={getPositionColor}
                getRatingColor={getRatingColor}
              />
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <Card className="p-8 text-center border-2 border-dashed">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No players found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No players in the squad"}
              </p>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Player
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Squad Summary - Improved mobile layout */}
      <Card className="p-4 border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <h3 className="text-lg font-bold mb-3">Squad Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Users}
            title="Players"
            value={players.length.toString()}
            color="text-blue-400"
          />
          <SummaryCard
            icon={Star}
            title="Avg Rating"
            value={(
              players.reduce((acc, p) => acc + p.rating, 0) / players.length ||
              0
            ).toFixed(1)}
            color="text-yellow-400"
          />
          <SummaryCard
            icon={TrendingUp}
            title="Goals"
            value={players
              .reduce((acc, p) => acc + (p.goals || 0), 0)
              .toString()}
            color="text-green-400"
          />
          <SummaryCard
            icon={Calendar}
            title="Assists"
            value={players
              .reduce((acc, p) => acc + (p.assists || 0), 0)
              .toString()}
            color="text-purple-400"
          />
        </div>
      </Card>
    </div>
  );
};

const PlayerCard = ({ player, getPositionColor, getRatingColor }) => (
  <Card className="hover:shadow-lg transition-all duration-300 border-0">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Player Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {player.jersey_number}
          </div>
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <Shirt className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>

        {/* Player Info - Improved mobile layout */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base truncate flex-1 min-w-[120px]">
              {player.name}
            </h3>
            <Badge className={cn("text-xs", getRatingColor(player.rating))}>
              <Star className="w-3 h-3 mr-1 fill-current" />
              {player.rating}
            </Badge>
          </div>

          {/* Position and Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-xs border-2",
                getPositionColor(player.position)
              )}
            >
              {player.position}
            </Badge>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Form: {player.form}/5</span>
              <span className="text-green-600">G: {player.goals || 0}</span>
              <span className="text-blue-600">A: {player.assists || 0}</span>
            </div>
          </div>

          {/* Nationality if available */}
          {player.nationality && (
            <div className="text-xs text-muted-foreground">
              {player.nationality}
            </div>
          )}
        </div>

        {/* Actions - Vertical on mobile */}
        <div className="flex flex-col gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Eye className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SummaryCard = ({ icon: Icon, title, value, color }) => (
  <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
    <Icon className={cn("w-6 h-6 mx-auto mb-2", color)} />
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-xs text-slate-300">{title}</div>
  </div>
);

export default PlayerManagement;
