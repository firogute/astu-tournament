import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Bell,
  Globe,
  Database,
  Save,
  RotateCcw,
  Mail,
  Calendar,
  Download,
} from "lucide-react";

export const SystemSettings = () => {
  return (
    <div className="space-y-6">
      {/* Settings header bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-card p-4 rounded-lg border">
        <div className="space-y-1">
          <h3 className="font-semibold">System Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Manage global system settings and preferences
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="Tournament Manager" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time (EST)</SelectItem>
                  <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  <SelectItem value="cet">
                    Central European Time (CET)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="maintenance" className="text-base">
                Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Put the site in maintenance mode
              </p>
            </div>
            <Switch id="maintenance" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="emailNotifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Send email alerts for important events
              </p>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="matchReminders" className="text-base">
                Match Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Notify users before matches start
              </p>
            </div>
            <Switch id="matchReminders" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="scoreUpdates" className="text-base">
                Live Score Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Push notifications for live scores
              </p>
            </div>
            <Switch id="scoreUpdates" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" placeholder="smtp.example.com" />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input id="smtpPort" type="number" placeholder="587" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input id="smtpUser" placeholder="username" />
            </div>
            <div>
              <Label htmlFor="smtpPass">SMTP Password</Label>
              <Input id="smtpPass" type="password" placeholder="••••••••" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tournament Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultDuration">
                Default Match Duration (minutes)
              </Label>
              <Input id="defaultDuration" type="number" defaultValue="90" />
            </div>
            <div>
              <Label htmlFor="maxPlayers">Max Players Per Team</Label>
              <Input id="maxPlayers" type="number" defaultValue="25" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="autoStandings" className="text-base">
                Auto-update Standings
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically update standings after matches
              </p>
            </div>
            <Switch id="autoStandings" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2 h-12">
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
            <Button variant="outline" className="gap-2 h-12">
              <Database className="w-4 h-4" />
              Backup Database
            </Button>
          </div>
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div>
                <Label className="text-base">System Cache</Label>
                <p className="text-sm text-muted-foreground">
                  Clear cached data for better performance
                </p>
              </div>
              <Button variant="destructive" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
