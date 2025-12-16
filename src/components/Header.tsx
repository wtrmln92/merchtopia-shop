import { Link } from "@tanstack/react-router";
import { Group, Title, ActionIcon, Badge } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";

export function Header() {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <Title order={3}>Merchtopia</Title>
      </Link>
      <Group>
        <ActionIcon variant="subtle" size="lg" aria-label="Cart">
          <IconShoppingCart size={24} />
        </ActionIcon>
        <Badge circle size="xs" color="red">
          0
        </Badge>
      </Group>
    </Group>
  );
}
