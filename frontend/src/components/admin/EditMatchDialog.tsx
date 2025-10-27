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
import { Edit3, Calendar, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface EditMatchDialogProps {
  match: any;
  onSuccess?: () => void;
}

export function EditMatchDialog({ match, onSuccess }: EditMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    venue_id: "",
    match_date: "",
    match_time: "15:00",
    status: "scheduled",
    home_score: 0,
    away_score: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (match && open) {
      fetchData();
      setFormData({
        home_team_id: match.home_team_id || "",
        away_team_id: match.away_team_id || "",
        venue_id: match.venue_id || "",
        match_date: match.match_date ? match.match_date.split("T")[0] : "",
        match_time: match.match_time || "15:00",
        status: match.status || "scheduled",
        home_score: match.home_score || 0,
        away_score: match.away_score || 0,
      });
    }
  }, [match, open]);

  const fetchData = async () => {
    try {
      const [teamsRes, venuesRes] = await Promise.all([
        apiClient.get("/teams"),
        apiClient
          .get("/venues")
          .catch(() => ({ data: { success: true, data: [] } })),
      ]);

      if (teamsRes.data.success) setTeams(teamsRes.data.data);
      if (venuesRes.data.success) setVenues(venuesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data");
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
      const response = await apiClient.put(`/matches/${match.id}`, formData);

      if (response.data.success) {
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Edit3 className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Match
          </DialogTitle>
          <DialogDescription>
            Update match details and scores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Home Team</Label>
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
              <Label>Away Team</Label>
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
            <Label>Venue</Label>
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
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Match Date
              </Label>
              <Input
                type="date"
                value={formData.match_date}
                onChange={(e) =>
                  setFormData({ ...formData, match_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Match Time
              </Label>
              <Input
                type="time"
                value={formData.match_time}
                onChange={(e) =>
                  setFormData({ ...formData, match_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Home Score</Label>
              <Input
                type="number"
                value={formData.home_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    home_score: parseInt(e.target.value),
                  })
                }
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Away Score</Label>
              <Input
                type="number"
                value={formData.away_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    away_score: parseInt(e.target.value),
                  })
                }
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="first_half">First Half</SelectItem>
                <SelectItem value="half_time">Half Time</SelectItem>
                <SelectItem value="second_half">Second Half</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
