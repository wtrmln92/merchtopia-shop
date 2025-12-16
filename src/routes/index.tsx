import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1}>Welcome to the Shop</Title>
      <Text c="dimmed" mt="md">
        Browse our products and find something you love.
      </Text>
    </Container>
  );
}
