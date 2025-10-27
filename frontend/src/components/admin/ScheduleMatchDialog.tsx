import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar, Plus, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface ScheduleMatchDialogProps {
  onSuccess?: () => void;
}

export function ScheduleMatchDialog({ onSuccess }: ScheduleMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    tournament_id: "",
    home_team_id: "",
    away_team_id: "",
    venue_id: "",
    match_date: "",
    match_time: "15:00",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsRes, teamsRes, venuesRes] = await Promise.all([
        apiClient.get("/tournaments"),
        apiClient.get("/teams"),
        apiClient
          .get("/venues")
          .catch(() => ({ data: { success: true, data: [] } })), // Handle 404
      ]);

      if (tournamentsRes.data.success) setTournaments(tournamentsRes.data.data);
      if (teamsRes.data.success) setTeams(teamsRes.data.data);
      if (venuesRes.data.success) setVenues(venuesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data");
      setTournaments([]);
      setTeams([]);
      setVenues([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.home_team_id === formData.away_team_id) {
      toast({
        title: "Error",
        description: "Home and away teams cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/admin/matches/schedule", {
        tournament_id: formData.tournament_id,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        venue_id: formData.venue_id,
        match_date: formData.match_date,
        match_time: formData.match_time,
      });

      if (response.data.success) {
        toast({
          title: "Match Scheduled",
          description: "Match has been scheduled successfully!",
        });
        setOpen(false);
        setFormData({
          tournament_id: "",
          home_team_id: "",
          away_team_id: "",
          venue_id: "",
          match_date: "",
          match_time: "15:00",
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to schedule match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4" />
          Schedule Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule New Match
          </DialogTitle>
          <DialogDescription>
            Create a new match fixture between two teams.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tournament">Tournament</Label>
            <Select
              value={formData.tournament_id}
              onValueChange={(value) =>
                setFormData({ ...formData, tournament_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tournament" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name} - {tournament.season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="home_team">Home Team</Label>
              <Select
                value={formData.home_team_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, home_team_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Home team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.short_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="away_team">Away Team</Label>
              <Select
                value={formData.away_team_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, away_team_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Away team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.short_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select
              value={formData.venue_id}
              onValueChange={(value) =>
                setFormData({ ...formData, venue_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="match_date">Match Date</Label>
              <Input
                id="match_date"
                type="date"
                value={formData.match_date}
                onChange={(e) =>
                  setFormData({ ...formData, match_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="match_time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Match Time
              </Label>
              <Input
                id="match_time"
                type="time"
                value={formData.match_time}
                onChange={(e) =>
                  setFormData({ ...formData, match_time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Match"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
