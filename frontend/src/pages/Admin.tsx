import { useState, useEffect, useRef } from "react";
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
  X,
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
import { CreateTournamentDialog } from "@/components/admin/CreateTournamentDialog";
import { CreateTeamDialog } from "@/components/admin/CreateTeamDialog";
import { CreatePlayerDialog } from "@/components/admin/CreatePlayerDialog";
import { ScheduleMatchDialog } from "@/components/admin/ScheduleMatchDialog";
import { EditTournamentDialog } from "@/components/admin/EditTournamentDialog";
import { EditTeamDialog } from "@/components/admin/EditTeamDialog";
import { DeleteTeamDialog } from "@/components/admin/DeleteTeamDialog";
import { EditMatchDialog } from "@/components/admin/EditMatchDialog";
import { DeleteMatchDialog } from "@/components/admin/DeleteMatchDialog";
import { UsersManagement } from "@/components/admin/system/UsersManagement";
import { VenuesManagement } from "@/components/admin/system/VenuesManagement";
import { UserManagementAdvanced } from "@/components/admin/system/UserManagementAdvanced";
import { SystemSettings } from "@/components/admin/system/SystemSettings";

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);
  const [systemSubTab, setSystemSubTab] = useState("users");

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Ultimate Search Functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    const results = [];
    const searchTermLower = term.toLowerCase();

    // Search across all data types
    if (masterData) {
      // Search tournaments
      results.push(
        ...(masterData.tournaments || [])
          .filter(
            (tournament) =>
              tournament.name.toLowerCase().includes(searchTermLower) ||
              tournament.season.toLowerCase().includes(searchTermLower) ||
              tournament.status.toLowerCase().includes(searchTermLower)
          )
          .map((item) => ({
            ...item,
            type: "tournament",
            icon: Trophy,
            displayName: item.name,
          }))
      );

      // Search teams
      results.push(
        ...(masterData.teams || [])
          .filter(
            (team) =>
              team.name.toLowerCase().includes(searchTermLower) ||
              team.short_name.toLowerCase().includes(searchTermLower) ||
              team.department?.toLowerCase().includes(searchTermLower)
          )
          .map((item) => ({
            ...item,
            type: "team",
            icon: Users,
            displayName: item.name,
          }))
      );

      // Search players
      results.push(
        ...(masterData.players || [])
          .filter(
            (player) =>
              player.name.toLowerCase().includes(searchTermLower) ||
              player.position?.toLowerCase().includes(searchTermLower) ||
              player.nationality?.toLowerCase().includes(searchTermLower)
          )
          .map((item) => ({
            ...item,
            type: "player",
            icon: UserPlus,
            displayName: item.name,
          }))
      );

      // Search matches
      results.push(
        ...(masterData.matches || [])
          .filter(
            (match) =>
              match.home_team?.name?.toLowerCase().includes(searchTermLower) ||
              match.away_team?.name?.toLowerCase().includes(searchTermLower) ||
              match.home_team?.short_name
                ?.toLowerCase()
                .includes(searchTermLower) ||
              match.away_team?.short_name
                ?.toLowerCase()
                .includes(searchTermLower) ||
              match.venue?.name?.toLowerCase().includes(searchTermLower) ||
              match.status?.toLowerCase().includes(searchTermLower)
          )
          .map((item) => ({
            ...item,
            type: "match",
            icon: Calendar,
            displayName: `${item.home_team?.short_name} vs ${item.away_team?.short_name}`,
          }))
      );

      // Search users
      results.push(
        ...(masterData.users || [])
          .filter(
            (user) =>
              user.email.toLowerCase().includes(searchTermLower) ||
              user.role.toLowerCase().includes(searchTermLower) ||
              user.team?.name?.toLowerCase().includes(searchTermLower)
          )
          .map((item) => ({
            ...item,
            type: "user",
            icon: Users,
            displayName: item.email,
          }))
      );
    }

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (result: any) => {
    // Navigate to relevant tab based on type
    setActiveTab(result.type === "user" ? "system" : result.type + "s");
    setShowSearchResults(false);
    setSearchTerm("");

    toast({
      title: "Navigating",
      description: `Opening ${result.type}: ${result.displayName}`,
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const filterDataBySearch = (data: any[] | undefined, category: string) => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();

    switch (category) {
      case "teams":
        return data.filter(
          (item) =>
            item.name?.toLowerCase().includes(term) ||
            item.short_name?.toLowerCase().includes(term) ||
            item.department?.toLowerCase().includes(term)
        );

      case "players":
        return data.filter(
          (item) =>
            item.name?.toLowerCase().includes(term) ||
            item.position?.toLowerCase().includes(term) ||
            item.nationality?.toLowerCase().includes(term)
        );

      case "matches":
        return data.filter(
          (item) =>
            item.home_team?.name?.toLowerCase().includes(term) ||
            item.away_team?.name?.toLowerCase().includes(term) ||
            item.venue?.name?.toLowerCase().includes(term) ||
            item.status?.toLowerCase().includes(term)
        );

      case "tournaments":
        return data.filter(
          (item) =>
            item.name?.toLowerCase().includes(term) ||
            item.season?.toLowerCase().includes(term) ||
            item.status?.toLowerCase().includes(term)
        );

      case "users":
        return data.filter(
          (item) =>
            item.email?.toLowerCase().includes(term) ||
            item.role?.toLowerCase().includes(term) ||
            item.team?.name?.toLowerCase().includes(term)
        );

      case "all":
      default:
        return data.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(term)
        );
    }
  };

  const getFilteredData = () => {
    if (!masterData)
      return {
        tournaments: [],
        teams: [],
        matches: [],
        players: [],
        users: [],
      };

    const baseFiltered = {
      tournaments:
        (masterData.tournaments || []).filter(
          (t) => !selectedTournament || t.id === selectedTournament.id
        ) || [],
      teams: masterData.teams || [],
      matches:
        (masterData.matches || []).filter(
          (m) =>
            !selectedTournament || m.tournament_id === selectedTournament.id
        ) || [],
      players: masterData.players || [],
      users: masterData.users || [],
    };

    if (!searchTerm.trim()) return baseFiltered;

    // Apply search filtering based on active tab or selected category
    const category = searchCategory === "all" ? activeTab : searchCategory;

    // Ensure the category exists in baseFiltered and is an array
    const categoryData = baseFiltered[category as keyof typeof baseFiltered];

    if (!categoryData || !Array.isArray(categoryData)) {
      return baseFiltered;
    }

    return {
      ...baseFiltered,
      [category]: filterDataBySearch(categoryData, category),
    };
  };

  const filteredData = getFilteredData();

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

  const DataTable = ({
    data,
    columns,
    onEdit,
    onDelete,
    title,
    renderActions,
  }: any) => {
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
          {data.map((item: any) => (
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
                <div className="flex gap-1">
                  {renderActions ? (
                    renderActions(item)
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
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
            {data.map((item: any) => (
              <TableRow key={item.id}>
                {columns.map((column: any) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-1">
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
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
                {masterData?.tournaments?.length || 0} Tournaments
              </Badge>
              <Badge variant="outline" className="text-xs">
                {masterData?.teams?.length || 0} Teams
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
            <CreateTournamentDialog onSuccess={fetchMasterData} />
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MobileCard
            title="Tournaments"
            value={masterData?.tournaments?.length || 0}
            description="Active competitions"
            icon={Trophy}
            color="#F59E0B"
            onClick={() => setActiveTab("tournaments")}
          />
          <MobileCard
            title="Teams"
            value={masterData?.teams?.length || 0}
            description="Registered teams"
            icon={Users}
            color="#3B82F6"
            onClick={() => setActiveTab("teams")}
          />
          <MobileCard
            title="Matches"
            value={masterData?.matches?.length || 0}
            description="Scheduled games"
            icon={Calendar}
            color="#10B981"
            onClick={() => setActiveTab("matches")}
          />
          <MobileCard
            title="Players"
            value={masterData?.players?.length || 0}
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
                  const tournament = masterData?.tournaments?.find(
                    (t) => t.id === value
                  );
                  setSelectedTournament(tournament);
                }}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select Tournament" />
                </SelectTrigger>
                <SelectContent>
                  {masterData?.tournaments?.map((tournament) => (
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
        <div ref={searchRef} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tournaments, teams, players, matches, users..."
                className="pl-10 pr-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm && setShowSearchResults(true)}
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer hover:text-foreground"
                  onClick={clearSearch}
                />
              )}
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>

          {/* SEARCH RESULTS */}
          {showSearchResults && searchResults.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-xl border-2 border-blue-200 animate-in fade-in-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Search Results</h4>
                    <Badge variant="secondary" className="text-xs">
                      {searchResults.length} results
                    </Badge>
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <result.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.displayName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {result.type}
                          </Badge>
                          {result.season && (
                            <span className="text-xs text-muted-foreground">
                              {result.season}
                            </span>
                          )}
                          {result.status && (
                            <span className="text-xs text-muted-foreground">
                              {result.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showSearchResults && searchTerm && searchResults.length === 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl animate-in fade-in-50">
              <CardContent className="p-6 text-center">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No results found for "{searchTerm}"
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching for tournaments, teams, players, or matches
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="flex w-full overflow-x-auto pb-2 sm:inline-flex sm:pb-0">
            <TabsTrigger
              value="overview"
              className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="tournaments"
              className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate">Tournaments</span>
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate">Teams</span>
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate">Matches</span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate">System</span>
            </TabsTrigger>
          </TabsList>

          {/* TOURNAMENTS TAB */}
          <TabsContent value="tournaments" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <CreateTournamentDialog onSuccess={fetchMasterData} />
              <Button
                variant="outline"
                onClick={() => handleBulkAction("tournaments-export")}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export Tournaments
              </Button>
            </div>

            <DataTable
              data={filteredData.tournaments}
              columns={[
                { key: "name", label: "Name" },
                { key: "season", label: "Season" },
                {
                  key: "status",
                  label: "Status",
                  render: (item: any) => (
                    <Badge
                      variant={
                        item.status === "active"
                          ? "default"
                          : item.status === "completed"
                          ? "secondary"
                          : item.status === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {item.status}
                    </Badge>
                  ),
                },
                {
                  key: "dates",
                  label: "Dates",
                  render: (item: any) =>
                    `${new Date(
                      item.start_date
                    ).toLocaleDateString()} - ${new Date(
                      item.end_date
                    ).toLocaleDateString()}`,
                },
              ]}
              title="tournaments"
              renderActions={(item: any) => (
                <EditTournamentDialog
                  tournament={item}
                  onSuccess={fetchMasterData}
                  onDelete={() => {
                    fetchMasterData();
                    toast({
                      title: "Tournament Deleted",
                      description: `${item.name} has been removed successfully`,
                    });
                  }}
                />
              )}
            />
          </TabsContent>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <CreateTournamentDialog onSuccess={fetchMasterData} />
              <CreateTeamDialog onSuccess={fetchMasterData} />
              <CreatePlayerDialog onSuccess={fetchMasterData} />
              <ScheduleMatchDialog onSuccess={fetchMasterData} />
            </div>

            {/* RECENT ACTIVITY */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={masterData?.tournaments?.slice(0, 5) || []}
                  columns={[
                    { key: "name", label: "Name" },
                    { key: "season", label: "Season" },
                    {
                      key: "status",
                      label: "Status",
                      render: (item: any) => (
                        <Badge
                          variant={
                            item.status === "active"
                              ? "default"
                              : item.status === "completed"
                              ? "secondary"
                              : item.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                      ),
                    },
                  ]}
                  onEdit={(item: any) => handleEditItem("Tournament", item)}
                  onDelete={(item: any) => handleDeleteItem("Tournament", item)}
                  title="tournaments"
                  renderActions={(item: any) => (
                    <EditTournamentDialog
                      tournament={item}
                      onSuccess={fetchMasterData}
                      onDelete={() => {
                        fetchMasterData();
                        toast({
                          title: "Tournament Deleted",
                          description: `${item.name} has been removed successfully`,
                        });
                      }}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAMS TAB */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <CreateTeamDialog onSuccess={fetchMasterData} />
            </div>

            <DataTable
              data={filteredData.teams}
              columns={[
                { key: "name", label: "Team Name" },
                { key: "short_name", label: "Short Name" },
                { key: "department", label: "Department" },
              ]}
              title="teams"
              renderActions={(item: any) => (
                <div className="flex gap-1">
                  <EditTeamDialog team={item} onSuccess={fetchMasterData} />
                  <DeleteTeamDialog team={item} onSuccess={fetchMasterData} />
                </div>
              )}
            />
          </TabsContent>

          {/* MATCHES TAB */}
          <TabsContent value="matches" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <ScheduleMatchDialog onSuccess={fetchMasterData} />
            </div>

            <DataTable
              data={filteredData.matches}
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
              title="matches"
              renderActions={(item: any) => (
                <div className="flex gap-1">
                  <EditMatchDialog match={item} onSuccess={fetchMasterData} />
                  <DeleteMatchDialog match={item} onSuccess={fetchMasterData} />
                </div>
              )}
            />
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="space-y-4">
            {/* SYSTEM SUB-TABS */}
            <Tabs
              value={systemSubTab}
              onValueChange={setSystemSubTab}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <TabsTrigger value="users" className="text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="venues" className="text-xs sm:text-sm">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Venues
                </TabsTrigger>
                <TabsTrigger
                  value="user-management"
                  className="text-xs sm:text-sm"
                >
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  User Mgmt
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* SUB-TAB CONTENTS */}
              <TabsContent value="users" className="space-y-4">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="venues" className="space-y-4">
                <VenuesManagement />
              </TabsContent>

              <TabsContent value="user-management" className="space-y-4">
                <UserManagementAdvanced />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <SystemSettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminControlCenter;
