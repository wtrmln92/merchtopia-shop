import { describe, it, expect, beforeEach } from "vitest";
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
  Link,
} from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Image,
  NumberInput,
  ActionIcon,
  Button,
  Stack,
  Divider,
} from "@mantine/core";
import { IconTrash, IconArrowLeft } from "@tabler/icons-react";
import { CartProvider, useCart } from "./context/CartContext";
import type { Product } from "./types/api";
import { useEffect } from "react";

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

function SetupCart({ products }: { products: Array<{ product: Product; quantity: number }> }) {
  const { addToCart } = useCart();
  useEffect(() => {
    products.forEach(({ product, quantity }) => {
      addToCart(product, quantity);
    });
  }, []);
  return null;
}

function CartPageComponent() {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useCart();

  if (items.length === 0) {
    return (
      <Container size="sm" py="xl">
        <Title order={1} mb="md">
          Your Cart
        </Title>
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed" mb="lg">
            Your cart is empty.
          </Text>
          <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />}>
            Continue Shopping
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={1}>Your Cart</Title>
        <Button variant="subtle" color="red" onClick={clearCart}>
          Clear Cart
        </Button>
      </Group>

      <Stack gap="md">
        {items.map((item) => (
          <Card key={item.product.uuid} withBorder padding="md">
            <Group wrap="nowrap" align="flex-start">
              <Image
                src={`https://placehold.co/100x100/e9ecef/495057?text=${encodeURIComponent(item.product.displayName.charAt(0))}`}
                alt={item.product.displayName}
                w={80}
                h={80}
                radius="md"
              />
              <div style={{ flex: 1 }}>
                <Text fw={500}>{item.product.displayName}</Text>
                <Text size="sm" c="dimmed">
                  ${parseFloat(item.product.price).toFixed(2)} each
                </Text>
              </div>
              <Group gap="xs">
                <NumberInput
                  value={item.quantity}
                  onChange={(val) =>
                    updateQuantity(item.product.uuid, Number(val) || 0)
                  }
                  min={1}
                  max={item.product.stockAmount}
                  w={80}
                  size="sm"
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => removeFromCart(item.product.uuid)}
                  aria-label="Remove item"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
              <Text fw={500} w={80} ta="right">
                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
              </Text>
            </Group>
          </Card>
        ))}
      </Stack>

      <Divider my="lg" />

      <Group justify="space-between" mb="lg">
        <Text size="lg" fw={500}>
          Total
        </Text>
        <Text size="xl" fw={700}>
          ${totalPrice.toFixed(2)}
        </Text>
      </Group>

      <Group justify="space-between">
        <Button
          component={Link}
          to="/"
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
        >
          Continue Shopping
        </Button>
        <Button size="lg">Checkout</Button>
      </Group>
    </Container>
  );
}

function renderCartPage(initialProducts: Array<{ product: Product; quantity: number }> = []) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <SetupCart products={initialProducts} />
        <Outlet />
      </>
    ),
  });
  const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cart",
    component: CartPageComponent,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>Home</div>,
  });
  const routeTree = rootRoute.addChildren([cartRoute, indexRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/cart"] }),
  });

  return render(
    <MantineProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </MantineProvider>
  );
}

describe("Cart Page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("displays empty cart message when cart is empty", async () => {
    renderCartPage();

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });

  it("displays Continue Shopping link when cart is empty", async () => {
    renderCartPage();

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /continue shopping/i })).toBeInTheDocument();
    });
  });

  it("displays cart items", async () => {
    const product = createMockProduct({ displayName: "Widget Pro" });
    renderCartPage([{ product, quantity: 2 }]);

    await waitFor(() => {
      expect(screen.getByText("Widget Pro")).toBeInTheDocument();
    });
  });

  it("displays item price", async () => {
    const product = createMockProduct({ price: "25.00" });
    renderCartPage([{ product, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByText("$25.00 each")).toBeInTheDocument();
    });
  });

  it("displays total price", async () => {
    const product = createMockProduct({ price: "10.00" });
    renderCartPage([{ product, quantity: 3 }]);

    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
      // Price appears twice (line item and total), so use getAllByText
      const prices = screen.getAllByText("$30.00");
      expect(prices.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("displays Clear Cart button", async () => {
    const product = createMockProduct();
    renderCartPage([{ product, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /clear cart/i })).toBeInTheDocument();
    });
  });

  it("clears cart when Clear Cart is clicked", async () => {
    const product = createMockProduct();
    renderCartPage([{ product, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const clearButton = screen.getByRole("button", { name: /clear cart/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });

  it("removes item when trash button is clicked", async () => {
    const product = createMockProduct();
    renderCartPage([{ product, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const removeButton = screen.getByRole("button", { name: /remove item/i });
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
  });

  it("displays Checkout button", async () => {
    const product = createMockProduct();
    renderCartPage([{ product, quantity: 1 }]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /checkout/i })).toBeInTheDocument();
    });
  });

  it("displays multiple products", async () => {
    const product1 = createMockProduct({ uuid: "prod-1", displayName: "Product One" });
    const product2 = createMockProduct({ uuid: "prod-2", displayName: "Product Two" });

    renderCartPage([
      { product: product1, quantity: 1 },
      { product: product2, quantity: 2 },
    ]);

    await waitFor(() => {
      expect(screen.getByText("Product One")).toBeInTheDocument();
      expect(screen.getByText("Product Two")).toBeInTheDocument();
    });
  });

  it("calculates correct total for multiple products", async () => {
    const product1 = createMockProduct({ uuid: "prod-1", price: "10.00" });
    const product2 = createMockProduct({ uuid: "prod-2", price: "15.00" });

    renderCartPage([
      { product: product1, quantity: 2 }, // $20
      { product: product2, quantity: 1 }, // $15
    ]);

    await waitFor(() => {
      expect(screen.getByText("$35.00")).toBeInTheDocument();
    });
  });
});
