import { Player } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface TopScorersProps {
  players: Player[];
  type: 'goals' | 'assists';
}

export function TopScorers({ players, type }: TopScorersProps) {
  const sortedPlayers = [...players]
    .sort((a, b) => (type === 'goals' ? b.goals - a.goals : b.assists - a.assists))
    .slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-secondary" />
        <h3 className="text-xl font-display font-bold">
          Top {type === 'goals' ? 'Scorers' : 'Assists'}
        </h3>
      </div>

      <div className="space-y-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50 ${
              index === 0 ? 'bg-primary/5' : ''
            }`}
          >
            {/* Rank */}
            <div className={`text-2xl font-bold font-display min-w-8 ${
              index === 0 ? 'text-secondary' : 'text-muted-foreground'
            }`}>
              {index + 1}
            </div>

            {/* Player Photo */}
            <div className="text-3xl">{player.photo}</div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-muted-foreground">{player.team}</div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary font-display">
                {type === 'goals' ? player.goals : player.assists}
              </div>
              <div className="text-xs text-muted-foreground">
                {type === 'goals' ? 'goals' : 'assists'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
