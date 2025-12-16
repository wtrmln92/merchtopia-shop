import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../types/api";
import { api } from "../../api/client";

export function useGetShopProduct(productId: string) {
  return useQuery<Product>({
    queryKey: ["shop", "products", productId],
    queryFn: () => api<Product>(`/shop/products/${productId}`),
    enabled: !!productId,
  });
}
