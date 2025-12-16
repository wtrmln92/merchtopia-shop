import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Image,
  Button,
  Group,
  Stack,
  Badge,
  Skeleton,
  Alert,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import {
  IconShoppingCartPlus,
  IconAlertCircle,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useGetShopProduct } from "../../hooks/queries/useGetShopProduct";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading, error } = useGetShopProduct(productId);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          Failed to load product. It may not exist or there was an error.
        </Alert>
        <Button
          component={Link}
          to="/"
          variant="light"
          mt="md"
          leftSection={<IconArrowLeft size={18} />}
        >
          Back to Shop
        </Button>
      </Container>
    );
  }

  const imageUrl = `https://picsum.photos/seed/${product.uuid}/800/600`;
  const inStock = product.stockAmount > 0;

  return (
    <Container size="md" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/">
          Shop
        </Anchor>
        <Text>{product.displayName}</Text>
      </Breadcrumbs>

      <Group align="flex-start" gap="xl" wrap="wrap">
        <Image
          src={imageUrl}
          alt={product.displayName}
          radius="md"
          w={{ base: "100%", sm: 400 }}
          h={{ base: 300, sm: 300 }}
          fit="cover"
        />

        <Stack style={{ flex: 1, minWidth: 280 }}>
          <div>
            <Group gap="sm" mb="xs">
              {product.isOnSale && <Badge color="red">On Sale</Badge>}
              {!inStock && <Badge color="gray">Out of Stock</Badge>}
            </Group>
            <Title order={1}>{product.displayName}</Title>
          </div>

          <Text size="xl" fw={700} c="blue">
            ${product.price}
          </Text>

          {product.description && (
            <Text c="dimmed">{product.description}</Text>
          )}

          <Text size="sm" c="dimmed">
            SKU: {product.sku}
          </Text>

          {inStock ? (
            <Text size="sm" c="green">
              {product.stockAmount} in stock
            </Text>
          ) : (
            <Text size="sm" c="red">
              Currently unavailable
            </Text>
          )}

          {inStock ? (
            <Button
              size="lg"
              leftSection={<IconShoppingCartPlus size={20} />}
              mt="md"
            >
              Add to Cart
            </Button>
          ) : (
            <Button size="lg" variant="light" color="gray" disabled mt="md">
              Out of Stock
            </Button>
          )}

          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
          >
            Back to Shop
          </Button>
        </Stack>
      </Group>
    </Container>
  );
}

function ProductDetailSkeleton() {
  return (
    <Container size="md" py="xl">
      <Skeleton height={20} width={200} mb="lg" />
      <Group align="flex-start" gap="xl" wrap="wrap">
        <Skeleton height={300} width={400} radius="md" />
        <Stack style={{ flex: 1, minWidth: 280 }}>
          <Skeleton height={36} width="80%" />
          <Skeleton height={28} width={100} />
          <Skeleton height={60} />
          <Skeleton height={20} width={150} />
          <Skeleton height={48} mt="md" />
        </Stack>
      </Group>
    </Container>
  );
}
