import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { http, HttpResponse } from "msw";
import { server } from "./test/server";
import { CartProvider, useCart } from "./context/CartContext";
import type { Product } from "./types/api";
import { useEffect } from "react";

// Import the actual checkout component
import { Route as CheckoutRoute } from "./routes/checkout";

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

function SetupCart({
  products,
}: {
  products: Array<{ product: Product; quantity: number }>;
}) {
  const { addToCart, clearCart } = useCart();
  useEffect(() => {
    clearCart();
    products.forEach(({ product, quantity }) => {
      addToCart(product, quantity);
    });
  }, []);
  return null;
}

function renderCheckoutPage(
  initialProducts: Array<{ product: Product; quantity: number }> = []
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <>
        <SetupCart products={initialProducts} />
        <Outlet />
      </>
    ),
  });

  const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/checkout",
    component: CheckoutRoute.options.component,
  });

  const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cart",
    component: () => <div>Cart Page</div>,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>Home</div>,
  });

  const routeTree = rootRoute.addChildren([checkoutRoute, cartRoute, indexRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/checkout"] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

describe("Checkout Page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Empty Cart", () => {
    it("displays empty cart message when cart is empty", async () => {
      renderCheckoutPage();

      await waitFor(() => {
        expect(
          screen.getByText(/your cart is empty/i)
        ).toBeInTheDocument();
      });
    });

    it("displays Continue Shopping link when cart is empty", async () => {
      renderCheckoutPage();

      await waitFor(() => {
        expect(
          screen.getByRole("link", { name: /continue shopping/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Stock Validation", () => {
    it("shows out of stock warning for unavailable items", async () => {
      // product-2 has stockAmount: 0 in the mock handlers
      const product = createMockProduct({
        uuid: "product-2",
        displayName: "Out of Stock Item",
      });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByText(/items out of stock/i)).toBeInTheDocument();
      });
    });

    it("shows insufficient stock warning when requesting more than available", async () => {
      // product-3 has stockAmount: 2 in the mock handlers
      const product = createMockProduct({
        uuid: "product-3",
        displayName: "Limited Stock Product",
        stockAmount: 2,
      });
      renderCheckoutPage([{ product, quantity: 5 }]);

      await waitFor(
        () => {
          // The Alert title is rendered as a span, not a heading
          expect(screen.getByText("Limited Stock")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("disables payment button when stock issues exist", async () => {
      const product = createMockProduct({
        uuid: "product-2",
        displayName: "Out of Stock Item",
      });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /update cart to continue/i,
        });
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Order Summary", () => {
    it("displays cart items in order summary", async () => {
      const product = createMockProduct({
        uuid: "product-1",
        displayName: "Test Product One",
      });
      renderCheckoutPage([{ product, quantity: 2 }]);

      await waitFor(() => {
        expect(screen.getByText("Test Product One")).toBeInTheDocument();
        expect(screen.getByText("Qty: 2")).toBeInTheDocument();
      });
    });

    it("displays total section", async () => {
      const product = createMockProduct({
        uuid: "product-1",
        price: "19.99",
      });
      renderCheckoutPage([{ product, quantity: 2 }]);

      await waitFor(() => {
        // Wait for the order summary to load
        expect(screen.getByText("Order Summary")).toBeInTheDocument();
        // Check that total label is displayed
        expect(screen.getByText("Total")).toBeInTheDocument();
      });
    });
  });

  describe("Payment Form", () => {
    it("displays payment form fields", async () => {
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/name on card/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email", async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid card number", async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
      });

      const cardInput = screen.getByLabelText(/card number/i);
      await user.type(cardInput, "1234");

      const submitButton = screen.getByRole("button", { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid card number/i)
        ).toBeInTheDocument();
      });
    });

    it("formats card number with spaces", async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/card number/i)).toBeInTheDocument();
      });

      const cardInput = screen.getByLabelText(/card number/i);
      await user.type(cardInput, "1234567890123456");

      expect(cardInput).toHaveValue("1234 5678 9012 3456");
    });

    it("formats expiry date with slash", async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument();
      });

      const expiryInput = screen.getByLabelText(/expiry date/i);
      await user.type(expiryInput, "1225");

      expect(expiryInput).toHaveValue("12/25");
    });
  });

  describe("Order Submission", () => {
    it("submits order successfully with valid form data", async () => {
      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill out the form
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/card number/i), "1234567890123456");
      await user.type(screen.getByLabelText(/name on card/i), "John Doe");
      await user.type(screen.getByLabelText(/expiry date/i), "1225");
      await user.type(screen.getByLabelText(/cvv/i), "123");

      const submitButton = screen.getByRole("button", { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      });
    });

    it("shows error message when order fails", async () => {
      // Override the handler to return an error
      server.use(
        http.post("http://localhost:3000/order", () => {
          return HttpResponse.json(
            { message: "Order failed" },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill out the form
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/card number/i), "1234567890123456");
      await user.type(screen.getByLabelText(/name on card/i), "John Doe");
      await user.type(screen.getByLabelText(/expiry date/i), "1225");
      await user.type(screen.getByLabelText(/cvv/i), "123");

      const submitButton = screen.getByRole("button", { name: /pay/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
      });
    });

    it("shows processing state during submission", async () => {
      // Add a delay to the order endpoint to catch the processing state
      server.use(
        http.post("http://localhost:3000/order", async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return HttpResponse.json({
            uuid: "order-123",
            status: "PENDING",
          }, { status: 201 });
        })
      );

      const user = userEvent.setup();
      const product = createMockProduct({ uuid: "product-1" });
      renderCheckoutPage([{ product, quantity: 1 }]);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill out the form
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/card number/i), "1234567890123456");
      await user.type(screen.getByLabelText(/name on card/i), "John Doe");
      await user.type(screen.getByLabelText(/expiry date/i), "1225");
      await user.type(screen.getByLabelText(/cvv/i), "123");

      const submitButton = screen.getByRole("button", { name: /pay/i });
      await user.click(submitButton);

      // Should show processing state
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /processing/i })
        ).toBeInTheDocument();
      });
    });
  });
});
