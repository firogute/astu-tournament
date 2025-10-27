import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  Trophy,
  Settings,
  Shield,
  UserPlus,
  Plus,
  Upload,
  Download,
  Edit3,
  Trash2,
  Zap,
  Globe,
  Star,
  Crown,
  Rocket,
  RefreshCw,
  Eye,
  EyeOff,
  MoreHorizontal,
  Search,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/api";

interface MasterData {
  tournaments: any[];
  teams: any[];
  players: any[];
  matches: any[];
  venues: any[];
  users: any[];
  standings: any[];
}

const AdminControlCenter = () => {
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/master-data");
      if (response.data.success) {
        setMasterData(response.data.data);
        if (response.data.data.tournaments.length > 0) {
          setSelectedTournament(response.data.data.tournaments[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ACTION HANDLERS
  const handleEditItem = (type: string, item: any) => {
    toast({
      title: `Edit ${type}`,
      description: `Editing ${item.name || item.email || "item"}`,
    });
  };

  const handleDeleteItem = (type: string, item: any) => {
    toast({
      title: `Delete ${type}`,
      description: `Are you sure you want to delete ${
        item.name || item.email || "this item"
      }?`,
      variant: "destructive",
    });
  };

  const handleAddItem = (type: string) => {
    toast({
      title: `Add ${type}`,
      description: `Opening ${type} creation form`,
    });
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: "Bulk Action",
      description: `Performing ${action} on selected items`,
    });
  };

  // MOBILE-FRIENDLY COMPONENTS
  const MobileCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
    onClick,
  }: any) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4"
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div
            className="p-3 rounded-full bg-opacity-10"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = "default",
  }: any) => (
    <Button
      variant={variant}
      className="w-full sm:w-auto justify-start gap-2 py-6 sm:py-2"
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );

  const DataTable = ({ data, columns, onEdit, onDelete, title }: any) => {
    if (!data || data.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No {title} found</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Mobile View */}
        <div className="sm:hidden space-y-2 p-4">
          {data.slice(0, 5).map((item: any) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  {columns.slice(0, 2).map((column: any) => (
                    <div key={column.key} className="text-sm">
                      <span className="font-medium text-muted-foreground">
                        {column.label}:
                      </span>{" "}
                      {column.render ? column.render(item) : item[column.key]}
                    </div>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop View */}
        <Table className="hidden sm:table">
          <TableHeader>
            <TableRow>
              {columns.map((column: any) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((item: any) => (
              <TableRow key={item.id}>
                {columns.map((column: any) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tournamentTeams =
    masterData?.teams.filter((team) =>
      masterData.tournament_teams?.some(
        (tt) =>
          tt.team_id === team.id && tt.tournament_id === selectedTournament?.id
      )
    ) || [];

  const tournamentMatches =
    masterData?.matches.filter(
      (match) => match.tournament_id === selectedTournament?.id
    ) || [];

  const filteredTeams = tournamentTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.short_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Control
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Complete system management
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Rocket className="w-3 h-3" />
                Super Admin
              </Badge>
              <Badge variant="outline" className="text-xs">
                {masterData?.tournaments.length} Tournaments
              </Badge>
              <Badge variant="outline" className="text-xs">
                {masterData?.teams.length} Teams
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none gap-2"
              onClick={fetchMasterData}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              onClick={() => handleAddItem("Tournament")}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Tournament</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MobileCard
            title="Tournaments"
            value={masterData?.tournaments.length}
            description="Active competitions"
            icon={Trophy}
            color="#F59E0B"
            onClick={() => setActiveTab("tournaments")}
          />
          <MobileCard
            title="Teams"
            value={masterData?.teams.length}
            description="Registered teams"
            icon={Users}
            color="#3B82F6"
            onClick={() => setActiveTab("teams")}
          />
          <MobileCard
            title="Matches"
            value={masterData?.matches.length}
            description="Scheduled games"
            icon={Calendar}
            color="#10B981"
            onClick={() => setActiveTab("matches")}
          />
          <MobileCard
            title="Players"
            value={masterData?.players.length}
            description="Active athletes"
            icon={UserPlus}
            color="#EF4444"
            onClick={() => setActiveTab("players")}
          />
        </div>

        {/* TOURNAMENT SELECTOR */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <Label className="text-sm font-medium">
                  Current Tournament:
                </Label>
              </div>
              <Select
                value={selectedTournament?.id}
                onValueChange={(value) => {
                  const tournament = masterData?.tournaments.find(
                    (t) => t.id === value
                  );
                  setSelectedTournament(tournament);
                }}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select Tournament" />
                </SelectTrigger>
                <SelectContent>
                  {masterData?.tournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name} - {tournament.season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTournament && (
                <Badge
                  variant={
                    selectedTournament.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedTournament.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search teams, players, matches..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-xs sm:text-sm py-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-xs sm:text-sm py-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm py-2">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">System</span>
              <span className="sm:hidden">Sys</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <ActionButton
                icon={Plus}
                label="Create Tournament"
                onClick={() => handleAddItem("Tournament")}
              />
              <ActionButton
                icon={Users}
                label="Add Team"
                onClick={() => handleAddItem("Team")}
              />
              <ActionButton
                icon={UserPlus}
                label="Add Player"
                onClick={() => handleAddItem("Player")}
              />
              <ActionButton
                icon={Calendar}
                label="Schedule Match"
                onClick={() => handleAddItem("Match")}
              />
              <ActionButton
                icon={Upload}
                label="Bulk Import"
                onClick={() => handleBulkAction("import")}
                variant="outline"
              />
              <ActionButton
                icon={Download}
                label="Export Data"
                onClick={() => handleBulkAction("export")}
                variant="outline"
              />
            </div>

            {/* RECENT ACTIVITY */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={masterData?.tournaments.slice(0, 5)}
                  columns={[
                    { key: "name", label: "Name" },
                    { key: "season", label: "Season" },
                    { key: "status", label: "Status" },
                  ]}
                  onEdit={(item: any) => handleEditItem("Tournament", item)}
                  onDelete={(item: any) => handleDeleteItem("Tournament", item)}
                  title="tournaments"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAMS TAB */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleAddItem("Team")} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Team
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction("teams-import")}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Bulk Import
              </Button>
            </div>

            <DataTable
              data={filteredTeams}
              columns={[
                { key: "name", label: "Team Name" },
                { key: "short_name", label: "Short Name" },
                { key: "department", label: "Department" },
              ]}
              onEdit={(item: any) => handleEditItem("Team", item)}
              onDelete={(item: any) => handleDeleteItem("Team", item)}
              title="teams"
            />
          </TabsContent>

          {/* MATCHES TAB */}
          <TabsContent value="matches" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleAddItem("Match")} className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Match
              </Button>
            </div>

            <DataTable
              data={tournamentMatches}
              columns={[
                {
                  key: "match",
                  label: "Match",
                  render: (item: any) =>
                    `${item.home_team?.short_name} vs ${item.away_team?.short_name}`,
                },
                {
                  key: "date",
                  label: "Date",
                  render: (item: any) =>
                    new Date(item.match_date).toLocaleDateString(),
                },
                { key: "status", label: "Status" },
              ]}
              onEdit={(item: any) => handleEditItem("Match", item)}
              onDelete={(item: any) => handleDeleteItem("Match", item)}
              title="matches"
            />
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ActionButton
                icon={UserPlus}
                label="Add User"
                onClick={() => handleAddItem("User")}
              />
              <ActionButton
                icon={Globe}
                label="Manage Venues"
                onClick={() => navigate("/admin/venues")}
              />
              <ActionButton
                icon={Shield}
                label="User Management"
                onClick={() => navigate("/admin/users")}
              />
              <ActionButton
                icon={Settings}
                label="System Settings"
                onClick={() => navigate("/admin/settings")}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Users</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={masterData?.users}
                  columns={[
                    { key: "email", label: "Email" },
                    { key: "role", label: "Role" },
                    {
                      key: "team",
                      label: "Team",
                      render: (item: any) => item.team?.name || "System",
                    },
                  ]}
                  onEdit={(item: any) => handleEditItem("User", item)}
                  onDelete={(item: any) => handleDeleteItem("User", item)}
                  title="users"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminControlCenter;
