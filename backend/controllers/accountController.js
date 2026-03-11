import { supabase } from '../services/db.js';
import fs from 'fs';
import browserManager from '../services/browserManager.js';

export const accountController = {
  async getAllAccounts(req, res) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async createAccount(req, res) {
    try {
      const { name, cookieFileName } = req.body;

      if (!name || !cookieFileName) {
        return res.status(400).json({ error: 'Name and cookie file name are required' });
      }

      const cookiePath = browserManager.getCookiesPath(cookieFileName);
      if (!fs.existsSync(cookiePath)) {
        return res.status(400).json({ error: 'Cookie file not found' });
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert([{ name, cookie_file_name: cookieFileName }])
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async uploadCookies(req, res) {
    try {
      const { cookieFileName, cookies } = req.body;

      if (!cookieFileName || !cookies) {
        return res.status(400).json({ error: 'Cookie file name and cookies data are required' });
      }

      const cookiePath = browserManager.getCookiesPath(cookieFileName);
      fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));

      res.json({ success: true, message: 'Cookies uploaded successfully', path: cookiePath });
    } catch (error) {
      console.error('Error uploading cookies:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteAccount(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
