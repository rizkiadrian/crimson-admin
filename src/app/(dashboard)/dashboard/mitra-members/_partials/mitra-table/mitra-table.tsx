"use client";
import { ListFilter, Download, Pencil, Trash2, Eye } from "lucide-react";
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
  mitraMembersService,
  IMitraUser,
  IMitraUserParams,
} from "@services/backoffice/mitra-members";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { SearchInput } from "@app/components/ui/SearchInput";

/** Map verification_status to badge variant. */
const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "error" | "neutral"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  suspended: "neutral",
};

const getColumns = (onDeleted: () => void): TableColumn<IMitraUser>[] => [
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
            <p className="text-[12px] text-text-muted">
              {member.mitra?.service_category?.name || "—"}
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
    header: "Verification",
    render: (member) => {
      const status = member.mitra?.verification_status || "pending";
      return (
        <TableCell>
          <Badge variant={STATUS_VARIANT[status] || "neutral"}>{status}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (member) => (
      <TableCell>
        <MitraActions memberId={member.id} onDeleted={onDeleted} />
      </TableCell>
    ),
  },
];

function MitraActions({
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
  const showHref = currentPage
    ? `${PATHS.mitraMembersShow(memberId)}?returnPage=${currentPage}`
    : PATHS.mitraMembersShow(memberId);
  const editHref = currentPage
    ? `${PATHS.mitraMembersEdit(memberId)}?returnPage=${currentPage}`
    : PATHS.mitraMembersEdit(memberId);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Data Mitra?",
      description:
        "Tindakan ini tidak dapat dibatalkan. Seluruh data profil mitra akan dihapus secara permanen dari sistem.",
      onConfirm: async () => {
        try {
          const resp = await mitraMembersService.mitraMembersDelete(memberId);
          showNotification(resp.message, "success");
          onDeleted();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus mitra",
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
        className="h-auto w-auto p-2 rounded-lg hover:text-tertiary-600 hover:bg-tertiary-50 hover:border-transparent"
        href={showHref}
        aria-label="View"
      >
        <Eye size={16} />
      </Button>
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

const VERIFICATION_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
  dateFrom: "",
  dateTo: "",
};

export function MitraTable() {
  const fetcher = useCallback(
    (params: IMitraUserParams) => mitraMembersService.mitraMembers(params),
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
  } = useTableData<IMitraUser, IMitraUserParams>({
    fetcher,
    perPage: 10,
  });

  const columns = getColumns(refetch);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Mitra Members"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search mitra..."
              />
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
        title="Filter Mitra"
        onApply={() => setFilterOpen(false)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      >
        <FilterSection label="Verification Status">
          <FilterChipGroup
            options={VERIFICATION_OPTIONS}
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
