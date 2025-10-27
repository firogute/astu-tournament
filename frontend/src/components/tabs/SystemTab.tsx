// components/tabs/SystemTab.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe, Shield, Settings } from "lucide-react";
import { UsersManagement } from "@/components/admin/system/UsersManagement";
import { VenuesManagement } from "@/components/admin/system/VenuesManagement";
import { UserManagementAdvanced } from "@/components/admin/system/UserManagementAdvanced";
import { SystemSettings } from "@/components/admin/system/SystemSettings";

interface SystemTabProps {
  subTab: string;
  onSubTabChange: (tab: string) => void;
}

const SystemTab = ({ subTab, onSubTabChange }: SystemTabProps) => {
  return (
    <div className="space-y-6">
      <div className="relative z-10">
        <Tabs
          value={subTab}
          onValueChange={onSubTabChange}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 gap-2 sm:flex sm:gap-1 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 py-2">
            <TabsTrigger
              value="users"
              className="flex-1 text-xs px-3 py-2 sm:px-4 sm:text-sm"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Users</span>
              <span className="xs:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="venues"
              className="flex-1 text-xs px-3 py-2 sm:px-4 sm:text-sm"
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Venues</span>
              <span className="xs:hidden">Venues</span>
            </TabsTrigger>
            <TabsTrigger
              value="user-management"
              className="flex-1 text-xs px-3 py-2 sm:px-4 sm:text-sm"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">User Mgmt</span>
              <span className="xs:hidden">Mgmt</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 text-xs px-3 py-2 sm:px-4 sm:text-sm"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Settings</span>
              <span className="xs:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="pt-4">
            <TabsContent value="users" className="space-y-4 m-0">
              <UsersManagement />
            </TabsContent>

            <TabsContent value="venues" className="space-y-4 m-0">
              <VenuesManagement />
            </TabsContent>

            <TabsContent value="user-management" className="space-y-4 m-0">
              <UserManagementAdvanced />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 m-0">
              <SystemSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemTab;
