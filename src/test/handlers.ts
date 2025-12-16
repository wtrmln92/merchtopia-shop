import { http, HttpResponse } from "msw";
import type { Product, CreateOrderDto } from "../types/api";

const BASE_URL = "http://localhost:3000";

export const mockProducts: Product[] = [
  {
    uuid: "product-1",
    sku: "SKU-001",
    displayName: "Test Product One",
    price: "19.99",
    stockAmount: 10,
    isOnSale: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    uuid: "product-2",
    sku: "SKU-002",
    displayName: "Test Product Two",
    price: "29.99",
    stockAmount: 0,
    isOnSale: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    uuid: "product-3",
    sku: "SKU-003",
    displayName: "Limited Stock Product",
    price: "15.00",
    stockAmount: 2,
    isOnSale: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

export const handlers = [
  http.get(`${BASE_URL}/shop/products`, () => {
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${BASE_URL}/shop/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.uuid === params.id);
    if (product) {
      return HttpResponse.json(product);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post(`${BASE_URL}/order`, async ({ request }) => {
    const body = (await request.json()) as CreateOrderDto;

    // Validate required fields
    if (!body.customerEmail || !body.items || body.items.length === 0) {
      return HttpResponse.json(
        { message: "Invalid order data" },
        { status: 400 }
      );
    }

    // Return success response
    return HttpResponse.json({
      uuid: "order-123",
      status: "PENDING",
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      items: body.items,
    }, { status: 201 });
  }),
];
