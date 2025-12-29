import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertDeposit } from "@shared/schema";

// Fetch deposits for a specific wallet
export function useDeposits(walletAddress: string) {
  return useQuery({
    queryKey: ['deposits', walletAddress],
    queryFn: async () => {
      // Don't fetch if no wallet
      if (!walletAddress) return [];

      // Use query parameter format that Vercel API expects
      const url = `/api/deposits?walletAddress=${encodeURIComponent(walletAddress)}`;
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
    mutationFn: async (data: InsertDeposit) => {
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
        queryKey: ['deposits', variables.walletAddress]
      });
      queryClient.invalidateQueries({
        queryKey: [api.strategies.list.path] // TVL might update
      });
    },
  });
}
