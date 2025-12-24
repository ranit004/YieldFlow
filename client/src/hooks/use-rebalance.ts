import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useRebalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (walletAddress: string) => {
      const res = await fetch(api.rebalance.execute.path, {
        method: api.rebalance.execute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Rebalance failed");
      return api.rebalance.execute.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate everything relevant
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
    },
  });
}
