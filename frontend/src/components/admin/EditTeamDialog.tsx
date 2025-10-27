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
import { Palette, Edit3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface EditTeamDialogProps {
  team: any;
  onSuccess?: () => void;
}

export function EditTeamDialog({ team, onSuccess }: EditTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    department: "",
    color_primary: "#3B82F6",
    color_secondary: "#FFFFFF",
    founded_year: new Date().getFullYear(),
  });
  const { toast } = useToast();

  useEffect(() => {
    if (team && open) {
      setFormData({
        name: team.name || "",
        short_name: team.short_name || "",
        department: team.department || "",
        color_primary: team.color_primary || "#3B82F6",
        color_secondary: team.color_secondary || "#FFFFFF",
        founded_year: team.founded_year || new Date().getFullYear(),
      });
    }
  }, [team, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put(`/teams/${team.id}`, formData);

      if (response.data.success) {
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update team",
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
            Edit Team
          </DialogTitle>
          <DialogDescription>
            Update team information and branding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Team Name</Label>
            <Input
              id="edit-team-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-short-name">Short Name</Label>
            <Input
              id="edit-short-name"
              value={formData.short_name}
              onChange={(e) =>
                setFormData({ ...formData, short_name: e.target.value })
              }
              maxLength={10}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit-color-primary"
                className="flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Primary Color
              </Label>
              <Input
                id="edit-color-primary"
                type="color"
                value={formData.color_primary}
                onChange={(e) =>
                  setFormData({ ...formData, color_primary: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-founded-year">Founded Year</Label>
              <Input
                id="edit-founded-year"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
