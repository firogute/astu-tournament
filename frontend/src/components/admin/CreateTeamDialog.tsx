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
import { Users, Plus, Palette } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface CreateTeamDialogProps {
  onSuccess?: () => void;
}

export function CreateTeamDialog({ onSuccess }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    department: "",
    color_primary: "#3B82F6",
    color_secondary: "#FFFFFF",
    founded_year: new Date().getFullYear(),
    tournament_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await apiClient.get("/tournaments");
      if (response.data.success) {
        setTournaments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tournaments");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/admin/teams/create", {
        team: {
          name: formData.name,
          short_name: formData.short_name,
          department: formData.department,
          color_primary: formData.color_primary,
          color_secondary: formData.color_secondary,
          founded_year: formData.founded_year,
        },
        tournament_id: formData.tournament_id,
      });

      if (response.data.success) {
        toast({
          title: "Team Created",
          description: `${formData.name} has been created successfully!`,
        });
        setOpen(false);
        setFormData({
          name: "",
          short_name: "",
          department: "",
          color_primary: "#3B82F6",
          color_secondary: "#FFFFFF",
          founded_year: new Date().getFullYear(),
          tournament_id: "",
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
          <Plus className="w-4 h-4" />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Add a new team to the tournament system.
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
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Computer Science Department"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_name">Short Name</Label>
            <Input
              id="short_name"
              value={formData.short_name}
              onChange={(e) =>
                setFormData({ ...formData, short_name: e.target.value })
              }
              placeholder="e.g., CS"
              maxLength={10}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="color_primary"
                className="flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Primary Color
              </Label>
              <Input
                id="color_primary"
                type="color"
                value={formData.color_primary}
                onChange={(e) =>
                  setFormData({ ...formData, color_primary: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                id="founded_year"
                type="number"
                value={formData.founded_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    founded_year: parseInt(e.target.value),
                  })
                }
                min={1900}
                max={new Date().getFullYear()}
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
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
