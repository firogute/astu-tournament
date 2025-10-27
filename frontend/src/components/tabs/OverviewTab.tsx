// components/tabs/OverviewTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTournamentDialog } from "@/components/admin/CreateTournamentDialog";
import { CreateTeamDialog } from "@/components/admin/CreateTeamDialog";
import { CreatePlayerDialog } from "@/components/admin/CreatePlayerDialog";
import { ScheduleMatchDialog } from "@/components/admin/ScheduleMatchDialog";
import DataTable from "../DataTable";
import { Badge } from "@/components/ui/badge";
import { EditTournamentDialog } from "@/components/admin/EditTournamentDialog";

const OverviewTab = ({ masterData, onDataUpdate }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <CreateTournamentDialog onSuccess={onDataUpdate} />
        <CreateTeamDialog onSuccess={onDataUpdate} />
        <CreatePlayerDialog onSuccess={onDataUpdate} />
        <ScheduleMatchDialog onSuccess={onDataUpdate} />
      </div>

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
            title="tournaments"
            renderActions={(item: any) => (
              <EditTournamentDialog
                tournament={item}
                onSuccess={onDataUpdate}
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
