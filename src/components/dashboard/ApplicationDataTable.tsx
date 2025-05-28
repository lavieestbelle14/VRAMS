
'use client';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Application } from '@/types';
import { Eye, MoreHorizontal, ArrowUpDown, ListFilter, Calendar as CalendarIconLucide } from 'lucide-react';
import { format, parseISO, isValid, subDays, startOfDay, endOfDay } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input'; // For potential search later

interface ApplicationDataTableProps {
  applications: Application[];
}

type SortKey = 'applicantName' | 'submissionDate' | 'status';
type SortDirection = 'asc' | 'desc';

export function ApplicationDataTable({ applications: initialApplications }: ApplicationDataTableProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [sortKey, setSortKey] = useState<SortKey>('submissionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });

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

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...initialApplications];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.applicationType === typeFilter);
    }
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
  }, [initialApplications, statusFilter, typeFilter, dateRange, sortKey, sortDirection]);

  const SortableHeader = ({ children, sortFieldKey }: { children: React.ReactNode; sortFieldKey: SortKey }) => (
    <TableHead onClick={() => handleSort(sortFieldKey)} className="cursor-pointer hover:bg-muted/50">
      <div className="flex items-center gap-2">
        {children}
        {sortKey === sortFieldKey && <ArrowUpDown className="h-3 w-3" />}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 p-4 border rounded-lg bg-card">
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
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
         <Button variant="outline" onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setDateRange({}); }} className="w-full sm:w-auto">
          Clear Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortFieldKey="applicantName">Applicant Name</SortableHeader>
              <TableHead>Application Type</TableHead>
              <SortableHeader sortFieldKey="submissionDate">Submission Date</SortableHeader>
              <SortableHeader sortFieldKey="status">Status</SortableHeader>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

