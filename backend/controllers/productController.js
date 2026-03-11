import { supabase } from '../services/db.js';
import flipkartBotService from '../services/flipkartBotService.js';
import { getIO } from '../server.js';

export const productController = {
  async getAllProducts(req, res) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          accounts (
            id,
            name,
            cookie_file_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const { accountId, productName, productUrl } = req.body;

      if (!accountId || !productName || !productUrl) {
        return res.status(400).json({ error: 'Account ID, product name, and URL are required' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          account_id: accountId,
          product_name: productName,
          product_url: productUrl,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createBulkProducts(req, res) {
    try {
      const { accountId, products } = req.body;

      if (!accountId || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Account ID and products array are required' });
      }

      const productsToInsert = products.map(p => ({
        account_id: accountId,
        product_name: p.productName,
        product_url: p.productUrl,
        status: 'pending'
      }));

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error creating bulk products:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async processProduct(req, res) {
    try {
      const { id } = req.params;

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          accounts (
            id,
            name,
            cookie_file_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ success: true, message: 'Processing started' });

      const io = getIO();

      await supabase
        .from('products')
        .update({ status: 'processing' })
        .eq('id', id);

      io.emit('product-update', { id, status: 'processing' });

      const result = await flipkartBotService.processProduct(
        product.accounts.id,
        product.accounts.cookie_file_name,
        product.product_name,
        (update) => {
          io.emit('product-update', { id, ...update });
        }
      );

      if (result.success) {
        await supabase
          .from('products')
          .update({
            status: 'ready-for-payment',
            amount: result.amount,
            price_breakdown: result.priceBreakdown
          })
          .eq('id', id);

        io.emit('product-update', {
          id,
          status: 'ready-for-payment',
          amount: result.amount,
          priceBreakdown: result.priceBreakdown
        });
      } else {
        await supabase
          .from('products')
          .update({
            status: 'failed',
            error: result.error
          })
          .eq('id', id);

        io.emit('product-update', { id, status: 'failed', error: result.error });
      }

    } catch (error) {
      console.error('Error processing product:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async processPayment(req, res) {
    try {
      const { id } = req.params;
      const { cardDetails } = req.body;

      if (!cardDetails) {
        return res.status(400).json({ error: 'Card details are required' });
      }

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          accounts (
            id,
            name,
            cookie_file_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const io = getIO();

      await supabase
        .from('products')
        .update({ status: 'processing-payment' })
        .eq('id', id);

      io.emit('product-update', { id, status: 'processing-payment' });

      const result = await flipkartBotService.fillPaymentDetails(
        product.accounts.id,
        cardDetails
      );

      if (result.success) {
        await supabase
          .from('products')
          .update({ status: 'completed' })
          .eq('id', id);

        io.emit('product-update', { id, status: 'completed' });

        res.json({ success: true, message: 'Payment processed successfully' });
      } else {
        await supabase
          .from('products')
          .update({
            status: 'payment-failed',
            error: result.error
          })
          .eq('id', id);

        io.emit('product-update', { id, status: 'payment-failed', error: result.error });

        res.status(500).json({ error: result.error });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const io = getIO();
      io.emit('product-update', { id, ...updates });

      res.json(data);
    } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
