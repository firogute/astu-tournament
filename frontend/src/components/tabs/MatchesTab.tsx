// components/tabs/MatchesTab.tsx
import { ScheduleMatchDialog } from "@/components/admin/ScheduleMatchDialog";
import { EditMatchDialog } from "@/components/admin/EditMatchDialog";
import { DeleteMatchDialog } from "@/components/admin/DeleteMatchDialog";
import DataTable from "../DataTable";

const MatchesTab = ({ matches, selectedTournament, onDataUpdate }: any) => {
  // Filter matches by selected tournament if one is selected
  const filteredMatches = selectedTournament
    ? matches?.filter(
        (match: any) => match.tournament_id === selectedTournament.id
      )
    : matches;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <ScheduleMatchDialog onSuccess={onDataUpdate} />
      </div>

      <DataTable
        data={filteredMatches}
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
            <EditMatchDialog match={item} onSuccess={onDataUpdate} />
            <DeleteMatchDialog match={item} onSuccess={onDataUpdate} />
          </div>
        )}
      />
    </div>
  );
};

export default MatchesTab;
