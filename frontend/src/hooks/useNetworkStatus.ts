import { useQuery } from "@tanstack/react-query";
import { networkApi } from "../services/networkApi";

export function useNetworkStatus(zone: string) {
  return useQuery({
    queryKey: ["network-status", zone],
    queryFn: () => networkApi.getStatus(zone),
  });
}
