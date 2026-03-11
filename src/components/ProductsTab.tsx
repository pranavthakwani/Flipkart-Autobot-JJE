import { useState, useEffect } from 'react';
import { Plus, PlayCircle } from 'lucide-react';
import { api, Account, Product } from '../services/api';

export function ProductsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [productName, setProductName] = useState('');
  const [bulkProducts, setBulkProducts] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadProducts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await api.getAllAccounts();
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getAllProducts();
      setProducts(data.filter(p => p.status === 'pending'));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedAccountId || !productName) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const newProduct = await api.createProduct(selectedAccountId, productName, 'auto-generated'); // Pass a placeholder URL
      setProductName('');
      loadProducts();
      
      // Check if we got a valid product with ID
      if (newProduct && newProduct.id) {
        // Automatically start processing the new product
        console.log('Starting automatic processing for new product:', newProduct.id);
        await api.processProduct(newProduct.id);
      } else {
        console.error('Product created but no ID returned:', newProduct);
        alert('Product created but failed to start processing. Please try manually.');
      }
      
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!selectedAccountId || !bulkProducts) {
      alert('Please select account and paste products');
      return;
    }

    setLoading(true);
    try {
      const lines = bulkProducts.split('\n').filter(line => line.trim());
      const productsToAdd = lines.map(line => ({
        productName: line.trim(),
        productUrl: 'auto-generated' // Pass a placeholder URL
      }));

      const newProducts = await api.createBulkProducts(selectedAccountId, productsToAdd);
      setBulkProducts('');
      setShowBulkAdd(false);
      loadProducts();
      
      // Check if we got valid products with IDs
      if (newProducts && Array.isArray(newProducts) && newProducts.length > 0) {
        // Automatically start processing all new products
        console.log('Starting automatic processing for bulk products:', newProducts.length);
        for (const product of newProducts) {
          if (product && product.id) {
            await api.processProduct(product.id);
            // Add small delay between processing requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error('Product created but no ID returned:', product);
          }
        }
      } else {
        console.error('No valid products returned from bulk creation:', newProducts);
        alert('Products created but failed to start processing. Please try manually.');
      }
      
    } catch (error) {
      console.error('Error adding bulk products:', error);
      alert('Error adding bulk products: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcessing = async () => {
    if (products.length === 0) {
      alert('No products to process');
      return;
    }

    setLoading(true);
    try {
      for (const product of products) {
        await api.processProduct(product.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      alert('Processing started for all products');
    } catch (error) {
      console.error('Error starting processing:', error);
      alert('Error starting processing');
    } finally {
      setLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">Please add an account first in the Accounts tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light tracking-tight text-gray-800">Add Products</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-light rounded-lg hover:bg-gray-200 transition-all"
          >
            Bulk Add
          </button>
          <button
            onClick={handleStartProcessing}
            disabled={loading || products.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
          >
            <PlayCircle size={16} />
            Start Processing ({products.length})
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Account</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          {showBulkAdd ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Bulk Products (one product name per line)
              </label>
              <textarea
                placeholder="iPhone 14
Samsung Galaxy S23
Sony Headphones
MacBook Pro"
                value={bulkProducts}
                onChange={(e) => setBulkProducts(e.target.value)}
                rows={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={handleBulkAdd}
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Add All Products
              </button>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                placeholder="iPhone 14, Samsung Galaxy, etc."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />

              <button
                onClick={handleAddProduct}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                <Plus size={16} />
                Add Product
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Pending Products ({products.length})</h3>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No pending products
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{product.product_name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{product.accounts?.name}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
