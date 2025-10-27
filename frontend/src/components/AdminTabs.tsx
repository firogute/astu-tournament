// components/AdminTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Trophy,
  Users,
  Calendar,
  Settings,
  Globe,
  Shield,
} from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import TournamentsTab from "./tabs/TournamentsTab";
import TeamsTab from "./tabs/TeamsTab";
import MatchesTab from "./tabs/MatchesTab";
import SystemTab from "./tabs/SystemTab";

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  systemSubTab: string;
  onSystemSubTabChange: (tab: string) => void;
  masterData: any;
  selectedTournament: any;
  searchTerm: string;
  onDataUpdate: () => void;
}

const AdminTabs = ({
  activeTab,
  onTabChange,
  systemSubTab,
  onSystemSubTabChange,
  masterData,
  selectedTournament,
  searchTerm,
  onDataUpdate,
}: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="flex w-full overflow-x-auto pb-2 sm:inline-flex sm:pb-0">
        <TabTrigger value="overview" icon={Zap} label="Overview" />
        <TabTrigger value="tournaments" icon={Trophy} label="Tournaments" />
        <TabTrigger value="teams" icon={Users} label="Teams" />
        <TabTrigger value="matches" icon={Calendar} label="Matches" />
        <TabTrigger value="system" icon={Settings} label="System" />
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab masterData={masterData} onDataUpdate={onDataUpdate} />
      </TabsContent>

      <TabsContent value="tournaments">
        <TournamentsTab
          tournaments={masterData?.tournaments}
          onDataUpdate={onDataUpdate}
        />
      </TabsContent>

      <TabsContent value="teams">
        <TeamsTab teams={masterData?.teams} onDataUpdate={onDataUpdate} />
      </TabsContent>

      <TabsContent value="matches">
        <MatchesTab
          matches={masterData?.matches}
          selectedTournament={selectedTournament}
          onDataUpdate={onDataUpdate}
        />
      </TabsContent>

      <TabsContent value="system">
        <SystemTab
          subTab={systemSubTab}
          onSubTabChange={onSystemSubTabChange}
        />
      </TabsContent>
    </Tabs>
  );
};

const TabTrigger = ({ value, icon: Icon, label }: any) => (
  <TabsTrigger
    value={value}
    className="flex-1 min-w-0 sm:flex-none text-xs sm:text-sm px-3 py-2"
  >
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
    <span className="truncate">{label}</span>
  </TabsTrigger>
);

export default AdminTabs;
