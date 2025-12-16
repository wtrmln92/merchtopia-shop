import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { CreateOrderDto } from "../../types/api";

interface OrderResponse {
  uuid: string;
  status: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (orderData: CreateOrderDto) =>
      api<OrderResponse>("/order", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),
  });
}
