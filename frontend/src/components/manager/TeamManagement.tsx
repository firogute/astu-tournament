// components/manager/TeamManagement.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Target,
  Zap,
  Shield,
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
  goals: number;
  assists: number;
  is_active: boolean;
  photo?: string;
  nationality?: string;
  date_of_birth?: string;
  preferred_foot?: string;
  height_cm?: number;
}

const TeamManagement = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

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

  const positions = [
    { value: "all", label: "All Players", icon: Users },
    { value: "GK", label: "Goalkeepers", icon: Shield },
    { value: "DF", label: "Defenders", icon: Shield },
    { value: "MF", label: "Midfielders", icon: Target },
    { value: "FW", label: "Forwards", icon: Zap },
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
    const averageAge = 24.3; // This would be calculated from date_of_birth in real app
    const totalGoals = players.reduce((acc, p) => acc + (p.goals || 0), 0);

    return { totalPlayers, averageRating, averageAge, totalGoals };
  };

  const squadStats = calculateSquadStats();

  if (loading) {
    return <TeamManagementSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          {team?.logo && (
            <img
              src={team.logo}
              alt={team.name}
              className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700"
            />
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {team?.name} Squad
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your team roster and player information
            </p>
          </div>
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

      {/* Squad Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          value={squadStats.totalPlayers.toString()}
          label="Total Players"
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
          label="Total Goals"
          color="text-green-600"
        />
        <StatCard
          icon={Calendar}
          value={squadStats.averageAge.toString()}
          label="Avg Age"
          color="text-purple-600"
        />
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
                  className="whitespace-nowrap gap-2"
                >
                  <Icon className="w-4 h-4" />
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
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            <Users className="w-4 h-4" />
            All Players
          </TabsTrigger>
          <TabsTrigger value="starters" className="gap-2">
            <Star className="w-4 h-4" />
            Starting XI
          </TabsTrigger>
          <TabsTrigger value="reserves" className="gap-2">
            <Shirt className="w-4 h-4" />
            Reserves
          </TabsTrigger>
          <TabsTrigger value="youth" className="gap-2">
            <Zap className="w-4 h-4" />
            Youth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
            <Card className="p-12 text-center border-0 bg-slate-50 dark:bg-slate-800/50">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">No players found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No players in the squad"}
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Player
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="starters">
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Starting XI selection coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="reserves">
          <div className="text-center py-12 text-muted-foreground">
            <Shirt className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Reserve players will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="youth">
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Youth team players coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
    <CardContent className="p-0">
      <Icon className={cn("w-8 h-8 mx-auto mb-2", color)} />
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </CardContent>
  </Card>
);

const PlayerCard = ({
  player,
  getPositionColor,
  getRatingColor,
  getFormColor,
}) => (
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
              <span
                className={cn(
                  "text-sm font-semibold",
                  getFormColor(player.form)
                )}
              >
                {player.form}/5
              </span>
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
            {player.preferred_foot && (
              <div className="text-sm text-muted-foreground">
                {player.preferred_foot} footed
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
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TeamManagementSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <CardContent className="p-0 text-center space-y-2">
            <Skeleton className="h-8 w-8 mx-auto" />
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Skeleton className="h-20 w-full mb-6 rounded-xl" />
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export default TeamManagement;
