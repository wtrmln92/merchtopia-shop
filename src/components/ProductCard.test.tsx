import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

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

  it("renders product name", () => {
    renderWithMantine(<ProductCard {...defaultProps} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders product price", () => {
    renderWithMantine(<ProductCard {...defaultProps} />);
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("renders Add to cart button when in stock", () => {
    renderWithMantine(<ProductCard {...defaultProps} />);
    const button = screen.getByRole("button", { name: /add to cart/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("renders Out of stock button when stock is 0", () => {
    renderWithMantine(<ProductCard {...defaultProps} stockAmount={0} />);
    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("applies reduced opacity when out of stock", () => {
    const { container } = renderWithMantine(
      <ProductCard {...defaultProps} stockAmount={0} />
    );
    const card = container.querySelector(".mantine-Card-root");
    expect(card).toHaveStyle({ opacity: "0.6" });
  });

  it("does not apply reduced opacity when in stock", () => {
    const { container } = renderWithMantine(
      <ProductCard {...defaultProps} stockAmount={10} />
    );
    const card = container.querySelector(".mantine-Card-root");
    expect(card).not.toHaveStyle({ opacity: "0.6" });
  });
});

describe("ProductCardSkeleton", () => {
  it("renders skeleton elements", () => {
    const { container } = renderWithMantine(<ProductCardSkeleton />);
    const skeletons = container.querySelectorAll(".mantine-Skeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
