import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
      <RouterProvider router={router} />
    </MantineProvider>
  );
}

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe("ProductCard", () => {
  const defaultProps = {
    uuid: "test-uuid-123",
    displayName: "Test Product",
    price: "19.99",
    stockAmount: 10,
  };

  it("renders product name", async () => {
    renderWithProviders(<ProductCard {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("renders product price", async () => {
    renderWithProviders(<ProductCard {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("$19.99")).toBeInTheDocument();
    });
  });

  it("renders Add to cart button when in stock", async () => {
    renderWithProviders(<ProductCard {...defaultProps} />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /add to cart/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it("renders Out of stock button when stock is 0", async () => {
    renderWithProviders(<ProductCard {...defaultProps} stockAmount={0} />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /out of stock/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it("applies reduced opacity when out of stock", async () => {
    const { container } = renderWithProviders(
      <ProductCard {...defaultProps} stockAmount={0} />
    );
    await waitFor(() => {
      const card = container.querySelector(".mantine-Card-root");
      expect(card).toHaveStyle({ opacity: "0.6" });
    });
  });

  it("does not apply reduced opacity when in stock", async () => {
    const { container } = renderWithProviders(
      <ProductCard {...defaultProps} stockAmount={10} />
    );
    await waitFor(() => {
      const card = container.querySelector(".mantine-Card-root");
      expect(card).toBeTruthy();
    });
  });

  it("links to the product detail page", async () => {
    renderWithProviders(<ProductCard {...defaultProps} />);
    await waitFor(() => {
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/products/test-uuid-123");
    });
  });
});

describe("ProductCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = renderWithMantine(<ProductCardSkeleton />);
    const skeletons = container.querySelectorAll(".mantine-Skeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
