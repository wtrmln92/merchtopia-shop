import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetShopProducts } from "./useGetShopProducts";
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

describe("useGetShopProducts", () => {
  it("fetches products successfully", async () => {
    const { result } = renderHook(() => useGetShopProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data?.[0]).toMatchObject({
      uuid: "product-1",
      displayName: "Test Product One",
      price: "19.99",
    });
  });

  it("handles empty product list", async () => {
    server.use(
      http.get("http://localhost:3000/shop/products", () => {
        return HttpResponse.json([]);
      })
    );

    const { result } = renderHook(() => useGetShopProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(0);
  });

  it("handles server error", async () => {
    server.use(
      http.get("http://localhost:3000/shop/products", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useGetShopProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
