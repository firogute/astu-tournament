import { useParams, Link } from 'react-router-dom';
import { matches, players } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy } from 'lucide-react';
import { LeagueTable } from '@/components/LeagueTable';
import { teams } from '@/lib/mockData';

const MatchDetails = () => {
  const { id } = useParams();
  const match = matches.find(m => m.id === id);

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Match Not Found</h2>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isLive = match.status === 'live' || match.status === 'first_half' || match.status === 'second_half';
  const isFinished = match.status === 'finished';

  // Mock lineup data
  const homeLineup = [
    { id: 'h1', name: 'Alemayehu T.', number: 1, position: 'GK' },
    { id: 'h2', name: 'Bekele M.', number: 2, position: 'DF' },
    { id: 'h3', name: 'Gebre K.', number: 5, position: 'DF' },
    { id: 'h4', name: 'Tadesse H.', number: 6, position: 'DF' },
    { id: 'h5', name: 'Yohannes A.', number: 3, position: 'DF' },
    { id: 'h6', name: 'Biniam H.', number: 7, position: 'MF' },
    { id: 'h7', name: 'Daniel W.', number: 8, position: 'MF' },
    { id: 'h8', name: 'Ephrem T.', number: 11, position: 'MF' },
    { id: 'h9', name: 'Fitsum G.', number: 10, position: 'FW' },
    { id: 'h10', name: 'Abebe K.', number: 9, position: 'FW' },
    { id: 'h11', name: 'Girma S.', number: 14, position: 'FW' },
  ];

  const awayLineup = [
    { id: 'a1', name: 'Haile G.', number: 1, position: 'GK' },
    { id: 'a2', name: 'Isaac M.', number: 2, position: 'DF' },
    { id: 'a3', name: 'John K.', number: 4, position: 'DF' },
    { id: 'a4', name: 'Kebede A.', number: 5, position: 'DF' },
    { id: 'a5', name: 'Lemma T.', number: 3, position: 'DF' },
    { id: 'a6', name: 'Meseret H.', number: 6, position: 'MF' },
    { id: 'a7', name: 'Negash B.', number: 8, position: 'MF' },
    { id: 'a8', name: 'Omar S.', number: 10, position: 'MF' },
    { id: 'a9', name: 'Dawit T.', number: 9, position: 'FW' },
    { id: 'a10', name: 'Pawlos A.', number: 7, position: 'FW' },
    { id: 'a11', name: 'Robel M.', number: 11, position: 'FW' },
  ];

  const homeSubs = [
    { name: 'Samuel K.', number: 12 },
    { name: 'Tesfaye M.', number: 15 },
    { name: 'Yared B.', number: 16 },
  ];

  const awaySubs = [
    { name: 'Mikael A.', number: 12 },
    { name: 'Nathan G.', number: 13 },
    { name: 'Solomon H.', number: 18 },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link to="/">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </Button>
      </Link>

      {/* Match Header */}
      <Card className="p-8 mb-8 fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{match.date}</span>
            {!isLive && (
              <>
                <Clock className="h-5 w-5 text-muted-foreground ml-4" />
                <span className="text-muted-foreground">{match.time}</span>
              </>
            )}
            <MapPin className="h-5 w-5 text-muted-foreground ml-4" />
            <span className="text-muted-foreground">{match.venue}</span>
          </div>
          {isLive && (
            <Badge className="bg-live text-white pulse-live text-lg px-4 py-2">
              <span className="font-bold">LIVE</span>
              <span className="ml-2">{match.minute}'</span>
            </Badge>
          )}
          {isFinished && <Badge variant="secondary" className="text-lg px-4 py-2">Full Time</Badge>}
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <Link to={`/team/${match.homeTeam.id}`} className="hover-scale">
              <div className="text-6xl">{match.homeTeam.logo}</div>
            </Link>
            <div>
              <Link to={`/team/${match.homeTeam.id}`}>
                <h2 className="text-3xl font-display font-bold hover:text-primary transition-colors">
                  {match.homeTeam.name}
                </h2>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-8 mx-12">
            <div className="text-7xl font-bold font-display text-primary">
              {match.homeScore}
            </div>
            <div className="text-4xl font-bold text-muted-foreground">-</div>
            <div className="text-7xl font-bold font-display text-primary">
              {match.awayScore}
            </div>
          </div>

          <div className="flex items-center gap-6 flex-1 flex-row-reverse">
            <Link to={`/team/${match.awayTeam.id}`} className="hover-scale">
              <div className="text-6xl">{match.awayTeam.logo}</div>
            </Link>
            <div className="text-right">
              <Link to={`/team/${match.awayTeam.id}`}>
                <h2 className="text-3xl font-display font-bold hover:text-primary transition-colors">
                  {match.awayTeam.name}
                </h2>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="fade-in">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="h2h">Head to Head</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Match Stats Overview */}
              <Card className="p-6">
                <h3 className="text-xl font-display font-bold mb-6">Match Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{match.stats.possession[0]}%</span>
                      <span className="text-sm text-muted-foreground">Possession</span>
                      <span className="font-medium">{match.stats.possession[1]}%</span>
                    </div>
                    <div className="flex gap-1">
                      <Progress value={match.stats.possession[0]} className="flex-1" />
                      <Progress value={match.stats.possession[1]} className="flex-1 rotate-180" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{match.stats.shots[0]}</span>
                      <span className="text-sm text-muted-foreground">Total Shots</span>
                      <span className="font-medium">{match.stats.shots[1]}</span>
                    </div>
                    <div className="flex gap-1">
                      <Progress value={(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1])) * 100} className="flex-1" />
                      <Progress value={(match.stats.shots[1] / (match.stats.shots[0] + match.stats.shots[1])) * 100} className="flex-1 rotate-180" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{match.stats.shotsOnTarget[0]}</span>
                      <span className="text-sm text-muted-foreground">Shots on Target</span>
                      <span className="font-medium">{match.stats.shotsOnTarget[1]}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{match.stats.corners[0]}</span>
                      <span className="text-sm text-muted-foreground">Corners</span>
                      <span className="font-medium">{match.stats.corners[1]}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{match.stats.fouls[0]}</span>
                      <span className="text-sm text-muted-foreground">Fouls</span>
                      <span className="font-medium">{match.stats.fouls[1]}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Event Timeline */}
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-6">Match Events</h3>
              <div className="space-y-4">
                {match.events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="mt-1">{event.minute}'</Badge>
                    <div className="flex-1">
                      <div className="font-semibold capitalize">
                        {event.type.replace('_', ' ')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.playerName}
                        {event.assistName && ` (Assist: ${event.assistName})`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Lineups Tab */}
        <TabsContent value="lineups">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Home Team */}
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">{match.homeTeam.logo}</span>
                {match.homeTeam.name}
              </h3>

              {/* Formation Visual */}
              <div className="bg-primary/5 rounded-lg p-6 mb-6 aspect-[3/4] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="text-center text-sm text-muted-foreground mb-4">4-3-3</div>
                
                {/* Pitch lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                <div className="absolute top-0 left-1/2 bottom-0 w-px bg-border" />
                
                {/* Starting XI positions */}
                <div className="relative h-full flex flex-col justify-around">
                  {/* Goalkeeper */}
                  <div className="flex justify-center">
                    <div className="bg-card p-2 rounded-lg text-center shadow-sm">
                      <div className="font-bold text-sm">{homeLineup[0].number}</div>
                      <div className="text-xs">{homeLineup[0].name.split(' ')[0]}</div>
                    </div>
                  </div>
                  
                  {/* Defenders */}
                  <div className="flex justify-around">
                    {homeLineup.slice(1, 5).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Midfielders */}
                  <div className="flex justify-around">
                    {homeLineup.slice(5, 8).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Forwards */}
                  <div className="flex justify-around">
                    {homeLineup.slice(8, 11).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Substitutes */}
              <div>
                <h4 className="font-semibold mb-3">Substitutes</h4>
                <div className="space-y-2">
                  {homeSubs.map(player => (
                    <div key={player.number} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Badge variant="outline">{player.number}</Badge>
                      <span>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Away Team */}
            <Card className="p-6">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">{match.awayTeam.logo}</span>
                {match.awayTeam.name}
              </h3>

              {/* Formation Visual */}
              <div className="bg-secondary/5 rounded-lg p-6 mb-6 aspect-[3/4] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent" />
                <div className="text-center text-sm text-muted-foreground mb-4">4-3-3</div>
                
                {/* Pitch lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                <div className="absolute top-0 left-1/2 bottom-0 w-px bg-border" />
                
                {/* Starting XI positions */}
                <div className="relative h-full flex flex-col justify-around">
                  {/* Goalkeeper */}
                  <div className="flex justify-center">
                    <div className="bg-card p-2 rounded-lg text-center shadow-sm">
                      <div className="font-bold text-sm">{awayLineup[0].number}</div>
                      <div className="text-xs">{awayLineup[0].name.split(' ')[0]}</div>
                    </div>
                  </div>
                  
                  {/* Defenders */}
                  <div className="flex justify-around">
                    {awayLineup.slice(1, 5).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Midfielders */}
                  <div className="flex justify-around">
                    {awayLineup.slice(5, 8).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Forwards */}
                  <div className="flex justify-around">
                    {awayLineup.slice(8, 11).map(player => (
                      <div key={player.id} className="bg-card p-2 rounded-lg text-center shadow-sm">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-xs">{player.name.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Substitutes */}
              <div>
                <h4 className="font-semibold mb-3">Substitutes</h4>
                <div className="space-y-2">
                  {awaySubs.map(player => (
                    <div key={player.number} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <Badge variant="outline">{player.number}</Badge>
                      <span>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card className="p-8">
            <h3 className="text-2xl font-display font-bold mb-8">Detailed Statistics</h3>
            <div className="space-y-6">
              {[
                { label: 'Ball Possession', home: match.stats.possession[0], away: match.stats.possession[1], suffix: '%' },
                { label: 'Total Shots', home: match.stats.shots[0], away: match.stats.shots[1] },
                { label: 'Shots on Target', home: match.stats.shotsOnTarget[0], away: match.stats.shotsOnTarget[1] },
                { label: 'Shots off Target', home: match.stats.shots[0] - match.stats.shotsOnTarget[0], away: match.stats.shots[1] - match.stats.shotsOnTarget[1] },
                { label: 'Blocked Shots', home: 3, away: 2 },
                { label: 'Corner Kicks', home: match.stats.corners[0], away: match.stats.corners[1] },
                { label: 'Offsides', home: 2, away: 4 },
                { label: 'Fouls', home: match.stats.fouls[0], away: match.stats.fouls[1] },
                { label: 'Yellow Cards', home: match.stats.yellowCards[0], away: match.stats.yellowCards[1] },
                { label: 'Red Cards', home: match.stats.redCards[0], away: match.stats.redCards[1] },
                { label: 'Pass Accuracy', home: 84, away: 78, suffix: '%' },
                { label: 'Attacks', home: 67, away: 52 },
                { label: 'Dangerous Attacks', home: 34, away: 28 },
              ].map((stat, index) => {
                const total = stat.home + stat.away;
                const homePercent = total > 0 ? (stat.home / total) * 100 : 50;
                const awayPercent = total > 0 ? (stat.away / total) * 100 : 50;

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-lg">{stat.home}{stat.suffix || ''}</span>
                      <span className="text-muted-foreground font-medium">{stat.label}</span>
                      <span className="font-bold text-lg">{stat.away}{stat.suffix || ''}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-primary/20 rounded-full overflow-hidden h-3">
                        <div 
                          className="bg-primary h-full rounded-full transition-all" 
                          style={{ width: `${homePercent}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-secondary/20 rounded-full overflow-hidden h-3 flex flex-row-reverse">
                        <div 
                          className="bg-secondary h-full rounded-full transition-all" 
                          style={{ width: `${awayPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* H2H Tab */}
        <TabsContent value="h2h">
          <Card className="p-8">
            <h3 className="text-2xl font-display font-bold mb-8">Head to Head History</h3>
            
            {/* H2H Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center bg-primary/5">
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-sm text-muted-foreground">{match.homeTeam.name} Wins</div>
              </Card>
              <Card className="p-6 text-center bg-muted">
                <div className="text-4xl font-bold mb-2">1</div>
                <div className="text-sm text-muted-foreground">Draws</div>
              </Card>
              <Card className="p-6 text-center bg-secondary/5">
                <div className="text-4xl font-bold text-secondary mb-2">2</div>
                <div className="text-sm text-muted-foreground">{match.awayTeam.name} Wins</div>
              </Card>
            </div>

            {/* Previous Matches */}
            <h4 className="font-semibold mb-4">Previous Encounters</h4>
            <div className="space-y-3">
              {[
                { date: '2024-09-15', homeScore: 2, awayScore: 1, competition: 'Championship' },
                { date: '2024-05-20', homeScore: 1, awayScore: 1, competition: 'Championship' },
                { date: '2024-02-10', homeScore: 3, awayScore: 2, competition: 'Cup' },
                { date: '2023-11-05', homeScore: 0, awayScore: 2, competition: 'Championship' },
                { date: '2023-08-12', homeScore: 2, awayScore: 0, competition: 'Championship' },
              ].map((game, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{game.date}</span>
                    <Badge variant="outline">{game.competition}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{match.homeTeam.name}</span>
                    <div className="flex items-center gap-3 px-4 py-2 bg-background rounded">
                      <span className="font-bold text-lg">{game.homeScore}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="font-bold text-lg">{game.awayScore}</span>
                    </div>
                    <span className="font-medium">{match.awayTeam.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table">
          <Card className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-display font-bold">Tournament Standings</h3>
            </div>
            <LeagueTable teams={teams} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchDetails;
