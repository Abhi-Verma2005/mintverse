'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@repo/web3';

interface TransactionDetails {
  hash: string;
  status: 'Success' | 'Pending' | 'Failed';
  block: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gas_used: number;
  gas_price: string;
  gas_limit: number;
  nonce: number;
  input_data: string;
}

const TransactionPage = () => {
  const params = useParams();
  const hash = params.hash as string;
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching transaction details
    const fetchTransaction = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fake transaction data
      const fakeTransaction: TransactionDetails = {
        hash: hash,
        status: 'Success',
        block: Math.floor(Math.random() * 1000000) + 19000000,
        timestamp: new Date().toISOString(),
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
        value: '0 ETH',
        gas_used: Math.floor(Math.random() * 150000) + 150000,
        gas_price: `${(Math.random() * 30 + 20).toFixed(1)} Gwei`,
        gas_limit: 300000,
        nonce: Math.floor(Math.random() * 1000),
        input_data: '0x...',
      };
      
      setTransaction(fakeTransaction);
      setLoading(false);
    };

    if (hash) {
      fetchTransaction();
    }
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Not Found</h1>
          <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Etherscan
              </Link>
              <div className="text-gray-400">|</div>
              <span className="text-gray-600">Ethereum Mainnet</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Transaction Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Transaction</h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              transaction.status === 'Success' 
                ? 'bg-green-100 text-green-800'
                : transaction.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {transaction.status}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
            {transaction.hash}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'Success' 
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Block</label>
                <div className="text-gray-900">{transaction.block.toLocaleString()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Timestamp</label>
                <div className="text-gray-900">{new Date(transaction.timestamp).toLocaleString()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">From</label>
                <div className="text-blue-600 font-mono text-sm break-all">{transaction.from}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">To</label>
                <div className="text-blue-600 font-mono text-sm break-all">{transaction.to}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Value</label>
                <div className="text-gray-900">{transaction.value}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Gas Used</label>
                <div className="text-gray-900">{transaction.gas_used.toLocaleString()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Gas Price</label>
                <div className="text-gray-900">{transaction.gas_price}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Gas Limit</label>
                <div className="text-gray-900">{transaction.gas_limit.toLocaleString()}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nonce</label>
                <div className="text-gray-900">{transaction.nonce}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-1">Input Data</label>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm break-all">
              {transaction.input_data}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-center">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage; 