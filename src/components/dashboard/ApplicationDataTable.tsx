'use client';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { Application } from '@/types';
import { Eye, MoreHorizontal, ArrowUpDown, Trash2, Calendar as CalendarIconLucide, FileDown, Search } from 'lucide-react';
import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteApplicationById } from '@/lib/applicationStore'; 
import { useToast } from '@/hooks/use-toast';

interface ApplicationDataTableProps {
  applications: Application[];
  onReviewId?: (application: Application) => void;
}

type SortKey = 'applicantName' | 'submissionDate' | 'status';
type SortDirection = 'asc' | 'desc';

export function ApplicationDataTable({ applications: initialApplications, onReviewId }: ApplicationDataTableProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [sortKey, setSortKey] = useState<SortKey>('submissionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });
  const [searchTerm, setSearchTerm] = useState<string>('');

    const handleDateRangeSelect = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    setDateRange(range || { from: undefined, to: undefined });
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [applicationToDeleteId, setApplicationToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleDeleteApplication = (id: string) => {
    setApplicationToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (applicationToDeleteId) {
      const success = deleteApplicationById(applicationToDeleteId);
      if (success) {
        setApplications(prev => prev.filter(app => app.id !== applicationToDeleteId));
        toast({ title: "Application Deleted", description: `Application ID ${applicationToDeleteId} has been deleted.` });
      } else {
        toast({ title: "Error", description: "Failed to delete application.", variant: "destructive" });
      }
      setApplicationToDeleteId(null);
      setShowDeleteDialog(false);
    }
  };

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        `${app.personalInfo.firstName} ${app.personalInfo.lastName}`.toLowerCase().includes(lowerSearchTerm) ||
        app.id.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationType === typeFilter);
    }
    // Date range filter
    if (dateRange.from) {
      const fromDate = startOfDay(dateRange.from);
      filtered = filtered.filter(app => {
        const submissionDate = parseISO(app.submissionDate);
        return isValid(submissionDate) && submissionDate >= fromDate;
      });
    }
    if (dateRange.to) {
      const toDate = endOfDay(dateRange.to);
      filtered = filtered.filter(app => {
        const submissionDate = parseISO(app.submissionDate);
        return isValid(submissionDate) && submissionDate <= toDate;
      });
    }

    // Sorting
    return filtered.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortKey === 'applicantName') {
        valA = `${a.personalInfo.firstName} ${a.personalInfo.lastName}`.toLowerCase();
        valB = `${b.personalInfo.firstName} ${b.personalInfo.lastName}`.toLowerCase();
      } else if (sortKey === 'submissionDate') {
        valA = new Date(a.submissionDate).getTime();
        valB = new Date(b.submissionDate).getTime();
      } else if (sortKey === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, statusFilter, typeFilter, dateRange, sortKey, sortDirection, searchTerm]);

  const SortableHeader = ({ children, sortFieldKey }: { children: React.ReactNode; sortFieldKey: SortKey }) => (
    <TableHead onClick={() => handleSort(sortFieldKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-2">
        {children}
        {sortKey === sortFieldKey && <ArrowUpDown className="h-3 w-3" />}
      </div>
    </TableHead>
  );

  const exportToCSV = () => {
    if (filteredAndSortedApplications.length === 0) {
      toast({ title: "No Data", description: "There is no data to export.", variant: "destructive" });
      return;
    }

    const headers = [
      "ID", "Applicant Name", "Application Type", "Submission Date", "Status", 
      "Voter ID", "Precinct", "Approval Date", "Remarks"
    ];
    const rows = filteredAndSortedApplications.map(app => [
      app.id,
      `${app.personalInfo.firstName} ${app.personalInfo.middleName || ''} ${app.personalInfo.lastName}`,
      app.applicationType,
      format(new Date(app.submissionDate), 'yyyy-MM-dd HH:mm'),
      app.status,
      app.voterId || 'N/A',
      app.precinct || 'N/A',
      app.approvalDate ? format(new Date(app.approvalDate), 'yyyy-MM-dd HH:mm') : 'N/A',
      app.remarks || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
      + rows.map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vrams_applications_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: "Application data has been exported to CSV." });
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:flex-nowrap sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="register">New Registration</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIconLucide className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateRangeSelect} // Use the new handler here
        />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setDateRange({}); }} className="w-full sm:w-auto">
            Clear Filters
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto ml-auto">
            <FileDown className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortFieldKey="applicantName">Applicant Name</SortableHeader>
              <TableHead>Application Type</TableHead>
              <SortableHeader sortFieldKey="submissionDate">Submission Date</SortableHeader>
              <SortableHeader sortFieldKey="status">Status</SortableHeader>
              <TableHead>ID Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No applications match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.personalInfo.firstName} {app.personalInfo.lastName}
                    <div className="text-xs text-muted-foreground">ID: {app.id}</div>
                  </TableCell>
                  <TableCell className="capitalize">{app.applicationType}</TableCell>
                  <TableCell>{format(new Date(app.submissionDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(app.status)} className="capitalize">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.idDocumentUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReviewId && onReviewId(app)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Review ID
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No ID Submitted</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/applications/${app.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        {app.idDocumentUrl && onReviewId && (
                          <DropdownMenuItem onClick={() => onReviewId(app)}>
                            <Eye className="mr-2 h-4 w-4" /> Review ID
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteApplication(app.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application
              (ID: {applicationToDeleteId}) from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApplicationToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

