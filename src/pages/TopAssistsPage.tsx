import { players } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Award, Target } from 'lucide-react';

const TopAssistsPage = () => {
  const sortedPlayers = [...players].sort((a, b) => b.assists - a.assists);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 fade-in flex items-center gap-3">
          <Award className="h-12 w-12 text-primary" />
          Top Assists
        </h1>
        <p className="text-xl text-muted-foreground fade-in">
          Leading playmakers and assist providers
        </p>
      </div>

      {/* Playmaker Leader */}
      {sortedPlayers[0] && (
        <Card className="mb-8 p-8 bg-gradient-primary text-primary-foreground fade-in shadow-glow">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Award className="h-20 w-20" />
              <div>
                <div className="text-sm uppercase tracking-wide opacity-90 mb-1">
                  Top Playmaker
                </div>
                <div className="text-4xl font-display font-bold">
                  {sortedPlayers[0].name}
                </div>
                <div className="text-lg opacity-90 mt-1">
                  {sortedPlayers[0].team}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">{sortedPlayers[0].assists}</div>
              <div className="text-lg opacity-90">Assists</div>
            </div>
          </div>
        </Card>
      )}

      {/* All Top Assist Providers */}
      <div className="grid gap-4 fade-in">
        {sortedPlayers.map((player, index) => (
          <Card
            key={player.id}
            className={`p-6 hover-lift transition-all ${
              index === 0 ? 'border-primary border-2' : ''
            }`}
          >
            <div className="flex items-center gap-6">
              {/* Rank */}
              <div className={`text-4xl font-bold font-display min-w-16 text-center ${
                index === 0 ? 'text-primary' :
                index === 1 ? 'text-muted-foreground' :
                index === 2 ? 'text-accent' :
                'text-muted-foreground/50'
              }`}>
                {index + 1}
              </div>

              {/* Player Photo */}
              <div className="text-5xl">{player.photo}</div>

              {/* Player Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-display font-bold">{player.name}</h3>
                <p className="text-muted-foreground">{player.team}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {player.goals} goals
                  </span>
                  <span>• {player.appearances} appearances</span>
                  <span>• {player.minutesPlayed} minutes</span>
                </div>
              </div>

              {/* Assists */}
              <div className="text-center min-w-24">
                <div className="text-5xl font-bold text-primary font-display">
                  {player.assists}
                </div>
                <div className="text-sm text-muted-foreground">assists</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopAssistsPage;
