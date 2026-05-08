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
import { articleCategoriesService } from "@services/backoffice/article-categories";
import type {
  IArticleCategory,
  IArticleCategoryParams,
} from "@services/backoffice/article-categories";
import { PATHS } from "@config/routing";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function CategoryActions({
  category,
  onRefetch,
}: {
  category: IArticleCategory;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Category?",
      description: `Category "${category.name}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const resp = await articleCategoriesService.delete(category.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          const apiError = err as { message?: string };
          showNotification(
            apiError.message || "Gagal menghapus category",
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
        href={PATHS.articleCategoryEdit(category.id)}
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

const getColumns = (onRefetch: () => void): TableColumn<IArticleCategory>[] => [
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
        <CategoryActions category={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

export default function ArticleCategoriesPage() {
  const fetcher = useCallback(
    (params: IArticleCategoryParams) => articleCategoriesService.list(params),
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
  } = useTableData<IArticleCategory, IArticleCategoryParams>({
    fetcher,
    perPage: 15,
  });

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Article Categories"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Search categories..."
            />
            <Button
              variant="primary"
              href={PATHS.articleCategoryCreate}
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Category
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
