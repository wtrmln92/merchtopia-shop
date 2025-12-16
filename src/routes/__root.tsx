import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MantineProvider, AppShell } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Header } from "../components/Header";
import "@mantine/core/styles.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MantineProvider>
      <ModalsProvider>
        <AppShell header={{ height: 60 }} padding="md">
          <AppShell.Header>
            <Header />
          </AppShell.Header>
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>
  );
}
