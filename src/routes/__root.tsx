import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <Outlet />
      </ModalsProvider>
    </MantineProvider>
  );
}
