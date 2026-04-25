"use client";
import React from "react";
import { Text } from "@app/components/ui/Text";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCell,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";

interface DemoItem {
  id: number;
  name: string;
}

const columns: TableColumn<DemoItem>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => <TableCell>{item.name}</TableCell>,
  },
  {
    key: "email",
    header: "Email",
    render: () => <TableCell>—</TableCell>,
  },
  {
    key: "status",
    header: "Status",
    render: () => <TableCell>—</TableCell>,
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: () => <TableCell>—</TableCell>,
  },
];

export function EmptyStateShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Default empty state */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Default Empty State
          </Text>
        </div>

        <div className="w-full">
          <TableCard>
            <TableCardHeader title="Members" />
            <TableCardContent
              columns={columns}
              data={[]}
              keyExtractor={(item) => item.id}
              isLoading={false}
              error={null}
            />
          </TableCard>
        </div>
      </div>

      {/* Custom empty message */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Custom Empty Message
          </Text>
        </div>

        <div className="w-full">
          <TableCard>
            <TableCardHeader title="Search Results" />
            <TableCardContent
              columns={columns}
              data={[]}
              keyExtractor={(item) => item.id}
              isLoading={false}
              error={null}
              emptyTitle='No results for "xyz"'
              emptyMessage="We couldn't find any members matching your search. Try a different keyword."
            />
          </TableCard>
        </div>
      </div>
    </div>
  );
}
