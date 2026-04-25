"use client";
import { Plus, ListFilter, Download, Pencil, Trash2 } from "lucide-react";
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
  FilterChipGroup,
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
import { useTableData } from "@lib/hooks/use-table-data";
import {
  clientMembersService,
  IClientUser,
  IClientUserParams,
} from "@services/backoffice/client-members";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";

/**
 * Column definitions for the client members table.
 */
const getColumns = (onDeleted: () => void): TableColumn<IClientUser>[] => [
  {
    key: "name",
    header: "Name",
    render: (member) => (
      <TableCell>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
            {getNameInitials(member.name)}
          </div>
          <div>
            <p className="text-[15px] font-bold text-text-main">
              {member.name}
            </p>
          </div>
        </div>
      </TableCell>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (member) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">{member.email}</p>
      </TableCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (member) => (
      <TableCell>
        <Badge variant={member.is_verified ? "success" : "warning"}>
          {member.is_verified ? "Verified" : "Unverified"}
        </Badge>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (member) => (
      <TableCell>
        <ClientActions memberId={member.id} onDeleted={onDeleted} />
      </TableCell>
    ),
  },
];

/**
 * Action buttons for each client table row.
 */
function ClientActions({
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
    ? `${PATHS.clientMembersEdit(memberId)}?returnPage=${currentPage}`
    : PATHS.clientMembersEdit(memberId);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Data Client?",
      description:
        "Tindakan ini tidak dapat dibatalkan. Seluruh data profil client akan dihapus secara permanen dari sistem.",
      onConfirm: async () => {
        try {
          const resp = await clientMembersService.clientMembersDelete(memberId);
          showNotification(resp.message, "success");
          onDeleted();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus client",
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

/** Verification status filter options. */
const STATUS_OPTIONS = [
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
];

/** Default state for all filter fields. */
const DEFAULT_FILTERS = {
  statuses: [] as string[],
  dateFrom: "",
  dateTo: "",
};

/**
 * Client members table page component.
 */
export function ClientTable() {
  const fetcher = useCallback(
    (params: IClientUserParams) => clientMembersService.clientMembers(params),
    []
  );

  const {
    data: members,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    refetch,
    isMounted,
  } = useTableData<IClientUser, IClientUserParams>({
    fetcher,
    perPage: 10,
  });

  const columns = getColumns(refetch);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleApplyFilters = () => {
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Client Members"
          actions={
            <>
              <Button
                variant="primary"
                href={PATHS.clientMembersCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add New
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
        title="Filter Clients"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Verification Status">
          <FilterChipGroup
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) =>
              setFilters((prev) => ({ ...prev, statuses }))
            }
          />
        </FilterSection>

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
