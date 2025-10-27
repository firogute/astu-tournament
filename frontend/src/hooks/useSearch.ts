// hooks/useSearch.ts
import { useState } from "react";
import { Trophy, Users, UserPlus, Calendar } from "lucide-react";

export const useSearch = (masterData: any, toast: any) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    const results = [];
    const searchTermLower = term.toLowerCase();

    if (masterData) {
      // Search tournaments
      results.push(
        ...(masterData.tournaments || [])
          .filter(
            (tournament: any) =>
              tournament.name.toLowerCase().includes(searchTermLower) ||
              tournament.season.toLowerCase().includes(searchTermLower) ||
              tournament.status.toLowerCase().includes(searchTermLower)
          )
          .map((item: any) => ({
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
            (team: any) =>
              team.name.toLowerCase().includes(searchTermLower) ||
              team.short_name.toLowerCase().includes(searchTermLower) ||
              team.department?.toLowerCase().includes(searchTermLower)
          )
          .map((item: any) => ({
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
            (player: any) =>
              player.name.toLowerCase().includes(searchTermLower) ||
              player.position?.toLowerCase().includes(searchTermLower) ||
              player.nationality?.toLowerCase().includes(searchTermLower)
          )
          .map((item: any) => ({
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
            (match: any) =>
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
          .map((item: any) => ({
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
            (user: any) =>
              user.email.toLowerCase().includes(searchTermLower) ||
              user.role.toLowerCase().includes(searchTermLower) ||
              user.team?.name?.toLowerCase().includes(searchTermLower)
          )
          .map((item: any) => ({
            ...item,
            type: "user",
            icon: Users,
            displayName: item.email,
          }))
      );
    }

    setSearchResults(results.slice(0, 8));
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (result: any) => {
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

  return {
    searchTerm,
    searchResults,
    showSearchResults,
    searchCategory,
    setSearchCategory,
    handleSearch,
    clearSearch,
    handleSearchResultClick,
  };
};
