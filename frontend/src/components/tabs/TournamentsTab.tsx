// components/tabs/TournamentsTab.tsx
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CreateTournamentDialog } from "@/components/admin/CreateTournamentDialog";
import DataTable from "../DataTable";
import { Badge } from "@/components/ui/badge";
import { EditTournamentDialog } from "@/components/admin/EditTournamentDialog";

const TournamentsTab = ({ tournaments, onDataUpdate }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <CreateTournamentDialog onSuccess={onDataUpdate} />
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Tournaments
        </Button>
      </div>

      <DataTable
        data={tournaments}
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
              `${new Date(item.start_date).toLocaleDateString()} - ${new Date(
                item.end_date
              ).toLocaleDateString()}`,
          },
        ]}
        title="tournaments"
        renderActions={(item: any) => (
          <EditTournamentDialog tournament={item} onSuccess={onDataUpdate} />
        )}
      />
    </div>
  );
};

export default TournamentsTab;
