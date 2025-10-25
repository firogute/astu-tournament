import { useParams, Link } from 'react-router-dom';
import { teams, matches, players } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { MatchCard } from '@/components/MatchCard';

const TeamProfile = () => {
  const { id } = useParams();
  const team = teams.find(t => t.id === id);

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Team Not Found</h2>
          <Link to="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const teamPlayers = players.filter(p => p.teamId === id);
  const teamMatches = matches.filter(m => 
    m.homeTeam.id === id || m.awayTeam.id === id
  );
  const upcomingMatches = teamMatches.filter(m => m.status === 'scheduled');
  const recentMatches = teamMatches.filter(m => m.status === 'finished');

  // Group players by position
  const goalkeepers = teamPlayers.filter(p => p.position === 'GK');
  const defenders = teamPlayers.filter(p => p.position === 'DF');
  const midfielders = teamPlayers.filter(p => p.position === 'MF');
  const forwards = teamPlayers.filter(p => p.position === 'FW');

  // Calculate season stats
  const totalGoals = teamPlayers.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = teamPlayers.reduce((sum, p) => sum + p.assists, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to="/teams">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
      </Link>

      {/* Team Header */}
      <Card className="p-8 mb-8 fade-in bg-gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div className="flex items-center gap-8">
            <div className="text-9xl">{team.logo}</div>
            <div>
              <h1 className="text-5xl font-display font-bold mb-2">{team.name}</h1>
              <div className="flex items-center gap-4 text-lg opacity-90">
                <span>Position: #{teams.findIndex(t => t.id === id) + 1}</span>
                <span>•</span>
                <span>{team.points} Points</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold">{team.played}</div>
              <div className="text-sm opacity-90">Played</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{team.won}</div>
              <div className="text-sm opacity-90">Won</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{team.goalsFor}</div>
              <div className="text-sm opacity-90">Goals</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8 fade-in">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-8 w-8 text-win" />
            <div className="text-3xl font-bold text-win">{team.won}</div>
          </div>
          <p className="text-sm text-muted-foreground">Wins</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-draw" />
            <div className="text-3xl font-bold text-draw">{team.drawn}</div>
          </div>
          <p className="text-sm text-muted-foreground">Draws</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-destructive" />
            <div className="text-3xl font-bold text-destructive">{team.lost}</div>
          </div>
          <p className="text-sm text-muted-foreground">Losses</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <div className={`text-3xl font-bold ${team.goalDifference > 0 ? 'text-win' : team.goalDifference < 0 ? 'text-destructive' : ''}`}>
              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Goal Difference</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Squad */}
        <div className="lg:col-span-2 space-y-8 fade-in">
          <Card className="p-8">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Full Squad
            </h2>

            {/* Goalkeepers */}
            {goalkeepers.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">Goalkeepers</h3>
                <div className="space-y-3">
                  {goalkeepers.map(player => (
                    <Link key={player.id} to={`/player/${player.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
                        <Badge variant="outline" className="w-12 justify-center">
                          {player.jerseyNumber}
                        </Badge>
                        <div className="text-3xl">{player.photo}</div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.appearances} apps • {player.minutesPlayed} mins
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Clean Sheets</div>
                          <div className="font-bold">3</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Defenders */}
            {defenders.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">Defenders</h3>
                <div className="space-y-3">
                  {defenders.map(player => (
                    <Link key={player.id} to={`/player/${player.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
                        <Badge variant="outline" className="w-12 justify-center">
                          {player.jerseyNumber}
                        </Badge>
                        <div className="text-3xl">{player.photo}</div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.appearances} apps • {player.minutesPlayed} mins
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Goals</div>
                            <div className="font-bold">{player.goals}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Assists</div>
                            <div className="font-bold">{player.assists}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Midfielders */}
            {midfielders.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">Midfielders</h3>
                <div className="space-y-3">
                  {midfielders.map(player => (
                    <Link key={player.id} to={`/player/${player.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
                        <Badge variant="outline" className="w-12 justify-center">
                          {player.jerseyNumber}
                        </Badge>
                        <div className="text-3xl">{player.photo}</div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.appearances} apps • {player.minutesPlayed} mins
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Goals</div>
                            <div className="font-bold">{player.goals}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Assists</div>
                            <div className="font-bold">{player.assists}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Forwards */}
            {forwards.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4 text-muted-foreground">Forwards</h3>
                <div className="space-y-3">
                  {forwards.map(player => (
                    <Link key={player.id} to={`/player/${player.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
                        <Badge variant="outline" className="w-12 justify-center">
                          {player.jerseyNumber}
                        </Badge>
                        <div className="text-3xl">{player.photo}</div>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.appearances} apps • {player.minutesPlayed} mins
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Goals</div>
                            <div className="font-bold">{player.goals}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Assists</div>
                            <div className="font-bold">{player.assists}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 fade-in">
          {/* Upcoming Fixtures */}
          {upcomingMatches.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Fixtures
              </h3>
              <div className="space-y-3">
                {upcomingMatches.slice(0, 3).map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </Card>
          )}

          {/* Recent Results */}
          {recentMatches.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                Recent Results
              </h3>
              <div className="space-y-3">
                {recentMatches.slice(0, 3).map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </Card>
          )}

          {/* Team Statistics */}
          <Card className="p-6">
            <h3 className="text-xl font-display font-bold mb-4">Season Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Goals</span>
                <span className="font-bold text-lg">{team.goalsFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Goals Conceded</span>
                <span className="font-bold text-lg">{team.goalsAgainst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-bold text-lg">
                  {team.played > 0 ? Math.round((team.won / team.played) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Goals/Game</span>
                <span className="font-bold text-lg">
                  {team.played > 0 ? (team.goalsFor / team.played).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
