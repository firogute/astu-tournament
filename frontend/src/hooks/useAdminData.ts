// hooks/useAdminData.ts
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface MasterData {
  tournaments: any[];
  teams: any[];
  players: any[];
  matches: any[];
  venues: any[];
  users: any[];
  standings: any[];
}

export const useAdminData = () => {
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const { toast } = useToast();

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/master-data");
      if (response.data.success) {
        setMasterData(response.data.data);
        if (response.data.data.tournaments.length > 0) {
          setSelectedTournament(response.data.data.tournaments[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  return {
    masterData,
    loading,
    selectedTournament,
    setSelectedTournament,
    fetchMasterData,
  };
};
