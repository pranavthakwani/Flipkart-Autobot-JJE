import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { AccountsTab } from './components/AccountsTab';
import { ProductsTab } from './components/ProductsTab';
import { DashboardTab } from './components/DashboardTab';
import { ProcessedTab } from './components/ProcessedTab';

function App() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'products' | 'dashboard' | 'processed'>('accounts');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const tabs = [
    { id: 'accounts', label: 'Accounts', component: AccountsTab },
    { id: 'products', label: 'Products', component: ProductsTab },
    { id: 'dashboard', label: 'Dashboard', component: DashboardTab },
    { id: 'processed', label: 'Processed', component: ProcessedTab },
  ] as const;

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AccountsTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Flipkart Auto Payment</h1>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            <ActiveComponent socket={socket} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
