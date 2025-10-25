import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, Settings, Shield } from 'lucide-react';

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 fade-in flex items-center gap-3">
          <Shield className="h-12 w-12 text-primary" />
          Admin Control Panel
        </h1>
        <p className="text-xl text-muted-foreground fade-in">
          Tournament management and configuration
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 fade-in">
        <Card className="p-6 hover-lift cursor-pointer">
          <Trophy className="h-12 w-12 text-secondary mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">Tournament</h3>
          <p className="text-sm text-muted-foreground">Setup & configuration</p>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">Teams</h3>
          <p className="text-sm text-muted-foreground">Manage all teams</p>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer">
          <Calendar className="h-12 w-12 text-accent mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">Matches</h3>
          <p className="text-sm text-muted-foreground">Schedule matches</p>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-display font-bold text-lg mb-2">Settings</h3>
          <p className="text-sm text-muted-foreground">System settings</p>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Team Management */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6">Team Management</h2>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-5 w-5" />
              View All Teams
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Add New Team
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Edit Team Details
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Manage Players
            </Button>
          </div>
        </Card>

        {/* Match Management */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6">Match Management</h2>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule New Match
            </Button>
            <Button className="w-full justify-start" variant="outline">
              View All Matches
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Edit Match Details
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Set Venues & Times
            </Button>
          </div>
        </Card>

        {/* User Management */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6">User Management</h2>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-5 w-5" />
              Manage Managers
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Manage Commentators
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Create Admin Account
            </Button>
            <Button className="w-full justify-start" variant="outline">
              View Access Logs
            </Button>
          </div>
        </Card>

        {/* Tournament Settings */}
        <Card className="p-8 fade-in">
          <h2 className="text-2xl font-display font-bold mb-6">Tournament Settings</h2>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Trophy className="mr-2 h-5 w-5" />
              Tournament Rules
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Points System
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Season Dates
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Trophy Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
