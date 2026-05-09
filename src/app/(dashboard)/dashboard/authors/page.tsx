"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
  TableCell,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { SearchInput } from "@app/components/ui/SearchInput";
import { useTableData } from "@lib/hooks/use-table-data";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { authorsService } from "@services/marketing/authors";
import type { IAuthor, IAuthorParams } from "@services/marketing/authors";
import { PATHS } from "@config/routing";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function AuthorActions({
  author,
  onRefetch,
}: {
  author: IAuthor;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Author?",
      description: `Author "${author.name}" akan dihapus dari sistem.`,
      onConfirm: async () => {
        try {
          const resp = await authorsService.delete(author.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus author",
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
        href={PATHS.authorEdit(author.id)}
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

const getColumns = (onRefetch: () => void): TableColumn<IAuthor>[] => [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <TableCell>
        <div className="flex items-center gap-3">
          {item.avatar_url ? (
            <Image
              src={item.avatar_url}
              alt={item.name}
              width={36}
              height={36}
              className="rounded-full object-cover w-9 h-9"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-[15px] font-bold text-text-main">{item.name}</p>
        </div>
      </TableCell>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.email || "—"}</p>
      </TableCell>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{formatDate(item.created_at)}</p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <AuthorActions author={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

export default function AuthorsPage() {
  const fetcher = useCallback(
    (params: IAuthorParams) => authorsService.list(params),
    []
  );

  const {
    data: authors,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    refetch,
    isMounted,
  } = useTableData<IAuthor, IAuthorParams>({ fetcher, perPage: 15 });

  const columns = getColumns(refetch);

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Authors"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search authors..."
            />
            <Button
              variant="primary"
              href={PATHS.authorCreate}
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Author
            </Button>
          </>
        }
      />
      <TableCardContent
        columns={columns}
        data={authors}
        keyExtractor={(item) => item.id}
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
