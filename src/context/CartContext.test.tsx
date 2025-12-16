import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";
import type { Product } from "../types/api";

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    uuid: "test-uuid-123",
    sku: "TEST-SKU",
    displayName: "Test Product",
    price: "19.99",
    stockAmount: 10,
    isOnSale: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("throws error when useCart is used outside CartProvider", () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within a CartProvider");
  });

  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  describe("addToCart", () => {
    it("adds a product to the cart", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.uuid).toBe("test-uuid-123");
      expect(result.current.items[0].quantity).toBe(1);
    });

    it("increments quantity when adding same product", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.addToCart(product);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it("adds specified quantity", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("adds multiple different products", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = createMockProduct({ uuid: "product-1" });
      const product2 = createMockProduct({ uuid: "product-2" });

      act(() => {
        result.current.addToCart(product1);
        result.current.addToCart(product2);
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe("removeFromCart", () => {
    it("removes a product from the cart", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.removeFromCart("test-uuid-123");
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("does nothing when removing non-existent product", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.removeFromCart("non-existent");
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates the quantity of a product", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.updateQuantity("test-uuid-123", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("removes product when quantity is set to 0", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.updateQuantity("test-uuid-123", 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("removes product when quantity is negative", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
        result.current.updateQuantity("test-uuid-123", -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = createMockProduct({ uuid: "product-1" });
      const product2 = createMockProduct({ uuid: "product-2" });

      act(() => {
        result.current.addToCart(product1);
        result.current.addToCart(product2);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("totalItems", () => {
    it("calculates total items correctly", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = createMockProduct({ uuid: "product-1" });
      const product2 = createMockProduct({ uuid: "product-2" });

      act(() => {
        result.current.addToCart(product1, 3);
        result.current.addToCart(product2, 2);
      });

      expect(result.current.totalItems).toBe(5);
    });
  });

  describe("totalPrice", () => {
    it("calculates total price correctly", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product1 = createMockProduct({ uuid: "product-1", price: "10.00" });
      const product2 = createMockProduct({ uuid: "product-2", price: "5.50" });

      act(() => {
        result.current.addToCart(product1, 2); // 20.00
        result.current.addToCart(product2, 3); // 16.50
      });

      expect(result.current.totalPrice).toBe(36.5);
    });
  });

  describe("localStorage persistence", () => {
    it("saves cart to localStorage", () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      const product = createMockProduct();

      act(() => {
        result.current.addToCart(product);
      });

      const stored = localStorage.getItem("merchtopia-cart");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].product.uuid).toBe("test-uuid-123");
    });

    it("loads cart from localStorage on mount", () => {
      const cartData = [
        {
          product: createMockProduct(),
          quantity: 3,
        },
      ];
      localStorage.setItem("merchtopia-cart", JSON.stringify(cartData));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it("handles invalid localStorage data gracefully", () => {
      localStorage.setItem("merchtopia-cart", "invalid json");

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toEqual([]);
    });
  });
});
