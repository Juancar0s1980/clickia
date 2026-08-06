import { useQuery } from "@tanstack/react-query";
import { plansApi } from "../services/plansApi";

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: plansApi.list });
}
