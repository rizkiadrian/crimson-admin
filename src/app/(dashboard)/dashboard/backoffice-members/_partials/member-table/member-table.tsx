"use client";
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
  TablePagination,
} from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { useEffect, useState } from "react";
import {
  backofficeMembersService,
  IBackofficeUser,
  IBackofficeUserParams,
} from "@services/backoffice/backoffice-members";
import { IApiError, IPagination } from "@services/general";
import { getNameInitials } from "@lib/utils";

export function MemberTable() {
  // 1. Inisialisasi State
  const [isMounted, setIsMounted] = useState(false);
  const [members, setMembers] = useState<IBackofficeUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backofficeUserParam, setBackofficeUserParam] =
    useState<IBackofficeUserParams>({
      page: 1,
      per_page: 10, // Tetap 1 untuk keperluan testing
    });
  const [paginationMeta, setPaginationMeta] = useState<IPagination>({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  // 2. Hydration Fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Fetching Data
  useEffect(() => {
    const handler = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response =
          await backofficeMembersService.backofficeMembers(backofficeUserParam);
        setMembers(response.data || []);
        if (response.meta?.pagination) {
          setPaginationMeta(response.meta.pagination);
        }
      } catch (err: unknown) {
        const apiError = err as IApiError;
        setError(apiError.message || "Gagal mengambil data member");
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      handler();
    }
  }, [backofficeUserParam, isMounted]);

  const handlePageChange = (newPage: number) => {
    setBackofficeUserParam((prev) => ({ ...prev, page: newPage }));
  };

  // Mencegah error render antara server & client
  if (!isMounted) return null;

  // --- LOGIKA PEMISAH LOADING ---
  const isInitialLoad = isLoading && members.length === 0;
  const isPaginationLoad = isLoading && members.length > 0;

  return (
    <div className="bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden relative">
      {/* 1. Generic Table Header */}
      <TableHeader
        title="Backoffice Members"
        actions={
          <>
            <Button
              variant="primary"
              className="rounded-xl gap-2 shadow-md shadow-primary-200/60 h-auto py-2.5 px-5"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add New Customer
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

      {/* 2. Generic Table Body (Menggunakan isRefetching untuk memicu animasi) */}
      <Table isRefetching={isPaginationLoad}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody loading={isInitialLoad} error={error} columnCount={4}>
          {members.map((member) => (
            <TableRow key={member.id}>
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
              <TableCell>
                <div>
                  <p className="text-[15px] font-bold text-text-main">
                    {member.email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    member.role_name?.toLowerCase() === "admin"
                      ? "primary"
                      : "tertiary"
                  }
                >
                  {member.role_name}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-auto w-auto p-2 rounded-lg hover:text-primary-600 hover:bg-primary-50 hover:border-transparent"
                  >
                    <Pencil size={16} />
                  </Button>

                  {/* Tombol Delete (Trash) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-auto w-auto p-2 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 3. Pagination */}
      {paginationMeta.total > 0 && !isInitialLoad && !error && (
        <TablePagination
          currentPage={paginationMeta.current_page}
          totalPages={paginationMeta.last_page}
          totalItems={paginationMeta.total}
          itemsPerPage={paginationMeta.per_page}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
