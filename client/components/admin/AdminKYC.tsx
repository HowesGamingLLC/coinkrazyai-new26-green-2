import React, { useEffect, useState } from 'react';
import { adminV2 } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface KYCDocument {
  id: number;
  player_id: number;
  document_type: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string;
  notes?: string;
}

const AdminKYC = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      // Fetch from a KYC endpoint - using a placeholder for now
      // This would need a dedicated endpoint in the server
      setDocuments([]);
    } catch (error) {
      console.error('Failed to fetch KYC documents:', error);
      toast.error('Failed to load KYC documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const handleApprove = async (documentId: number) => {
    try {
      const notes = prompt('Add approval notes (optional):');
      await adminV2.kyc.approve(documentId, notes || undefined);
      toast.success('KYC document approved');
      fetchDocuments();
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      toast.error('Failed to approve KYC document');
    }
  };

  const handleReject = async (documentId: number) => {
    try {
      const reason = prompt('Reason for rejection:');
      if (reason) {
        await adminV2.kyc.reject(documentId, reason);
        toast.success('KYC document rejected');
        fetchDocuments();
      }
    } catch (error) {
      console.error('Failed to reject KYC:', error);
      toast.error('Failed to reject KYC document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Management</CardTitle>
          <CardDescription>Review and manage Know Your Customer verification documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['pending', 'verified', 'rejected'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status === 'pending' && <Clock className="w-4 h-4 mr-2" />}
                {status === 'verified' && <CheckCircle className="w-4 h-4 mr-2" />}
                {status === 'rejected' && <XCircle className="w-4 h-4 mr-2" />}
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
          <CardDescription>Showing {statusFilter} documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Player ID: {doc.player_id}</p>
                    <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      doc.status === 'verified' ? 'default' :
                      doc.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {doc.status}
                    </Badge>
                    {doc.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(doc.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(doc.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No {statusFilter} KYC documents found
            </p>
          )}
        </CardContent>
      </Card>

      {/* KYC Settings */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Settings</CardTitle>
          <CardDescription>Configure KYC verification requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-semibold text-sm">Require ID Verification</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Players must verify identity before withdrawals
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-semibold text-sm">Require Address Verification</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Players must verify address for large withdrawals
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="font-semibold text-sm">Phone Verification</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Require phone number verification
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="font-semibold text-sm">Email Confirmation</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Require email confirmation before gameplay
              </p>
            </div>
          </div>
          <Button className="mt-4">Save KYC Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKYC;
