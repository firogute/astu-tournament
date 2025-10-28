// components/manager/TeamManagement.tsx
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
  Shirt,
  Star,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Target,
  Zap,
  Shield,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  preferred_foot?: string;
  height_cm?: number;
}

interface NewPlayerForm {
  name: string;
  jersey_number: number;
  position: string;
  nationality: string;
  date_of_birth: string;
  preferred_foot: string;
  height_cm: number;
}

const TeamManagement = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);

  const [newPlayer, setNewPlayer] = useState<NewPlayerForm>({
    name: "",
    jersey_number: 1,
    position: "DF",
    nationality: "",
    date_of_birth: "",
    preferred_foot: "right",
    height_cm: 180,
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamRes, playersRes] = await Promise.all([
        apiClient.get("/manager/my-team"),
        apiClient.get("/manager/my-players"),
      ]);

      setTeam(teamRes.data.team);
      setPlayers(playersRes.data.players || []);
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    try {
      setAddingPlayer(true);

      const response = await apiClient.post("/manager/players", {
        name: newPlayer.name,
        jersey_number: newPlayer.jersey_number,
        position: newPlayer.position,
        nationality: newPlayer.nationality,
        date_of_birth: newPlayer.date_of_birth,
        preferred_foot: newPlayer.preferred_foot,
        height_cm: newPlayer.height_cm,
      });

      if (response.data.success) {
        // Refresh the players list
        await fetchTeamData();
        setAddPlayerOpen(false);
        resetNewPlayerForm();

        console.log("Player added successfully:", response.data.player);
      }
    } catch (error: any) {
      console.error("Failed to add player:", error);
      alert(
        `Failed to add player: ${error.response?.data?.error || error.message}`
      );
    } finally {
      setAddingPlayer(false);
    }
  };

  const resetNewPlayerForm = () => {
    setNewPlayer({
      name: "",
      jersey_number: 1,
      position: "DF",
      nationality: "",
      date_of_birth: "",
      preferred_foot: "right",
      height_cm: 180,
    });
  };

  const positions = [
    { value: "all", label: "All", icon: Users },
    { value: "GK", label: "GK", icon: Shield },
    { value: "DF", label: "DF", icon: Shield },
    { value: "MF", label: "MF", icon: Target },
    { value: "FW", label: "FW", icon: Zap },
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

  const getFormColor = (form: number) => {
    if (form >= 4.0) return "text-green-600";
    if (form >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateSquadStats = () => {
    const totalPlayers = players.length;
    const averageRating =
      players.reduce((acc, p) => acc + p.rating, 0) / totalPlayers || 0;
    const averageAge = 24.3;
    const totalGoals = players.reduce((acc, p) => acc + (p.goals || 0), 0);

    return { totalPlayers, averageRating, averageAge, totalGoals };
  };

  const squadStats = calculateSquadStats();

  if (loading) {
    return <TeamManagementSkeleton />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header - Improved mobile layout */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          {team?.logo && (
            <img
              src={team.logo}
              alt={team.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              {team?.name} Squad
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              Manage your team roster
            </p>
          </div>
        </div>

        {/* Action Buttons - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={addPlayerOpen} onOpenChange={setAddPlayerOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Player</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter player name"
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jersey_number">Jersey Number</Label>
                    <Input
                      id="jersey_number"
                      type="number"
                      min="1"
                      max="99"
                      value={newPlayer.jersey_number}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          jersey_number: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newPlayer.position}
                      onValueChange={(value) =>
                        setNewPlayer({ ...newPlayer, position: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GK">Goalkeeper</SelectItem>
                        <SelectItem value="DF">Defender</SelectItem>
                        <SelectItem value="MF">Midfielder</SelectItem>
                        <SelectItem value="FW">Forward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    placeholder="Country"
                    value={newPlayer.nationality}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        nationality: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newPlayer.date_of_birth}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min="150"
                      max="220"
                      value={newPlayer.height_cm}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          height_cm: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_foot">Preferred Foot</Label>
                  <Select
                    value={newPlayer.preferred_foot}
                    onValueChange={(value) =>
                      setNewPlayer({ ...newPlayer, preferred_foot: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddPlayerOpen(false);
                    resetNewPlayerForm();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPlayer}
                  disabled={addingPlayer || !newPlayer.name.trim()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {addingPlayer ? "Adding..." : "Add Player"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Squad Overview - Better mobile grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          icon={Users}
          value={squadStats.totalPlayers.toString()}
          label="Players"
          color="text-blue-600"
        />
        <StatCard
          icon={Star}
          value={squadStats.averageRating.toFixed(1)}
          label="Avg Rating"
          color="text-yellow-600"
        />
        <StatCard
          icon={TrendingUp}
          value={squadStats.totalGoals.toString()}
          label="Goals"
          color="text-green-600"
        />
        <StatCard
          icon={Calendar}
          value={squadStats.averageAge.toString()}
          label="Avg Age"
          color="text-purple-600"
        />
      </div>

      {/* Controls - Improved mobile layout */}
      <Card className="p-4 sm:p-6 mb-4 sm:mb-6 border-0 shadow-lg">
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
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {positions.map((position) => {
              const Icon = position.icon;
              return (
                <Button
                  key={position.value}
                  variant={
                    activeFilter === position.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setActiveFilter(position.value)}
                  className="whitespace-nowrap flex-shrink-0 gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {position.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Players Grid */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 h-10">
          <TabsTrigger
            value="all"
            className="text-xs sm:text-sm gap-1 sm:gap-2"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="starters"
            className="text-xs sm:text-sm gap-1 sm:gap-2"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Starters</span>
          </TabsTrigger>
          <TabsTrigger
            value="reserves"
            className="text-xs sm:text-sm gap-1 sm:gap-2"
          >
            <Shirt className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Reserves</span>
          </TabsTrigger>
          <TabsTrigger
            value="youth"
            className="text-xs sm:text-sm gap-1 sm:gap-2"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Youth</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 sm:space-y-4">
          {filteredPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              getPositionColor={getPositionColor}
              getRatingColor={getRatingColor}
              getFormColor={getFormColor}
            />
          ))}

          {filteredPlayers.length === 0 && (
            <Card className="p-8 text-center border-2 border-dashed">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No players found</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No players in the squad"}
              </p>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setAddPlayerOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Add Player
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="starters">
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Starting XI selection coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="reserves">
          <div className="text-center py-8 text-muted-foreground">
            <Shirt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Reserve players will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="youth">
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Youth team players coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <Card className="p-3 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
    <CardContent className="p-0">
      <Icon className={cn("w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2", color)} />
      <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">
        {label}
      </div>
    </CardContent>
  </Card>
);

const PlayerCard = ({
  player,
  getPositionColor,
  getRatingColor,
  getFormColor,
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        {/* Player Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {player.jersey_number}
          </div>
          {player.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Form: {player.form}/5</span>
              <span className="text-green-600">G: {player.goals || 0}</span>
              <span className="text-blue-600">A: {player.assists || 0}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {player.nationality && <span>{player.nationality}</span>}
            {player.preferred_foot && (
              <span>{player.preferred_foot} footed</span>
            )}
          </div>
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

const TeamManagementSkeleton = () => (
  <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
    {/* Header Skeleton */}
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 sm:flex-none sm:w-28" />
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-3">
          <CardContent className="p-0 text-center space-y-2">
            <Skeleton className="h-6 w-6 mx-auto" />
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Controls Skeleton */}
    <Skeleton className="h-20 w-full mb-4 rounded-lg" />

    {/* Players Skeleton */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export default TeamManagement;
