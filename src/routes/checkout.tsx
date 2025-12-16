import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Image,
  Button,
  Stack,
  Divider,
  TextInput,
  Grid,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconLock,
  IconCheck,
  IconAlertCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useCart } from "../context/CartContext";
import { useValidateCartStock } from "../hooks/queries/useValidateCartStock";
import { useCreateOrder } from "../hooks/mutations/useCreateOrder";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const stockValidation = useValidateCartStock(items);
  const createOrder = useCreateOrder();

  const form = useForm({
    initialValues: {
      email: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
    validate: {
      email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : "Please enter a valid email address",
      cardNumber: (value) =>
        value.replace(/\s/g, "").length === 16
          ? null
          : "Please enter a valid card number",
      cardName: (value) =>
        value.trim() ? null : "Please enter the name on card",
      expiryDate: (value) =>
        /^\d{2}\/\d{2}$/.test(value)
          ? null
          : "Please enter a valid expiry date (MM/YY)",
      cvv: (value) =>
        /^\d{3,4}$/.test(value) ? null : "Please enter a valid CVV",
    },
    transformValues: (values) => ({
      ...values,
      cardNumber: values.cardNumber.replace(/\s/g, ""),
    }),
  });

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handleSubmit = async (values: typeof form.values) => {
    createOrder.mutate(
      {
        customerEmail: values.email,
        customerName: values.cardName,
        items: items.map((item) => ({
          productUuid: item.product.uuid,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          clearCart();
        },
      }
    );
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <Container size="sm" py="xl">
        <Title order={1} mb="md">
          Checkout
        </Title>
        <Card withBorder p="xl" ta="center">
          <Text c="dimmed" mb="lg">
            Your cart is empty. Add some items before checking out.
          </Text>
          <Button
            component={Link}
            to="/"
            leftSection={<IconArrowLeft size={16} />}
          >
            Continue Shopping
          </Button>
        </Card>
      </Container>
    );
  }

  if (stockValidation.isLoading) {
    return (
      <Container size="sm" py="xl">
        <Card withBorder p="xl" ta="center">
          <Center>
            <Loader size="lg" />
          </Center>
          <Text c="dimmed" mt="md">
            Validating stock availability...
          </Text>
        </Card>
      </Container>
    );
  }

  if (createOrder.isSuccess) {
    return (
      <Container size="sm" py="xl">
        <Card withBorder p="xl" ta="center">
          <Center mb="lg">
            <IconCheck size={64} color="var(--mantine-color-green-6)" />
          </Center>
          <Title order={2} mb="sm">
            Payment Successful!
          </Title>
          <Text c="dimmed" mb="lg">
            Thank you for your order. You will receive a confirmation email
            shortly.
          </Text>
          <Button component={Link} to="/">
            Continue Shopping
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Button
        component={Link}
        to="/cart"
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        mb="lg"
      >
        Back to Cart
      </Button>

      <Title order={1} mb="lg">
        Checkout
      </Title>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder p="lg">
            <Title order={3} mb="md">
              Payment Details
            </Title>

            {createOrder.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Payment Failed"
                color="red"
                mb="md"
              >
                Your payment could not be processed. Please check your card
                details and try again.
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  disabled={createOrder.isPending}
                  {...form.getInputProps("email")}
                />

                <TextInput
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  disabled={createOrder.isPending}
                  maxLength={19}
                  {...form.getInputProps("cardNumber")}
                  onChange={(e) =>
                    form.setFieldValue(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                />

                <TextInput
                  label="Name on Card"
                  placeholder="John Doe"
                  disabled={createOrder.isPending}
                  {...form.getInputProps("cardName")}
                />

                <Group grow>
                  <TextInput
                    label="Expiry Date"
                    placeholder="MM/YY"
                    disabled={createOrder.isPending}
                    maxLength={5}
                    {...form.getInputProps("expiryDate")}
                    onChange={(e) =>
                      form.setFieldValue(
                        "expiryDate",
                        formatExpiryDate(e.target.value)
                      )
                    }
                  />

                  <TextInput
                    label="CVV"
                    placeholder="123"
                    disabled={createOrder.isPending}
                    maxLength={4}
                    {...form.getInputProps("cvv")}
                    onChange={(e) =>
                      form.setFieldValue(
                        "cvv",
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      )
                    }
                  />
                </Group>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  mt="md"
                  leftSection={
                    createOrder.isPending ? (
                      <Loader size={16} color="white" />
                    ) : (
                      <IconLock size={16} />
                    )
                  }
                  disabled={
                    createOrder.isPending || stockValidation.hasStockIssues
                  }
                >
                  {createOrder.isPending
                    ? "Processing..."
                    : stockValidation.hasStockIssues
                    ? "Update cart to continue"
                    : `Pay $${totalPrice.toFixed(2)}`}
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  This is a demo checkout. No real payment will be processed.
                </Text>
              </Stack>
            </form>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder p="lg">
            <Title order={3} mb="md">
              Order Summary
            </Title>

            {stockValidation.unavailableItems.length > 0 && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Items Out of Stock"
                color="red"
                mb="md"
              >
                The following items are no longer available:
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                  {stockValidation.unavailableItems.map((item) => (
                    <li key={item.productUuid}>{item.productName}</li>
                  ))}
                </ul>
                Please return to your cart to remove these items.
              </Alert>
            )}

            {stockValidation.insufficientStockItems.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Limited Stock"
                color="yellow"
                mb="md"
              >
                Some items have limited availability:
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                  {stockValidation.insufficientStockItems.map((item) => (
                    <li key={item.productUuid}>
                      {item.productName}: only {item.availableStock} available
                      (you requested {item.requestedQuantity})
                    </li>
                  ))}
                </ul>
                Please return to your cart to adjust quantities.
              </Alert>
            )}

            <Stack gap="sm">
              {items.map((item) => {
                const validation = stockValidation.results.find(
                  (r) => r.productUuid === item.product.uuid
                );
                const hasIssue =
                  validation &&
                  (!validation.isAvailable || validation.hasInsufficientStock);

                return (
                  <Group
                    key={item.product.uuid}
                    justify="space-between"
                    wrap="nowrap"
                    style={hasIssue ? { opacity: 0.5 } : undefined}
                  >
                    <Group wrap="nowrap" gap="sm">
                      <Image
                        src={`https://placehold.co/50x50/e9ecef/495057?text=${encodeURIComponent(
                          item.product.displayName.charAt(0)
                        )}`}
                        alt={item.product.displayName}
                        w={40}
                        h={40}
                        radius="sm"
                      />
                      <div>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {item.product.displayName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Qty: {item.quantity}
                        </Text>
                      </div>
                    </Group>
                    <Text size="sm" fw={500}>
                      $
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2
                      )}
                    </Text>
                  </Group>
                );
              })}
            </Stack>

            <Divider my="md" />

            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Subtotal
                </Text>
                <Text size="sm">${totalPrice.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Shipping
                </Text>
                <Text size="sm">Free</Text>
              </Group>
            </Stack>

            <Divider my="md" />

            <Group justify="space-between">
              <Text fw={600}>Total</Text>
              <Text size="lg" fw={700}>
                ${totalPrice.toFixed(2)}
              </Text>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
