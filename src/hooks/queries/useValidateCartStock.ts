import { useQueries } from "@tanstack/react-query";
import type { Product } from "../../types/api";
import type { CartItem } from "../../context/CartContext";
import { api } from "../../api/client";

export interface StockValidationResult {
  productUuid: string;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  isAvailable: boolean;
  hasInsufficientStock: boolean;
}

export interface CartStockValidation {
  results: StockValidationResult[];
  isLoading: boolean;
  isError: boolean;
  hasStockIssues: boolean;
  unavailableItems: StockValidationResult[];
  insufficientStockItems: StockValidationResult[];
  refetch: () => void;
}

export function useValidateCartStock(cartItems: CartItem[]): CartStockValidation {
  const queries = useQueries({
    queries: cartItems.map((item) => ({
      queryKey: ["shop", "products", item.product.uuid, "stock-check"],
      queryFn: () => api<Product>(`/shop/products/${item.product.uuid}`),
      staleTime: 0, // Always fetch fresh data for stock validation
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const results: StockValidationResult[] = cartItems.map((item, index) => {
    const query = queries[index];
    const freshProduct = query.data;
    const availableStock = freshProduct?.stockAmount ?? 0;

    return {
      productUuid: item.product.uuid,
      productName: item.product.displayName,
      requestedQuantity: item.quantity,
      availableStock,
      isAvailable: availableStock > 0,
      hasInsufficientStock: availableStock < item.quantity && availableStock > 0,
    };
  });

  const unavailableItems = results.filter((r) => !r.isAvailable);
  const insufficientStockItems = results.filter((r) => r.hasInsufficientStock);
  const hasStockIssues = unavailableItems.length > 0 || insufficientStockItems.length > 0;

  const refetch = () => {
    queries.forEach((q) => q.refetch());
  };

  return {
    results,
    isLoading,
    isError,
    hasStockIssues,
    unavailableItems,
    insufficientStockItems,
    refetch,
  };
}
