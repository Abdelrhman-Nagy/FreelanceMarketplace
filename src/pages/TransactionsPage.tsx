import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Calendar, FileText } from 'lucide-react';

interface Transaction {
  id: number;
  paymentRequestId?: number;
  contractId?: number;
  jobId?: number;
  jobTitle?: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  description: string;
  transactionId: string;
  createdAt: string;
  direction: 'incoming' | 'outgoing';
}

export default function TransactionsPage() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: () => apiRequest('/api/transactions')
  });

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const getTransactionIcon = (direction: string) => {
    return direction === 'incoming' ? (
      <ArrowDownLeft className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowUpRight className="w-5 h-5 text-red-600" />
    );
  };

  const getDirectionBadge = (direction: string) => {
    return direction === 'incoming' ? (
      <Badge variant="outline" className="text-green-600">
        Received
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600">
        Sent
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTotalEarnings = () => {
    return transactions
      .filter((tx: Transaction) => tx.direction === 'incoming')
      .reduce((total: number, tx: Transaction) => total + tx.amount, 0);
  };

  const getTotalSpent = () => {
    return transactions
      .filter((tx: Transaction) => tx.direction === 'outgoing')
      .reduce((total: number, tx: Transaction) => total + tx.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">View your payment and transaction history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              All payment transactions
            </p>
          </CardContent>
        </Card>

        {user?.role === 'freelancer' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(getTotalEarnings())}
              </div>
              <p className="text-xs text-muted-foreground">
                Money received from clients
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'client' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(getTotalSpent())}
              </div>
              <p className="text-xs text-muted-foreground">
                Money paid to freelancers
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter((tx: Transaction) => {
                const txDate = new Date(tx.createdAt);
                const now = new Date();
                return txDate.getMonth() === now.getMonth() && 
                       txDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
            <p className="text-gray-600">
              You haven't made or received any payments yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction: Transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.direction)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.jobTitle || 'Payment Transaction'}
                        </p>
                        {getDirectionBadge(transaction.direction)}
                        {getStatusBadge(transaction.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {transaction.direction === 'incoming' 
                          ? `From: ${transaction.fromUserName}`
                          : `To: ${transaction.toUserName}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.direction === 'incoming' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.direction === 'incoming' ? '+' : '-'}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {transaction.transactionId && (
                      <div className="text-xs text-gray-400 mt-1">
                        ID: {transaction.transactionId.slice(-8)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}