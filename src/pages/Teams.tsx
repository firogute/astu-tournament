import { teams } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight } from 'lucide-react';

const Teams = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-display font-bold mb-4 fade-in">
          Competing Teams
        </h1>
        <p className="text-xl text-muted-foreground fade-in">
          Meet the teams battling for the championship title
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team, index) => (
          <Card 
            key={team.id} 
            className="p-8 hover-lift cursor-pointer fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="text-center">
              {/* Team Logo */}
              <div className="text-7xl mb-6">{team.logo}</div>

              {/* Team Name */}
              <h2 className="text-2xl font-display font-bold mb-4">
                {team.name}
              </h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{team.points}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-win">{team.won}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{team.goalsFor}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
              </div>

              {/* View Details Button */}
              <Link to={`/team/${team.id}`}>
                <Button className="w-full" variant="outline">
                  View Team Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Championship Info */}
      <Card className="mt-16 p-8 bg-gradient-secondary text-secondary-foreground text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-display font-bold mb-4">
          Championship Glory Awaits
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Six departments competing for ultimate bragging rights. 
          Which team will be crowned the 4th Year Football Champions?
        </p>
      </Card>
    </div>
  );
};

export default Teams;
