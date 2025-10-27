import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface DeleteMatchDialogProps {
  match: any;
  onSuccess?: () => void;
}

export function DeleteMatchDialog({
  match,
  onSuccess,
}: DeleteMatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await apiClient.delete(`/matches/${match.id}`);

      if (response.data.success) {
        setOpen(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const matchInfo = `${match.home_team?.short_name} vs ${
    match.away_team?.short_name
  } - ${new Date(match.match_date).toLocaleDateString()}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Trash2 className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Match
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the match{" "}
            <strong>{matchInfo}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Match"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
