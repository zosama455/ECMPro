import { useState, useMemo } from 'react';
import { X, Download, Filter, Calendar, User, FileText, ChevronRight, Search } from 'lucide-react';

interface DetailItem {
  label: string;
  value: string | number;
  trend?: string;
  type?: 'success' | 'warning' | 'info';
}

interface DocumentSample {
  id: string;
  name: string;
  date: string;
  status: string;
  type: string;
  createdAt?: Date;
}

interface RetentionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    type: 'chart' | 'counter';
    value?: string | number;
    chartData?: { label: string; value: number; color: string }[];
    note?: string;
  } | null;
}

type DateRange = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export function RetentionDetailsModal({ isOpen, onClose, widget }: RetentionDetailsModalProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  if (!isOpen || !widget) return null;

  const Icon = widget.icon;

  const getDetailedStats = (): DetailItem[] => {
    switch (widget.id) {
      case 'active-docs':
        return [
          { label: 'Total Documents', value: 1590, type: 'info' },
          { label: 'Active (Last 30 days)', value: 1250, trend: '+12%', type: 'success' },
          { label: 'Inactive', value: 340, trend: '-5%', type: 'warning' },
          { label: 'Avg. Access/Day', value: 145, trend: '+8%', type: 'info' },
        ];
      case 'archived-docs':
        return [
          { label: 'Total Documents', value: 1590, type: 'info' },
          { label: 'Archived', value: 892, trend: '+15%', type: 'success' },
          { label: 'Pending Archive', value: 698, type: 'warning' },
          { label: 'Archive Rate', value: '56%', trend: '+3%', type: 'info' },
        ];
      case 'disposed-docs':
        return [
          { label: 'Total Disposed', value: 156, trend: '+22', type: 'success' },
          { label: 'Eligible for Disposal', value: 89, type: 'warning' },
          { label: 'Awaiting Approval', value: 34, type: 'info' },
          { label: 'This Month', value: 12, trend: '+4', type: 'info' },
        ];
      case 'relocated-docs':
        return [
          { label: 'Total Relocated', value: 234, trend: '+18', type: 'success' },
          { label: 'Eligible for Relocation', value: 67, type: 'warning' },
          { label: 'Permanent Records', value: 301, type: 'info' },
          { label: 'This Quarter', value: 45, trend: '+12', type: 'info' },
        ];
      case 'disposal-events':
        return [
          { label: 'Approved Events', value: 42, type: 'success' },
          { label: 'Pending Approval', value: 8, type: 'warning' },
          { label: 'Completed', value: 34, trend: '+6', type: 'success' },
          { label: 'Avg. Processing Time', value: '3.2 days', type: 'info' },
        ];
      case 'relocation-events':
        return [
          { label: 'Approved Events', value: 28, type: 'success' },
          { label: 'Pending Approval', value: 5, type: 'warning' },
          { label: 'Completed', value: 23, trend: '+4', type: 'success' },
          { label: 'Avg. Processing Time', value: '2.8 days', type: 'info' },
        ];
      case 'legal-holds':
        return [
          { label: 'Active Holds', value: 15, type: 'warning' },
          { label: 'Documents Affected', value: 347, type: 'info' },
          { label: 'Longest Hold Duration', value: '245 days', type: 'info' },
          { label: 'Expired This Month', value: 3, trend: '-2', type: 'success' },
        ];
      default:
        return [];
    }
  };

  const getSampleDocuments = (): DocumentSample[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (widget.id) {
      case 'active-docs':
        return [
          { id: '1', name: 'Project Proposal Q1 2024.pdf', date: '2 hours ago', status: 'Active', type: 'Document', createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
          { id: '2', name: 'Budget Report 2024.xlsx', date: '5 hours ago', status: 'Active', type: 'Spreadsheet', createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
          { id: '3', name: 'Meeting Notes - Jan.docx', date: '1 day ago', status: 'Active', type: 'Document', createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          { id: '4', name: 'Marketing Plan.pptx', date: '3 days ago', status: 'Inactive', type: 'Presentation', createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
          { id: '5', name: 'Contract Template.pdf', date: '7 days ago', status: 'Inactive', type: 'Document', createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        ];
      case 'archived-docs':
        return [
          { id: '1', name: '2023 Annual Report.pdf', date: 'Jan 15, 2024', status: 'Archived', type: 'Report', createdAt: new Date(2024, 0, 15) },
          { id: '2', name: 'Q4 2023 Financial.xlsx', date: 'Jan 10, 2024', status: 'Archived', type: 'Financial', createdAt: new Date(2024, 0, 10) },
          { id: '3', name: 'Employee Records 2023.pdf', date: 'Jan 5, 2024', status: 'Pending', type: 'HR', createdAt: new Date(2024, 0, 5) },
          { id: '4', name: 'Old Contracts Archive.zip', date: 'Dec 28, 2023', status: 'Archived', type: 'Legal', createdAt: new Date(2023, 11, 28) },
          { id: '5', name: 'Project Files 2022.pdf', date: 'Dec 20, 2023', status: 'Pending', type: 'Project', createdAt: new Date(2023, 11, 20) },
        ];
      case 'disposed-docs':
        return [
          { id: '1', name: 'Expired Contracts 2020.pdf', date: 'Feb 1, 2024', status: 'Disposed', type: 'Legal', createdAt: new Date(2024, 1, 1) },
          { id: '2', name: 'Old Invoices 2019.pdf', date: 'Jan 28, 2024', status: 'Disposed', type: 'Financial', createdAt: new Date(2024, 0, 28) },
          { id: '3', name: 'Temporary Files Archive.zip', date: 'Jan 20, 2024', status: 'Eligible', type: 'Archive', createdAt: new Date(2024, 0, 20) },
          { id: '4', name: 'Draft Documents 2020.pdf', date: 'Jan 15, 2024', status: 'Eligible', type: 'Document', createdAt: new Date(2024, 0, 15) },
          { id: '5', name: 'Outdated Policies.pdf', date: 'Jan 10, 2024', status: 'Eligible', type: 'Policy', createdAt: new Date(2024, 0, 10) },
        ];
      default:
        return [
          { id: '1', name: 'Sample Document 1.pdf', date: 'Today', status: 'Active', type: 'Document', createdAt: today },
          { id: '2', name: 'Sample Document 2.pdf', date: 'Yesterday', status: 'Active', type: 'Document', createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
          { id: '3', name: 'Sample Document 3.pdf', date: '2 days ago', status: 'Active', type: 'Document', createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
        ];
    }
  };

  const detailedStats = getDetailedStats();
  const allDocs = getSampleDocuments();

  const documentTypes = useMemo(() => {
    const types = new Set(allDocs.map(doc => doc.type));
    return ['all', ...Array.from(types)];
  }, [allDocs]);

  const documentStatuses = useMemo(() => {
    const statuses = new Set(allDocs.map(doc => doc.status));
    return ['all', ...Array.from(statuses)];
  }, [allDocs]);

  const getDateRangeFilter = (doc: DocumentSample): boolean => {
    if (!doc.createdAt) return true;
    const now = new Date();
    const docDate = doc.createdAt;

    switch (dateRange) {
      case 'all':
        return true;
      case 'today':
        return docDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return docDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return docDate >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return docDate >= quarterAgo;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return docDate >= yearAgo;
      case 'custom':
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate) : new Date(0);
        const end = customEndDate ? new Date(customEndDate) : new Date();
        return docDate >= start && docDate <= end;
      default:
        return true;
    }
  };

  const filteredDocs = useMemo(() => {
    return allDocs.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      const matchesDate = getDateRangeFilter(doc);

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [allDocs, searchQuery, selectedType, selectedStatus, dateRange, customStartDate, customEndDate]);

  const handleExport = () => {
    const csvData = [
      ['Retention Dashboard Report'],
      [`Widget: ${widget.title}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Detailed Statistics'],
      ...detailedStats.map(stat => [stat.label, stat.value.toString(), stat.trend || '']),
      [],
    ];

    if (widget.type === 'chart' && widget.chartData) {
      const total = widget.chartData.reduce((sum, d) => sum + d.value, 0);
      csvData.push(['Distribution']);
      csvData.push(['Category', 'Count', 'Percentage']);
      widget.chartData.forEach(data => {
        const percentage = Math.round((data.value / total) * 100);
        csvData.push([data.label, data.value.toString(), `${percentage}%`]);
      });
      csvData.push([]);
    }

    csvData.push(['Recent Documents']);
    csvData.push(['Document Name', 'Type', 'Date', 'Status']);
    filteredDocs.forEach(doc => {
      csvData.push([doc.name, doc.type, doc.date, doc.status]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const activeFilterCount = [
    searchQuery !== '',
    selectedType !== 'all',
    selectedStatus !== 'all',
    dateRange !== 'all',
  ].filter(Boolean).length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'archived':
        return 'bg-blue-100 text-blue-700';
      case 'disposed':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
      case 'eligible':
        return 'bg-amber-100 text-amber-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{widget.title}</h2>
              <p className="text-gray-600 mt-1">{widget.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {detailedStats.map((stat, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getStatTypeColor(stat.type)}`}
                  >
                    <div className="text-sm font-medium mb-1">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      {stat.trend && (
                        <div className="text-xs font-semibold">{stat.trend}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {widget.type === 'chart' && widget.chartData && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h3>
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                  <div className="space-y-4">
                    {widget.chartData.map((data, index) => {
                      const total = widget.chartData!.reduce((sum, d) => sum + d.value, 0);
                      const percentage = Math.round((data.value / total) * 100);

                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{data.label}</span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{data.value}</div>
                              <div className="text-xs text-gray-500">{percentage}%</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${data.color} h-3 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 text-sm border rounded-lg transition-colors flex items-center gap-2 ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Document Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {documentTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {documentStatuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Statuses' : status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Date Range</label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as DateRange)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="quarter">Last 90 Days</option>
                      <option value="year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                {dateRange === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                  <span className="text-sm text-gray-600">
                    Showing {filteredDocs.length} of {allDocs.length} documents
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                      setSelectedStatus('all');
                      setDateRange('all');
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center">
                          <div className="text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No documents found</p>
                            <p className="text-xs mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">{doc.type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5" />
                              {doc.date}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                              View
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredDocs.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredDocs.length} of {allDocs.length} documents
                  {activeFilterCount > 0 && (
                    <span className="text-emerald-600 font-medium ml-1">(filtered)</span>
                  )}
                </span>
                <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                  View all documents
                </button>
              </div>
            )}
          </div>

          {widget.note && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">i</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-900 mb-1">Note</div>
                  <p className="text-sm text-blue-700">{widget.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
