// components/tabs/TeamsTab.tsx
import { CreateTeamDialog } from "@/components/admin/CreateTeamDialog";
import { EditTeamDialog } from "@/components/admin/EditTeamDialog";
import { DeleteTeamDialog } from "@/components/admin/DeleteTeamDialog";
import DataTable from "../DataTable";

const TeamsTab = ({ teams, onDataUpdate }: any) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <CreateTeamDialog onSuccess={onDataUpdate} />
      </div>

      <DataTable
        data={teams}
        columns={[
          { key: "name", label: "Team Name" },
          { key: "short_name", label: "Short Name" },
          { key: "department", label: "Department" },
        ]}
        title="teams"
        renderActions={(item: any) => (
          <div className="flex gap-1">
            <EditTeamDialog team={item} onSuccess={onDataUpdate} />
            <DeleteTeamDialog team={item} onSuccess={onDataUpdate} />
          </div>
        )}
      />
    </div>
  );
};

export default TeamsTab;
