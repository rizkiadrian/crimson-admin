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
import { useTableData } from "@lib/hooks/use-table-data";
import {
  backofficeMembersService,
  IBackofficeUser,
  IBackofficeUserParams,
} from "@services/backoffice/backoffice-members";
import { getNameInitials } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useCallback } from "react";

const columns: TableColumn<IBackofficeUser>[] = [
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
    render: () => (
      <TableCell>
        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    ),
  },
];

export function MemberTable() {
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
    isMounted,
  } = useTableData<IBackofficeUser, IBackofficeUserParams>({
    fetcher,
    perPage: 10,
  });

  if (!isMounted) return null;

  return (
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
  );
}
