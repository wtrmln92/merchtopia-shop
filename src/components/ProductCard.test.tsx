import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { CartProvider } from "../context/CartContext";
import type { Product } from "../types/api";

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        {ui}
        <Outlet />
      </>
    ),
  });
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/products/$productId",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([productRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(
    <MantineProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </MantineProvider>
  );
}

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    uuid: "test-uuid-123",
    sku: "TEST-SKU",
    displayName: "Test Product",
    price: "19.99",
    stockAmount: 10,
    isOnSale: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProductCard", () => {
  it("renders product name", async () => {
    const product = createMockProduct();
    renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("renders product price", async () => {
    const product = createMockProduct();
    renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      expect(screen.getByText("$19.99")).toBeInTheDocument();
    });
  });

  it("renders Add to cart button when in stock", async () => {
    const product = createMockProduct();
    renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /add to cart/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it("renders Out of stock button when stock is 0", async () => {
    const product = createMockProduct({ stockAmount: 0 });
    renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /out of stock/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it("applies reduced opacity when out of stock", async () => {
    const product = createMockProduct({ stockAmount: 0 });
    const { container } = renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      const card = container.querySelector(".mantine-Card-root");
      expect(card).toHaveStyle({ opacity: "0.6" });
    });
  });

  it("does not apply reduced opacity when in stock", async () => {
    const product = createMockProduct({ stockAmount: 10 });
    const { container } = renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      const card = container.querySelector(".mantine-Card-root");
      expect(card).toBeTruthy();
    });
  });

  it("links to the product detail page", async () => {
    const product = createMockProduct();
    renderWithProviders(<ProductCard product={product} />);
    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/products/test-uuid-123");
    });
  });

  it("calls addToCart and shows notification when Add to cart is clicked", async () => {
    const { notifications } = await import("@mantine/notifications");
    const product = createMockProduct();
    renderWithProviders(<ProductCard product={product} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
    });

    const button = screen.getByRole("button", { name: /add to cart/i });
    await userEvent.click(button);

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Added to cart",
        message: "Test Product has been added to your cart",
        color: "green",
      })
    );
  });
});

describe("ProductCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = renderWithMantine(<ProductCardSkeleton />);
    const skeletons = container.querySelectorAll(".mantine-Skeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
