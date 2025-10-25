import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Manager = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 fade-in">
          Manager Dashboard
        </h1>
        <p className="text-xl text-muted-foreground fade-in">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12 fade-in">
        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-primary" />
            <div className="text-3xl font-bold">23</div>
          </div>
          <p className="text-sm text-muted-foreground">Squad Size</p>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">5</div>
          </div>
          <p className="text-sm text-muted-foreground">Matches Played</p>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="h-8 w-8 text-win" />
            <div className="text-3xl font-bold">4</div>
          </div>
          <p className="text-sm text-muted-foreground">Wins</p>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-accent" />
            <div className="text-3xl font-bold">13</div>
          </div>
          <p className="text-sm text-muted-foreground">Points</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Squad Management */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Squad Management
          </h2>
          <p className="text-muted-foreground mb-6">
            Manage your team roster, add new players, and update player information.
          </p>
          <div className="space-y-3">
            <Button className="w-full" variant="default">
              View Squad
            </Button>
            <Button className="w-full" variant="outline">
              Add New Player
            </Button>
            <Button className="w-full" variant="outline">
              Edit Players
            </Button>
          </div>
        </Card>

        {/* Match Lineup */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-secondary" />
            Match Lineup
          </h2>
          <p className="text-muted-foreground mb-6">
            Set your starting XI and formation for upcoming matches.
          </p>
          <div className="space-y-3">
            <Button className="w-full" variant="default">
              Set Lineup
            </Button>
            <Button className="w-full" variant="outline">
              View Formation
            </Button>
            <Button className="w-full" variant="outline">
              Substitute Strategy
            </Button>
          </div>
        </Card>
      </div>

      {/* Next Match */}
      <Card className="mt-8 p-8 bg-gradient-primary text-primary-foreground fade-in">
        <h2 className="text-2xl font-display font-bold mb-4">Next Match</h2>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="text-3xl font-bold mb-2">vs Computer Science</div>
            <div className="text-lg opacity-90">
              October 26, 2025 • 16:30 • ASTU Main Stadium
            </div>
          </div>
          <Button variant="secondary" size="lg">
            Prepare Lineup
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Manager;
