// components/MatchSelector.jsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MatchSelector = ({
  liveMatches,
  selectedMatch,
  setSelectedMatch,
  selectedMatchData,
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-3">Select Active Match</h2>
          <Select value={selectedMatch} onValueChange={setSelectedMatch}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a match to commentate" />
            </SelectTrigger>
            <SelectContent>
              {liveMatches.map((match) => (
                <SelectItem key={match.id} value={match.id}>
                  {match.home_team?.name} vs {match.away_team?.name} -{" "}
                  {new Date(match.match_date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMatchData && (
          <div className="text-center sm:text-right">
            <Badge variant="secondary" className="text-sm">
              {selectedMatchData.home_team?.name} vs{" "}
              {selectedMatchData.away_team?.name}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedMatchData.venue?.name}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchSelector;
