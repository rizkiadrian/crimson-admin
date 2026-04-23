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
  backofficeMembersService,
  IBackofficeUser,
  IBackofficeUserParams,
} from "@services/backoffice/backoffice-members";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";

/**
 * Column definitions for the backoffice members table.
 * Accepts an `onDeleted` callback so the actions column can trigger a refetch after delete.
 */
const getColumns = (onDeleted: () => void): TableColumn<IBackofficeUser>[] => [
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
    key: "role",
    header: "Role",
    render: (member) => (
      <TableCell>
        <Badge
          variant={
            member.role_name?.toLowerCase() === "admin" ? "primary" : "tertiary"
          }
        >
          {member.role_name}
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
        <MemberActions memberId={member.id} onDeleted={onDeleted} />
      </TableCell>
    ),
  },
];

/**
 * Action buttons for each table row.
 * Reads the current page from URL search params and appends it to the edit link
 * so the edit page can redirect back to the same page after submit.
 */
function MemberActions({
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
    ? `${PATHS.backofficeMembersEdit(memberId)}?returnPage=${currentPage}`
    : PATHS.backofficeMembersEdit(memberId);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Data Backoffice?",
      description:
        "Tindakan ini tidak dapat dibatalkan. Seluruh data profil backoffice akan dihapus secara permanen dari sistem.",
      onConfirm: async () => {
        try {
          const resp =
            await backofficeMembersService.backofficeMembersDelete(memberId);
          showNotification(resp.message, "success");
          onDeleted();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus member",
            "error"
          );
          throw err; // Re-throw so ConfirmDialog stops loading
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

/** Role filter options for the chip group. */
const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
  { label: "Viewer", value: "viewer" },
];

/** Verification status filter options. */
const STATUS_OPTIONS = [
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
];

/** Default state for all filter fields. */
const DEFAULT_FILTERS = {
  roles: [] as string[],
  statuses: [] as string[],
  dateFrom: "",
  dateTo: "",
};

/**
 * Backoffice members table page component.
 *
 * Demonstrates the standard pattern for building a table page:
 * 1. Define columns as a static array outside the component.
 * 2. Use `useTableData` to handle fetching, pagination, and loading states.
 * 3. Compose `TableCard` + `TableCardHeader` + `TableCardContent` + `TableCardPagination`.
 * 4. Use `FilterPopup` for the filter modal triggered by the filter button.
 */
export function MemberTable() {
  // Wrap the service call in useCallback to keep a stable reference for useTableData
  const fetcher = useCallback(
    (params: IBackofficeUserParams) =>
      backofficeMembersService.backofficeMembers(params),
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
  } = useTableData<IBackofficeUser, IBackofficeUserParams>({
    fetcher,
    perPage: 10,
  });

  // Build columns with refetch callback for delete action
  const columns = getColumns(refetch);

  // Filter popup state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleApplyFilters = () => {
    // TODO: integrate filters with useTableData.setParams when API supports filtering
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Prevent rendering until client-side hydration is complete
  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Backoffice Members"
          actions={
            <>
              <Button
                variant="primary"
                href={PATHS.backofficeMembersCreate}
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
              >
                <ListFilter size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-auto w-auto p-2.5"
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

      {/* Filter popup modal */}
      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Members"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Role">
          <FilterChipGroup
            options={ROLE_OPTIONS}
            selected={filters.roles}
            onChange={(roles) => setFilters((prev) => ({ ...prev, roles }))}
          />
        </FilterSection>

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
