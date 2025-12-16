import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/api";
import { api } from "../../api/client";

export function useGetShopProducts() {
  return useQuery<Product[]>({
    queryKey: ["shop", "products"],
    queryFn: () => api<Product[]>("/shop/products"),
  });
}
