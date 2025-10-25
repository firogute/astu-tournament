import { Link } from 'react-router-dom';
import { Match } from '@/lib/mockData';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === 'live' || match.status === 'first_half' || match.status === 'second_half';
  const isFinished = match.status === 'finished';
  const isScheduled = match.status === 'scheduled';

  return (
    <Link to={`/match/${match.id}`}>
      <Card className="hover-lift p-6 cursor-pointer transition-all">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{match.date}</span>
            {!isLive && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{match.time}</span>
              </>
            )}
          </div>
          {isLive && (
            <Badge className="bg-live text-white pulse-live">
              <span className="font-bold">LIVE</span>
              <span className="ml-1">{match.minute}'</span>
            </Badge>
          )}
          {isFinished && (
            <Badge variant="secondary">FT</Badge>
          )}
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-4xl">{match.homeTeam.logo}</div>
            <div>
              <div className="font-display font-semibold text-lg">{match.homeTeam.name}</div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 mx-6">
            {isScheduled ? (
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
            ) : (
              <>
                <div className={`text-4xl font-bold font-display ${isLive ? 'score-pop text-primary' : ''}`}>
                  {match.homeScore}
                </div>
                <div className="text-2xl font-bold text-muted-foreground">-</div>
                <div className={`text-4xl font-bold font-display ${isLive ? 'score-pop text-primary' : ''}`}>
                  {match.awayScore}
                </div>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <div className="text-4xl">{match.awayTeam.logo}</div>
            <div className="text-right">
              <div className="font-display font-semibold text-lg">{match.awayTeam.name}</div>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
          <MapPin className="h-4 w-4" />
          <span>{match.venue}</span>
        </div>
      </Card>
    </Link>
  );
}
