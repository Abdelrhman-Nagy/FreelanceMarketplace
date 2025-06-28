import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

interface PaymentRequest {
  id: number;
  contractId: number;
  jobId: number;
  jobTitle: string;
  freelancerId: string;
  clientId: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  freelancerName?: string;
  clientName?: string;
  clientCompany?: string;
  createdAt: string;
}

interface Contract {
  id: number;
  jobId: number;
  jobTitle: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  proposedRate: number;
  status: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch payment requests
  const { data: paymentRequests = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: () => apiRequest('/api/payments')
  });

  // Fetch contracts for freelancers
  const { data: contractsData, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: () => apiRequest('/api/contracts'),
    enabled: user?.role === 'freelancer'
  });

  const contracts = contractsData?.contracts || [];

  // Create payment request mutation
  const createRequestMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/payments/request', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Payment request created",
        description: "Your payment request has been sent to the client"
      });
      setShowRequestDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment request",
        variant: "destructive"
      });
    }
  });

  // Approve payment request mutation
  const approveRequestMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest(`/api/payments/${requestId}/approve`, {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Payment approved",
        description: "Payment has been processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve payment",
        variant: "destructive"
      });
    }
  });

  // Reject payment request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: number; reason: string }) => 
      apiRequest(`/api/payments/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      }),
    onSuccess: () => {
      toast({
        title: "Payment rejected",
        description: "Payment request has been rejected"
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment",
        variant: "destructive"
      });
    }
  });

  const handleCreateRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contractId = formData.get('contractId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    const selectedContract = contracts.find((c: Contract) => c.id === parseInt(contractId));
    if (!selectedContract) {
      toast({
        title: "Error",
        description: "Please select a valid contract",
        variant: "destructive"
      });
      return;
    }

    createRequestMutation.mutate({
      contractId: parseInt(contractId),
      clientId: selectedContract.clientId,
      amount,
      description
    });
  };

  const handleRejectRequest = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    rejectRequestMutation.mutate({
      requestId: selectedRequest.id,
      reason: rejectionReason
    });
  };

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadingPayments || (user?.role === 'freelancer' && loadingContracts)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'freelancer' 
              ? 'Request payments for your completed work'
              : 'Review and approve payment requests from freelancers'
            }
          </p>
        </div>
        
        {user?.role === 'freelancer' && contracts.length > 0 && (
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Request Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateRequest}>
                <DialogHeader>
                  <DialogTitle>Request Payment</DialogTitle>
                  <DialogDescription>
                    Create a payment request for completed work on your contracts.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contractId">Contract</Label>
                    <Select name="contractId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contract" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map((contract: Contract) => (
                          <SelectItem key={contract.id} value={contract.id.toString()}>
                            {contract.jobTitle} - {contract.clientName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="100.00"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the work completed..."
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createRequestMutation.isPending}>
                    {createRequestMutation.isPending ? 'Creating...' : 'Create Request'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {paymentRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
            <p className="text-gray-600">
              {user?.role === 'freelancer' 
                ? 'You haven\'t created any payment requests yet.'
                : 'No payment requests to review at this time.'
              }
            </p>
            {user?.role === 'freelancer' && contracts.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                You need active contracts to request payments.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {paymentRequests.map((request: PaymentRequest) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.jobTitle}</CardTitle>
                    <CardDescription className="mt-1">
                      {user?.role === 'freelancer' 
                        ? `Client: ${request.clientName} ${request.clientCompany ? `(${request.clientCompany})` : ''}`
                        : `Freelancer: ${request.freelancerName}`
                      }
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(request.amount, request.currency)}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{request.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Requested:</span>
                      <p className="text-gray-600">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {request.status === 'approved' && request.paidAt && (
                      <div>
                        <span className="font-medium text-gray-700">Paid:</span>
                        <p className="text-gray-600">
                          {new Date(request.paidAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="col-span-2">
                        <span className="font-medium text-red-700">Rejection Reason:</span>
                        <p className="text-red-600 mt-1">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  
                  {user?.role === 'client' && request.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => approveRequestMutation.mutate(request.id)}
                        disabled={approveRequestMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Pay
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectDialog(true);
                        }}
                        disabled={rejectRequestMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Reason for rejection</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this payment request..."
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={rejectRequestMutation.isPending || !rejectionReason.trim()}
            >
              {rejectRequestMutation.isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}