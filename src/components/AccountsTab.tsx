import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api, Account } from '../services/api';

export function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [cookieFileName, setCookieFileName] = useState('');
  const [cookiesData, setCookiesData] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await api.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleAddAccount = async () => {
    if (!accountName || !cookieFileName || !cookiesData) {
      alert('Please provide account name, cookie file name, and cookies data');
      return;
    }

    setLoading(true);
    try {
      // First upload cookies
      let cookies;
      try {
        cookies = JSON.parse(cookiesData);
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      await api.uploadCookies(cookieFileName, cookies);
      
      // Then create account
      await api.createAccount(accountName, cookieFileName);
      
      // Reset form
      setAccountName('');
      setCookieFileName('');
      setCookiesData('');
      setShowAddForm(false);
      loadAccounts();
      
      alert('Account created successfully!');
    } catch (error) {
      console.error('Error adding account:', error);
      alert(`Error adding account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.deleteAccount(id);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light tracking-tight text-gray-800">Accounts</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-light rounded-lg hover:bg-gray-800 transition-all"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Add New Account</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Account name (e.g., Personal Account)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Cookie file name (e.g., account1.json)"
              value={cookieFileName}
              onChange={(e) => setCookieFileName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <textarea
              placeholder='Paste cookies JSON here. Example format:
[
  {
    "name": "flipkart_session",
    "value": "your_session_value",
    "domain": ".flipkart.com",
    "path": "/",
    "expires": -1,
    "httpOnly": true,
    "secure": true,
    "sameSite": "Lax"
  }
]'
              value={cookiesData}
              onChange={(e) => setCookiesData(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button
              onClick={handleAddAccount}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Plus size={16} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No accounts yet. Add your first account to get started.
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{account.cookie_file_name}</p>
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs ${
                      account.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {account.status}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
