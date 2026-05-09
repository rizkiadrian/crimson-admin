"use client";

import { useCallback, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ListFilter,
  Send,
  Archive,
  RotateCcw,
} from "lucide-react";
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
import { SearchInput } from "@app/components/ui/SearchInput";
import {
  FilterPopup,
  FilterSection,
  FilterChipGroup,
} from "@app/components/ui/FilterPopup";
import { useTableData } from "@lib/hooks/use-table-data";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { articlesService } from "@services/marketing/articles";
import type {
  IArticle,
  IArticleParams,
  ArticleStatus,
} from "@services/marketing/articles";
import { PATHS } from "@config/routing";

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS_BADGE: Record<
  ArticleStatus,
  { variant: "primary" | "success" | "warning" | "neutral"; label: string }
> = {
  draft: { variant: "neutral", label: "Draft" },
  scheduled: { variant: "warning", label: "Scheduled" },
  published: { variant: "success", label: "Published" },
  archived: { variant: "primary", label: "Archived" },
};

function ArticleActions({
  article,
  onRefetch,
}: {
  article: IArticle;
  onRefetch: () => void;
}) {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const handlePublish = () => {
    showConfirm({
      title: "Publish Article?",
      description: `"${article.title}" akan dipublish.`,
      confirmLabel: "Publish",
      onConfirm: async () => {
        try {
          const resp = await articlesService.publish(article.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          showNotification(
            (err as { message?: string }).message || "Failed",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleArchive = () => {
    showConfirm({
      title: "Archive Article?",
      description: `"${article.title}" akan diarsipkan.`,
      confirmLabel: "Archive",
      onConfirm: async () => {
        try {
          const resp = await articlesService.archive(article.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          showNotification(
            (err as { message?: string }).message || "Failed",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleUnpublish = () => {
    showConfirm({
      title: "Unpublish Article?",
      description: `"${article.title}" akan dikembalikan ke draft.`,
      confirmLabel: "Unpublish",
      onConfirm: async () => {
        try {
          const resp = await articlesService.unpublish(article.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          showNotification(
            (err as { message?: string }).message || "Failed",
            "error"
          );
          throw err;
        }
      },
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: "Hapus Article?",
      description: `"${article.title}" akan dihapus.`,
      onConfirm: async () => {
        try {
          const resp = await articlesService.delete(article.id);
          showNotification(resp.message, "success");
          onRefetch();
        } catch (err: unknown) {
          showNotification(
            (err as { message?: string }).message || "Failed",
            "error"
          );
          throw err;
        }
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
      {article.status === "draft" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-2 rounded-lg hover:text-success-600 hover:bg-success-50 hover:border-transparent"
          aria-label="Publish"
          onClick={handlePublish}
        >
          <Send size={16} />
        </Button>
      )}
      {article.status === "published" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-2 rounded-lg hover:text-warning-600 hover:bg-warning-50 hover:border-transparent"
            aria-label="Unpublish"
            onClick={handleUnpublish}
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-2 rounded-lg hover:text-neutral-600 hover:bg-neutral-100 hover:border-transparent"
            aria-label="Archive"
            onClick={handleArchive}
          >
            <Archive size={16} />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
        href={PATHS.articleEdit(article.id)}
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

const getColumns = (onRefetch: () => void): TableColumn<IArticle>[] => [
  {
    key: "title",
    header: "Title",
    render: (item) => (
      <TableCell>
        <p className="text-[15px] font-bold text-text-main">{item.title}</p>
        <p className="text-xs text-text-muted mt-0.5">
          {item.author?.name || "—"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">{item.category?.name || "—"}</p>
      </TableCell>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => {
      const cfg = STATUS_BADGE[item.status];
      return (
        <TableCell>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </TableCell>
      );
    },
  },
  {
    key: "published_at",
    header: "Published",
    render: (item) => (
      <TableCell>
        <p className="text-sm text-text-muted">
          {item.published_at ? formatDate(item.published_at) : "—"}
        </p>
      </TableCell>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    render: (item) => (
      <TableCell>
        <ArticleActions article={item} onRefetch={onRefetch} />
      </TableCell>
    ),
  },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export default function ArticlesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ statuses: [] as string[] });

  const fetcher = useCallback(
    (params: IArticleParams) => articlesService.list(params),
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
    setParams,
  } = useTableData<IArticle, IArticleParams>({ fetcher, perPage: 15 });

  const handleApplyFilters = () => {
    setParams({ status: (filters.statuses[0] as ArticleStatus) ?? undefined });
    setFilterOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({ statuses: [] });
    setParams({ status: undefined });
  };

  if (!isMounted) return null;

  return (
    <>
      <TableCard>
        <TableCardHeader
          title="Articles"
          actions={
            <>
              <SearchInput
                value={searchQuery}
                onSearch={handleSearch}
                placeholder="Search articles..."
              />
              <Button
                variant="primary"
                href={PATHS.articleCreate}
                className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
              >
                <Plus size={16} strokeWidth={2.5} />
                Create Article
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

      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Articles"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection label="Status">
          <FilterChipGroup
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) => setFilters({ statuses })}
          />
        </FilterSection>
      </FilterPopup>
    </>
  );
}
