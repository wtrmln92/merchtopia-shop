import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, SimpleGrid, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { useGetShopProducts } from "../hooks/queries/useGetShopProducts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: products, isLoading, error } = useGetShopProducts();

  return (
    <Container size="xl" py="xl">
      <Title order={1}>Shop</Title>
      <Text c="dimmed" mt="xs" mb="xl">
        Browse our products and find something you love.
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
          Failed to load products. Please try again later.
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 4 }} spacing="lg">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : [...(products ?? [])]
              .sort((a, b) => (b.stockAmount > 0 ? 1 : 0) - (a.stockAmount > 0 ? 1 : 0))
              .map((product) => (
                <ProductCard
                  key={product.uuid}
                  uuid={product.uuid}
                  displayName={product.displayName}
                  price={product.price}
                  stockAmount={product.stockAmount}
                />
              ))}
      </SimpleGrid>
    </Container>
  );
}
