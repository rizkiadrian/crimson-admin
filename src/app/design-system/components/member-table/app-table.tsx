// // src/components/dashboard/ClientTable.tsx
import { Plus, ListFilter, Download, Pencil, Trash2 } from "lucide-react";
import { TableHeader } from "@app/components/ui/TableHeader";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
} from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";

// Dummy data tetap sama...
const CLIENTS = [
  {
    id: 1,
    initials: "AS",
    name: "Alexander Sterling",
    email: "alexander.s@vanguard.com",
    status: "ACTIVE",
    amount: "$142,500.00",
    tier: "HIGH-VALUE TIER",
  },
  {
    id: 2,
    initials: "ER",
    name: "Elena Rodriguez",
    email: "elena.rod@fintech.io",
    status: "ACTIVE",
    amount: "$89,200.50",
    tier: "RETAINER CLIENT",
  },
  {
    id: 3,
    initials: "MW",
    name: "Marcus Wainwright",
    email: "m.wainwright@heritage.co",
    status: "INACTIVE",
    amount: "$12,400.00",
    tier: "DORMANT ACCOUNT",
  },
];

export function AppTable() {
  return (
    <div className="bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden">
      {/* 1. Generic Table Header */}
      <TableHeader
        title="Client Directory"
        badge="Verified Only"
        actions={
          <>
            <Button
              variant="primary"
              // Timpa sedikit base styling-nya agar 100% match dengan desain (rounded-xl, gap, height)
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add New Customer
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-auto w-auto p-2.5"
              aria-label="Filter"
            >
              <ListFilter size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-auto w-auto p-2.5"
              aria-label="Download"
            >
              <Download size={18} />
            </Button>
          </>
        }
      />

      {/* 2. Generic Table Body */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Client Name</TableHeaderCell>
            <TableHeaderCell>Relationship Status</TableHeaderCell>
            <TableHeaderCell>Total Transactional Spend</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {CLIENTS.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
                    {client.initials}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-text-main">
                      {client.name}
                    </p>
                    <p className="text-[13px] text-text-muted font-medium">
                      {client.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={client.status === "ACTIVE" ? "primary" : "tertiary"}
                >
                  {client.status}
                </Badge>
              </TableCell>

              <TableCell>
                <p className="text-[15px] font-bold text-text-main">
                  {client.amount}
                </p>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                  {client.tier}
                </p>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {/* Tombol Edit (Pencil) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>

                  {/* Tombol Delete (Trash) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 3. Footer / Pagination (Bisa dibuat generic juga nantinya) */}
      <div className="px-8 py-6 border-t border-border-subtle flex items-center justify-between">
        {/* ... (Kode pagination tetap sama) ... */}
      </div>
    </div>
  );
}
