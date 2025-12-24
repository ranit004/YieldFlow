import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateDepositRequest } from "@shared/routes";

// Fetch deposits for a specific wallet
export function useDeposits(walletAddress: string) {
  return useQuery({
    queryKey: [api.deposits.list.path, walletAddress],
    queryFn: async () => {
      // Don't fetch if no wallet
      if (!walletAddress) return [];
      
      const url = buildUrl(api.deposits.list.path, { walletAddress });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch deposits");
      return api.deposits.list.responses[200].parse(await res.json());
    },
    enabled: !!walletAddress,
  });
}

// Create a new deposit
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDepositRequest) => {
      const validated = api.deposits.create.input.parse(data);
      const res = await fetch(api.deposits.create.path, {
        method: api.deposits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.deposits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create deposit");
      }
      return api.deposits.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.deposits.list.path, variables.walletAddress] 
      });
      queryClient.invalidateQueries({
        queryKey: [api.strategies.list.path] // TVL might update
      });
    },
  });
}
