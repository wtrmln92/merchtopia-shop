import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MantineProvider, AppShell } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Header } from "../components/Header";
import { CartProvider } from "../context/CartContext";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <ModalsProvider>
        <CartProvider>
          <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header>
              <Header />
            </AppShell.Header>
            <AppShell.Main>
              <Outlet />
            </AppShell.Main>
          </AppShell>
        </CartProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
