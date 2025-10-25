import { Team } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeagueTableProps {
  teams: Team[];
}

export function LeagueTable({ teams }: LeagueTableProps) {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center font-bold">#</TableHead>
              <TableHead className="font-bold">Team</TableHead>
              <TableHead className="text-center font-bold">P</TableHead>
              <TableHead className="text-center font-bold">W</TableHead>
              <TableHead className="text-center font-bold">D</TableHead>
              <TableHead className="text-center font-bold">L</TableHead>
              <TableHead className="text-center font-bold">GF</TableHead>
              <TableHead className="text-center font-bold">GA</TableHead>
              <TableHead className="text-center font-bold">GD</TableHead>
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => (
              <TableRow 
                key={team.id}
                className={`hover:bg-muted/50 transition-colors ${
                  index === 0 ? 'bg-primary/5' : ''
                }`}
              >
                <TableCell className="text-center font-bold">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{team.logo}</div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{team.played}</TableCell>
                <TableCell className="text-center text-win font-medium">{team.won}</TableCell>
                <TableCell className="text-center text-draw font-medium">{team.drawn}</TableCell>
                <TableCell className="text-center text-destructive font-medium">{team.lost}</TableCell>
                <TableCell className="text-center">{team.goalsFor}</TableCell>
                <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                <TableCell className={`text-center font-medium ${
                  team.goalDifference > 0 ? 'text-win' : 
                  team.goalDifference < 0 ? 'text-destructive' : ''
                }`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </TableCell>
                <TableCell className="text-center font-bold text-lg text-primary">
                  {team.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
