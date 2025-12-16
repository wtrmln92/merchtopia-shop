import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useCart } from "../context/CartContext";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
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
        <Button component={Link} to="/checkout" size="lg">Checkout</Button>
      </Group>
    </Container>
  );
}
