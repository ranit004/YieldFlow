import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type StrategyResponse, type UpdateStrategyRequest } from "@shared/routes";
import { z } from "zod";

// Fetch all strategies
export function useStrategies() {
  return useQuery({
    queryKey: [api.strategies.list.path],
    queryFn: async () => {
      const res = await fetch(api.strategies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return api.strategies.list.responses[200].parse(await res.json());
    },
  });
}

// Update a strategy (e.g. deactivate)
export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateStrategyRequest) => {
      const validated = api.strategies.update.input.parse(updates);
      const url = buildUrl(api.strategies.update.path, { id });
      const res = await fetch(url, {
        method: api.strategies.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Strategy not found");
        throw new Error("Failed to update strategy");
      }
      return api.strategies.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] }),
  });
}
