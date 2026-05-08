"use client";

import { useCallback } from "react";
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
import { articleTagsService } from "@services/backoffice/article-tags";
import type {
  IArticleTag,
  IArticleTagParams,
} from "@services/backoffice/article-tags";
import { PATHS } from "@config/routing";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function TagActions({
  tag,
  onRefetch,
}: {
  tag: IArticleTag;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Tag?",
      description: `Tag "${tag.name}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const resp = await articleTagsService.delete(tag.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(apiError.message || "Gagal menghapus tag", "error");
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
        href={PATHS.articleTagEdit(tag.id)}
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

const getColumns = (onRefetch: () => void): TableColumn<IArticleTag>[] => [
  {
    key: "name",
    header: "Name",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">{item.name}</p>
      </TableCell>
    ),
  },
  {
    key: "slug",
    header: "Slug",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.slug}</p>
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
        <TagActions tag={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

export default function ArticleTagsPage() {
  const fetcher = useCallback(
    (params: IArticleTagParams) => articleTagsService.list(params),
    []
  );

  const {
    data,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    handleSearch,
    searchQuery,
    refetch,
    isMounted,
  } = useTableData<IArticleTag, IArticleTagParams>({ fetcher, perPage: 15 });

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Article Tags"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search tags..."
            />
            <Button
              variant="primary"
              href={PATHS.articleTagCreate}
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Tag
            </Button>
          </>
        }
      />
      <TableCardContent
        columns={getColumns(refetch)}
        data={data}
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
