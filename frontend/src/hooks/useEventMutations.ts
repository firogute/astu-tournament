import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const useEventMutations = (selectedMatch, queryClient) => {
  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await apiClient.post(
        `/commentary/${selectedMatch}/event`,
        eventData
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["commentary", "data"]);
      queryClient.invalidateQueries(["commentary", "match"]);
      toast.success("Event logged successfully!");
      if (data.autoCommentary) {
        toast.info("Auto-commentary generated");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add event");
    },
  });

  return { addEventMutation };
};
