import { Suspense } from "react";
import { SalesTable } from "./_partials/sales-table";

export default function SalesMembersPage() {
  return (
    <Suspense>
      <SalesTable />
    </Suspense>
  );
}
