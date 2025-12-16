import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetShopProduct } from "./useGetShopProduct";
import { server } from "../../test/server";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useGetShopProduct", () => {
  it("fetches a single product successfully", async () => {
    const { result } = renderHook(() => useGetShopProduct("product-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      uuid: "product-1",
      displayName: "Test Product One",
      price: "19.99",
      stockAmount: 10,
    });
  });

  it("fetches a different product", async () => {
    const { result } = renderHook(() => useGetShopProduct("product-2"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      uuid: "product-2",
      displayName: "Test Product Two",
      price: "29.99",
      stockAmount: 0,
      isOnSale: true,
    });
  });

  it("handles product not found", async () => {
    const { result } = renderHook(() => useGetShopProduct("non-existent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("handles server error", async () => {
    server.use(
      http.get("http://localhost:3000/shop/products/:id", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useGetShopProduct("product-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("does not fetch when productId is empty", async () => {
    const { result } = renderHook(() => useGetShopProduct(""), {
      wrapper: createWrapper(),
    });

    // Should not be loading since query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });
});
