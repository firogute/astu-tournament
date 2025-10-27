// AdminControlCenter.tsx
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminData } from "@/hooks/useAdminData";
import { useSearch } from "@/hooks/useSearch";
import AdminHeader from "@/components/AdminHeader";
import QuickStats from "@/components/QuickStats";
import TournamentSelector from "@/components/TournamentSelector";
import SearchSection from "@/components/SearchSection";
import AdminTabs from "@/components/AdminTabs";

const AdminControlCenter = () => {
  const { toast } = useToast();
  const {
    masterData,
    loading,
    selectedTournament,
    setSelectedTournament,
    fetchMasterData,
  } = useAdminData();

  const {
    searchTerm,
    searchResults,
    showSearchResults,
    searchCategory,
    setSearchCategory,
    handleSearch,
    clearSearch,
    handleSearchResultClick,
  } = useSearch(masterData, toast);

  const [activeTab, setActiveTab] = useState("overview");
  const [systemSubTab, setSystemSubTab] = useState("users");
  const searchRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader masterData={masterData} onRefresh={fetchMasterData} />

        <QuickStats masterData={masterData} onTabChange={setActiveTab} />

        <TournamentSelector
          tournaments={masterData?.tournaments}
          selectedTournament={selectedTournament}
          onTournamentChange={setSelectedTournament}
        />

        <SearchSection
          ref={searchRef}
          searchTerm={searchTerm}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          onSearch={handleSearch}
          onClearSearch={clearSearch}
          onSearchResultClick={handleSearchResultClick}
        />

        <AdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          systemSubTab={systemSubTab}
          onSystemSubTabChange={setSystemSubTab}
          masterData={masterData}
          selectedTournament={selectedTournament}
          searchTerm={searchTerm}
          onDataUpdate={fetchMasterData}
        />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
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

export default AdminControlCenter;
