import { Card, Skeleton, Image, Text, Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { IconShoppingCartPlus, IconCheck } from "@tabler/icons-react";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { uuid, displayName, price, stockAmount } = product;
  const imageUrl = `https://picsum.photos/seed/${uuid}/400/300`;
  const inStock = stockAmount > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    notifications.show({
      title: "Added to cart",
      message: `${displayName} has been added to your cart`,
      icon: <IconCheck size={16} />,
      color: "green",
    });
  };

  return (
    <Link
      to="/products/$productId"
      params={{ productId: uuid }}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{ opacity: !inStock ? 0.6 : undefined }}
      >
        <Card.Section>
          <Image src={imageUrl} height={160} alt={displayName} />
        </Card.Section>

        <Text fw={500} lineClamp={1} mt="md" mb="xs">{displayName}</Text>

        <Text size="xl" fw={700} c="blue">
          ${price}
        </Text>

        {inStock ? (
          <Button
            fullWidth
            mt="md"
            leftSection={<IconShoppingCartPlus size={18} />}
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>
        ) : (
          <Button fullWidth mt="md" variant="light" color="gray" disabled>
            Out of stock
          </Button>
        )}
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Skeleton height={160} />
      </Card.Section>
      <Skeleton height={20} mt="md" />
      <Skeleton height={14} mt="sm" width="60%" />
      <Skeleton height={36} mt="md" />
    </Card>
  );
}
