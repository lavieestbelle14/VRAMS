
'use client';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Application } from '@/types';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ApplicationDataTableProps {
  applications: Application[];
}

export function ApplicationDataTable({ applications }: ApplicationDataTableProps) {
  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return 'default'; // default is primary color (blueish in this theme)
      case 'pending':
        return 'secondary'; // light greyish
      case 'rejected':
        return 'destructive'; // red
      case 'reviewing':
        return 'outline'; // This will use accent for hover, default border. We can customize specific 'warning' variant if needed.
      default:
        return 'secondary';
    }
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant Name</TableHead>
            <TableHead>Application Type</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No applications found.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
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
                      {/* Edit might be complex for now, can be added later */}
                      {/* <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Application
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
