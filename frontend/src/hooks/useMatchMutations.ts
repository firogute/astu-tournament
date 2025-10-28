// hooks/useMatchMutations.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export const useMatchMutations = (selectedMatch, queryClient) => {
  const updateMatchMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await apiClient.patch(
        `/commentary/${selectedMatch}/status`,
        updates
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["commentary", "matches"]);
      queryClient.invalidateQueries(["commentary", "match"]);
      queryClient.invalidateQueries(["commentary", "data"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update match");
    },
  });

  return { updateMatchMutation };
};
