import { matches, teams, players } from '@/lib/mockData';
import { MatchCard } from '@/components/MatchCard';
import { LeagueTable } from '@/components/LeagueTable';
import { TopScorers } from '@/components/TopScorers';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-stadium.jpg';

const Index = () => {
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'first_half' || m.status === 'second_half');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 3);
  const recentMatches = matches.filter(m => m.status === 'finished').slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 fade-in">
            The Final Year Showdown
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 fade-in">
            ASTU 4th Year Football Championship 2025
          </p>
          <Button size="lg" className="rounded-full shadow-glow hover-scale">
            View Full Schedule
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <section className="fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-3 w-3 bg-live rounded-full pulse-live" />
              <h2 className="text-3xl font-display font-bold">Live Matches</h2>
            </div>
            <div className="grid gap-6">
              {liveMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        <section className="fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-display font-bold">Upcoming Matches</h2>
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* Recent Results */}
        {recentMatches.length > 0 && (
          <section className="fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-display font-bold">Recent Results</h2>
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        {/* League Table & Top Scorers */}
        <section className="grid lg:grid-cols-3 gap-8 fade-in">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-display font-bold">League Standings</h2>
            </div>
            <LeagueTable teams={teams} />
          </div>

          <div className="space-y-8">
            <TopScorers players={players} type="goals" />
            <TopScorers players={players} type="assists" />
          </div>
        </section>

        {/* Tournament Info */}
        <section className="bg-gradient-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center fade-in shadow-glow">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Join the Championship
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Follow your favorite teams, track live scores, and never miss a moment
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" className="rounded-full">
              View Teams
            </Button>
            <Button variant="outline" size="lg" className="rounded-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Match Schedule
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
