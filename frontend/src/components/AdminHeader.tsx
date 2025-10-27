// components/AdminHeader.tsx
import { Crown, Rocket, RefreshCw, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTournamentDialog } from "@/components/admin/CreateTournamentDialog";

interface AdminHeaderProps {
  masterData: any;
  onRefresh: () => void;
}

const AdminHeader = ({ masterData, onRefresh }: AdminHeaderProps) => {
  return (
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
          onClick={onRefresh}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <CreateTournamentDialog onSuccess={onRefresh} />
      </div>
    </div>
  );
};

export default AdminHeader;
