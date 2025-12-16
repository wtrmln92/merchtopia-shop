import { Card, Skeleton, Image, Text, Button } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { IconShoppingCartPlus } from "@tabler/icons-react";

interface ProductCardProps {
  uuid: string;
  displayName: string;
  price: string;
  stockAmount: number;
}

export function ProductCard({
  uuid,
  displayName,
  price,
  stockAmount,
}: ProductCardProps) {
  const imageUrl = `https://picsum.photos/seed/${uuid}/400/300`;
  const inStock = stockAmount > 0;

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
            onClick={(e) => e.preventDefault()}
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
