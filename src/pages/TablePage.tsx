import { teams } from '@/lib/mockData';
import { LeagueTable } from '@/components/LeagueTable';
import { Card } from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';

const TablePage = () => {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  const leader = sortedTeams[0];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 fade-in flex items-center gap-3">
          <TrendingUp className="h-12 w-12 text-primary" />
          League Standings
        </h1>
        <p className="text-xl text-muted-foreground fade-in">
          Current tournament table and team rankings
        </p>
      </div>

      {/* Leader Highlight */}
      <Card className="mb-8 p-8 bg-gradient-primary text-primary-foreground fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <Award className="h-16 w-16" />
            <div>
              <div className="text-sm uppercase tracking-wide opacity-90 mb-1">
                Current Leader
              </div>
              <div className="text-4xl font-display font-bold flex items-center gap-3">
                <span className="text-5xl">{leader.logo}</span>
                {leader.name}
              </div>
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">{leader.points}</div>
              <div className="text-sm opacity-90">Points</div>
            </div>
            <div>
              <div className="text-4xl font-bold">+{leader.goalDifference}</div>
              <div className="text-sm opacity-90">GD</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{leader.won}</div>
              <div className="text-sm opacity-90">Wins</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Full Table */}
      <div className="fade-in">
        <LeagueTable teams={teams} />
      </div>

      {/* Legend */}
      <Card className="mt-8 p-6 fade-in">
        <h3 className="font-display font-semibold mb-4">Table Legend</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">P:</span>
            <span className="text-muted-foreground">Played</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">W:</span>
            <span className="text-muted-foreground">Won</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">D:</span>
            <span className="text-muted-foreground">Drawn</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">L:</span>
            <span className="text-muted-foreground">Lost</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">GF:</span>
            <span className="text-muted-foreground">Goals For</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">GA:</span>
            <span className="text-muted-foreground">Goals Against</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">GD:</span>
            <span className="text-muted-foreground">Goal Difference</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Pts:</span>
            <span className="text-muted-foreground">Points</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TablePage;
