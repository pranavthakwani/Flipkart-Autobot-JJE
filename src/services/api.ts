const API_BASE_URL = 'http://localhost:3001/api';

export interface Account {
  id: string;
  name: string;
  cookie_file_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  account_id: string;
  product_name: string;
  product_url: string;
  status: string;
  amount: string;
  price_breakdown?: PriceBreakdown;
  error?: string;
  created_at: string;
  updated_at: string;
  accounts?: Account;
}

export interface PriceBreakdown {
  mrp: string;
  fees: { name: string; amount: number }[];
  discounts: { name: string; amount: number }[];
  total: string;
  discountOffer: string;
  cardImages: string[];
  numericData: {
    mrp: number;
    total: number;
    fees: { name: string; amount: number }[];
    discounts: { name: string; amount: number }[];
  };
}

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export const api = {
  async getAllAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    return response.json();
  },

  async createAccount(name: string, cookieFileName: string): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cookieFileName })
    });
    return response.json();
  },

  async uploadCookies(cookieFileName: string, cookies: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/accounts/upload-cookies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookieFileName, cookies })
    });
    return response.json();
  },

  async deleteAccount(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE'
    });
  },

  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
  },

  async createProduct(accountId: string, productName: string, productUrl: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, productName, productUrl })
    });
    return response.json();
  },

  async createBulkProducts(accountId: string, products: { productName: string; productUrl: string }[]): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, products })
    });
    return response.json();
  },

  async processProduct(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/process`, {
      method: 'POST'
    });
    return response.json();
  },

  async processPayment(id: string, cardDetails: CardDetails): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/products/${id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardDetails })
    });
    return response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });
  }
};
