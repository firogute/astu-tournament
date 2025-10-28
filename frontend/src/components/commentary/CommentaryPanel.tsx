// components/CommentaryPanel.jsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api";

const CommentaryPanel = ({
  commentary,
  setCommentary,
  matchMinute,
  selectedMatch,
  user,
  queryClient,
}) => {
  const addCommentaryMutation = useMutation({
    mutationFn: async (commentaryData) => {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/comment`,
        commentaryData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commentary", "data"]);
      toast.success("Commentary added!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add commentary");
    },
  });

  const handleAddCommentary = async () => {
    if (!commentary.trim()) {
      toast.error("Please enter commentary text");
      return;
    }

    const commentaryData = {
      minute: matchMinute,
      commentary_text: commentary,
      is_important: false,
      created_by: user?.id,
    };

    try {
      await addCommentaryMutation.mutateAsync(commentaryData);
      setCommentary("");
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-3">Add Text Commentary</h3>
      <Textarea
        value={commentary}
        onChange={(e) => setCommentary(e.target.value)}
        placeholder={`Type live commentary for minute ${matchMinute}...`}
        rows={3}
        className="mb-3"
        disabled={addCommentaryMutation.isLoading}
      />
      <Button
        onClick={handleAddCommentary}
        className="w-full"
        disabled={addCommentaryMutation.isLoading || !commentary.trim()}
      >
        {addCommentaryMutation.isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Post Commentary
      </Button>
    </Card>
  );
};

export default CommentaryPanel;
