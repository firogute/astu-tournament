import { useParams, Link } from 'react-router-dom';
import { players, matches } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Award, AlertCircle, Clock } from 'lucide-react';

const PlayerProfile = () => {
  const { id } = useParams();
  const player = players.find(p => p.id === id);

  if (!player) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Player Not Found</h2>
          <Link to="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculate additional stats
  const avgMinutesPerGame = player.appearances > 0 ? Math.round(player.minutesPlayed / player.appearances) : 0;
  const goalsPerGame = player.appearances > 0 ? (player.goals / player.appearances).toFixed(2) : '0.00';
  const assistsPerGame = player.appearances > 0 ? (player.assists / player.appearances).toFixed(2) : '0.00';

  // Mock match log data
  const matchLog = [
    { id: 'm1', date: '2025-10-25', opponent: 'Computer Science', result: 'W 2-1', goals: 2, assists: 0, cards: 0, minutes: 90 },
    { id: 'm2', date: '2025-10-22', opponent: 'Information Systems', result: 'W 3-1', goals: 1, assists: 1, cards: 0, minutes: 90 },
    { id: 'm3', date: '2025-10-19', opponent: 'Network Engineering', result: 'D 1-1', goals: 1, assists: 0, cards: 1, minutes: 85 },
    { id: 'm4', date: '2025-10-15', opponent: 'Information Technology', result: 'W 2-0', goals: 0, assists: 1, cards: 0, minutes: 78 },
    { id: 'm5', date: '2025-10-12', opponent: 'Cybersecurity', result: 'W 4-0', goals: 2, assists: 1, cards: 0, minutes: 90 },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to={`/team/${player.teamId}`}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Button>
      </Link>

      {/* Player Header */}
      <Card className="p-8 mb-8 fade-in bg-gradient-secondary text-secondary-foreground">
        <div className="flex items-center justify-between flex-wrap gap-8">
          <div className="flex items-center gap-8">
            <div className="text-9xl">{player.photo}</div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Badge className="text-2xl px-4 py-2 bg-secondary-foreground text-secondary">
                  #{player.jerseyNumber}
                </Badge>
                <Badge variant="outline" className="text-lg px-3 py-1 border-secondary-foreground">
                  {player.position}
                </Badge>
              </div>
              <h1 className="text-5xl font-display font-bold mb-2">{player.name}</h1>
              <Link to={`/team/${player.teamId}`}>
                <p className="text-xl opacity-90 hover:opacity-100 transition-opacity">
                  {player.team}
                </p>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold">{player.goals}</div>
              <div className="text-sm opacity-90 mt-1">Goals</div>
            </div>
            <div>
              <div className="text-5xl font-bold">{player.assists}</div>
              <div className="text-sm opacity-90 mt-1">Assists</div>
            </div>
            <div>
              <div className="text-5xl font-bold">{player.appearances}</div>
              <div className="text-sm opacity-90 mt-1">Apps</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8 fade-in">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-primary" />
            <div className="text-3xl font-bold">{goalsPerGame}</div>
          </div>
          <p className="text-sm text-muted-foreground">Goals per Game</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">{assistsPerGame}</div>
          </div>
          <p className="text-sm text-muted-foreground">Assists per Game</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 text-accent" />
            <div className="text-3xl font-bold">{avgMinutesPerGame}</div>
          </div>
          <p className="text-sm text-muted-foreground">Avg Minutes</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div className="text-3xl font-bold">{player.yellowCards}</div>
          </div>
          <p className="text-sm text-muted-foreground">Yellow Cards</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 fade-in">
          {/* Match Log */}
          <Card className="p-8">
            <h2 className="text-2xl font-display font-bold mb-6">Match Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Opponent</th>
                    <th className="text-left py-3 px-2">Result</th>
                    <th className="text-center py-3 px-2">⚽</th>
                    <th className="text-center py-3 px-2">🎯</th>
                    <th className="text-center py-3 px-2">🟨</th>
                    <th className="text-center py-3 px-2">⏱️</th>
                  </tr>
                </thead>
                <tbody>
                  {matchLog.map((match, index) => (
                    <tr key={match.id} className={`border-b hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{match.date}</td>
                      <td className="py-3 px-2 font-medium">{match.opponent}</td>
                      <td className="py-3 px-2">
                        <Badge variant={match.result.startsWith('W') ? 'default' : match.result.startsWith('D') ? 'secondary' : 'outline'}>
                          {match.result}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {match.goals > 0 && <span className="font-bold text-primary">{match.goals}</span>}
                        {match.goals === 0 && <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {match.assists > 0 && <span className="font-bold text-secondary">{match.assists}</span>}
                        {match.assists === 0 && <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {match.cards > 0 && <span className="text-yellow-500">●</span>}
                        {match.cards === 0 && <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-3 px-2 text-center text-sm">{match.minutes}'</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Performance Analysis */}
          <Card className="p-8">
            <h2 className="text-2xl font-display font-bold mb-6">Performance Analysis</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Goal Scoring</span>
                  <span className="text-muted-foreground">85%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Playmaking</span>
                  <span className="text-muted-foreground">78%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-secondary rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Work Rate</span>
                  <span className="text-muted-foreground">92%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Discipline</span>
                  <span className="text-muted-foreground">88%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8 fade-in">
          {/* Season Statistics */}
          <Card className="p-6">
            <h3 className="text-xl font-display font-bold mb-6">Season Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Appearances</span>
                <span className="font-bold text-lg">{player.appearances}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Minutes Played</span>
                <span className="font-bold text-lg">{player.minutesPlayed}'</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Goals</span>
                <span className="font-bold text-lg text-primary">{player.goals}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Assists</span>
                <span className="font-bold text-lg text-secondary">{player.assists}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Yellow Cards</span>
                <span className="font-bold text-lg text-yellow-500">{player.yellowCards}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Red Cards</span>
                <span className="font-bold text-lg text-destructive">{player.redCards}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Goal Contributions</span>
                <span className="font-bold text-lg">{player.goals + player.assists}</span>
              </div>
            </div>
          </Card>

          {/* Rankings */}
          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <h3 className="text-xl font-display font-bold mb-4">Tournament Rankings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="opacity-90">Goals</span>
                <Badge className="bg-primary-foreground text-primary">
                  #{players.sort((a, b) => b.goals - a.goals).findIndex(p => p.id === player.id) + 1}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Assists</span>
                <Badge className="bg-primary-foreground text-primary">
                  #{players.sort((a, b) => b.assists - a.assists).findIndex(p => p.id === player.id) + 1}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Minutes</span>
                <Badge className="bg-primary-foreground text-primary">
                  #{players.sort((a, b) => b.minutesPlayed - a.minutesPlayed).findIndex(p => p.id === player.id) + 1}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Team Link */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Team</h3>
            <Link to={`/team/${player.teamId}`}>
              <Button className="w-full" variant="outline">
                View {player.team} Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
