// components/TournamentSelector.tsx
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TournamentSelectorProps {
  tournaments: any[];
  selectedTournament: any;
  onTournamentChange: (tournament: any) => void;
}

const TournamentSelector = ({
  tournaments,
  selectedTournament,
  onTournamentChange,
}: TournamentSelectorProps) => {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-primary" />
            <Label className="text-sm font-medium">Current Tournament:</Label>
          </div>
          <Select
            value={selectedTournament?.id}
            onValueChange={(value) => {
              const tournament = tournaments?.find((t) => t.id === value);
              onTournamentChange(tournament);
            }}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent>
              {tournaments?.map((tournament) => (
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
                  : selectedTournament.status === "completed"
                  ? "secondary"
                  : selectedTournament.status === "cancelled"
                  ? "destructive"
                  : "outline"
              }
            >
              {selectedTournament.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentSelector;
