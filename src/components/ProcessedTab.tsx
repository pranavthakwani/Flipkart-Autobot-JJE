import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api, Product } from '../services/api';

export function ProcessedTab() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getAllProducts();
      setProducts(
        data.filter(
          (p) => p.status === 'completed' || p.status === 'failed' || p.status === 'payment-failed'
        )
      );
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light tracking-tight text-gray-800">Processed Orders</h2>
        <div className="text-sm text-gray-500">
          {products.filter(p => p.status === 'completed').length} completed
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No processed orders yet
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {product.status === 'completed' ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <h3 className="text-base font-medium text-gray-900">
                      {product.product_name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Account: {product.accounts?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(product.updated_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    product.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.status === 'completed' ? 'Completed' : 'Failed'}
                </span>
              </div>

              {product.price_breakdown && product.status === 'completed' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {product.price_breakdown.total}
                    </span>
                  </div>
                </div>
              )}

              {product.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{product.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
