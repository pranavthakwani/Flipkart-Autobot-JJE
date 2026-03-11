import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { api, Product } from "../services/api";
import { PaymentSection } from "./PaymentSection";
import { Socket } from "socket.io-client";

interface DashboardTabProps {
  socket: Socket | null;
}

export function DashboardTab({ socket }: DashboardTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("product-update", (update: any) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === update.id
            ? {
                ...p,
                status: update.status || p.status,
                price_breakdown: update.priceBreakdown || p.price_breakdown,
                error: update.error || p.error,
              }
            : p
        )
      );
    });

    return () => {
      socket.off("product-update");
    };
  }, [socket]);

  const loadProducts = async () => {
    try {
      const data = await api.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handlePaymentComplete = async (cardDetails: any) => {
    if (!selectedProduct) return;

    try {
      await api.processPayment(selectedProduct.id, cardDetails);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    }
  };

  const getStatus = (status: string) => {
    switch (status) {
      case "processing":
        return "Processing...";
      case "ready-for-payment":
        return "Ready for Payment";
      case "processing-payment":
        return "Processing Payment";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  if (selectedProduct) {
    return (
      <PaymentSection
        product={selectedProduct}
        onPaymentComplete={handlePaymentComplete}
        onClose={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light text-gray-800">Dashboard</h2>
        <span className="text-sm text-gray-500">
          {products.length} products
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No products available
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-xl p-5 hover:border-gray-300 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.product_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Account: {product.accounts?.name}
                  </p>
                </div>

                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {product.status === "processing" && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  {getStatus(product.status)}
                </span>
              </div>

              {product.status === "ready-for-payment" && (
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <CreditCard size={16} />
                  Pay Now
                </button>
              )}

              {product.error && (
                <div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {product.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}