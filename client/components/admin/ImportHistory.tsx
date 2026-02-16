import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, 
  Filter, Search, Download
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportHistoryItem {
  id: number;
  provider_name?: string;
  provider?: string;
  import_type: string;
  total_games_imported?: number;
  games_imported?: number;
  total_games_updated?: number;
  games_updated?: number;
  total_games_skipped?: number;
  games_skipped?: number;
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  started_at: string;
  completed_at?: string;
  import_duration_seconds?: number;
  error_message?: string;
  details?: string;
}

interface ImportHistoryProps {
  data?: ImportHistoryItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const ImportHistory: React.FC<ImportHistoryProps> = ({ 
  data = [], 
  isLoading = false, 
  onRefresh 
}) => {
  const [filteredData, setFilteredData] = useState<ImportHistoryItem[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.provider_name || item.provider || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.import_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string): any => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const exportHistory = () => {
    try {
      const csv = convertToCSV(filteredData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('History exported as CSV');
    } catch (error) {
      toast.error('Failed to export history');
    }
  };

  const convertToCSV = (items: ImportHistoryItem[]): string => {
    const headers = [
      'ID',
      'Provider',
      'Type',
      'Status',
      'Imported',
      'Updated',
      'Skipped',
      'Started',
      'Completed',
      'Duration (s)',
      'Error'
    ];

    const rows = items.map(item => [
      item.id,
      item.provider_name || item.provider || '-',
      item.import_type,
      item.status,
      item.games_imported || item.total_games_imported || 0,
      item.games_updated || item.total_games_updated || 0,
      item.games_skipped || item.total_games_skipped || 0,
      new Date(item.started_at).toLocaleString(),
      item.completed_at ? new Date(item.completed_at).toLocaleString() : '-',
      item.import_duration_seconds || '-',
      item.error_message || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Import History</CardTitle>
            <CardDescription>View all game import operations</CardDescription>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Refresh
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={filteredData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search provider or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {paginatedData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {data.length === 0 ? 'No imports yet' : 'No results matching your filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Provider</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Imported</th>
                    <th className="text-right p-3 font-medium">Updated</th>
                    <th className="text-right p-3 font-medium">Skipped</th>
                    <th className="text-left p-3 font-medium">Started</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-muted/30 transition"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 font-medium">
                        {item.provider_name || item.provider || '-'}
                      </td>
                      <td className="p-3 capitalize">{item.import_type}</td>
                      <td className="p-3 text-right">
                        <span className="text-green-600 font-semibold">
                          {item.games_imported || item.total_games_imported || 0}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-blue-600">
                          {item.games_updated || item.total_games_updated || 0}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-yellow-600">
                          {item.games_skipped || item.total_games_skipped || 0}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(item.started_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {item.status === 'completed' && item.import_duration_seconds ? (
                          <span className="text-xs">{item.import_duration_seconds}s</span>
                        ) : item.status === 'failed' && item.error_message ? (
                          <span className="text-xs text-red-500 truncate max-w-xs" title={item.error_message}>
                            {item.error_message.substring(0, 30)}...
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                  Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredData.length)} of{' '}
                  {filteredData.length} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                      }
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
