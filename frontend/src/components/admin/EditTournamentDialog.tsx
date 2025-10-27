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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Edit3,
  Trophy,
  Calendar,
  Save,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface EditTournamentDialogProps {
  tournament: any;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export function EditTournamentDialog({
  tournament,
  onSuccess,
  onDelete,
}: EditTournamentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    season: "",
    start_date: "",
    end_date: "",
    status: "",
    rules: "",
    points_system: { win: 3, draw: 1, loss: 0 },
  });
  const { toast } = useToast();

  useEffect(() => {
    if (tournament && open) {
      setFormData({
        name: tournament.name || "",
        season: tournament.season || "",
        start_date: tournament.start_date
          ? tournament.start_date.split("T")[0]
          : "",
        end_date: tournament.end_date ? tournament.end_date.split("T")[0] : "",
        status: tournament.status || "upcoming",
        rules: tournament.rules || "",
        points_system: tournament.points_system || { win: 3, draw: 1, loss: 0 },
      });
    }
  }, [tournament, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.put(
        `tournaments/${tournament.id}`,
        formData
      );

      if (response.data.success) {
        toast({
          title: "Tournament Updated",
          description: `${formData.name} has been updated successfully!`,
        });
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to update tournament",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await apiClient.delete(`tournaments/${tournament.id}`);

      if (response.data.success) {
        toast({
          title: "Tournament Deleted",
          description: `${tournament.name} has been deleted successfully!`,
        });
        setOpen(false);
        onDelete?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to delete tournament",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await apiClient.patch(
        `/tournaments/${tournament.id}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        toast({
          title: "Status Updated",
          description: `Tournament status changed to ${newStatus}`,
        });
        setFormData((prev) => ({ ...prev, status: newStatus }));
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <PlayCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <PauseCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Edit3 className="w-3 h-3" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Edit Tournament
          </DialogTitle>
          <DialogDescription>
            Update tournament details and manage settings.
          </DialogDescription>
        </DialogHeader>

        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Status
            </p>
            <Badge className={`mt-1 ${getStatusColor(formData.status)}`}>
              {getStatusIcon(formData.status)}
              <span className="ml-1 capitalize">{formData.status}</span>
            </Badge>
          </div>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tournament Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., ASTU Premier League"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-season">Season</Label>
                <Input
                  id="edit-season"
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                  placeholder="e.g., 2024/2025"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Points System */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Points System</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="win-points">Win Points</Label>
                <Input
                  id="win-points"
                  type="number"
                  value={formData.points_system.win}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_system: {
                        ...formData.points_system,
                        win: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="draw-points">Draw Points</Label>
                <Input
                  id="draw-points"
                  type="number"
                  value={formData.points_system.draw}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_system: {
                        ...formData.points_system,
                        draw: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  max="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loss-points">Loss Points</Label>
                <Input
                  id="loss-points"
                  type="number"
                  value={formData.points_system.loss}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_system: {
                        ...formData.points_system,
                        loss: parseInt(e.target.value),
                      },
                    })
                  }
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tournament Rules</h3>
            <div className="space-y-2">
              <Label htmlFor="edit-rules">Rules & Regulations</Label>
              <Textarea
                id="edit-rules"
                value={formData.rules}
                onChange={(e) =>
                  setFormData({ ...formData, rules: e.target.value })
                }
                placeholder="Enter tournament rules and regulations..."
                rows={6}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
            <div>
              {/* <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {deleteLoading ? "Deleting..." : "Delete Tournament"}
              </Button> */}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
