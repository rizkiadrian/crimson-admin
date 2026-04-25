"use client";

import { Plus, ListFilter, Pencil, Trash2 } from "lucide-react";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
  TableCell,
  Badge,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import {
  FilterPopup,
  FilterSection,
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
import { useTableData } from "@lib/hooks/use-table-data";
import {
  salesMembersService,
  ISalesUser,
  ISalesUserParams,
} from "@services/backoffice/sales-members";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { SearchInput } from "@app/components/ui/SearchInput";

const getColumns = (onDeleted: () => void): TableColumn<ISalesUser>[] => [
  {
    key: "name",
    header: "Name",
    render: (member) => (
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
            {getNameInitials(member.name)}
          </div>
          <div>
            <p className="text-[15px] font-bold text-text-main">
              {member.name}
            </p>
            <p className="text-[12px] text-text-muted">{member.email}</p>
          </div>
        </div>
      </TableCell>
    ),
  },
  {
    key: "sales_id",
    header: "Sales ID",
    render: (member) => (
      <TableCell>
        <Badge variant="primary" showDot={false}>
          {member.sales_id}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    render: (member) => (
      <TableCell>
        <p className="text-[14px] text-text-muted">{member.phone ?? "—"}</p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (member) => (
      <TableCell>
        <SalesMemberActions memberId={member.id} onDeleted={onDeleted} />
      </TableCell>
    ),
  },
];

function SalesMemberActions({
  memberId,
  onDeleted,
}: {
  memberId: number;
  onDeleted: () => void;
}) {
  const searchParams = useSearchParams();
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const currentPage = searchParams.get("page");
  const editHref = currentPage
    ? `${PATHS.salesMembersEdit(memberId)}?returnPage=${currentPage}`
    : PATHS.salesMembersEdit(memberId);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Sales Member?",
      description:
        "Tindakan ini tidak dapat dibatalkan. Data sales member akan dihapus secara permanen dari sistem.",
      onConfirm: async () => {
        try {
          const resp = await salesMembersService.salesMembersDelete(memberId);
          showNotification(resp.message, "success");
          onDeleted();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus sales member",
            "error"
          );
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={editHref}
        aria-label="Edit"
      >
        <Pencil size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
        aria-label="Delete"
        onClick={handleDelete}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

const DEFAULT_FILTERS = {
  dateFrom: "",
  dateTo: "",
};

export function SalesTable() {
  const fetcher = useCallback(
    (params: ISalesUserParams) => salesMembersService.salesMembers(params),
    []
  );

  const {
    data: members,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    refetch,
    isMounted,
  } = useTableData<ISalesUser, ISalesUserParams>({
    fetcher,
    perPage: 10,
  });

  const columns = getColumns(refetch);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleApplyFilters = () => setFilterOpen(false);
  const handleResetFilters = () => setFilters(DEFAULT_FILTERS);

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Sales Members"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search sales..."
              />
              <Button
                variant="primary"
                href={PATHS.salesMembersCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Sales
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-auto w-auto p-2.5"
                onClick={() => setFilterOpen(true)}
                aria-label="Filter"
              >
                <ListFilter size={18} />
              </Button>
            </>
          }
        />

        <TableCardContent
          columns={columns}
          data={members}
          keyExtractor={(member) => member.id}
          isRefetching={isRefetching}
          isLoading={isInitialLoad}
          error={error}
        />

        <TableCardPagination
          pagination={pagination}
          isInitialLoad={isInitialLoad}
          error={error}
          onPageChange={handlePageChange}
        />
      </TableCard>

      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Sales Members"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Date Joined">
          <FilterDateRange
            startDate={filters.dateFrom}
            endDate={filters.dateTo}
            onStartDateChange={(dateFrom) =>
              setFilters((prev) => ({ ...prev, dateFrom }))
            }
            onEndDateChange={(dateTo) =>
              setFilters((prev) => ({ ...prev, dateTo }))
            }
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
